const args = Bun.argv.slice(2);

const HELP = `
token-estimate — Estimate the token count of a file (rough approximation)

Usage:
  bun run tools/token-estimate.ts <file-path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Estimation: ~4 characters per token (rough approximation for English markdown).
The 5000-token guideline for SKILL.md corresponds to roughly 20,000 characters or 500 lines.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required file path argument");
    process.exit(1);
  }

  const { existsSync, readFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");

  const filePath = resolve(target);
  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const chars = content.length;
  const lines = content.split("\n").length;
  const words = content.split(/\s+/).filter(Boolean).length;
  const estimatedTokens = Math.ceil(chars / 4);
  const overBudget = estimatedTokens > 5000;

  const result = { file: filePath, chars, lines, words, estimatedTokens, overBudget };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`File: ${filePath}`);
    console.log(`Characters: ${chars}`);
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Estimated tokens: ~${estimatedTokens}`);
    if (overBudget) {
      console.log(`\nWARNING: Over the 5000-token budget. Move detailed content to references/.`);
      process.exit(1);
    } else {
      console.log(`\nWithin the 5000-token budget.`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
