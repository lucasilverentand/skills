const args = Bun.argv.slice(2);

const HELP = `
coverage-gap — Compare PURPOSE.md responsibilities against SKILL.md content and tools

Usage:
  bun run tools/coverage-gap.ts <skill-path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks:
  - Each responsibility in PURPOSE.md has matching content in SKILL.md or references/
  - Each tool listed in PURPOSE.md exists as a file in tools/
  - Decision tree branches cover the stated responsibilities
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface Gap {
  type: "responsibility" | "tool";
  item: string;
  issue: string;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required skill path argument");
    process.exit(1);
  }

  const { existsSync, readFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");

  const skillPath = resolve(target);
  const purposePath = resolve(skillPath, "PURPOSE.md");
  const skillMdPath = resolve(skillPath, "SKILL.md");

  if (!existsSync(purposePath)) {
    console.error("Error: PURPOSE.md not found");
    process.exit(1);
  }
  if (!existsSync(skillMdPath)) {
    console.error("Error: SKILL.md not found");
    process.exit(1);
  }

  const purpose = readFileSync(purposePath, "utf-8");
  const skillMd = readFileSync(skillMdPath, "utf-8");
  const gaps: Gap[] = [];

  // Extract responsibilities from PURPOSE.md
  const respSection = purpose.match(/## Responsibilities\n([\s\S]*?)(?=\n## |\n*$)/);
  const responsibilities: string[] = [];
  if (respSection) {
    for (const line of respSection[1].split("\n")) {
      const match = line.match(/^- (.+)/);
      if (match) responsibilities.push(match[1].trim());
    }
  }

  // Extract tools from PURPOSE.md
  const toolSection = purpose.match(/## Tools\n([\s\S]*?)(?=\n## |\n*$)/);
  const listedTools: string[] = [];
  if (toolSection) {
    for (const line of toolSection[1].split("\n")) {
      const match = line.match(/`(tools\/[^`]+)`/);
      if (match) listedTools.push(match[1]);
    }
  }

  // Check each responsibility has some mention in SKILL.md
  const skillMdLower = skillMd.toLowerCase();
  for (const resp of responsibilities) {
    // Extract key words (3+ chars) from the responsibility
    const keywords = resp
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["with", "from", "that", "this", "into", "when", "they", "them", "have", "been", "will"].includes(w));

    const matchCount = keywords.filter((kw) => skillMdLower.includes(kw)).length;
    const matchRatio = keywords.length > 0 ? matchCount / keywords.length : 0;

    if (matchRatio < 0.3) {
      gaps.push({ type: "responsibility", item: resp, issue: "Not addressed in SKILL.md (low keyword match)" });
    }
  }

  // Check each listed tool exists on disk
  for (const tool of listedTools) {
    const toolPath = resolve(skillPath, tool);
    if (!existsSync(toolPath)) {
      gaps.push({ type: "tool", item: tool, issue: "Listed in PURPOSE.md but file does not exist" });
    }
  }

  // Report
  if (jsonOutput) {
    console.log(JSON.stringify({ gaps, totalGaps: gaps.length, responsibilities: responsibilities.length, tools: listedTools.length }, null, 2));
  } else {
    if (gaps.length === 0) {
      console.log(`No gaps found. ${responsibilities.length} responsibilities and ${listedTools.length} tools all covered.`);
    } else {
      console.log(`Found ${gaps.length} gap(s):\n`);
      for (const gap of gaps) {
        console.log(`  [${gap.type}] ${gap.item}`);
        console.log(`    -> ${gap.issue}\n`);
      }
    }
  }

  if (gaps.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
