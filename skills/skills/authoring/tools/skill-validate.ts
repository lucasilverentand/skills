const args = Bun.argv.slice(2);

const HELP = `
skill-validate — Check a skill directory for required files, valid frontmatter, and naming rules

Usage:
  bun run tools/skill-validate.ts <skill-path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Examples:
  bun run tools/skill-validate.ts skills/development/debugging
  bun run tools/skill-validate.ts skills/git/committing --json
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface CheckResult {
  check: string;
  passed: boolean;
  message: string;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required skill path argument");
    process.exit(1);
  }

  const { existsSync, readFileSync } = await import("node:fs");
  const { resolve, basename } = await import("node:path");

  const skillPath = resolve(target);
  const results: CheckResult[] = [];

  // Check directory exists
  if (!existsSync(skillPath)) {
    results.push({ check: "directory", passed: false, message: `Directory not found: ${skillPath}` });
    report(results);
    return;
  }
  results.push({ check: "directory", passed: true, message: "Skill directory exists" });

  // Check SKILL.md exists
  const skillMd = resolve(skillPath, "SKILL.md");
  if (!existsSync(skillMd)) {
    results.push({ check: "skill-md", passed: false, message: "SKILL.md not found" });
    report(results);
    return;
  }
  results.push({ check: "skill-md", passed: true, message: "SKILL.md exists" });

  // Check PURPOSE.md exists
  const purposeMd = resolve(skillPath, "PURPOSE.md");
  if (existsSync(purposeMd)) {
    results.push({ check: "purpose-md", passed: true, message: "PURPOSE.md exists" });
  } else {
    results.push({ check: "purpose-md", passed: false, message: "PURPOSE.md not found" });
  }

  // Check no README.md
  const readmeMd = resolve(skillPath, "README.md");
  if (existsSync(readmeMd)) {
    results.push({ check: "no-readme", passed: false, message: "README.md exists (anti-pattern — delete it)" });
  } else {
    results.push({ check: "no-readme", passed: true, message: "No README.md (correct)" });
  }

  // Parse and validate frontmatter
  const content = readFileSync(skillMd, "utf-8");
  const lines = content.split("\n");

  if (lines[0]?.trim() !== "---") {
    results.push({ check: "frontmatter", passed: false, message: "SKILL.md missing YAML frontmatter" });
    report(results);
    return;
  }

  let endIdx: number | null = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === null) {
    results.push({ check: "frontmatter", passed: false, message: "SKILL.md frontmatter not closed" });
    report(results);
    return;
  }

  const fm: Record<string, string> = {};
  for (const line of lines.slice(1, endIdx)) {
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#")) continue;
    const colonIdx = stripped.indexOf(":");
    if (colonIdx !== -1) {
      const key = stripped.slice(0, colonIdx).trim();
      const value = stripped.slice(colonIdx + 1).trim();
      if (value) fm[key] = value;
    }
  }

  // Check name field
  if (!fm.name) {
    results.push({ check: "name", passed: false, message: "Frontmatter missing 'name' field" });
  } else {
    const nameRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
    if (!nameRegex.test(fm.name)) {
      results.push({ check: "name-format", passed: false, message: `Name '${fm.name}' must be lowercase alphanumeric + hyphens` });
    } else {
      results.push({ check: "name", passed: true, message: `Name: ${fm.name}` });
    }

    // Check name matches directory
    const dirName = basename(skillPath);
    if (fm.name !== dirName && fm.name !== dirName.replace(/_/g, "-")) {
      results.push({ check: "name-match", passed: false, message: `Name '${fm.name}' does not match directory '${dirName}'` });
    } else {
      results.push({ check: "name-match", passed: true, message: "Name matches directory" });
    }
  }

  // Check description field
  if (!fm.description) {
    results.push({ check: "description", passed: false, message: "Frontmatter missing 'description' field" });
  } else {
    if (fm.description.length > 1024) {
      results.push({ check: "description-length", passed: false, message: `Description is ${fm.description.length} chars (max 1024)` });
    } else {
      results.push({ check: "description", passed: true, message: "Description present and within length" });
    }
  }

  // Check for decision tree
  if (content.includes("## Decision Tree") || content.includes("## Decision tree")) {
    results.push({ check: "decision-tree", passed: true, message: "Decision tree found" });
  } else {
    results.push({ check: "decision-tree", passed: false, message: "No decision tree section found" });
  }

  // Check line count
  const lineCount = lines.length;
  if (lineCount > 500) {
    results.push({ check: "line-count", passed: false, message: `SKILL.md is ${lineCount} lines (target: under 500)` });
  } else {
    results.push({ check: "line-count", passed: true, message: `SKILL.md is ${lineCount} lines` });
  }

  report(results);
}

function report(results: CheckResult[]) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  if (jsonOutput) {
    console.log(JSON.stringify({ passed, failed, total: results.length, results }, null, 2));
  } else {
    for (const r of results) {
      const icon = r.passed ? "ok" : "FAIL";
      console.log(`  [${icon}] ${r.message}`);
    }
    console.log(`\n${passed} passed, ${failed} failed out of ${results.length} checks`);
    if (failed > 0) process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
