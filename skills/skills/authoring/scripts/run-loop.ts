// Run the eval + improve loop until all pass or max iterations reached.
//
// Combines run-eval.ts and improve-description.ts in a loop, tracking history
// and returning the best description found. Supports train/test split to prevent
// overfitting.

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseSkillMd, findProjectRoot } from "./utils.ts";
import { runEval } from "./run-eval.ts";
import { improveDescription } from "./improve-description.ts";
import { generateHtml } from "./generate-report.ts";

interface EvalItem {
  query: string;
  should_trigger: boolean;
}

interface EvalResult {
  query: string;
  should_trigger: boolean;
  trigger_rate: number;
  triggers: number;
  runs: number;
  pass: boolean;
}

// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function splitEvalSet(
  evalSet: EvalItem[],
  holdout: number,
  seed = 42
): [EvalItem[], EvalItem[]] {
  const rng = mulberry32(seed);
  const trigger = evalSet.filter((e) => e.should_trigger);
  const noTrigger = evalSet.filter((e) => !e.should_trigger);

  const shuffledTrigger = seededShuffle(trigger, rng);
  const shuffledNoTrigger = seededShuffle(noTrigger, rng);

  const nTriggerTest = Math.max(
    1,
    Math.floor(trigger.length * holdout)
  );
  const nNoTriggerTest = Math.max(
    1,
    Math.floor(noTrigger.length * holdout)
  );

  const testSet = [
    ...shuffledTrigger.slice(0, nTriggerTest),
    ...shuffledNoTrigger.slice(0, nNoTriggerTest),
  ];
  const trainSet = [
    ...shuffledTrigger.slice(nTriggerTest),
    ...shuffledNoTrigger.slice(nNoTriggerTest),
  ];

  return [trainSet, testSet];
}

interface HistoryEntry {
  iteration: number;
  description: string;
  train_passed: number;
  train_failed: number;
  train_total: number;
  train_results: EvalResult[];
  test_passed: number | null;
  test_failed: number | null;
  test_total: number | null;
  test_results: EvalResult[] | null;
  passed: number;
  failed: number;
  total: number;
  results: EvalResult[];
}

async function runLoop(opts: {
  evalSet: EvalItem[];
  skillPath: string;
  descriptionOverride?: string;
  numWorkers: number;
  timeout: number;
  maxIterations: number;
  runsPerQuery: number;
  triggerThreshold: number;
  holdout: number;
  model: string;
  verbose: boolean;
  liveReportPath?: string;
  logDir?: string;
}): Promise<Record<string, unknown>> {
  const {
    evalSet,
    skillPath,
    descriptionOverride,
    numWorkers,
    timeout,
    maxIterations,
    runsPerQuery,
    triggerThreshold,
    holdout,
    model,
    verbose,
    liveReportPath,
    logDir,
  } = opts;

  const projectRoot = findProjectRoot();
  const { name, description: originalDescription, content } =
    parseSkillMd(skillPath);
  let currentDescription = descriptionOverride || originalDescription;

  let trainSet: EvalItem[];
  let testSet: EvalItem[];

  if (holdout > 0) {
    [trainSet, testSet] = splitEvalSet(evalSet, holdout);
    if (verbose) {
      console.error(
        `Split: ${trainSet.length} train, ${testSet.length} test (holdout=${holdout})`
      );
    }
  } else {
    trainSet = evalSet;
    testSet = [];
  }

  const history: HistoryEntry[] = [];
  let exitReason = "unknown";

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    if (verbose) {
      console.error(`\n${"=".repeat(60)}`);
      console.error(`Iteration ${iteration}/${maxIterations}`);
      console.error(`Description: ${currentDescription}`);
      console.error("=".repeat(60));
    }

    // Evaluate train + test together for parallelism
    const allQueries = [...trainSet, ...testSet];
    const t0 = Date.now();

    const allResults = await runEval({
      evalSet: allQueries,
      skillName: name,
      description: currentDescription,
      numWorkers,
      timeout,
      projectRoot,
      runsPerQuery,
      triggerThreshold,
      model,
    });

    const evalElapsed = (Date.now() - t0) / 1000;

    // Split results back
    const trainQueriesSet = new Set(trainSet.map((q) => q.query));
    const trainResultList = allResults.results.filter((r) =>
      trainQueriesSet.has(r.query)
    );
    const testResultList = allResults.results.filter(
      (r) => !trainQueriesSet.has(r.query)
    );

    const trainPassed = trainResultList.filter((r) => r.pass).length;
    const trainTotal = trainResultList.length;
    const trainSummary = {
      passed: trainPassed,
      failed: trainTotal - trainPassed,
      total: trainTotal,
    };
    const trainResults = {
      results: trainResultList,
      summary: trainSummary,
    };

    let testSummary: { passed: number; failed: number; total: number } | null =
      null;
    let testResults: { results: EvalResult[]; summary: typeof testSummary } | null = null;

    if (testSet.length > 0) {
      const testPassed = testResultList.filter((r) => r.pass).length;
      const testTotal = testResultList.length;
      testSummary = {
        passed: testPassed,
        failed: testTotal - testPassed,
        total: testTotal,
      };
      testResults = { results: testResultList, summary: testSummary };
    }

    history.push({
      iteration,
      description: currentDescription,
      train_passed: trainSummary.passed,
      train_failed: trainSummary.failed,
      train_total: trainSummary.total,
      train_results: trainResultList,
      test_passed: testSummary?.passed ?? null,
      test_failed: testSummary?.failed ?? null,
      test_total: testSummary?.total ?? null,
      test_results: testResults?.results ?? null,
      // Backward compat with report generator
      passed: trainSummary.passed,
      failed: trainSummary.failed,
      total: trainSummary.total,
      results: trainResultList,
    });

    // Write live report
    if (liveReportPath) {
      const partialOutput = {
        original_description: originalDescription,
        best_description: currentDescription,
        best_score: "in progress",
        iterations_run: history.length,
        holdout,
        train_size: trainSet.length,
        test_size: testSet.length,
        history,
      };
      writeFileSync(
        liveReportPath,
        generateHtml(partialOutput, true, name)
      );
    }

    if (verbose) {
      function printEvalStats(
        label: string,
        results: EvalResult[],
        elapsed: number
      ) {
        const pos = results.filter((r) => r.should_trigger);
        const neg = results.filter((r) => !r.should_trigger);
        const tp = pos.reduce((s, r) => s + r.triggers, 0);
        const posRuns = pos.reduce((s, r) => s + r.runs, 0);
        const fn = posRuns - tp;
        const fp = neg.reduce((s, r) => s + r.triggers, 0);
        const negRuns = neg.reduce((s, r) => s + r.runs, 0);
        const tn = negRuns - fp;
        const total = tp + tn + fp + fn;
        const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
        const accuracy = total > 0 ? (tp + tn) / total : 0;
        console.error(
          `${label}: ${tp + tn}/${total} correct, precision=${(precision * 100).toFixed(0)}% recall=${(recall * 100).toFixed(0)}% accuracy=${(accuracy * 100).toFixed(0)}% (${elapsed.toFixed(1)}s)`
        );
        for (const r of results) {
          const status = r.pass ? "PASS" : "FAIL";
          console.error(
            `  [${status}] rate=${r.triggers}/${r.runs} expected=${r.should_trigger}: ${r.query.slice(0, 60)}`
          );
        }
      }

      printEvalStats("Train", trainResultList, evalElapsed);
      if (testSummary) {
        printEvalStats("Test ", testResultList, 0);
      }
    }

    if (trainSummary.failed === 0) {
      exitReason = `all_passed (iteration ${iteration})`;
      if (verbose) {
        console.error(
          `\nAll train queries passed on iteration ${iteration}!`
        );
      }
      break;
    }

    if (iteration === maxIterations) {
      exitReason = `max_iterations (${maxIterations})`;
      if (verbose) {
        console.error(`\nMax iterations reached (${maxIterations}).`);
      }
      break;
    }

    // Improve description
    if (verbose) console.error("\nImproving description...");

    const t1 = Date.now();
    // Strip test scores from history so improvement model can't see them
    const blindedHistory = history.map((h) => {
      const blinded: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(h)) {
        if (!k.startsWith("test_")) blinded[k] = v;
      }
      return blinded;
    });

    const newDescription = await improveDescription({
      skillName: name,
      skillContent: content,
      currentDescription,
      evalResults: {
        description: currentDescription,
        ...trainResults,
      },
      history: blindedHistory as Record<string, unknown>[],
      model,
      logDir,
      iteration,
    });

    const improveElapsed = (Date.now() - t1) / 1000;
    if (verbose) {
      console.error(
        `Proposed (${improveElapsed.toFixed(1)}s): ${newDescription}`
      );
    }

    currentDescription = newDescription;
  }

  // Find best iteration by TEST score (or train if no test set)
  let best: HistoryEntry;
  if (testSet.length > 0) {
    best = history.reduce((a, b) =>
      (b.test_passed ?? 0) > (a.test_passed ?? 0) ? b : a
    );
  } else {
    best = history.reduce((a, b) =>
      b.train_passed > a.train_passed ? b : a
    );
  }

  const bestScore =
    testSet.length > 0
      ? `${best.test_passed}/${best.test_total}`
      : `${best.train_passed}/${best.train_total}`;

  if (verbose) {
    console.error(`\nExit reason: ${exitReason}`);
    console.error(
      `Best score: ${bestScore} (iteration ${best.iteration})`
    );
  }

  return {
    exit_reason: exitReason,
    original_description: originalDescription,
    best_description: best.description,
    best_score: bestScore,
    best_train_score: `${best.train_passed}/${best.train_total}`,
    best_test_score:
      testSet.length > 0
        ? `${best.test_passed}/${best.test_total}`
        : null,
    final_description: currentDescription,
    iterations_run: history.length,
    holdout,
    train_size: trainSet.length,
    test_size: testSet.length,
    history,
  };
}

// CLI entrypoint
if (import.meta.main) {
  const args = Bun.argv.slice(2);

  const HELP = `
run-loop — Run eval + improve loop for skill description optimization

Usage:
  bun run scripts/run-loop.ts --eval-set <file> --skill-path <path> --model <id> [options]

Options:
  --eval-set <file>           Path to eval set JSON file (required)
  --skill-path <path>         Path to skill directory (required)
  --model <id>                Model for improvement (required)
  --description <text>        Override starting description
  --num-workers <n>           Number of parallel workers (default: 10)
  --timeout <seconds>         Timeout per query (default: 30)
  --max-iterations <n>        Max improvement iterations (default: 5)
  --runs-per-query <n>        Number of runs per query (default: 3)
  --trigger-threshold <f>     Trigger rate threshold (default: 0.5)
  --holdout <f>               Fraction to hold out for testing (default: 0.4)
  --verbose                   Print progress to stderr
  --report <path|auto|none>   HTML report path (default: auto)
  --results-dir <path>        Save all outputs to a timestamped subdirectory
  --help                      Show this help message

Requires ANTHROPIC_API_KEY environment variable.
`.trim();

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  function getArg(name: string): string | undefined {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : undefined;
  }

  const evalSetPath = getArg("--eval-set");
  const skillPathArg = getArg("--skill-path");
  const model = getArg("--model");
  const descriptionOverride = getArg("--description");
  const numWorkers = parseInt(getArg("--num-workers") || "10", 10);
  const timeout = parseInt(getArg("--timeout") || "30", 10);
  const maxIterations = parseInt(
    getArg("--max-iterations") || "5",
    10
  );
  const runsPerQuery = parseInt(getArg("--runs-per-query") || "3", 10);
  const triggerThreshold = parseFloat(
    getArg("--trigger-threshold") || "0.5"
  );
  const holdout = parseFloat(getArg("--holdout") || "0.4");
  const verbose = args.includes("--verbose");
  const reportArg = getArg("--report") || "auto";
  const resultsDirArg = getArg("--results-dir");

  if (!evalSetPath || !skillPathArg || !model) {
    console.error(
      "Error: --eval-set, --skill-path, and --model are required"
    );
    process.exit(1);
  }

  const evalSet: EvalItem[] = JSON.parse(
    readFileSync(evalSetPath, "utf-8")
  );
  const skillPath = resolve(skillPathArg);

  if (!existsSync(join(skillPath, "SKILL.md"))) {
    console.error(`Error: No SKILL.md found at ${skillPath}`);
    process.exit(1);
  }

  const { name } = parseSkillMd(skillPath);

  // Set up live report
  let liveReportPath: string | undefined;
  if (reportArg !== "none") {
    if (reportArg === "auto") {
      const { tmpdir } = await import("node:os");
      const now = new Date();
      const timestamp =
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0") +
        now.getHours().toString().padStart(2, "0") +
        now.getMinutes().toString().padStart(2, "0") +
        now.getSeconds().toString().padStart(2, "0");
      liveReportPath = join(
        tmpdir(),
        `skill_description_report_${name}_${timestamp}.html`
      );
    } else {
      liveReportPath = resolve(reportArg);
    }
    writeFileSync(
      liveReportPath,
      "<html><body><h1>Starting optimization loop...</h1><meta http-equiv='refresh' content='5'></body></html>"
    );
    const openCmd =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "start"
          : "xdg-open";
    Bun.spawn([openCmd, liveReportPath]);
  }

  // Set up results directory
  let resultsDir: string | undefined;
  let logDir: string | undefined;
  if (resultsDirArg) {
    const now2 = new Date();
    const timestamp2 =
      now2.getFullYear().toString() +
      "-" +
      (now2.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      now2.getDate().toString().padStart(2, "0") +
      "_" +
      now2.getHours().toString().padStart(2, "0") +
      now2.getMinutes().toString().padStart(2, "0") +
      now2.getSeconds().toString().padStart(2, "0");
    resultsDir = join(resolve(resultsDirArg), timestamp2);
    mkdirSync(resultsDir, { recursive: true });
    logDir = join(resultsDir, "logs");
  }

  const output = await runLoop({
    evalSet,
    skillPath,
    descriptionOverride,
    numWorkers,
    timeout,
    maxIterations,
    runsPerQuery,
    triggerThreshold,
    holdout,
    model,
    verbose,
    liveReportPath,
    logDir,
  });

  // Save JSON output
  const jsonOutput = JSON.stringify(output, null, 2);
  console.log(jsonOutput);
  if (resultsDir) {
    writeFileSync(join(resultsDir, "results.json"), jsonOutput);
  }

  // Write final HTML report
  if (liveReportPath) {
    writeFileSync(
      liveReportPath,
      generateHtml(output as Record<string, unknown> & { history: HistoryEntry[] }, false, name)
    );
    console.error(`\nReport: ${liveReportPath}`);
  }

  if (resultsDir && liveReportPath) {
    writeFileSync(
      join(resultsDir, "report.html"),
      generateHtml(output as Record<string, unknown> & { history: HistoryEntry[] }, false, name)
    );
  }

  if (resultsDir) {
    console.error(`Results saved to: ${resultsDir}`);
  }
}
