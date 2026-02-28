const args = Bun.argv.slice(2);

const HELP = `
flaky-detector — Identify tests with inconsistent pass/fail history

Usage:
  bun run tools/flaky-detector.ts [options]

Options:
  --runs <n>       Number of test suite runs (default: 3)
  --command <cmd>  Custom test command (default: bun test)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Runs the test suite multiple times and identifies tests that produce
inconsistent results, flagging them as potentially flaky.
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

interface TestOutcome {
  name: string;
  results: boolean[];
  isFlaky: boolean;
}

function parseResults(output: string): Map<string, boolean> {
  const results = new Map<string, boolean>();
  const lines = output.split("\n");

  for (const line of lines) {
    const passMatch = line.match(/[✓✔√]\s+(.+)/);
    if (passMatch) {
      results.set(passMatch[1].trim(), true);
      continue;
    }
    const failMatch = line.match(/[x✗✕×]\s+(.+)/);
    if (failMatch) {
      results.set(failMatch[1].trim(), false);
    }
  }

  return results;
}

async function main() {
  const runs = parseInt(getFlag("--runs") || "3");
  const testCmd = getFlag("--command") || "bun test";

  console.error(`Running ${runs} iterations to detect flaky tests...`);

  const allResults: Map<string, boolean>[] = [];

  for (let i = 0; i < runs; i++) {
    console.error(`  Run ${i + 1}/${runs}...`);
    const parts = testCmd.split(" ");
    const proc = Bun.spawn(parts, { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    await proc.exited;

    allResults.push(parseResults(stdout + "\n" + stderr));
  }

  // Combine results per test
  const testNames = new Set<string>();
  for (const run of allResults) {
    for (const name of run.keys()) {
      testNames.add(name);
    }
  }

  const outcomes: TestOutcome[] = [];
  for (const name of testNames) {
    const results: boolean[] = [];
    for (const run of allResults) {
      if (run.has(name)) {
        results.push(run.get(name)!);
      }
    }

    const hasPass = results.includes(true);
    const hasFail = results.includes(false);
    const isFlaky = hasPass && hasFail;

    outcomes.push({ name, results, isFlaky });
  }

  const flakyTests = outcomes.filter((o) => o.isFlaky);
  const consistentFails = outcomes.filter(
    (o) => !o.isFlaky && o.results.every((r) => !r)
  );

  const result = {
    totalTests: outcomes.length,
    runs,
    flakyTests: flakyTests.map((t) => ({
      name: t.name,
      passRate: Math.round(
        (t.results.filter((r) => r).length / t.results.length) * 100
      ),
    })),
    consistentFailures: consistentFails.map((t) => t.name),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Flaky Detection: ${outcomes.length} tests, ${runs} runs\n`);

    if (flakyTests.length === 0) {
      console.log("No flaky tests detected.");
    } else {
      console.log(`Flaky tests (${flakyTests.length}):`);
      for (const t of flakyTests) {
        const rate = Math.round(
          (t.results.filter((r) => r).length / t.results.length) * 100
        );
        const pattern = t.results.map((r) => (r ? "P" : "F")).join("");
        console.log(`  ${t.name}`);
        console.log(`    Pass rate: ${rate}% | Pattern: ${pattern}`);
      }
    }

    if (consistentFails.length > 0) {
      console.log(`\nConsistent failures (${consistentFails.length}):`);
      for (const name of consistentFails) {
        console.log(`  ${name}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
