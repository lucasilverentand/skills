const args = Bun.argv.slice(2);

const HELP = `
conversation-miner — Scan agent conversation transcripts for struggle patterns and taste signals

Usage:
  bun run tools/conversation-miner.ts [options]

Options:
  --project <path>   Project root to find conversations for (default: cwd)
  --source <name>    Transcript source: auto, claude, or codex (default: auto)
  --transcripts <path>  Scan JSONL transcripts under this directory instead of a known source
  --days <n>         How many days back to scan (default: 7)
  --min-confidence <n>  Minimum confidence threshold 0-1 (default: 0.3)
  --json             Output as JSON
  --help             Show this help message

Scans Claude Code transcripts, Codex session JSONL, or an explicit transcript
directory and analyzes them for:
  - Struggle patterns: corrections, retries, long back-and-forths, tool failures
  - Taste signals: preferences, style guidance, technology choices
  - Skill gaps: repeated manual work that could be automated

Examples:
  bun run tools/conversation-miner.ts --project /Users/me/myproject --days 14
  bun run tools/conversation-miner.ts --source codex --days 14 --json
  bun run tools/conversation-miner.ts --transcripts ~/exports/session-jsonl --json
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
const source = getFlag("--source", "auto");
const transcriptsPath = getFlag("--transcripts", "");
const daysBack = parseInt(getFlag("--days", "7"), 10);
const minConfidence = parseFloat(getFlag("--min-confidence", "0.3"));
const jsonOutput = args.includes("--json");

if (!["auto", "claude", "codex"].includes(source)) {
  console.error("Error: --source must be one of: auto, claude, codex");
  process.exit(1);
}

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
  source: "claude" | "codex" | "custom";
}

interface TranscriptFile {
  path: string;
  source: "claude" | "codex" | "custom";
}

interface DirectoryEntryLike {
  name: string;
  isDirectory: () => boolean;
  isFile: () => boolean;
}

interface FindTranscriptFilesOptions {
  homedir: string;
  projectPath: string;
  requestedSource: "auto" | "claude" | "codex";
  transcriptsPath: string;
  cutoff: number;
  existsSync: (path: string) => boolean;
  readdirSync: (path: string, options?: { withFileTypes?: boolean }) => Array<string | DirectoryEntryLike>;
  statSync: (path: string) => { mtimeMs: number; isFile: () => boolean; isDirectory: () => boolean };
  resolve: (...paths: string[]) => string;
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
  /\bthis\s+(is|looks)\s+(wrong|broken|off|bad)\b/i,
  /\byou\s+(broke|messed up|ruined)\b/i,
  /\b(undo|revert)\s+(that|this|it|the)\b/i,
  /\bnot\s+what\s+I\s+(expected|wanted|asked)\b/i,
  /\bwhy\s+(did|does|is)\s+(it|this|that)\s+(still|keep|not)\b/i,
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

function findTranscriptFiles(options: FindTranscriptFilesOptions): TranscriptFile[] {
  const roots: TranscriptFile[] = [];

  if (options.transcriptsPath) {
    roots.push({
      path: options.resolve(options.transcriptsPath),
      source: "custom",
    });
  } else {
    if (options.requestedSource === "auto" || options.requestedSource === "claude") {
      const projectKey = options.projectPath.replace(/\//g, "-");
      roots.push({
        path: options.resolve(options.homedir, ".claude", "projects", projectKey),
        source: "claude",
      });
    }

    if (options.requestedSource === "auto" || options.requestedSource === "codex") {
      roots.push({
        path: options.resolve(options.homedir, ".codex", "sessions"),
        source: "codex",
      });
      roots.push({
        path: options.resolve(options.homedir, ".codex", "archived_sessions"),
        source: "codex",
      });
    }
  }

  const files: TranscriptFile[] = [];
  for (const root of roots) {
    if (!options.existsSync(root.path)) continue;
    files.push(...collectJsonlFiles(root.path, root.source, options));
  }

  const seen = new Set<string>();
  return files
    .filter((file) => {
      if (seen.has(file.path)) return false;
      seen.add(file.path);
      return true;
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function collectJsonlFiles(
  dir: string,
  sourceName: TranscriptFile["source"],
  options: FindTranscriptFilesOptions,
): TranscriptFile[] {
  const files: TranscriptFile[] = [];

  let entries: Array<string | DirectoryEntryLike>;
  try {
    entries = options.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const name = typeof entry === "string" ? entry : entry.name;
    const fullPath = options.resolve(dir, name);

    if (typeof entry !== "string" && entry.isDirectory()) {
      files.push(...collectJsonlFiles(fullPath, sourceName, options));
      continue;
    }

    try {
      const stat = options.statSync(fullPath);
      const isFile = typeof entry === "string" ? stat.isFile() : entry.isFile();
      if (isFile && name.endsWith(".jsonl") && stat.mtimeMs >= options.cutoff) {
        files.push({ path: fullPath, source: sourceName });
      }
    } catch {
      // Ignore files that disappear during scanning.
    }
  }

  return files;
}

function summarizeSources(files: TranscriptFile[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const file of files) counts[file.source] = (counts[file.source] ?? 0) + 1;
  return counts;
}

function formatSourceSummary(counts: Record<string, number>): string {
  return Object.entries(counts)
    .map(([name, count]) => `${name}=${count}`)
    .join(", ");
}

async function main() {
  const { existsSync, readdirSync, readFileSync, statSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const { homedir } = await import("node:os");

  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const recentFiles = findTranscriptFiles({
    homedir: homedir(),
    projectPath,
    requestedSource: source as "auto" | "claude" | "codex",
    transcriptsPath,
    cutoff,
    existsSync,
    readdirSync,
    statSync,
    resolve,
  });

  if (recentFiles.length === 0) {
    console.error(`No transcript files found in the last ${daysBack} days.`);
    process.exit(0);
  }

  // Parse conversations
  const allFindings: Finding[] = [];
  const correctionCounts = new Map<string, { evidence: string[]; files: string[] }>();
  const tasteCounts = new Map<string, { evidence: string[]; files: string[]; tasteType: string }>();
  const longExchanges: { file: string; turns: number; topic: string }[] = [];

  for (const file of recentFiles) {
    const messages = parseConversationFile(file.path, file.source, readFileSync);

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
          if (!existing.files.includes(file.path)) existing.files.push(file.path);
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
          if (!existing.files.includes(file.path)) existing.files.push(file.path);
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
          if (!existing.files.includes(file.path)) existing.files.push(file.path);
          tasteCounts.set(key, existing);
        }
      }
    }

    // Detect long exchanges (many user turns = potential struggle)
    if (userMessages.length >= 8) {
      const firstMsg = userMessages[0];
      const topic = extractTextContent(firstMsg.content)?.slice(0, 100) ?? "unknown";
      longExchanges.push({ file: file.path, turns: userMessages.length, topic });
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
          sources: summarizeSources(recentFiles),
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
    console.log(`Scanned ${recentFiles.length} transcript file(s) from the last ${daysBack} days.`);
    console.log(`Sources: ${formatSourceSummary(summarizeSources(recentFiles))}\n`);

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
  sourceName: ConversationMessage["source"],
  readFileSync: (path: string, enc: string) => string,
): ConversationMessage[] {
  const messages: ConversationMessage[] = [];
  const raw = readFileSync(filePath, "utf-8");

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      const message = normalizeTranscriptRecord(parsed, sourceName);
      if (message) messages.push(message);
    } catch {
      // Skip malformed lines
    }
  }

  return messages;
}

function normalizeTranscriptRecord(
  parsed: Record<string, unknown>,
  sourceName: ConversationMessage["source"],
): ConversationMessage | null {
  const nested = parsed.item ?? parsed.message ?? parsed.payload;
  const record = isRecord(nested) ? nested : parsed;
  const role = stringValue(record.role) ?? stringValue(parsed.role);
  const rawType = stringValue(record.type) ?? stringValue(parsed.type);
  const type = role === "user" || rawType === "user"
    ? "user"
    : role === "assistant" || rawType === "assistant"
      ? "assistant"
      : "";

  if (type !== "user" && type !== "assistant") return null;

  const content =
    record.content ??
    record.text ??
    parsed.content ??
    (isRecord(parsed.message) ? parsed.message.content : undefined) ??
    "";

  return {
    type,
    role,
    content: normalizeContent(content),
    timestamp: stringValue(record.timestamp) ?? stringValue(parsed.timestamp) ?? "",
    isMeta: Boolean(parsed.isMeta ?? record.isMeta ?? false),
    source: sourceName,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (!isRecord(block)) return "";
        if (typeof block.text === "string") return block.text;
        if (typeof block.content === "string") return block.content;
        return "";
      })
      .filter(Boolean)
      .join(" ");
  }
  if (isRecord(content)) {
    if (typeof content.text === "string") return content.text;
    if (typeof content.content === "string") return content.content;
  }
  return "";
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
    return "User corrections detected — consider a skill or project instruction rule to prevent this pattern.";
  }
  if (type === "taste") {
    return "Consistent preference — codify in a skill's conventions or add to project instructions.";
  }
  return "Review for skill opportunity.";
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
