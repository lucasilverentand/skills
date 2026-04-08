// Aggregate individual run results into benchmark summary statistics.
//
// Reads grading.json files from run directories and produces:
// - run_summary with mean, stddev, min, max for each metric
// - delta between configurations
//
// Supports two directory layouts:
//   Workspace layout:  <dir>/eval-N/{with_skill,without_skill}/run-N/grading.json
//   Legacy layout:     <dir>/runs/eval-N/{with_skill,without_skill}/run-N/grading.json

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { join, resolve } from "node:path";

interface Stats {
  mean: number;
  stddev: number;
  min: number;
  max: number;
}

function calculateStats(values: number[]): Stats {
  if (values.length === 0) {
    return { mean: 0, stddev: 0, min: 0, max: 0 };
  }

  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const stddev =
    n > 1
      ? Math.sqrt(
          values.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (n - 1)
        )
      : 0;

  return {
    mean: Math.round(mean * 10000) / 10000,
    stddev: Math.round(stddev * 10000) / 10000,
    min: Math.round(Math.min(...values) * 10000) / 10000,
    max: Math.round(Math.max(...values) * 10000) / 10000,
  };
}

function loadRunResults(
  benchmarkDir: string
): Record<string, Record<string, unknown>[]> {
  const runsDir = join(benchmarkDir, "runs");
  let searchDir: string;

  if (existsSync(runsDir)) {
    searchDir = runsDir;
  } else {
    const evalDirs = readdirSync(benchmarkDir).filter((d) =>
      d.startsWith("eval-")
    );
    if (evalDirs.length > 0) {
      searchDir = benchmarkDir;
    } else {
      console.log(
        `No eval directories found in ${benchmarkDir} or ${runsDir}`
      );
      return {};
    }
  }

  const results: Record<string, Record<string, unknown>[]> = {};

  const evalDirs = readdirSync(searchDir)
    .filter((d) => d.startsWith("eval-"))
    .sort();

  for (let evalIdx = 0; evalIdx < evalDirs.length; evalIdx++) {
    const evalDir = join(searchDir, evalDirs[evalIdx]);
    if (!statSync(evalDir).isDirectory()) continue;

    let evalId = evalIdx;
    const metadataPath = join(evalDir, "eval_metadata.json");
    if (existsSync(metadataPath)) {
      try {
        evalId = JSON.parse(readFileSync(metadataPath, "utf-8")).eval_id ?? evalIdx;
      } catch {}
    } else {
      try {
        evalId = parseInt(evalDirs[evalIdx].split("-")[1], 10);
        if (isNaN(evalId)) evalId = evalIdx;
      } catch {
        evalId = evalIdx;
      }
    }

    // Discover config directories
    const configDirs = readdirSync(evalDir)
      .filter((d) => {
        const p = join(evalDir, d);
        if (!statSync(p).isDirectory()) return false;
        return readdirSync(p).some((f) => f.startsWith("run-"));
      })
      .sort();

    for (const config of configDirs) {
      if (!results[config]) results[config] = [];
      const configDir = join(evalDir, config);

      const runDirs = readdirSync(configDir)
        .filter((d) => d.startsWith("run-"))
        .sort();

      for (const runDirName of runDirs) {
        const runDir = join(configDir, runDirName);
        let runNumber: number;
        try {
          runNumber = parseInt(runDirName.split("-")[1], 10);
        } catch {
          continue;
        }

        const gradingFile = join(runDir, "grading.json");
        if (!existsSync(gradingFile)) {
          console.log(`Warning: grading.json not found in ${runDir}`);
          continue;
        }

        let grading: Record<string, unknown>;
        try {
          grading = JSON.parse(readFileSync(gradingFile, "utf-8"));
        } catch (e) {
          console.log(`Warning: Invalid JSON in ${gradingFile}: ${e}`);
          continue;
        }

        const summary = (grading.summary as Record<string, number>) || {};
        const result: Record<string, unknown> = {
          eval_id: evalId,
          run_number: runNumber,
          pass_rate: summary.pass_rate ?? 0,
          passed: summary.passed ?? 0,
          failed: summary.failed ?? 0,
          total: summary.total ?? 0,
        };

        // Timing
        const timing = (grading.timing as Record<string, number>) || {};
        result.time_seconds = timing.total_duration_seconds ?? 0;

        const timingFile = join(runDir, "timing.json");
        if (result.time_seconds === 0 && existsSync(timingFile)) {
          try {
            const td = JSON.parse(readFileSync(timingFile, "utf-8"));
            result.time_seconds = td.total_duration_seconds ?? 0;
            result.tokens = td.total_tokens ?? 0;
          } catch {}
        }

        // Metrics
        const metrics =
          (grading.execution_metrics as Record<string, unknown>) || {};
        result.tool_calls =
          (metrics.total_tool_calls as number) ?? 0;
        if (!result.tokens) {
          result.tokens = (metrics.output_chars as number) ?? 0;
        }
        result.errors =
          (metrics.errors_encountered as number) ?? 0;

        // Expectations — viewer requires fields: text, passed, evidence
        const rawExpectations = (grading.expectations as Record<string, unknown>[]) ?? [];
        for (const exp of rawExpectations) {
          if (!("text" in exp) || !("passed" in exp)) {
            console.log(`Warning: expectation in ${gradingFile} missing required fields (text, passed, evidence): ${JSON.stringify(exp)}`);
          }
        }
        result.expectations = rawExpectations;

        // Notes
        const notesSummary =
          (grading.user_notes_summary as Record<string, string[]>) || {};
        result.notes = [
          ...(notesSummary.uncertainties || []),
          ...(notesSummary.needs_review || []),
          ...(notesSummary.workarounds || []),
        ];

        results[config].push(result);
      }
    }
  }

  return results;
}

function aggregateResults(
  results: Record<string, Record<string, unknown>[]>
): Record<string, unknown> {
  const runSummary: Record<string, unknown> = {};
  const configs = Object.keys(results);

  for (const config of configs) {
    const runs = results[config] || [];
    if (runs.length === 0) {
      runSummary[config] = {
        pass_rate: { mean: 0, stddev: 0, min: 0, max: 0 },
        time_seconds: { mean: 0, stddev: 0, min: 0, max: 0 },
        tokens: { mean: 0, stddev: 0, min: 0, max: 0 },
      };
      continue;
    }

    runSummary[config] = {
      pass_rate: calculateStats(runs.map((r) => r.pass_rate as number)),
      time_seconds: calculateStats(
        runs.map((r) => r.time_seconds as number)
      ),
      tokens: calculateStats(
        runs.map((r) => (r.tokens as number) || 0)
      ),
    };
  }

  // Delta between first two configs
  if (configs.length === 0) return runSummary;

  const primary = (runSummary[configs[0]] as Record<string, Stats>) || {};
  const baseline =
    configs.length >= 2
      ? (runSummary[configs[1]] as Record<string, Stats>) || {}
      : ({} as Record<string, Stats>);

  const deltaPr =
    (primary.pass_rate?.mean ?? 0) - (baseline.pass_rate?.mean ?? 0);
  const deltaTime =
    (primary.time_seconds?.mean ?? 0) - (baseline.time_seconds?.mean ?? 0);
  const deltaTokens =
    (primary.tokens?.mean ?? 0) - (baseline.tokens?.mean ?? 0);

  (runSummary as Record<string, unknown>).delta = {
    pass_rate: `${deltaPr >= 0 ? "+" : ""}${deltaPr.toFixed(2)}`,
    time_seconds: `${deltaTime >= 0 ? "+" : ""}${deltaTime.toFixed(1)}`,
    tokens: `${deltaTokens >= 0 ? "+" : ""}${Math.round(deltaTokens)}`,
  };

  return runSummary;
}

function generateBenchmark(
  benchmarkDir: string,
  skillName = "",
  skillPath = ""
): Record<string, unknown> {
  const results = loadRunResults(benchmarkDir);
  const runSummary = aggregateResults(results);

  const runs: Record<string, unknown>[] = [];
  for (const config of Object.keys(results)) {
    for (const result of results[config]) {
      runs.push({
        eval_id: result.eval_id,
        configuration: config,
        run_number: result.run_number,
        result: {
          pass_rate: result.pass_rate,
          passed: result.passed,
          failed: result.failed,
          total: result.total,
          time_seconds: result.time_seconds,
          tokens: result.tokens ?? 0,
          tool_calls: result.tool_calls ?? 0,
          errors: result.errors ?? 0,
        },
        expectations: result.expectations,
        notes: result.notes,
      });
    }
  }

  const evalIds = [
    ...new Set(
      Object.values(results)
        .flat()
        .map((r) => r.eval_id as number)
    ),
  ].sort((a, b) => a - b);

  return {
    metadata: {
      skill_name: skillName || "<skill-name>",
      skill_path: skillPath || "<path/to/skill>",
      executor_model: "<model-name>",
      analyzer_model: "<model-name>",
      timestamp: new Date().toISOString(),
      evals_run: evalIds,
      runs_per_configuration: 3,
    },
    runs,
    run_summary: runSummary,
    notes: [],
  };
}

function generateMarkdown(benchmark: Record<string, unknown>): string {
  const metadata = benchmark.metadata as Record<string, unknown>;
  const runSummary = benchmark.run_summary as Record<string, Record<string, Stats>>;

  const configs = Object.keys(runSummary).filter((k) => k !== "delta");
  const labelA = (configs[0] || "config_a").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const labelB = (configs[1] || "config_b").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const a = runSummary[configs[0]] || {};
  const b = runSummary[configs[1]] || {};
  const delta = (runSummary as Record<string, unknown>).delta as Record<string, string> || {};

  const lines = [
    `# Skill Benchmark: ${metadata.skill_name}`,
    "",
    `**Model**: ${metadata.executor_model}`,
    `**Date**: ${metadata.timestamp}`,
    `**Evals**: ${(metadata.evals_run as number[]).join(", ")} (${metadata.runs_per_configuration} runs each per configuration)`,
    "",
    "## Summary",
    "",
    `| Metric | ${labelA} | ${labelB} | Delta |`,
    "|--------|------------|---------------|-------|",
    `| Pass Rate | ${((a.pass_rate?.mean ?? 0) * 100).toFixed(0)}% ± ${((a.pass_rate?.stddev ?? 0) * 100).toFixed(0)}% | ${((b.pass_rate?.mean ?? 0) * 100).toFixed(0)}% ± ${((b.pass_rate?.stddev ?? 0) * 100).toFixed(0)}% | ${delta.pass_rate ?? "—"} |`,
    `| Time | ${(a.time_seconds?.mean ?? 0).toFixed(1)}s ± ${(a.time_seconds?.stddev ?? 0).toFixed(1)}s | ${(b.time_seconds?.mean ?? 0).toFixed(1)}s ± ${(b.time_seconds?.stddev ?? 0).toFixed(1)}s | ${delta.time_seconds ?? "—"}s |`,
    `| Tokens | ${(a.tokens?.mean ?? 0).toFixed(0)} ± ${(a.tokens?.stddev ?? 0).toFixed(0)} | ${(b.tokens?.mean ?? 0).toFixed(0)} ± ${(b.tokens?.stddev ?? 0).toFixed(0)} | ${delta.tokens ?? "—"} |`,
  ];

  const notes = (benchmark.notes as string[]) || [];
  if (notes.length > 0) {
    lines.push("", "## Notes", "");
    for (const note of notes) {
      lines.push(`- ${note}`);
    }
  }

  return lines.join("\n");
}

// CLI entrypoint
if (import.meta.main) {
  const args = Bun.argv.slice(2);

  const HELP = `
aggregate-benchmark — Aggregate benchmark run results into summary statistics

Usage:
  bun run scripts/aggregate-benchmark.ts <benchmark-dir> [options]

Options:
  --skill-name <name>   Name of the skill being benchmarked
  --skill-path <path>   Path to the skill being benchmarked
  -o, --output <path>   Output path for benchmark.json (default: <dir>/benchmark.json)
  --help                Show this help message
`.trim();

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  // Parse named args
  const nameIdx = args.indexOf("--skill-name");
  const skillName = nameIdx !== -1 ? args[nameIdx + 1] : "";
  const pathIdx = args.indexOf("--skill-path");
  const skillPath = pathIdx !== -1 ? args[pathIdx + 1] : "";
  const outputIdx =
    args.indexOf("-o") !== -1 ? args.indexOf("-o") : args.indexOf("--output");
  const outputArg = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  // Collect positional args (skip named arg values)
  const namedArgIndices = new Set<number>();
  for (const flag of ["--skill-name", "--skill-path", "-o", "--output"]) {
    const idx = args.indexOf(flag);
    if (idx !== -1) {
      namedArgIndices.add(idx);
      namedArgIndices.add(idx + 1);
    }
  }
  const positionalArgs = args.filter(
    (a, i) => !a.startsWith("--") && !namedArgIndices.has(i)
  );

  const benchmarkDir = resolve(positionalArgs[0]);
  if (!existsSync(benchmarkDir)) {
    console.error(`Directory not found: ${benchmarkDir}`);
    process.exit(1);
  }

  const benchmark = generateBenchmark(benchmarkDir, skillName, skillPath);

  const outputJson = outputArg || join(benchmarkDir, "benchmark.json");
  const outputMd = outputJson.replace(/\.json$/, ".md");

  writeFileSync(outputJson, JSON.stringify(benchmark, null, 2));
  console.log(`Generated: ${outputJson}`);

  writeFileSync(outputMd, generateMarkdown(benchmark));
  console.log(`Generated: ${outputMd}`);

  // Print summary
  const runSummary = benchmark.run_summary as Record<string, Record<string, Stats>>;
  const configs = Object.keys(runSummary).filter((k) => k !== "delta");
  const delta = (runSummary as Record<string, unknown>).delta as Record<string, string> || {};

  console.log("\nSummary:");
  for (const config of configs) {
    const pr = runSummary[config]?.pass_rate?.mean ?? 0;
    const label = config.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    console.log(`  ${label}: ${(pr * 100).toFixed(1)}% pass rate`);
  }
  console.log(`  Delta:         ${delta.pass_rate ?? "—"}`);
}
