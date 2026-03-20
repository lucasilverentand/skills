const args = Bun.argv.slice(2);

const HELP = `
comparison-matrix — Generate a comparison table from criteria and options

Usage:
  bun run tools/comparison-matrix.ts --options <list> --criteria <list> [options]

Options:
  --options <list>   Comma-separated list of options to compare (required)
  --criteria <list>  Comma-separated list of evaluation criteria (required)
  --weights <list>   Comma-separated weights: High, Medium, Low (optional, matches criteria order)
  --topic <topic>    Comparison topic for the report title (default: "Comparison")
  --output <path>    Write to file instead of stdout
  --json             Output as JSON instead of Markdown
  --help             Show this help message

Examples:
  bun run tools/comparison-matrix.ts --options "React,Vue,Svelte" --criteria "performance,DX,ecosystem"
  bun run tools/comparison-matrix.ts --options "Postgres,SQLite,D1" --criteria "scale,cost,simplicity" --weights "High,Medium,Low"
  bun run tools/comparison-matrix.ts --options "A,B" --criteria "speed,cost" --json
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const optionsIdx = args.indexOf("--options");
const criteriaIdx = args.indexOf("--criteria");
const weightsIdx = args.indexOf("--weights");
const topicIdx = args.indexOf("--topic");
const outputIdx = args.indexOf("--output");

if (optionsIdx === -1 || criteriaIdx === -1) {
  console.error("Error: --options and --criteria are required. Run with --help for usage.");
  process.exit(1);
}

const options = args[optionsIdx + 1].split(",").map((s) => s.trim());
const criteria = args[criteriaIdx + 1].split(",").map((s) => s.trim());
const weights = weightsIdx !== -1
  ? args[weightsIdx + 1].split(",").map((s) => s.trim())
  : criteria.map(() => "Medium");
const topic = topicIdx !== -1 ? args[topicIdx + 1] : "Comparison";
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;

interface ComparisonData {
  topic: string;
  date: string;
  options: string[];
  criteria: { name: string; weight: string }[];
  matrix: Record<string, Record<string, string>>;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];

  // Build empty matrix
  const matrix: Record<string, Record<string, string>> = {};
  for (const criterion of criteria) {
    matrix[criterion] = {};
    for (const option of options) {
      matrix[criterion][option] = "<!-- rating -->";
    }
  }

  const data: ComparisonData = {
    topic,
    date: today,
    options,
    criteria: criteria.map((name, i) => ({ name, weight: weights[i] || "Medium" })),
    matrix,
  };

  if (jsonOutput) {
    const output = JSON.stringify(data, null, 2);
    if (outputPath) {
      await Bun.write(outputPath, output);
      console.log(`Written to ${outputPath}`);
    } else {
      console.log(output);
    }
    return;
  }

  const lines: string[] = [
    `# Comparison: ${topic}`,
    "",
    `**Date:** ${today}`,
    `**Author:** <!-- name -->`,
    `**Audience:** <!-- who this is for -->`,
    `**Decision deadline:** <!-- when a decision is needed -->`,
    "",
    "## Summary",
    "",
    "<!-- 2-3 sentences: which option is recommended and why -->",
    "",
    "## Context",
    "",
    "<!-- Why this comparison is needed. What problem are we solving? -->",
    "",
    "## Criteria",
    "",
    "| # | Criterion | Weight | Description |",
    "|---|---|---|---|",
    ...criteria.map((c, i) =>
      `| ${i + 1} | ${c} | ${weights[i] || "Medium"} | <!-- what it means --> |`
    ),
    "",
    "## Options",
    "",
  ];

  for (const option of options) {
    lines.push(
      `### ${option}`,
      "",
      `**What it is:** <!-- 1-sentence description -->`,
      "",
      `- Strengths: <!-- ... -->`,
      `- Weaknesses: <!-- ... -->`,
      `- Cost: <!-- ... -->`,
      `- Maturity: <!-- ... -->`,
      "",
    );
  }

  // Comparison matrix
  const header = `| Criterion | Weight | ${options.join(" | ")} |`;
  const separator = `|---|---|${options.map(() => "---").join("|")}|`;
  const rows = criteria.map((c, i) =>
    `| ${c} | ${weights[i] || "Medium"} | ${options.map(() => "<!-- rating -->").join(" | ")} |`
  );

  lines.push(
    "## Comparison Matrix",
    "",
    header,
    separator,
    ...rows,
    "",
    "## Scoring",
    "",
    "| Option | Weighted Score | Rank |",
    "|---|---|---|",
    ...options.map((o, i) => `| ${o} | <!-- score --> / 10 | ${i + 1} |`),
    "",
    "## Recommendation",
    "",
    `**Recommended: <!-- option -->**`,
    "",
    "<!-- Reasoning that ties back to criteria and scores -->",
    "",
    "## Risks and Mitigations",
    "",
    "| Risk | Likelihood | Impact | Mitigation |",
    "|---|---|---|---|",
    "| <!-- risk --> | <!-- likelihood --> | <!-- impact --> | <!-- mitigation --> |",
    "",
  );

  const markdown = lines.join("\n");

  if (outputPath) {
    await Bun.write(outputPath, markdown);
    console.log(`Written to ${outputPath}`);
  } else {
    console.log(markdown);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
