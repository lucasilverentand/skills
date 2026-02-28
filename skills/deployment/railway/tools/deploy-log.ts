const args = Bun.argv.slice(2);

const HELP = `
deploy-log — Fetch and format the latest deploy logs for a Railway service

Usage:
  bun run tools/deploy-log.ts [options]

Options:
  --lines <n>         Number of log lines to fetch (default: 100)
  --environment <env> Railway environment (default: linked environment)
  --service <name>    Railway service name
  --errors            Only show error-level log lines
  --json              Output as JSON instead of plain text
  --help              Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const errorsOnly = args.includes("--errors");

function getArg(flag: string, defaultVal: string): string {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const lines = parseInt(getArg("--lines", "100"), 10);
const environment = getArg("--environment", "");
const service = getArg("--service", "");

interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "warn" | "debug";
  message: string;
}

async function run(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

function classifyLogLine(line: string): "info" | "error" | "warn" | "debug" {
  const lower = line.toLowerCase();
  if (lower.includes("error") || lower.includes("fatal") || lower.includes("exception") || lower.includes("panic") || lower.includes("elifecycle")) {
    return "error";
  }
  if (lower.includes("warn") || lower.includes("deprecat")) {
    return "warn";
  }
  if (lower.includes("debug") || lower.includes("trace")) {
    return "debug";
  }
  return "info";
}

async function main() {
  // Fetch logs using Railway CLI
  const logArgs = ["railway", "logs", "--num", String(lines)];
  if (environment) logArgs.push("--environment", environment);
  if (service) logArgs.push("--service", service);

  const result = await run(logArgs);
  if (result.exitCode !== 0) {
    console.error(`Error fetching logs: ${result.stderr}`);
    console.error("Make sure you're linked to a Railway project (run 'railway link').");
    process.exit(1);
  }

  if (!result.stdout) {
    if (jsonOutput) {
      console.log(JSON.stringify({ entries: [], message: "No logs found" }));
    } else {
      console.log("No logs found.");
    }
    process.exit(0);
  }

  // Parse log lines
  const entries: LogEntry[] = [];
  for (const line of result.stdout.split("\n")) {
    if (!line.trim()) continue;

    // Try to parse timestamp from common formats
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[.\d]*Z?)\s*/);
    const timestamp = timestampMatch ? timestampMatch[1] : "";
    const message = timestampMatch ? line.slice(timestampMatch[0].length) : line;

    const level = classifyLogLine(message);
    entries.push({ timestamp, level, message: message.trim() });
  }

  const filtered = errorsOnly ? entries.filter((e) => e.level === "error" || e.level === "warn") : entries;

  const summary = {
    total: entries.length,
    errors: entries.filter((e) => e.level === "error").length,
    warnings: entries.filter((e) => e.level === "warn").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify({ summary, entries: filtered }, null, 2));
  } else {
    if (summary.errors > 0 || summary.warnings > 0) {
      console.log(`Deploy logs: ${summary.total} lines (${summary.errors} errors, ${summary.warnings} warnings)\n`);
    } else {
      console.log(`Deploy logs: ${summary.total} lines\n`);
    }

    for (const entry of filtered) {
      let prefix = "";
      if (entry.level === "error") prefix = "ERR  ";
      else if (entry.level === "warn") prefix = "WARN ";
      else if (entry.level === "debug") prefix = "DBG  ";
      else prefix = "     ";

      const ts = entry.timestamp ? `${entry.timestamp} ` : "";
      console.log(`${prefix}${ts}${entry.message}`);
    }

    if (summary.errors > 0) {
      console.log(`\n${summary.errors} error(s) found. Review the error lines above.`);
    }
  }

  if (summary.errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
