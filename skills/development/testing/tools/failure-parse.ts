const args = Bun.argv.slice(2);

const HELP = `
failure-parse — Parse test runner output and group failures by root cause

Usage:
  bun run tools/failure-parse.ts [test-output-file] [options]

Options:
  --stdin    Read test output from stdin (pipe test results into this tool)
  --command <cmd>  Run this test command and parse its output
  --json     Output as JSON instead of plain text
  --help     Show this help message

Groups test failures by error type to help identify common root causes.
Without arguments, runs 'bun test' and parses the output.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const fromStdin = args.includes("--stdin");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] === "--command")
);

interface FailureGroup {
  category: string;
  count: number;
  failures: {
    test: string;
    file: string;
    error: string;
    line?: number;
  }[];
}

function categorizeError(error: string): string {
  if (/expected.*to (equal|be|match|have)/i.test(error)) return "assertion-mismatch";
  if (/cannot find module|module not found|import/i.test(error)) return "import-error";
  if (/is not a function|undefined is not/i.test(error)) return "type-error";
  if (/null|undefined.*property/i.test(error)) return "null-access";
  if (/timeout|exceeded|timed out/i.test(error)) return "timeout";
  if (/ECONNREFUSED|ENOTFOUND|fetch failed/i.test(error)) return "network-error";
  if (/snapshot/i.test(error)) return "snapshot-mismatch";
  if (/permission|EACCES/i.test(error)) return "permission-error";
  if (/syntax|unexpected token/i.test(error)) return "syntax-error";
  return "other";
}

function parseTestOutput(output: string): FailureGroup[] {
  const groups = new Map<string, FailureGroup>();
  const lines = output.split("\n");

  let currentTest = "";
  let currentFile = "";
  let currentError = "";
  let inFailure = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect test file context
    const fileMatch = line.match(/(?:FAIL|RUNS?)\s+(\S+\.(?:test|spec)\.\w+)/);
    if (fileMatch) {
      currentFile = fileMatch[1];
    }

    // Detect test name (bun/vitest format)
    const testMatch = line.match(/[x✗✕×]\s+(.+)/);
    if (testMatch) {
      if (inFailure && currentError) {
        addFailure(groups, currentTest, currentFile, currentError);
      }
      currentTest = testMatch[1].trim();
      currentError = "";
      inFailure = true;
    }

    // Collect error lines
    if (inFailure) {
      if (
        /error:|expected|received|Error:|AssertionError|TypeError|ReferenceError/i.test(line)
      ) {
        currentError += line.trim() + " ";
      }
    }

    // Detect end of failure block
    if (inFailure && (line.trim() === "" || /^[✓✔√]/.test(line))) {
      if (currentError) {
        addFailure(groups, currentTest, currentFile, currentError);
      }
      inFailure = false;
      currentError = "";
    }
  }

  // Don't forget the last failure
  if (inFailure && currentError) {
    addFailure(groups, currentTest, currentFile, currentError);
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
}

function addFailure(
  groups: Map<string, FailureGroup>,
  test: string,
  file: string,
  error: string
) {
  const category = categorizeError(error);
  if (!groups.has(category)) {
    groups.set(category, { category, count: 0, failures: [] });
  }
  const group = groups.get(category)!;
  group.count++;
  group.failures.push({ test, file, error: error.trim().slice(0, 200) });
}

async function main() {
  let output: string;

  if (fromStdin) {
    const chunks: string[] = [];
    const reader = Bun.stdin.stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(new TextDecoder().decode(value));
    }
    output = chunks.join("");
  } else if (filteredArgs[0]) {
    const file = Bun.file(filteredArgs[0]);
    if (!(await file.exists())) {
      console.error(`Error: file not found: ${filteredArgs[0]}`);
      process.exit(1);
    }
    output = await file.text();
  } else {
    // Run tests and capture output
    const cmd = getFlag("--command") || "bun test";
    console.error(`Running: ${cmd}`);
    const parts = cmd.split(" ");
    const proc = Bun.spawn(parts, { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    await proc.exited;
    output = stdout + "\n" + stderr;
  }

  const groups = parseTestOutput(output);
  const totalFailures = groups.reduce((s, g) => s + g.count, 0);

  const result = {
    totalFailures,
    groups: groups.length,
    details: groups,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (totalFailures === 0) {
      console.log("No test failures detected.");
      return;
    }

    console.log(`${totalFailures} failure(s) in ${groups.length} group(s)\n`);

    for (const group of groups) {
      console.log(`[${group.category}] (${group.count} failure${group.count > 1 ? "s" : ""})`);
      for (const f of group.failures) {
        console.log(`  ${f.file}: ${f.test}`);
        console.log(`    ${f.error.slice(0, 120)}`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
