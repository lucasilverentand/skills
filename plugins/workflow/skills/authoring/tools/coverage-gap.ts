const args = Bun.argv.slice(2);

const HELP = `
coverage-gap — Verify that SKILL.md references (tools, references, skills) actually exist

Usage:
  bun run tools/coverage-gap.ts <skill-path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks:
  - Decision tree branches reference existing tools/, references/, sections, or skills
  - "Key references" table entries point to files that exist on disk
  - tools/ and references/ files are actually referenced from SKILL.md
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface Gap {
  type: "broken-ref" | "broken-tool" | "dead-branch" | "orphan-ref" | "orphan-tool";
  item: string;
  issue: string;
}

function extractExplicitReferenceFiles(content: string): Set<string> {
  const referencedFiles = new Set<string>();

  const add = (file: string) => {
    if (!file.includes("<") && !file.includes(">")) referencedFiles.add(file);
  };

  const tableRowPattern = /^\|`references\/([^`]+)`\|/gm;
  for (const match of content.matchAll(tableRowPattern)) add(match[1]);

  const actionPattern =
    /\b(?:see|read|load|open|follow|check|use|update|add to|link from|linked from)\s+`references\/([^`]+)`/gi;
  for (const match of content.matchAll(actionPattern)) add(match[1]);

  return referencedFiles;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required skill path argument");
    process.exit(1);
  }

  const { existsSync, readFileSync, readdirSync } = await import("node:fs");
  const { resolve } = await import("node:path");

  const skillPath = resolve(target);
  const skillMdPath = resolve(skillPath, "SKILL.md");

  if (!existsSync(skillMdPath)) {
    console.error("Error: SKILL.md not found");
    process.exit(1);
  }

  const skillMd = readFileSync(skillMdPath, "utf-8");
  const gaps: Gap[] = [];

  // ── Extract references that are actionable links from SKILL.md ──

  const referencedFiles = extractExplicitReferenceFiles(skillMd);

  // Backtick-quoted tools: `tools/foo.ts` or `tools/foo.ts <args>`
  const backtickToolPattern = /`tools\/([^`]+)`/g;
  const referencedTools = new Set<string>();
  for (const match of skillMd.matchAll(backtickToolPattern)) {
    // Extract just the filename, stripping any trailing arguments
    const raw = match[1];
    const filename = raw.split(/\s/)[0];
    if (!filename.includes("<") && !filename.includes(">")) referencedTools.add(filename);
  }

  // ── Check referenced files exist on disk ──

  const refsDir = resolve(skillPath, "references");
  for (const refFile of referencedFiles) {
    const refPath = resolve(refsDir, refFile);
    if (!existsSync(refPath)) {
      gaps.push({
        type: "broken-ref",
        item: `references/${refFile}`,
        issue: "Referenced in SKILL.md but does not exist on disk",
      });
    }
  }

  const toolsDir = resolve(skillPath, "tools");
  for (const toolFile of referencedTools) {
    const toolPath = resolve(toolsDir, toolFile);
    if (!existsSync(toolPath)) {
      gaps.push({
        type: "broken-tool",
        item: `tools/${toolFile}`,
        issue: "Referenced in SKILL.md but does not exist on disk",
      });
    }
  }

  // ── Check decision tree branches lead somewhere actionable ──

  const dtSection = skillMd.match(/## Decision [Tt]ree\n([\s\S]*?)(?=\n## |\n*$)/);
  if (dtSection) {
    const dtLines = dtSection[1].split("\n");
    for (let i = 0; i < dtLines.length; i++) {
      const line = dtLines[i];
      // Match lines with -> that point somewhere
      const arrowMatch = line.match(/->\s*(.+)$/);
      if (!arrowMatch) continue;

      const target = arrowMatch[1].trim();

      // Skip intermediate branches — if the next non-empty line is more deeply
      // indented, this is a question node that branches further, not a terminal.
      const currentIndent = line.search(/\S/);
      let isIntermediate = false;
      for (let j = i + 1; j < dtLines.length; j++) {
        const nextLine = dtLines[j];
        if (!nextLine.trim()) continue;
        const nextIndent = nextLine.search(/\S/);
        if (nextIndent > currentIndent) isIntermediate = true;
        break;
      }
      if (isIntermediate) continue;

      // Valid targets:
      // 1. "follow X below" or "see X below" — references a section in this file
      // 2. `references/foo.md` — already checked above
      // 3. `tools/foo.ts` — already checked above
      // 4. "use the X skill" — delegates to another skill
      // 5. "run `tools/foo.ts`" — tool invocation
      // 6. "see `references/foo.md`" — reference pointer

      const hasReference = /`references\//.test(target);
      const hasTool = /`tools\//.test(target);
      const hasSection = /\bfollow\b.*\bbelow\b/i.test(target) || /\bsee\b.*\bbelow\b/i.test(target);
      const hasSkillRef = /\buse\b.*\bskill\b/i.test(target);
      const hasRunCommand = /\brun\b/i.test(target);
      const hasInlineAction = /\b(check|fix|rewrite|extract|split|read|ask|create|write|add|delete|remove|update|route|focus|bump)\b/i.test(target);

      if (!hasReference && !hasTool && !hasSection && !hasSkillRef && !hasRunCommand && !hasInlineAction) {
        gaps.push({
          type: "dead-branch",
          item: line.trim(),
          issue: `Branch target "${target}" does not point to a section, reference, tool, or actionable instruction`,
        });
      }
    }
  }

  // ── Check for orphan files (on disk but unreferenced) ──

  if (existsSync(refsDir)) {
    try {
      const diskFiles = readdirSync(refsDir).filter((f) => f.endsWith(".md"));
      for (const diskFile of diskFiles) {
        if (!referencedFiles.has(diskFile) && !skillMd.includes(`references/${diskFile}`)) {
          gaps.push({
            type: "orphan-ref",
            item: `references/${diskFile}`,
            issue: "Exists on disk but is never referenced in SKILL.md",
          });
        }
      }
    } catch {
      // readdirSync failed — skip orphan check
    }
  }

  if (existsSync(toolsDir)) {
    try {
      const toolFiles = readdirSync(toolsDir).filter((f) => f.endsWith(".ts"));
      for (const toolFile of toolFiles) {
        if (!referencedTools.has(toolFile) && !skillMd.includes(`tools/${toolFile}`)) {
          gaps.push({
            type: "orphan-tool",
            item: `tools/${toolFile}`,
            issue: "Exists on disk but is never referenced in SKILL.md",
          });
        }
      }
    } catch {
      // readdirSync failed — skip orphan check
    }
  }

  // ── Deduplicate gaps ──

  const seen = new Set<string>();
  const uniqueGaps = gaps.filter((g) => {
    const key = `${g.type}:${g.item}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── Report ──

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          gaps: uniqueGaps,
          totalGaps: uniqueGaps.length,
          referencedFiles: [...referencedFiles],
          referencedTools: [...referencedTools],
        },
        null,
        2,
      ),
    );
  } else {
    if (uniqueGaps.length === 0) {
      console.log(
        `No gaps found. ${referencedFiles.size} references and ${referencedTools.size} tools all verified.`,
      );
    } else {
      console.log(`Found ${uniqueGaps.length} gap(s):\n`);
      for (const gap of uniqueGaps) {
        console.log(`  [${gap.type}] ${gap.item}`);
        console.log(`    -> ${gap.issue}\n`);
      }
    }
  }

  if (uniqueGaps.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
