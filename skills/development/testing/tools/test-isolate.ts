const args = Bun.argv.slice(2);

const HELP = `
test-isolate — Run a single test in isolation to check for side-effect dependencies

Usage:
  bun run tools/test-isolate.ts <test-file> [test-name] [options]

Options:
  --runs <n>       Number of isolated runs (default: 3)
  --command <cmd>  Custom test command prefix (default: bun test)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Runs a specific test file (or test name) in isolation multiple times to
determine if failures are caused by side effects from other tests.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    !(args[i - 1] === "--runs") &&
    !(args[i - 1] === "--command")
);

interface IsolatedRun {
  run: number;
  passed: boolean;
  duration: number;
  output: string;
}

async function main() {
  const testFile = filteredArgs[0];
  const testName = filteredArgs[1];

  if (!testFile) {
    console.error("Error: test file path required");
    process.exit(1);
  }

  const runs = parseInt(getFlag("--runs") || "3");
  const baseCmd = getFlag("--command") || "bun test";

  // Build the isolated test command
  const cmdParts = baseCmd.split(" ");
  cmdParts.push(testFile);
  if (testName) {
    cmdParts.push("--grep", testName);
  }

  console.error(`Isolating: ${testFile}${testName ? ` > "${testName}"` : ""}`);
  console.error(`Running ${runs} isolated executions...\n`);

  const results: IsolatedRun[] = [];

  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const proc = Bun.spawn(cmdParts, {
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        // Ensure clean environment for each run
        NODE_ENV: "test",
      },
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    const duration = Math.round(performance.now() - start);

    results.push({
      run: i + 1,
      passed: exitCode === 0,
      duration,
      output: (stdout + stderr).trim().slice(0, 500),
    });

    console.error(`  Run ${i + 1}: ${exitCode === 0 ? "PASS" : "FAIL"} (${duration}ms)`);
  }

  const passes = results.filter((r) => r.passed).length;
  const fails = results.filter((r) => !r.passed).length;

  let verdict: string;
  if (passes === runs) {
    verdict = "passes-in-isolation";
  } else if (fails === runs) {
    verdict = "fails-consistently";
  } else {
    verdict = "flaky";
  }

  let diagnosis: string;
  switch (verdict) {
    case "passes-in-isolation":
      diagnosis =
        "Test passes when run alone but may fail with other tests. " +
        "Likely cause: shared mutable state or ordering dependency. " +
        "Check for missing beforeEach/afterEach cleanup.";
      break;
    case "fails-consistently":
      diagnosis =
        "Test fails even in isolation. " +
        "The failure is in the test itself or the code under test, not a side effect.";
      break;
    case "flaky":
      diagnosis =
        "Test results are inconsistent even in isolation. " +
        "Likely cause: race condition, timing dependency, or non-deterministic input. " +
        "Check for unresolved promises, Date.now(), or random values.";
      break;
  }

  const result = {
    testFile,
    testName: testName || null,
    runs,
    passes,
    fails,
    verdict,
    diagnosis,
    details: results,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nIsolation Results: ${testFile}${testName ? ` > "${testName}"` : ""}`);
    console.log(`  Runs: ${runs} | Pass: ${passes} | Fail: ${fails}`);
    console.log(`  Verdict: ${verdict}\n`);
    console.log(`  Diagnosis: ${diagnosis}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
