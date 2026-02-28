const args = Bun.argv.slice(2);

const HELP = `
refactor-verify — Run the test suite before and after a refactor and diff results

Usage:
  bun run tools/refactor-verify.ts [options]

Options:
  --baseline   Capture baseline test results (run before refactoring)
  --compare    Compare current test results against the baseline
  --command <cmd>  Custom test command (default: bun test)
  --json       Output as JSON instead of plain text
  --help       Show this help message

Run with --baseline before refactoring, then --compare after to verify
no tests were broken.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const isBaseline = args.includes("--baseline");
const isCompare = args.includes("--compare");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

import { tmpdir } from "node:os";
import { join } from "node:path";

const BASELINE_FILE = join(tmpdir(), ".refactor-verify-baseline.json");

interface TestResult {
  timestamp: string;
  command: string;
  exitCode: number;
  output: string;
  passCount: number;
  failCount: number;
  skipCount: number;
  duration: number;
}

function parseTestOutput(output: string): { pass: number; fail: number; skip: number } {
  let pass = 0;
  let fail = 0;
  let skip = 0;

  // Bun test output: "X pass, Y fail, Z skip"
  const bunMatch = output.match(/(\d+)\s+pass/);
  if (bunMatch) pass = parseInt(bunMatch[1]);
  const bunFail = output.match(/(\d+)\s+fail/);
  if (bunFail) fail = parseInt(bunFail[1]);
  const bunSkip = output.match(/(\d+)\s+skip/);
  if (bunSkip) skip = parseInt(bunSkip[1]);

  // Vitest output: "Tests  X passed, Y failed, Z skipped"
  const vitestMatch = output.match(/(\d+)\s+passed/);
  if (vitestMatch && vitestMatch[1]) pass = parseInt(vitestMatch[1]);
  const vitestFail = output.match(/(\d+)\s+failed/);
  if (vitestFail) fail = parseInt(vitestFail[1]);

  return { pass, fail, skip };
}

async function runTests(command: string): Promise<TestResult> {
  const parts = command.split(" ");
  const start = performance.now();

  const proc = Bun.spawn(parts, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  const duration = performance.now() - start;

  const output = stdout + "\n" + stderr;
  const { pass, fail, skip } = parseTestOutput(output);

  return {
    timestamp: new Date().toISOString(),
    command,
    exitCode,
    output: output.trim(),
    passCount: pass,
    failCount: fail,
    skipCount: skip,
    duration: Math.round(duration),
  };
}

async function main() {
  const testCmd = getFlag("--command") || "bun test";

  if (!isBaseline && !isCompare) {
    // Default: just run tests and report
    const result = await runTests(testCmd);

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Test Results:`);
      console.log(`  Pass: ${result.passCount}`);
      console.log(`  Fail: ${result.failCount}`);
      console.log(`  Skip: ${result.skipCount}`);
      console.log(`  Duration: ${result.duration}ms`);
      console.log(`  Exit code: ${result.exitCode}`);
    }
    if (result.exitCode !== 0) process.exit(1);
    return;
  }

  if (isBaseline) {
    console.error("Running baseline tests...");
    const result = await runTests(testCmd);
    await Bun.write(BASELINE_FILE, JSON.stringify(result, null, 2));

    if (jsonOutput) {
      console.log(JSON.stringify({ baseline: result }, null, 2));
    } else {
      console.log(`Baseline captured:`);
      console.log(`  Pass: ${result.passCount}`);
      console.log(`  Fail: ${result.failCount}`);
      console.log(`  Skip: ${result.skipCount}`);
      console.log(`  Duration: ${result.duration}ms`);
      console.log(`\nSaved to: ${BASELINE_FILE}`);
      console.log("Run --compare after refactoring to verify.");
    }
    return;
  }

  if (isCompare) {
    const baselineFile = Bun.file(BASELINE_FILE);
    if (!(await baselineFile.exists())) {
      console.error("Error: no baseline found. Run with --baseline first.");
      process.exit(1);
    }

    const baseline: TestResult = await baselineFile.json();
    console.error("Running tests for comparison...");
    const current = await runTests(testCmd);

    const passDiff = current.passCount - baseline.passCount;
    const failDiff = current.failCount - baseline.failCount;
    const durationDiff = current.duration - baseline.duration;

    const ok = current.failCount <= baseline.failCount && current.passCount >= baseline.passCount;

    const result = {
      baseline: {
        pass: baseline.passCount,
        fail: baseline.failCount,
        skip: baseline.skipCount,
        duration: baseline.duration,
      },
      current: {
        pass: current.passCount,
        fail: current.failCount,
        skip: current.skipCount,
        duration: current.duration,
      },
      diff: { pass: passDiff, fail: failDiff, duration: durationDiff },
      verdict: ok ? "safe" : "regression",
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log("Refactor Verification:\n");
      console.log("          Baseline  Current  Diff");
      console.log(`  Pass:   ${String(baseline.passCount).padEnd(10)}${String(current.passCount).padEnd(9)}${passDiff >= 0 ? "+" : ""}${passDiff}`);
      console.log(`  Fail:   ${String(baseline.failCount).padEnd(10)}${String(current.failCount).padEnd(9)}${failDiff >= 0 ? "+" : ""}${failDiff}`);
      console.log(`  Time:   ${String(baseline.duration + "ms").padEnd(10)}${String(current.duration + "ms").padEnd(9)}${durationDiff >= 0 ? "+" : ""}${durationDiff}ms`);
      console.log(`\n  Verdict: ${ok ? "SAFE — no regressions" : "REGRESSION — tests got worse"}`);
    }

    if (!ok) process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
