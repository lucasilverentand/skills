const args = Bun.argv.slice(2);

const HELP = `
bench-compare — Run benchmarks on two branches and report statistical comparison

Usage:
  bun run tools/bench-compare.ts <branch-a> <branch-b> [options]

Options:
  --runs <n>       Number of benchmark runs per branch (default: 5)
  --script <cmd>   Custom benchmark command (default: bun run bench)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Checks out each branch, runs the benchmark command multiple times,
then compares the results with statistical analysis.
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
    !(args[i - 1] === "--script")
);

async function runBenchmark(command: string): Promise<{ duration: number; output: string }> {
  const start = performance.now();
  const parts = command.split(" ");
  const proc = Bun.spawn(parts, {
    stdout: "pipe",
    stderr: "pipe",
  });
  const output = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  const duration = performance.now() - start;

  if (exitCode !== 0) {
    throw new Error(`Benchmark failed: ${stderr || output}`);
  }

  return { duration, output: output + stderr };
}

function calculateStats(values: number[]): {
  mean: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);
  return { mean, median, stddev, min: sorted[0], max: sorted[sorted.length - 1] };
}

// Simple two-sample t-test
function tTest(a: number[], b: number[]): number {
  const meanA = a.reduce((s, v) => s + v, 0) / a.length;
  const meanB = b.reduce((s, v) => s + v, 0) / b.length;
  const varA = a.reduce((s, v) => s + (v - meanA) ** 2, 0) / (a.length - 1);
  const varB = b.reduce((s, v) => s + (v - meanB) ** 2, 0) / (b.length - 1);
  const se = Math.sqrt(varA / a.length + varB / b.length);
  if (se === 0) return 1;
  const t = Math.abs(meanA - meanB) / se;
  // Approximate p-value using normal distribution for large enough samples
  const p = Math.exp(-0.5 * t * t) * 0.4; // rough approximation
  return Math.min(1, p);
}

async function main() {
  const branchA = filteredArgs[0];
  const branchB = filteredArgs[1];

  if (!branchA || !branchB) {
    console.error("Error: two branch names required");
    process.exit(1);
  }

  const runs = parseInt(getFlag("--runs") || "5");
  const benchCmd = getFlag("--script") || "bun run bench";

  // Get current branch to restore later
  const currentBranchProc = Bun.spawn(["git", "branch", "--show-current"], {
    stdout: "pipe",
  });
  const currentBranch = (await new Response(currentBranchProc.stdout).text()).trim();
  await currentBranchProc.exited;

  // Check for uncommitted changes
  const statusProc = Bun.spawn(["git", "status", "--porcelain"], {
    stdout: "pipe",
  });
  const statusOutput = (await new Response(statusProc.stdout).text()).trim();
  await statusProc.exited;

  if (statusOutput) {
    console.error("Error: uncommitted changes detected. Commit or stash before benchmarking.");
    process.exit(1);
  }

  const resultsA: number[] = [];
  const resultsB: number[] = [];

  try {
    // Benchmark branch A
    console.error(`Benchmarking ${branchA} (${runs} runs)...`);
    const checkoutA = Bun.spawn(["git", "checkout", branchA], { stdout: "pipe", stderr: "pipe" });
    await checkoutA.exited;

    for (let i = 0; i < runs; i++) {
      const { duration } = await runBenchmark(benchCmd);
      resultsA.push(duration);
      console.error(`  Run ${i + 1}: ${duration.toFixed(1)}ms`);
    }

    // Benchmark branch B
    console.error(`Benchmarking ${branchB} (${runs} runs)...`);
    const checkoutB = Bun.spawn(["git", "checkout", branchB], { stdout: "pipe", stderr: "pipe" });
    await checkoutB.exited;

    for (let i = 0; i < runs; i++) {
      const { duration } = await runBenchmark(benchCmd);
      resultsB.push(duration);
      console.error(`  Run ${i + 1}: ${duration.toFixed(1)}ms`);
    }
  } finally {
    // Restore original branch
    const restore = Bun.spawn(["git", "checkout", currentBranch], {
      stdout: "pipe",
      stderr: "pipe",
    });
    await restore.exited;
  }

  const statsA = calculateStats(resultsA);
  const statsB = calculateStats(resultsB);
  const pValue = tTest(resultsA, resultsB);
  const changePercent = ((statsB.mean - statsA.mean) / statsA.mean) * 100;
  const significant = pValue < 0.05;

  const result = {
    branchA,
    branchB,
    runs,
    command: benchCmd,
    statsA: { ...statsA, values: resultsA },
    statsB: { ...statsB, values: resultsB },
    comparison: {
      changePercent: parseFloat(changePercent.toFixed(2)),
      pValue: parseFloat(pValue.toFixed(4)),
      significant,
      verdict: significant
        ? changePercent > 5
          ? "regression"
          : changePercent < -5
            ? "improvement"
            : "no meaningful change"
        : "not statistically significant",
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Benchmark Comparison: ${branchA} vs ${branchB}`);
    console.log(`  Command: ${benchCmd}`);
    console.log(`  Runs: ${runs}\n`);

    console.log(`  ${branchA}:`);
    console.log(`    Mean:   ${statsA.mean.toFixed(1)}ms`);
    console.log(`    Median: ${statsA.median.toFixed(1)}ms`);
    console.log(`    StdDev: ${statsA.stddev.toFixed(1)}ms`);

    console.log(`  ${branchB}:`);
    console.log(`    Mean:   ${statsB.mean.toFixed(1)}ms`);
    console.log(`    Median: ${statsB.median.toFixed(1)}ms`);
    console.log(`    StdDev: ${statsB.stddev.toFixed(1)}ms`);

    console.log(`\n  Change: ${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`);
    console.log(`  p-value: ${pValue.toFixed(4)} (${significant ? "significant" : "not significant"})`);
    console.log(`  Verdict: ${result.comparison.verdict}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
