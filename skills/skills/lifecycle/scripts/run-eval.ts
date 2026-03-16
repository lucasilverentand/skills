// Run trigger evaluation for a skill description.
//
// Tests whether a skill's description causes Claude to trigger (read the skill)
// for a set of queries. Outputs results as JSON.

import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { parseSkillMd, findProjectRoot } from "./utils.ts";

interface EvalItem {
  query: string;
  should_trigger: boolean;
}

interface EvalResult {
  query: string;
  should_trigger: boolean;
  trigger_rate: number;
  triggers: number;
  runs: number;
  pass: boolean;
}

async function runSingleQuery(
  query: string,
  skillName: string,
  skillDescription: string,
  timeout: number,
  projectRoot: string,
  model?: string
): Promise<boolean> {
  const uniqueId = Math.random().toString(36).slice(2, 10);
  const cleanName = `${skillName}-skill-${uniqueId}`;
  const commandsDir = join(projectRoot, ".claude", "commands");
  const commandFile = join(commandsDir, `${cleanName}.md`);

  try {
    mkdirSync(commandsDir, { recursive: true });

    const indentedDesc = skillDescription
      .split("\n")
      .join("\n  ");
    const commandContent = `---\ndescription: |\n  ${indentedDesc}\n---\n\n# ${skillName}\n\nThis skill handles: ${skillDescription}\n`;
    writeFileSync(commandFile, commandContent);

    const cmd = [
      "claude",
      "-p",
      query,
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
    ];
    if (model) cmd.push("--model", model);

    // Remove CLAUDECODE env var to allow nesting
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([k]) => k !== "CLAUDECODE")
    );

    const proc = Bun.spawn(cmd, {
      cwd: projectRoot,
      stdout: "pipe",
      stderr: "ignore",
      env,
    });

    let pendingToolName: string | null = null;
    let accumulatedJson = "";
    const decoder = new TextDecoder();
    let buffer = "";

    const timeoutMs = timeout * 1000;
    const startTime = Date.now();

    try {
      const reader = proc.stdout.getReader();

      while (Date.now() - startTime < timeoutMs) {
        const readPromise = reader.read();
        const remaining = timeoutMs - (Date.now() - startTime);
        if (remaining <= 0) break;
        const timeoutPromise = new Promise<{ done: true; value: undefined }>(
          (resolve) =>
            setTimeout(
              () => resolve({ done: true, value: undefined }),
              remaining
            )
        );

        const { done, value } = await Promise.race([
          readPromise,
          timeoutPromise,
        ]);
        if (done && !value) break;
        if (value) buffer += decoder.decode(value, { stream: true });

        while (buffer.includes("\n")) {
          const nlIdx = buffer.indexOf("\n");
          const line = buffer.slice(0, nlIdx).trim();
          buffer = buffer.slice(nlIdx + 1);

          if (!line) continue;

          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }

          // Stream event detection
          if (event.type === "stream_event") {
            const se = (event.event as Record<string, unknown>) || {};
            const seType = se.type as string;

            if (seType === "content_block_start") {
              const cb =
                (se.content_block as Record<string, unknown>) || {};
              if (cb.type === "tool_use") {
                const toolName = cb.name as string;
                if (toolName === "Skill" || toolName === "Read") {
                  pendingToolName = toolName;
                  accumulatedJson = "";
                } else {
                  reader.cancel();
                  return false;
                }
              }
            } else if (
              seType === "content_block_delta" &&
              pendingToolName
            ) {
              const delta =
                (se.delta as Record<string, unknown>) || {};
              if (delta.type === "input_json_delta") {
                accumulatedJson += (delta.partial_json as string) || "";
                if (accumulatedJson.includes(cleanName)) {
                  reader.cancel();
                  return true;
                }
              }
            } else if (
              seType === "content_block_stop" ||
              seType === "message_stop"
            ) {
              if (pendingToolName) {
                reader.cancel();
                return accumulatedJson.includes(cleanName);
              }
              if (seType === "message_stop") {
                reader.cancel();
                return false;
              }
            }
          }

          // Fallback: full assistant message
          if (event.type === "assistant") {
            const message =
              (event.message as Record<string, unknown>) || {};
            const content =
              (message.content as Record<string, unknown>[]) || [];
            for (const item of content) {
              if (item.type !== "tool_use") continue;
              const input =
                (item.input as Record<string, string>) || {};
              if (
                item.name === "Skill" &&
                (input.skill || "").includes(cleanName)
              ) {
                reader.cancel();
                return true;
              }
              if (
                item.name === "Read" &&
                (input.file_path || "").includes(cleanName)
              ) {
                reader.cancel();
                return true;
              }
              reader.cancel();
              return false;
            }
          }

          if (event.type === "result") {
            reader.cancel();
            return false;
          }
        }
      }
    } finally {
      try {
        proc.kill();
        await proc.exited;
      } catch {}
    }

    return false;
  } finally {
    try {
      if (existsSync(commandFile)) unlinkSync(commandFile);
    } catch {}
  }
}

async function mapConcurrent<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

export async function runEval(opts: {
  evalSet: EvalItem[];
  skillName: string;
  description: string;
  numWorkers: number;
  timeout: number;
  projectRoot: string;
  runsPerQuery?: number;
  triggerThreshold?: number;
  model?: string;
}): Promise<{
  skill_name: string;
  description: string;
  results: EvalResult[];
  summary: { total: number; passed: number; failed: number };
}> {
  const {
    evalSet,
    skillName,
    description,
    numWorkers,
    timeout,
    projectRoot,
    runsPerQuery = 1,
    triggerThreshold = 0.5,
    model,
  } = opts;

  // Build task list: each (item, runIdx) pair
  const tasks: { item: EvalItem; runIdx: number }[] = [];
  for (const item of evalSet) {
    for (let r = 0; r < runsPerQuery; r++) {
      tasks.push({ item, runIdx: r });
    }
  }

  // Run all tasks with concurrency limit
  const taskResults = await mapConcurrent(
    tasks,
    async ({ item }) => {
      try {
        return {
          query: item.query,
          triggered: await runSingleQuery(
            item.query,
            skillName,
            description,
            timeout,
            projectRoot,
            model
          ),
        };
      } catch (e) {
        console.error(`Warning: query failed: ${e}`, );
        return { query: item.query, triggered: false };
      }
    },
    numWorkers
  );

  // Group results by query
  const queryTriggers = new Map<string, boolean[]>();
  const queryItems = new Map<string, EvalItem>();

  for (let i = 0; i < tasks.length; i++) {
    const query = tasks[i].item.query;
    queryItems.set(query, tasks[i].item);
    if (!queryTriggers.has(query)) queryTriggers.set(query, []);
    queryTriggers.get(query)!.push(taskResults[i].triggered);
  }

  // Build results
  const results: EvalResult[] = [];
  for (const [query, triggers] of queryTriggers) {
    const item = queryItems.get(query)!;
    const triggerRate =
      triggers.filter(Boolean).length / triggers.length;
    const shouldTrigger = item.should_trigger;
    const didPass = shouldTrigger
      ? triggerRate >= triggerThreshold
      : triggerRate < triggerThreshold;

    results.push({
      query,
      should_trigger: shouldTrigger,
      trigger_rate: triggerRate,
      triggers: triggers.filter(Boolean).length,
      runs: triggers.length,
      pass: didPass,
    });
  }

  const passed = results.filter((r) => r.pass).length;

  return {
    skill_name: skillName,
    description,
    results,
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
    },
  };
}

// CLI entrypoint
if (import.meta.main) {
  const args = Bun.argv.slice(2);

  const HELP = `
run-eval — Run trigger evaluation for a skill description

Usage:
  bun run scripts/run-eval.ts --eval-set <file> --skill-path <path> [options]

Options:
  --eval-set <file>           Path to eval set JSON file (required)
  --skill-path <path>         Path to skill directory (required)
  --description <text>        Override description to test
  --num-workers <n>           Number of parallel workers (default: 10)
  --timeout <seconds>         Timeout per query (default: 30)
  --runs-per-query <n>        Number of runs per query (default: 3)
  --trigger-threshold <f>     Trigger rate threshold (default: 0.5)
  --model <id>                Model to use for claude -p
  --verbose                   Print progress to stderr
  --help                      Show this help message
`.trim();

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  function getArg(name: string): string | undefined {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : undefined;
  }

  const evalSetPath = getArg("--eval-set");
  const skillPathArg = getArg("--skill-path");
  const descriptionOverride = getArg("--description");
  const numWorkers = parseInt(getArg("--num-workers") || "10", 10);
  const timeout = parseInt(getArg("--timeout") || "30", 10);
  const runsPerQuery = parseInt(getArg("--runs-per-query") || "3", 10);
  const triggerThreshold = parseFloat(
    getArg("--trigger-threshold") || "0.5"
  );
  const model = getArg("--model");
  const verbose = args.includes("--verbose");

  if (!evalSetPath || !skillPathArg) {
    console.error("Error: --eval-set and --skill-path are required");
    process.exit(1);
  }

  const { readFileSync } = await import("node:fs");
  const evalSet: EvalItem[] = JSON.parse(readFileSync(evalSetPath, "utf-8"));

  if (!existsSync(join(skillPathArg, "SKILL.md"))) {
    console.error(`Error: No SKILL.md found at ${skillPathArg}`);
    process.exit(1);
  }

  const { name, description: originalDescription } =
    parseSkillMd(skillPathArg);
  const description = descriptionOverride || originalDescription;
  const projectRoot = findProjectRoot();

  if (verbose) {
    console.error(`Evaluating: ${description}`);
  }

  const output = await runEval({
    evalSet,
    skillName: name,
    description,
    numWorkers,
    timeout,
    projectRoot,
    runsPerQuery,
    triggerThreshold,
    model,
  });

  if (verbose) {
    const { summary } = output;
    console.error(`Results: ${summary.passed}/${summary.total} passed`);
    for (const r of output.results) {
      const status = r.pass ? "PASS" : "FAIL";
      console.error(
        `  [${status}] rate=${r.triggers}/${r.runs} expected=${r.should_trigger}: ${r.query.slice(0, 70)}`
      );
    }
  }

  console.log(JSON.stringify(output, null, 2));
}
