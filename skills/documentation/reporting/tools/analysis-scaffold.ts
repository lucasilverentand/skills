const args = Bun.argv.slice(2);

const HELP = `
analysis-scaffold — Create an analysis report with sections pre-filled from codebase context

Usage:
  bun run tools/analysis-scaffold.ts --topic <topic> [options]

Options:
  --topic <topic>    The subject of the analysis (required)
  --path <dir>       Directory to analyze for context (default: ".")
  --depth <n>        How many levels deep to scan (default: 3)
  --output <path>    Write to file instead of stdout
  --json             Output as JSON instead of Markdown
  --help             Show this help message

Examples:
  bun run tools/analysis-scaffold.ts --topic "API latency" --path src/api
  bun run tools/analysis-scaffold.ts --topic "Bundle size" --output analysis.md
  bun run tools/analysis-scaffold.ts --topic "Auth flow" --json
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const topicIdx = args.indexOf("--topic");
const topic = topicIdx !== -1 ? args[topicIdx + 1] : "Untitled Analysis";
const pathIdx = args.indexOf("--path");
const targetPath = pathIdx !== -1 ? args[pathIdx + 1] : ".";
const depthIdx = args.indexOf("--depth");
const depth = depthIdx !== -1 ? parseInt(args[depthIdx + 1], 10) : 3;
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const output = await new Response(proc.stdout).text();
  await proc.exited;
  return output.trim();
}

interface ContextData {
  topic: string;
  date: string;
  path: string;
  fileCount: number;
  fileTypes: Record<string, number>;
  recentCommits: string[];
  structure: string;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];

  // Count files by type
  const findOutput = await run([
    "find", targetPath, "-maxdepth", String(depth), "-type", "f",
    "-not", "-path", "**/node_modules/**",
    "-not", "-path", "**/.git/**",
    "-not", "-path", "**/dist/**",
  ]).catch(() => "");

  const files = findOutput.split("\n").filter(Boolean);
  const fileTypes: Record<string, number> = {};
  for (const f of files) {
    const ext = f.includes(".") ? f.slice(f.lastIndexOf(".")) : "(none)";
    fileTypes[ext] = (fileTypes[ext] || 0) + 1;
  }

  // Recent commits touching the path
  const recentCommitsRaw = await run([
    "git", "log", "--oneline", "--max-count=20", "--", targetPath,
  ]).catch(() => "");
  const recentCommits = recentCommitsRaw.split("\n").filter(Boolean);

  // Directory structure
  const structure = await run([
    "find", targetPath, "-maxdepth", String(Math.min(depth, 2)), "-type", "d",
    "-not", "-path", "**/node_modules/**",
    "-not", "-path", "**/.git/**",
  ]).catch(() => "");

  const data: ContextData = {
    topic,
    date: today,
    path: targetPath,
    fileCount: files.length,
    fileTypes,
    recentCommits,
    structure,
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

  // Sort file types by count descending
  const sortedTypes = Object.entries(fileTypes).sort((a, b) => b[1] - a[1]);

  const lines: string[] = [
    `# Analysis: ${topic}`,
    "",
    `**Date:** ${today}`,
    `**Author:** <!-- name -->`,
    `**Audience:** <!-- who is this for -->`,
    `**Status:** Draft`,
    "",
    "## Executive Summary",
    "",
    "<!-- 2-3 sentences: the key conclusion and recommended action -->",
    "",
    "## Problem Statement",
    "",
    "<!-- What question is being investigated? What triggered this analysis? -->",
    "",
    "### Context",
    "",
    `Analyzing \`${targetPath}\` — ${files.length} files across ${Object.keys(fileTypes).length} file types.`,
    "",
    "Top file types:",
    "",
    "| Extension | Count |",
    "|---|---|",
    ...sortedTypes.slice(0, 10).map(([ext, count]) => `| ${ext} | ${count} |`),
    "",
    "### Scope",
    "",
    "<!-- What is included and excluded from this analysis -->",
    "",
    "## Methodology",
    "",
    "- Source: codebase at `" + targetPath + "`",
    `- ${files.length} files scanned`,
    `- ${recentCommits.length} recent commits reviewed`,
    "",
    "## Findings",
    "",
    "### Finding 1: <!-- title -->",
    "",
    "**Evidence:**",
    "<!-- code snippets, data, links -->",
    "",
    "**Impact:** High | Medium | Low",
    "**Confidence:** High | Medium | Low",
    "",
    "### Finding 2: <!-- title -->",
    "",
    "**Evidence:**",
    "<!-- ... -->",
    "",
    "**Impact:** High | Medium | Low",
    "**Confidence:** High | Medium | Low",
    "",
    "## Trade-offs",
    "",
    "| Approach | Pros | Cons | Effort |",
    "|---|---|---|---|",
    "| Option A | <!-- pros --> | <!-- cons --> | S/M/L |",
    "| Option B | <!-- pros --> | <!-- cons --> | S/M/L |",
    "",
    "## Recommendations",
    "",
    "1. **<!-- Action -->** — <!-- reasoning -->. Priority: High",
    "2. **<!-- Action -->** — <!-- reasoning -->. Priority: Medium",
    "",
  ];

  if (recentCommits.length > 0) {
    lines.push(
      "## Appendix: Recent Commits",
      "",
      ...recentCommits.map((c) => `- ${c}`),
      "",
    );
  }

  if (structure) {
    lines.push(
      "## Appendix: Directory Structure",
      "",
      "```",
      structure,
      "```",
      "",
    );
  }

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
