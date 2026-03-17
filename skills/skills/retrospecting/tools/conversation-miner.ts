const args = Bun.argv.slice(2);

const HELP = `
conversation-miner — Scan Claude Code conversation transcripts for struggle patterns and taste signals

Usage:
  bun run tools/conversation-miner.ts [options]

Options:
  --project <path>   Project root to find conversations for (default: cwd)
  --days <n>         How many days back to scan (default: 7)
  --min-confidence <n>  Minimum confidence threshold 0-1 (default: 0.3)
  --json             Output as JSON
  --help             Show this help message

Scans ~/.claude/projects/<project-path>/ for conversation JSONL files and
analyzes them for:
  - Struggle patterns: corrections, retries, long back-and-forths, tool failures
  - Taste signals: preferences, style guidance, technology choices
  - Skill gaps: repeated manual work that could be automated

Examples:
  bun run tools/conversation-miner.ts --project /Users/me/myproject --days 14
  bun run tools/conversation-miner.ts --json
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

// ── Parse args ──

function getFlag(name: string, fallback: string): string {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
}

const projectPath = getFlag("--project", process.cwd());
const daysBack = parseInt(getFlag("--days", "7"), 10);
const minConfidence = parseFloat(getFlag("--min-confidence", "0.3"));
const jsonOutput = args.includes("--json");

// ── Types ──

interface Finding {
  type: "struggle" | "taste" | "skill-gap";
  pattern: string;
  evidence: string[];
  frequency: number;
  confidence: number;
  conversationFiles: string[];
  suggestion: string;
}

interface ConversationMessage {
  type: string;
  role?: string;
  content: string;
  timestamp: string;
  isMeta?: boolean;
}

// ── Struggle detection patterns ──

const CORRECTION_PATTERNS = [
  /\bno[,.]?\s+(don'?t|do not|not that|instead|rather)\b/i,
  /\bthat'?s\s+(not|wrong|incorrect|broken)\b/i,
  /\bdon'?t\s+(do|use|add|make|create|put|include)\b/i,
  /\binstead\s+(of|do|use|try)\b/i,
  /\bwrong\s+(approach|way|file|method|pattern)\b/i,
  /\btry\s+again\b/i,
  /\bnot\s+what\s+I\s+(meant|wanted|asked|need)/i,
  /\bstop\s+(doing|adding|using|creating)\b/i,
  /\bplease\s+(don'?t|stop|remove|undo|revert)\b/i,
  /\bactually[,.]?\s+(I|we|let'?s|it should)\b/i,
  /\bI\s+said\b/i,
  /\bno no/i,
];

const DISSATISFACTION_PATTERNS = [
  /\b(doesn'?t|does not|didn'?t|did not)\s+(work|compile|build|run|pass)\b/i,
  /\b(still|again)\s+(broken|failing|wrong|not working)\b/i,
  /\berror|bug|broken|crash/i,
  /\bthis\s+(is|looks)\s+(wrong|broken|off|bad)\b/i,
];

const TASTE_PATTERNS = [
  { regex: /\b(I|we)\s+(prefer|always|never|like to|want to|use)\b/i, type: "preference" as const },
  { regex: /\b(always|never|don'?t ever)\s+(use|add|include|import|create)\b/i, type: "rule" as const },
  { regex: /\bthe\s+(convention|pattern|standard|style|way)\s+(is|here|we)\b/i, type: "convention" as const },
  { regex: /\bformat\s+(it|this|them)\s+(like|as|with)\b/i, type: "style" as const },
  { regex: /\bkeep\s+(it|this|things)\s+(simple|clean|minimal|lean|short)\b/i, type: "style" as const },
  { regex: /\buse\s+\w+\s+(instead of|over|rather than)\s+\w+/i, type: "preference" as const },
  { regex: /\b(should|must|needs to)\s+(be|have|use|follow)\b/i, type: "rule" as const },
];

// ── Main ──

async function main() {
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { resolve, basename } = await import("node:path");
  const { homedir } = await import("node:os");

  // Find the conversation directory
  const projectKey = projectPath.replace(/\//g, "-");
  const conversationsDir = resolve(homedir(), ".claude", "projects", projectKey);

  let files: string[];
  try {
    files = readdirSync(conversationsDir).filter((f) => f.endsWith(".jsonl"));
  } catch {
    console.error(`No conversations found at ${conversationsDir}`);
    console.error("Check that --project points to a valid project root.");
    process.exit(1);
  }

  // Filter by date
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const recentFiles = files.filter((f) => {
    try {
      const stat = statSync(resolve(conversationsDir, f));
      return stat.mtimeMs >= cutoff;
    } catch {
      return false;
    }
  });

  if (recentFiles.length === 0) {
    console.error(`No conversations found in the last ${daysBack} days.`);
    process.exit(0);
  }

  // Parse conversations
  const allFindings: Finding[] = [];
  const correctionCounts = new Map<string, { evidence: string[]; files: string[] }>();
  const tasteCounts = new Map<string, { evidence: string[]; files: string[]; tasteType: string }>();
  const longExchanges: { file: string; turns: number; topic: string }[] = [];

  for (const file of recentFiles) {
    const filePath = resolve(conversationsDir, file);
    const messages = parseConversationFile(filePath, readFileSync);

    // Filter to real user messages (not meta, not commands)
    const userMessages = messages.filter(
      (m) => m.type === "user" && !m.isMeta && !m.content.startsWith("<command")
    );
    const assistantMessages = messages.filter((m) => m.type === "assistant");

    // Detect corrections/struggles
    for (const msg of userMessages) {
      const content = extractTextContent(msg.content);
      if (!content || content.length < 10) continue;

      for (const pattern of CORRECTION_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          const key = patternToKey(pattern);
          const existing = correctionCounts.get(key) ?? { evidence: [], files: [] };
          const snippet = extractSnippet(content, match.index ?? 0);
          if (existing.evidence.length < 5) existing.evidence.push(snippet);
          if (!existing.files.includes(file)) existing.files.push(file);
          correctionCounts.set(key, existing);
        }
      }

      // Detect dissatisfaction
      for (const pattern of DISSATISFACTION_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          const key = `dissatisfaction:${patternToKey(pattern)}`;
          const existing = correctionCounts.get(key) ?? { evidence: [], files: [] };
          const snippet = extractSnippet(content, match.index ?? 0);
          if (existing.evidence.length < 5) existing.evidence.push(snippet);
          if (!existing.files.includes(file)) existing.files.push(file);
          correctionCounts.set(key, existing);
        }
      }

      // Detect taste signals
      for (const { regex, type: tasteType } of TASTE_PATTERNS) {
        const match = content.match(regex);
        if (match) {
          const key = `${tasteType}:${patternToKey(regex)}`;
          const existing = tasteCounts.get(key) ?? { evidence: [], files: [], tasteType };
          const snippet = extractSnippet(content, match.index ?? 0);
          if (existing.evidence.length < 5) existing.evidence.push(snippet);
          if (!existing.files.includes(file)) existing.files.push(file);
          tasteCounts.set(key, existing);
        }
      }
    }

    // Detect long exchanges (many user turns = potential struggle)
    if (userMessages.length >= 8) {
      const firstMsg = userMessages[0];
      const topic = extractTextContent(firstMsg.content)?.slice(0, 100) ?? "unknown";
      longExchanges.push({ file, turns: userMessages.length, topic });
    }
  }

  // Convert correction counts to findings
  for (const [key, data] of correctionCounts) {
    const frequency = data.evidence.length;
    const confidence = Math.min(1, frequency * 0.25);
    if (confidence < minConfidence) continue;

    allFindings.push({
      type: "struggle",
      pattern: key,
      evidence: data.evidence,
      frequency,
      confidence,
      conversationFiles: data.files,
      suggestion: suggestAction("struggle", key, data.evidence),
    });
  }

  // Convert taste counts to findings
  for (const [key, data] of tasteCounts) {
    const frequency = data.evidence.length;
    const confidence = Math.min(1, frequency * 0.2);
    if (confidence < minConfidence) continue;

    allFindings.push({
      type: "taste",
      pattern: `${data.tasteType}: ${key}`,
      evidence: data.evidence,
      frequency,
      confidence,
      conversationFiles: data.files,
      suggestion: suggestAction("taste", key, data.evidence),
    });
  }

  // Convert long exchanges to findings
  for (const exchange of longExchanges) {
    allFindings.push({
      type: "skill-gap",
      pattern: `Long exchange (${exchange.turns} turns)`,
      evidence: [exchange.topic],
      frequency: 1,
      confidence: Math.min(1, exchange.turns * 0.05),
      conversationFiles: [exchange.file],
      suggestion: "This conversation required many turns — review if a skill could streamline it.",
    });
  }

  // Sort by confidence descending
  allFindings.sort((a, b) => b.confidence - a.confidence);

  // Output
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          scanned: recentFiles.length,
          daysBack,
          findings: allFindings,
          summary: {
            struggles: allFindings.filter((f) => f.type === "struggle").length,
            tastes: allFindings.filter((f) => f.type === "taste").length,
            skillGaps: allFindings.filter((f) => f.type === "skill-gap").length,
          },
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Scanned ${recentFiles.length} conversations from the last ${daysBack} days.\n`);

    const struggles = allFindings.filter((f) => f.type === "struggle");
    const tastes = allFindings.filter((f) => f.type === "taste");
    const gaps = allFindings.filter((f) => f.type === "skill-gap");

    if (struggles.length > 0) {
      console.log(`## Struggles (${struggles.length})\n`);
      for (const f of struggles) {
        console.log(`  [${(f.confidence * 100).toFixed(0)}%] ${f.pattern} (${f.frequency}x)`);
        for (const e of f.evidence.slice(0, 2)) {
          console.log(`    > ${e}`);
        }
        console.log(`    -> ${f.suggestion}\n`);
      }
    }

    if (tastes.length > 0) {
      console.log(`## Taste Signals (${tastes.length})\n`);
      for (const f of tastes) {
        console.log(`  [${(f.confidence * 100).toFixed(0)}%] ${f.pattern} (${f.frequency}x)`);
        for (const e of f.evidence.slice(0, 2)) {
          console.log(`    > ${e}`);
        }
        console.log(`    -> ${f.suggestion}\n`);
      }
    }

    if (gaps.length > 0) {
      console.log(`## Skill Gaps (${gaps.length})\n`);
      for (const f of gaps) {
        console.log(`  [${(f.confidence * 100).toFixed(0)}%] ${f.pattern}`);
        for (const e of f.evidence.slice(0, 1)) {
          console.log(`    > ${e}`);
        }
        console.log(`    -> ${f.suggestion}\n`);
      }
    }

    if (allFindings.length === 0) {
      console.log("No notable patterns found in recent conversations.");
    }
  }
}

// ── Helpers ──

function parseConversationFile(
  filePath: string,
  readFileSync: (path: string, enc: string) => string,
): ConversationMessage[] {
  const messages: ConversationMessage[] = [];
  const raw = readFileSync(filePath, "utf-8");

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      const type = parsed.type;
      if (type !== "user" && type !== "assistant") continue;

      const message = parsed.message ?? {};
      const content = message.content ?? "";
      const timestamp = parsed.timestamp ?? "";
      const isMeta = parsed.isMeta ?? false;

      messages.push({
        type,
        role: message.role,
        content: typeof content === "string" ? content : JSON.stringify(content),
        timestamp,
        isMeta,
      });
    } catch {
      // Skip malformed lines
    }
  }

  return messages;
}

function extractTextContent(content: string): string {
  // If content looks like JSON array (content blocks), extract text
  if (content.startsWith("[")) {
    try {
      const blocks = JSON.parse(content);
      return blocks
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join(" ");
    } catch {
      return content;
    }
  }

  // Strip XML-like tags (system reminders, etc.)
  return content.replace(/<[^>]+>[^<]*<\/[^>]+>/g, "").trim();
}

function extractSnippet(text: string, matchIndex: number): string {
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(text.length, matchIndex + 120);
  let snippet = text.slice(start, end).replace(/\n/g, " ").trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

function patternToKey(pattern: RegExp): string {
  return pattern.source
    .replace(/\\b/g, "")
    .replace(/\\s\+/g, " ")
    .replace(/[\\()[\]|?+*^${}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

function suggestAction(type: string, key: string, evidence: string[]): string {
  if (type === "struggle") {
    if (key.includes("dissatisfaction")) {
      return "Repeated issues — investigate if a skill could catch or prevent these errors.";
    }
    return "User corrections detected — consider a skill or CLAUDE.md rule to prevent this pattern.";
  }
  if (type === "taste") {
    return "Consistent preference — codify in a skill's conventions or add to CLAUDE.md.";
  }
  return "Review for skill opportunity.";
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
