// Improve a skill description based on eval results.
//
// Takes eval results (from run-eval.ts) and generates an improved description
// using Claude with extended thinking. Uses the Anthropic API directly via fetch.

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseSkillMd } from "./utils.ts";

interface EvalResult {
  query: string;
  should_trigger: boolean;
  trigger_rate: number;
  triggers: number;
  runs: number;
  pass: boolean;
}

interface EvalResults {
  description: string;
  results: EvalResult[];
  summary: { total: number; passed: number; failed: number };
}

interface HistoryEntry {
  description: string;
  train_passed?: number;
  train_total?: number;
  passed?: number;
  failed?: number;
  total?: number;
  results?: EvalResult[];
  note?: string;
}

async function callClaude(
  model: string,
  messages: { role: string; content: string }[],
  thinkingBudget = 10000
): Promise<{ thinking: string; text: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is required"
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      thinking: { type: "enabled", budget_tokens: thinkingBudget },
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  let thinking = "";
  let text = "";

  for (const block of (data as Record<string, unknown>).content as Record<string, unknown>[]) {
    if (block.type === "thinking") thinking = block.thinking as string;
    else if (block.type === "text") text = block.text as string;
  }

  return { thinking, text };
}

export async function improveDescription(opts: {
  skillName: string;
  skillContent: string;
  currentDescription: string;
  evalResults: EvalResults;
  history: (HistoryEntry | Record<string, unknown>)[];
  model: string;
  testResults?: EvalResults | null;
  logDir?: string | null;
  iteration?: number | null;
}): Promise<string> {
  const {
    skillName,
    skillContent,
    currentDescription,
    evalResults,
    history,
    model,
    testResults,
    logDir,
    iteration,
  } = opts;

  const failedTriggers = evalResults.results.filter(
    (r) => r.should_trigger && !r.pass
  );
  const falseTriggers = evalResults.results.filter(
    (r) => !r.should_trigger && !r.pass
  );

  const trainScore = `${evalResults.summary.passed}/${evalResults.summary.total}`;
  const scoresSummary = testResults
    ? `Train: ${trainScore}, Test: ${testResults.summary.passed}/${testResults.summary.total}`
    : `Train: ${trainScore}`;

  let prompt = `You are optimizing a skill description for a Claude Code skill called "${skillName}". A "skill" is sort of like a prompt, but with progressive disclosure -- there's a title and description that Claude sees when deciding whether to use the skill, and then if it does use the skill, it reads the .md file which has lots more details and potentially links to other resources in the skill folder like helper files and scripts and additional documentation or examples.

The description appears in Claude's "available_skills" list. When a user sends a query, Claude decides whether to invoke the skill based solely on the title and on this description. Your goal is to write a description that triggers for relevant queries, and doesn't trigger for irrelevant ones.

Here's the current description:
<current_description>
"${currentDescription}"
</current_description>

Current scores (${scoresSummary}):
<scores_summary>
`;

  if (failedTriggers.length > 0) {
    prompt += "FAILED TO TRIGGER (should have triggered but didn't):\n";
    for (const r of failedTriggers) {
      prompt += `  - "${r.query}" (triggered ${r.triggers}/${r.runs} times)\n`;
    }
    prompt += "\n";
  }

  if (falseTriggers.length > 0) {
    prompt += "FALSE TRIGGERS (triggered but shouldn't have):\n";
    for (const r of falseTriggers) {
      prompt += `  - "${r.query}" (triggered ${r.triggers}/${r.runs} times)\n`;
    }
    prompt += "\n";
  }

  if (history.length > 0) {
    prompt +=
      "PREVIOUS ATTEMPTS (do NOT repeat these — try something structurally different):\n\n";
    for (const h of history) {
      const trainS = `${h.train_passed ?? h.passed ?? 0}/${h.train_total ?? h.total ?? 0}`;
      const scoreStr = `train=${trainS}`;
      prompt += `<attempt ${scoreStr}>\n`;
      prompt += `Description: "${h.description}"\n`;
      if (h.results) {
        prompt += "Train results:\n";
        for (const r of h.results) {
          const status = r.pass ? "PASS" : "FAIL";
          prompt += `  [${status}] "${r.query.slice(0, 80)}" (triggered ${r.triggers}/${r.runs})\n`;
        }
      }
      if (h.note) prompt += `Note: ${h.note}\n`;
      prompt += "</attempt>\n\n";
    }
  }

  prompt += `</scores_summary>

Skill content (for context on what the skill does):
<skill_content>
${skillContent}
</skill_content>

Based on the failures, write a new and improved description that is more likely to trigger correctly. When I say "based on the failures", it's a bit of a tricky line to walk because we don't want to overfit to the specific cases you're seeing. So what I DON'T want you to do is produce an ever-expanding list of specific queries that this skill should or shouldn't trigger for. Instead, try to generalize from the failures to broader categories of user intent and situations where this skill would be useful or not useful.

Remember that your description is injected into ALL queries the user sends to Claude, and there might be a lot of skills. So it's important that the description is concise and doesn't waste space. It should be immediately scannable.

Concretely, your description should not be more than about 100-200 words, even if that comes at the cost of accuracy.

Here are some tips that we've found to work well in writing these descriptions:
- The skill should be phrased in the imperative -- "Use this skill for" rather than "this skill does"
- The skill description should focus on the user's intent, what they are trying to achieve, vs. the implementation details of how the skill works.
- The description competes with other skills for Claude's attention — make it distinctive and immediately recognizable.
- If you're getting lots of failures after repeated attempts, change things up. Try different sentence structures or wordings.

I'd encourage you to be creative and mix up the style in different iterations since you'll have multiple opportunities to try different approaches and we'll just grab the highest-scoring one at the end.

Please respond with only the new description text in <new_description> tags, nothing else.`;

  const { thinking: thinkingText, text } = await callClaude(model, [
    { role: "user", content: prompt },
  ]);

  // Parse <new_description> tags
  const match = text.match(/<new_description>([\s\S]*?)<\/new_description>/);
  let description = match
    ? match[1].trim().replace(/^["']|["']$/g, "")
    : text.trim().replace(/^["']|["']$/g, "");

  const transcript: Record<string, unknown> = {
    iteration,
    prompt,
    thinking: thinkingText,
    response: text,
    parsed_description: description,
    char_count: description.length,
    over_limit: description.length > 1024,
  };

  // If over 1024 chars, ask the model to shorten
  if (description.length > 1024) {
    const shortenPrompt = `Your description is ${description.length} characters, which exceeds the hard 1024 character limit. Please rewrite it to be under 1024 characters while preserving the most important trigger words and intent coverage. Respond with only the new description in <new_description> tags.`;

    const { thinking: shortenThinking, text: shortenText } =
      await callClaude(model, [
        { role: "user", content: prompt },
        { role: "assistant", content: text },
        { role: "user", content: shortenPrompt },
      ]);

    const shortenMatch = shortenText.match(
      /<new_description>([\s\S]*?)<\/new_description>/
    );
    const shortened = shortenMatch
      ? shortenMatch[1].trim().replace(/^["']|["']$/g, "")
      : shortenText.trim().replace(/^["']|["']$/g, "");

    transcript.rewrite_prompt = shortenPrompt;
    transcript.rewrite_thinking = shortenThinking;
    transcript.rewrite_response = shortenText;
    transcript.rewrite_description = shortened;
    transcript.rewrite_char_count = shortened.length;
    description = shortened;
  }

  transcript.final_description = description;

  if (logDir) {
    mkdirSync(logDir, { recursive: true });
    const logFile = join(
      logDir,
      `improve_iter_${iteration ?? "unknown"}.json`
    );
    writeFileSync(logFile, JSON.stringify(transcript, null, 2));
  }

  return description;
}

// CLI entrypoint
if (import.meta.main) {
  const args = Bun.argv.slice(2);

  const HELP = `
improve-description — Improve a skill description based on eval results

Usage:
  bun run scripts/improve-description.ts --eval-results <file> --skill-path <path> --model <id> [options]

Options:
  --eval-results <file>   Path to eval results JSON (required)
  --skill-path <path>     Path to skill directory (required)
  --model <id>            Model for improvement (required)
  --history <file>        Path to history JSON (previous attempts)
  --verbose               Print thinking to stderr
  --help                  Show this help message

Requires ANTHROPIC_API_KEY environment variable.
`.trim();

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  function getArg(name: string): string | undefined {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : undefined;
  }

  const evalResultsPath = getArg("--eval-results");
  const skillPathArg = getArg("--skill-path");
  const model = getArg("--model");
  const historyPath = getArg("--history");
  const verbose = args.includes("--verbose");

  if (!evalResultsPath || !skillPathArg || !model) {
    console.error(
      "Error: --eval-results, --skill-path, and --model are required"
    );
    process.exit(1);
  }

  const evalResults: EvalResults = JSON.parse(
    readFileSync(evalResultsPath, "utf-8")
  );
  const history: HistoryEntry[] = historyPath
    ? JSON.parse(readFileSync(historyPath, "utf-8"))
    : [];

  const { name, content } = parseSkillMd(skillPathArg);
  const currentDescription = evalResults.description;

  if (verbose) {
    console.error(`Current: ${currentDescription}`);
    console.error(
      `Score: ${evalResults.summary.passed}/${evalResults.summary.total}`
    );
  }

  const newDescription = await improveDescription({
    skillName: name,
    skillContent: content,
    currentDescription,
    evalResults,
    history,
    model,
  });

  if (verbose) {
    console.error(`Improved: ${newDescription}`);
  }

  const output = {
    description: newDescription,
    history: [
      ...history,
      {
        description: currentDescription,
        passed: evalResults.summary.passed,
        failed: evalResults.summary.failed,
        total: evalResults.summary.total,
        results: evalResults.results,
      },
    ],
  };
  console.log(JSON.stringify(output, null, 2));
}
