const args = Bun.argv.slice(2);

const HELP = `
flaky-history — Track pass/fail history and rank tests by flakiness score

Usage:
  bun run tools/flaky-history.ts [options]

Options:
  --runs <n>       Number of test runs to perform (default: 5)
  --command <cmd>  Custom test command (default: bun test)
  --history <path> Path to history file (default: .flaky-history.json)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Runs the test suite multiple times and tracks which tests have inconsistent
results, ranking them by flakiness score (percentage of inconsistent runs).
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

interface TestRun {
  test: string;
  passed: boolean;
}

interface FlakyTest {
  name: string;
  passRate: number;
  flakiness: number;
  runs: number;
  passes: number;
  fails: number;
}

function parseTestResults(output: string): TestRun[] {
  const results: TestRun[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    // Bun test format: ✓ or ✗ followed by test name
    const passMatch = line.match(/[✓✔√]\s+(.+)/);
    if (passMatch) {
      results.push({ test: passMatch[1].trim(), passed: true });
      continue;
    }

    const failMatch = line.match(/[x✗✕×]\s+(.+)/);
    if (failMatch) {
      results.push({ test: failMatch[1].trim(), passed: false });
    }
  }

  return results;
}

async function main() {
  const runs = parseInt(getFlag("--runs") || "5");
  const testCmd = getFlag("--command") || "bun test";
  const historyPath = getFlag("--history") || ".flaky-history.json";

  // Load existing history
  let history: Record<string, { passes: number; fails: number }> = {};
  const histFile = Bun.file(historyPath);
  if (await histFile.exists()) {
    history = await histFile.json();
  }

  console.error(`Running ${runs} test iterations...`);

  for (let i = 0; i < runs; i++) {
    console.error(`  Run ${i + 1}/${runs}...`);
    const parts = testCmd.split(" ");
    const proc = Bun.spawn(parts, { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    await proc.exited;

    const results = parseTestResults(stdout + "\n" + stderr);

    for (const result of results) {
      if (!history[result.test]) {
        history[result.test] = { passes: 0, fails: 0 };
      }
      if (result.passed) {
        history[result.test].passes++;
      } else {
        history[result.test].fails++;
      }
    }
  }

  // Save updated history
  await Bun.write(historyPath, JSON.stringify(history, null, 2));

  // Calculate flakiness scores
  const flakyTests: FlakyTest[] = [];
  for (const [name, data] of Object.entries(history)) {
    const total = data.passes + data.fails;
    if (total < 2) continue;

    const passRate = data.passes / total;
    // Flakiness: 0 = always passes or always fails, 1 = 50/50
    const flakiness = 1 - Math.abs(2 * passRate - 1);

    if (flakiness > 0) {
      flakyTests.push({
        name,
        passRate: parseFloat((passRate * 100).toFixed(1)),
        flakiness: parseFloat((flakiness * 100).toFixed(1)),
        runs: total,
        passes: data.passes,
        fails: data.fails,
      });
    }
  }

  flakyTests.sort((a, b) => b.flakiness - a.flakiness);

  const result = {
    totalTests: Object.keys(history).length,
    flakyCount: flakyTests.length,
    runsPerformed: runs,
    historyFile: historyPath,
    flakyTests: flakyTests.slice(0, 20),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Flaky Test Report (${runs} new runs, ${result.totalTests} tests tracked)`);
    console.log(`History: ${historyPath}\n`);

    if (flakyTests.length === 0) {
      console.log("No flaky tests detected.");
    } else {
      console.log(`${flakyTests.length} flaky test(s):\n`);
      console.log("  Flakiness  Pass Rate  Runs  Test");
      console.log("  ---------  ---------  ----  ----");
      for (const t of flakyTests.slice(0, 20)) {
        console.log(
          `  ${String(t.flakiness + "%").padEnd(11)}${String(t.passRate + "%").padEnd(11)}${String(t.runs).padEnd(6)}${t.name}`
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
