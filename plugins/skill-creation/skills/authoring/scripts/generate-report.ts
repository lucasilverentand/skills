// Generate an HTML report from run-loop output.
//
// Takes the JSON output from run-loop.ts and generates a visual HTML report
// showing each description attempt with check/x for each test case.
// Distinguishes between train and test queries.

import { readFileSync } from "node:fs";

interface QueryInfo {
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

interface HistoryEntry {
  iteration: number;
  description: string;
  train_passed?: number;
  train_failed?: number;
  train_total?: number;
  train_results?: EvalResult[];
  test_passed?: number | null;
  test_failed?: number | null;
  test_total?: number | null;
  test_results?: EvalResult[] | null;
  passed?: number;
  failed?: number;
  total?: number;
  results?: EvalResult[];
}

interface LoopOutput {
  original_description?: string;
  best_description?: string;
  best_score?: string;
  best_train_score?: string;
  best_test_score?: string | null;
  iterations_run?: number;
  holdout?: number;
  train_size?: number;
  test_size?: number;
  history: HistoryEntry[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateHtml(
  data: LoopOutput,
  autoRefresh = false,
  skillName = ""
): string {
  const history = data.history || [];
  const titlePrefix = skillName ? escapeHtml(skillName) + " \u2014 " : "";

  const trainQueries: QueryInfo[] = [];
  const testQueries: QueryInfo[] = [];
  if (history.length > 0) {
    const h0 = history[0];
    for (const r of h0.train_results || h0.results || []) {
      trainQueries.push({
        query: r.query,
        should_trigger: r.should_trigger ?? true,
      });
    }
    if (h0.test_results) {
      for (const r of h0.test_results) {
        testQueries.push({
          query: r.query,
          should_trigger: r.should_trigger ?? true,
        });
      }
    }
  }

  const refreshTag = autoRefresh
    ? '    <meta http-equiv="refresh" content="5">\n'
    : "";

  const parts: string[] = [
    `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
${refreshTag}    <title>${titlePrefix}Skill Description Optimization</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Lora:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Lora', Georgia, serif; max-width: 100%; margin: 0 auto; padding: 20px; background: #faf9f5; color: #141413; }
        h1 { font-family: 'Poppins', sans-serif; color: #141413; }
        .explainer { background: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e8e6dc; color: #b0aea5; font-size: 0.875rem; line-height: 1.6; }
        .summary { background: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e8e6dc; }
        .summary p { margin: 5px 0; }
        .best { color: #788c5d; font-weight: bold; }
        .table-container { overflow-x: auto; width: 100%; }
        table { border-collapse: collapse; background: white; border: 1px solid #e8e6dc; border-radius: 6px; font-size: 12px; min-width: 100%; }
        th, td { padding: 8px; text-align: left; border: 1px solid #e8e6dc; white-space: normal; word-wrap: break-word; }
        th { font-family: 'Poppins', sans-serif; background: #141413; color: #faf9f5; font-weight: 500; }
        th.test-col { background: #6a9bcc; }
        th.query-col { min-width: 200px; }
        td.description { font-family: monospace; font-size: 11px; word-wrap: break-word; max-width: 400px; }
        td.result { text-align: center; font-size: 16px; min-width: 40px; }
        td.test-result { background: #f0f6fc; }
        .pass { color: #788c5d; }
        .fail { color: #c44; }
        .rate { font-size: 9px; color: #b0aea5; display: block; }
        tr:hover { background: #faf9f5; }
        .score { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; }
        .score-good { background: #eef2e8; color: #788c5d; }
        .score-ok { background: #fef3c7; color: #d97706; }
        .score-bad { background: #fceaea; color: #c44; }
        .best-row { background: #f5f8f2; }
        th.positive-col { border-bottom: 3px solid #788c5d; }
        th.negative-col { border-bottom: 3px solid #c44; }
        th.test-col.positive-col { border-bottom: 3px solid #788c5d; }
        th.test-col.negative-col { border-bottom: 3px solid #c44; }
        .legend { font-family: 'Poppins', sans-serif; display: flex; gap: 20px; margin-bottom: 10px; font-size: 13px; align-items: center; }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-swatch { width: 16px; height: 16px; border-radius: 3px; display: inline-block; }
        .swatch-positive { background: #141413; border-bottom: 3px solid #788c5d; }
        .swatch-negative { background: #141413; border-bottom: 3px solid #c44; }
        .swatch-test { background: #6a9bcc; }
        .swatch-train { background: #141413; }
    </style>
</head>
<body>
    <h1>${titlePrefix}Skill Description Optimization</h1>
    <div class="explainer">
        <strong>Optimizing your skill's description.</strong> This page updates automatically as Claude tests different versions of your skill's description. Each row is an iteration. The columns show test queries: green checkmarks mean the description correctly triggered (or correctly didn't trigger), red crosses mean wrong. The "Train" score shows performance on queries used for improvement; "Test" shows held-out queries that the improvement model never sees. When done, Claude applies the best description.
    </div>
`,
  ];

  // Summary
  const bestTestScore = data.best_test_score;
  parts.push(`
    <div class="summary">
        <p><strong>Original:</strong> ${escapeHtml(data.original_description || "N/A")}</p>
        <p class="best"><strong>Best:</strong> ${escapeHtml(data.best_description || "N/A")}</p>
        <p><strong>Best Score:</strong> ${data.best_score || "N/A"} ${bestTestScore ? "(test)" : "(train)"}</p>
        <p><strong>Iterations:</strong> ${data.iterations_run || 0} | <strong>Train:</strong> ${data.train_size ?? "?"} | <strong>Test:</strong> ${data.test_size ?? "?"}</p>
    </div>
`);

  // Legend
  parts.push(`
    <div class="legend">
        <span style="font-weight:600">Query columns:</span>
        <span class="legend-item"><span class="legend-swatch swatch-positive"></span> Should trigger</span>
        <span class="legend-item"><span class="legend-swatch swatch-negative"></span> Should NOT trigger</span>
        <span class="legend-item"><span class="legend-swatch swatch-train"></span> Train</span>
        <span class="legend-item"><span class="legend-swatch swatch-test"></span> Test</span>
    </div>
`);

  // Table header
  parts.push(`
    <div class="table-container">
    <table>
        <thead>
            <tr>
                <th>Iter</th>
                <th>Train</th>
                <th>Test</th>
                <th class="query-col">Description</th>
`);

  for (const q of trainQueries) {
    const polarity = q.should_trigger ? "positive-col" : "negative-col";
    parts.push(
      `                <th class="${polarity}">${escapeHtml(q.query)}</th>\n`
    );
  }
  for (const q of testQueries) {
    const polarity = q.should_trigger ? "positive-col" : "negative-col";
    parts.push(
      `                <th class="test-col ${polarity}">${escapeHtml(q.query)}</th>\n`
    );
  }

  parts.push(`            </tr>
        </thead>
        <tbody>
`);

  // Find best iteration
  let bestIter: number | undefined;
  if (testQueries.length > 0) {
    bestIter = history.reduce((best, h) =>
      (h.test_passed ?? 0) > (best.test_passed ?? 0) ? h : best
    ).iteration;
  } else {
    bestIter = history.reduce((best, h) =>
      (h.train_passed ?? h.passed ?? 0) > (best.train_passed ?? best.passed ?? 0) ? h : best
    ).iteration;
  }

  function aggregateRuns(
    results: EvalResult[]
  ): { correct: number; total: number } {
    let correct = 0;
    let total = 0;
    for (const r of results) {
      const runs = r.runs ?? 0;
      const triggers = r.triggers ?? 0;
      total += runs;
      correct += (r.should_trigger ?? true) ? triggers : runs - triggers;
    }
    return { correct, total };
  }

  function scoreClass(correct: number, total: number): string {
    if (total > 0) {
      const ratio = correct / total;
      if (ratio >= 0.8) return "score-good";
      if (ratio >= 0.5) return "score-ok";
    }
    return "score-bad";
  }

  for (const h of history) {
    const trainResults = h.train_results || h.results || [];
    const testResults = h.test_results || [];
    const trainByQuery = new Map(trainResults.map((r) => [r.query, r]));
    const testByQuery = new Map((testResults || []).map((r) => [r.query, r]));

    const trainAgg = aggregateRuns(trainResults);
    const testAgg = aggregateRuns(testResults || []);

    const rowClass = h.iteration === bestIter ? "best-row" : "";

    parts.push(`            <tr class="${rowClass}">
                <td>${h.iteration}</td>
                <td><span class="score ${scoreClass(trainAgg.correct, trainAgg.total)}">${trainAgg.correct}/${trainAgg.total}</span></td>
                <td><span class="score ${scoreClass(testAgg.correct, testAgg.total)}">${testAgg.correct}/${testAgg.total}</span></td>
                <td class="description">${escapeHtml(h.description)}</td>
`);

    for (const q of trainQueries) {
      const r = trainByQuery.get(q.query);
      const didPass = r?.pass ?? false;
      const icon = didPass ? "\u2713" : "\u2717";
      const cls = didPass ? "pass" : "fail";
      parts.push(
        `                <td class="result ${cls}">${icon}<span class="rate">${r?.triggers ?? 0}/${r?.runs ?? 0}</span></td>\n`
      );
    }

    for (const q of testQueries) {
      const r = testByQuery.get(q.query);
      const didPass = r?.pass ?? false;
      const icon = didPass ? "\u2713" : "\u2717";
      const cls = didPass ? "pass" : "fail";
      parts.push(
        `                <td class="result test-result ${cls}">${icon}<span class="rate">${r?.triggers ?? 0}/${r?.runs ?? 0}</span></td>\n`
      );
    }

    parts.push("            </tr>\n");
  }

  parts.push(`        </tbody>
    </table>
    </div>
</body>
</html>
`);

  return parts.join("");
}

// CLI entrypoint
if (import.meta.main) {
  const args = Bun.argv.slice(2);

  const HELP = `
generate-report — Generate HTML report from run-loop output

Usage:
  bun run scripts/generate-report.ts <input.json> [options]

Options:
  -o, --output <file>     Output HTML file (default: stdout)
  --skill-name <name>     Skill name for the report title
  --help                  Show this help message

Use "-" as input to read from stdin.
`.trim();

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const inputPath = args[0];
  const outputIdx = args.indexOf("-o") !== -1 ? args.indexOf("-o") : args.indexOf("--output");
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;
  const nameIdx = args.indexOf("--skill-name");
  const skillName = nameIdx !== -1 ? args[nameIdx + 1] : "";

  let data: LoopOutput;
  if (inputPath === "-") {
    data = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
  } else {
    data = JSON.parse(readFileSync(inputPath, "utf-8"));
  }

  const html = generateHtml(data, false, skillName);

  if (outputPath) {
    Bun.write(outputPath, html);
    console.error(`Report written to ${outputPath}`);
  } else {
    console.log(html);
  }
}
