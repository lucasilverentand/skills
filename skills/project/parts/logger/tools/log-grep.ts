const args = Bun.argv.slice(2);

const HELP = `
log-grep — Search structured log output by level, message, or trace ID

Usage:
  bun run tools/log-grep.ts <pattern> [options]

Arguments:
  pattern    String to search for in log messages

Options:
  --level <level>     Filter by log level (trace, debug, info, warn, error, fatal)
  --trace <id>        Filter by request/trace ID
  --file <path>       Log file to search (default: stdin or last log output)
  --json              Output as JSON instead of plain text
  --help              Show this help message

Reads structured JSON log lines (pino-format) from a file or stdin.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const LEVEL_MAP: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

interface LogEntry {
  level: number;
  levelName: string;
  time: string;
  msg: string;
  requestId?: string;
  [key: string]: unknown;
}

function parseLogLine(line: string): LogEntry | null {
  try {
    const obj = JSON.parse(line);
    const level = obj.level ?? 30;
    return {
      ...obj,
      level,
      levelName: LEVEL_MAP[level] || String(level),
      time: obj.time ? new Date(obj.time).toISOString() : "",
      msg: obj.msg || obj.message || "",
    };
  } catch {
    return null;
  }
}

async function main() {
  const pattern = filteredArgs[0];
  if (!pattern) {
    console.error("Error: missing required pattern argument");
    process.exit(1);
  }

  const levelFilter = getFlag("--level");
  const traceFilter = getFlag("--trace");
  const logFile = getFlag("--file");

  let input: string;

  if (logFile) {
    const file = Bun.file(logFile);
    if (!(await file.exists())) {
      console.error(`Error: log file not found: ${logFile}`);
      process.exit(1);
    }
    input = await file.text();
  } else {
    // Try to read from stdin if piped
    if (Bun.stdin.stream) {
      const chunks: string[] = [];
      const reader = Bun.stdin.stream().getReader();
      const decoder = new TextDecoder();

      // Read with a timeout
      const timeout = setTimeout(() => {
        reader.cancel();
      }, 1000);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(decoder.decode(value));
        }
      } catch {
        // Timeout or read error
      }
      clearTimeout(timeout);
      input = chunks.join("");
    } else {
      console.error("Error: no log file specified and no stdin input");
      console.error("Usage: cat app.log | bun run tools/log-grep.ts <pattern>");
      console.error("       bun run tools/log-grep.ts <pattern> --file app.log");
      process.exit(1);
    }
  }

  const lines = input.split("\n").filter(Boolean);
  const matches: LogEntry[] = [];
  const patternLower = pattern.toLowerCase();

  const levelValue: number | undefined = levelFilter
    ? Object.entries(LEVEL_MAP).find(([, name]) => name === levelFilter)?.[0] as unknown as number
    : undefined;

  for (const line of lines) {
    const entry = parseLogLine(line);
    if (!entry) continue;

    // Apply filters
    if (levelValue !== undefined && entry.level !== Number(levelValue)) continue;
    if (traceFilter && entry.requestId !== traceFilter) continue;

    // Pattern match
    const serialized = JSON.stringify(entry).toLowerCase();
    if (serialized.includes(patternLower)) {
      matches.push(entry);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(matches, null, 2));
  } else {
    if (matches.length === 0) {
      console.log(`No matching log entries for "${pattern}".`);
      return;
    }

    console.log(`Found ${matches.length} matching entries:\n`);

    for (const entry of matches) {
      const trace = entry.requestId ? ` [${entry.requestId}]` : "";
      console.log(
        `  ${entry.time} ${entry.levelName.toUpperCase().padEnd(5)} ${entry.msg}${trace}`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
