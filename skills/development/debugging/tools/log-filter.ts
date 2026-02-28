const args = Bun.argv.slice(2);

const HELP = `
log-filter — Extract and correlate log entries by timestamp or request ID

Usage:
  bun run tools/log-filter.ts <log-file> [options]

Options:
  --request-id <id>     Filter to entries matching this request/trace ID
  --timestamp <ts>      Filter to entries within 5 minutes of this timestamp
  --level <level>       Filter by log level (error, warn, info, debug)
  --json                Output as JSON instead of plain text
  --help                Show this help message

Parses log files in common formats (JSON lines, structured text) and filters
entries by request ID, timestamp range, or log level.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const requestIdIdx = args.indexOf("--request-id");
const requestId = requestIdIdx !== -1 ? args[requestIdIdx + 1] : null;
const timestampIdx = args.indexOf("--timestamp");
const timestampFilter = timestampIdx !== -1 ? args[timestampIdx + 1] : null;
const levelIdx = args.indexOf("--level");
const levelFilter = levelIdx !== -1 ? args[levelIdx + 1]?.toLowerCase() : null;
const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (requestIdIdx === -1 || i !== requestIdIdx + 1) &&
    (timestampIdx === -1 || i !== timestampIdx + 1) &&
    (levelIdx === -1 || i !== levelIdx + 1)
);

interface LogEntry {
  lineNum: number;
  raw: string;
  timestamp: string | null;
  level: string | null;
  message: string;
  requestId: string | null;
  fields: Record<string, string>;
}

function parseLogLine(line: string, lineNum: number): LogEntry | null {
  if (!line.trim()) return null;

  const entry: LogEntry = {
    lineNum,
    raw: line,
    timestamp: null,
    level: null,
    message: "",
    requestId: null,
    fields: {},
  };

  // Try JSON line format
  try {
    const parsed = JSON.parse(line);
    entry.timestamp = parsed.timestamp || parsed.time || parsed.ts || parsed.date || null;
    entry.level = (parsed.level || parsed.severity || parsed.lvl || "")
      .toString()
      .toLowerCase();
    entry.message = parsed.message || parsed.msg || parsed.text || "";
    entry.requestId =
      parsed.requestId ||
      parsed.request_id ||
      parsed.traceId ||
      parsed.trace_id ||
      parsed.correlationId ||
      null;
    entry.fields = parsed;
    return entry;
  } catch {
    // Not JSON, try text formats
  }

  // Common text log format: [2024-01-15 10:30:45] [ERROR] message
  const textMatch = line.match(
    /^\[?(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\]?\s*\[?(ERROR|WARN|INFO|DEBUG|TRACE|FATAL|error|warn|info|debug|trace|fatal)\]?\s*(.*)/
  );
  if (textMatch) {
    entry.timestamp = textMatch[1];
    entry.level = textMatch[2].toLowerCase();
    entry.message = textMatch[3];
  } else {
    // Simple format: just message, check for level keywords
    entry.message = line;
    if (/\bERROR\b/i.test(line)) entry.level = "error";
    else if (/\bWARN(?:ING)?\b/i.test(line)) entry.level = "warn";
    else if (/\bINFO\b/i.test(line)) entry.level = "info";
    else if (/\bDEBUG\b/i.test(line)) entry.level = "debug";
  }

  // Extract timestamp if not found
  if (!entry.timestamp) {
    const tsMatch = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/);
    if (tsMatch) entry.timestamp = tsMatch[1];
  }

  // Extract request ID patterns
  const reqIdMatch = line.match(
    /(?:request[_-]?id|trace[_-]?id|correlation[_-]?id)[=: ]["']?([a-zA-Z0-9_-]+)["']?/i
  );
  if (reqIdMatch) entry.requestId = reqIdMatch[1];

  // Also check for UUID patterns that might be request IDs
  if (!entry.requestId) {
    const uuidMatch = line.match(/\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i);
    if (uuidMatch) entry.requestId = uuidMatch[1];
  }

  return entry;
}

function isWithinTimeWindow(entryTs: string, filterTs: string, windowMs = 5 * 60 * 1000): boolean {
  const entryTime = new Date(entryTs).getTime();
  const filterTime = new Date(filterTs).getTime();
  if (isNaN(entryTime) || isNaN(filterTime)) return false;
  return Math.abs(entryTime - filterTime) <= windowMs;
}

async function main() {
  const logPath = filteredArgs[0];
  if (!logPath) {
    console.error("Error: missing required log file argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedPath = resolve(logPath);

  const file = Bun.file(resolvedPath);
  if (!(await file.exists())) {
    console.error(`Error: log file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = await file.text();
  const lines = content.split("\n");

  let entries: LogEntry[] = [];
  for (let i = 0; i < lines.length; i++) {
    const entry = parseLogLine(lines[i], i + 1);
    if (entry) entries.push(entry);
  }

  // Apply filters
  if (requestId) {
    entries = entries.filter(
      (e) => e.requestId === requestId || e.raw.includes(requestId)
    );
  }

  if (timestampFilter) {
    entries = entries.filter(
      (e) => e.timestamp && isWithinTimeWindow(e.timestamp, timestampFilter)
    );
  }

  if (levelFilter) {
    const levelPriority: Record<string, number> = {
      fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5,
    };
    const filterPriority = levelPriority[levelFilter] ?? 3;
    entries = entries.filter((e) => {
      const entryPriority = e.level ? (levelPriority[e.level] ?? 3) : 3;
      return entryPriority <= filterPriority;
    });
  }

  // Count by level
  const levelCounts: Record<string, number> = {};
  for (const entry of entries) {
    const lvl = entry.level || "unknown";
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          totalLines: lines.length,
          matchingEntries: entries.length,
          levelCounts,
          filters: { requestId, timestamp: timestampFilter, level: levelFilter },
          entries,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Log Filter: ${entries.length} entries from ${lines.length} lines`
    );
    if (requestId) console.log(`  request-id: ${requestId}`);
    if (timestampFilter) console.log(`  timestamp: ${timestampFilter} (+/- 5min)`);
    if (levelFilter) console.log(`  level: ${levelFilter} and above`);
    console.log(
      `  levels: ${Object.entries(levelCounts).map(([k, v]) => `${k}=${v}`).join(", ")}\n`
    );

    if (entries.length === 0) {
      console.log("No matching entries found.");
    } else {
      for (const entry of entries) {
        const ts = entry.timestamp ? `[${entry.timestamp}]` : "";
        const lvl = entry.level ? ` [${entry.level.toUpperCase()}]` : "";
        const rid = entry.requestId ? ` (${entry.requestId})` : "";
        console.log(`  ${ts}${lvl}${rid} ${entry.message || entry.raw}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
