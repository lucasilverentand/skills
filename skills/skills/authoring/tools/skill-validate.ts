const args = Bun.argv.slice(2);

const HELP = `
skill-validate — Deep quality check on a single skill directory

Usage:
  bun run tools/skill-validate.ts <skill-path> [options]

Options:
  --fix     Auto-fix mechanical issues (name mismatch, README.md)
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
const fixMode = args.includes("--fix");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

type Severity = "error" | "warning";

interface CheckResult {
  check: string;
  passed: boolean;
  message: string;
  severity: Severity;
  fixable?: boolean;
}

const fixes: string[] = [];

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_LINE_COUNT = 500;

const KNOWN_TOOLS = new Set([
  "Read",
  "Edit",
  "Write",
  "Bash",
  "Glob",
  "Grep",
  "WebFetch",
  "WebSearch",
  "Agent",
  "Zsh",
]);

const KNOWN_FRONTMATTER_FIELDS = new Set([
  "name",
  "description",
  "allowed-tools",
  "license",
  "compatibility",
  "metadata",
  "argument-hint",
  "disable-model-invocation",
  "user-invocable",
  "model",
  "context",
  "agent",
  "hooks",
]);

function pass(
  results: CheckResult[],
  check: string,
  message: string,
) {
  results.push({ check, passed: true, message, severity: "error" });
}

function fail(
  results: CheckResult[],
  check: string,
  message: string,
  severity: Severity = "error",
  fixable = false,
) {
  results.push({ check, passed: false, message, severity, fixable });
}

function parseFrontmatter(
  content: string,
): { fm: Record<string, string>; endIdx: number } | null {
  const lines = content.split("\n");
  if (!lines.length || lines[0].trim() !== "---") return null;

  let endIdx: number | null = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === null) return null;

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
  return { fm, endIdx };
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required skill path argument");
    process.exit(1);
  }

  const { existsSync, readFileSync, readdirSync, writeFileSync, unlinkSync } = await import("node:fs");
  const { resolve, basename } = await import("node:path");

  const skillPath = resolve(target);
  const results: CheckResult[] = [];

  // ── Directory existence ──

  if (!existsSync(skillPath)) {
    fail(results, "directory", `Directory not found: ${skillPath}`);
    report(results);
    return;
  }
  pass(results, "directory", "Skill directory exists");

  // ── Required files ──

  const skillMdPath = resolve(skillPath, "SKILL.md");
  if (!existsSync(skillMdPath)) {
    fail(results, "skill-md", "SKILL.md not found");
    report(results);
    return;
  }
  pass(results, "skill-md", "SKILL.md exists");

  // ── Anti-pattern: README.md ──

  const readmePath = resolve(skillPath, "README.md");
  if (existsSync(readmePath)) {
    fail(
      results,
      "no-readme",
      "README.md exists — delete it (use SKILL.md for instructions)",
      "warning",
      true,
    );
  }

  // ── Parse and validate SKILL.md ──

  const content = readFileSync(skillMdPath, "utf-8");
  const lines = content.split("\n");

  // Frontmatter parsing
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    if (lines[0]?.trim() !== "---") {
      fail(results, "frontmatter", "SKILL.md missing YAML frontmatter (must start with ---)");
    } else {
      fail(results, "frontmatter", "SKILL.md frontmatter not closed (missing closing ---)");
    }
    report(results);
    return;
  }
  pass(results, "frontmatter", "Valid frontmatter block");

  const { fm, endIdx } = parsed;

  // ── Frontmatter fields ──

  // name
  if (!fm.name) {
    fail(results, "name", "Frontmatter missing 'name' field");
  } else {
    if (!KEBAB.test(fm.name)) {
      fail(results, "name-format", `Name '${fm.name}' must be kebab-case (lowercase alphanumeric + hyphens)`);
    } else if (fm.name.length > 64) {
      fail(results, "name-format", `Name '${fm.name}' exceeds 64 characters`);
    } else {
      pass(results, "name-format", `Name: ${fm.name}`);
    }

    const dirName = basename(skillPath);
    const normalizedDirName = dirName.replace(/_/g, "-");
    if (fm.name !== dirName && fm.name !== normalizedDirName) {
      fail(results, "name-match", `Name '${fm.name}' does not match directory '${dirName}'`, "error", true);
    } else {
      pass(results, "name-match", "Name matches directory");
    }
  }

  // description
  if (!fm.description) {
    fail(results, "description", "Frontmatter missing 'description' field");
  } else if (fm.description.length > MAX_DESCRIPTION_LENGTH) {
    fail(results, "description-length", `Description is ${fm.description.length} chars (max ${MAX_DESCRIPTION_LENGTH})`);
  } else {
    pass(results, "description", `Description present (${fm.description.length} chars)`);
  }

  // allowed-tools
  if (fm["allowed-tools"]) {
    const tools = fm["allowed-tools"].split(/[\s,]+/).filter(Boolean);
    const unknownTools: string[] = [];
    for (const tool of tools) {
      const baseTool = tool.replace(/\(.*\)$/, "");
      if (!KNOWN_TOOLS.has(baseTool)) {
        unknownTools.push(tool);
      }
    }
    if (unknownTools.length > 0) {
      fail(
        results,
        "allowed-tools",
        `Unknown tool(s) in allowed-tools: ${unknownTools.join(", ")}`,
        "warning",
      );
    } else {
      pass(results, "allowed-tools", `allowed-tools: ${tools.join(", ")}`);
    }
  }

  // Unknown frontmatter fields
  const unknownFields = Object.keys(fm).filter(
    (k) => !KNOWN_FRONTMATTER_FIELDS.has(k),
  );
  if (unknownFields.length > 0) {
    fail(
      results,
      "unknown-fields",
      `Unknown frontmatter field(s): ${unknownFields.join(", ")} — check references/skill-format.md for valid fields`,
      "warning",
    );
  }

  // ── Content quality ──

  // Body content exists
  const bodyContent = content
    .slice(content.indexOf("---", 3) + 3)
    .trim();
  if (bodyContent.length === 0) {
    fail(results, "body-content", "SKILL.md has no content beyond frontmatter");
  } else {
    pass(results, "body-content", "SKILL.md has body content");
  }

  // Decision tree
  if (
    content.includes("## Decision Tree") ||
    content.includes("## Decision tree")
  ) {
    pass(results, "decision-tree", "Decision tree section found");
  } else {
    fail(
      results,
      "decision-tree",
      "No '## Decision Tree' section — add one to guide the agent through choices",
      "warning",
    );
  }

  // Line count
  const lineCount = lines.length;
  if (lineCount > MAX_LINE_COUNT) {
    fail(
      results,
      "line-count",
      `SKILL.md is ${lineCount} lines (target: under ${MAX_LINE_COUNT}) — extract details to references/`,
      "warning",
    );
  } else {
    pass(results, "line-count", `SKILL.md is ${lineCount} lines`);
  }

  // ── References validation ──

  const refsDir = resolve(skillPath, "references");
  if (existsSync(refsDir)) {
    // Check that referenced files in SKILL.md actually exist
    const refMatches = content.match(/`references\/[^`]+`/g) ?? [];
    const referencedFiles = refMatches
      .map((m) => m.replace(/^`references\//, "").replace(/`$/, ""))
      .filter((f) => !f.includes("<") && !f.includes(">")); // Skip template placeholders
    for (const refFile of referencedFiles) {
      const refPath = resolve(refsDir, refFile);
      if (!existsSync(refPath)) {
        fail(
          results,
          "broken-ref",
          `SKILL.md references 'references/${refFile}' but it doesn't exist`,
        );
      }
    }

    // Check for unreferenced files in references/
    try {
      const diskFiles = readdirSync(refsDir).filter((f) =>
        f.endsWith(".md"),
      );
      const referencedSet = new Set(referencedFiles);
      for (const diskFile of diskFiles) {
        if (!referencedSet.has(diskFile)) {
          if (!content.includes(`references/${diskFile}`)) {
            fail(
              results,
              "orphan-ref",
              `references/${diskFile} exists but is never referenced in SKILL.md`,
              "warning",
            );
          }
        }
      }
    } catch {
      // readdirSync failed — skip orphan check
    }
  }

  // ── Tools validation ──

  const toolsDir = resolve(skillPath, "tools");
  if (existsSync(toolsDir)) {
    try {
      const toolFiles = readdirSync(toolsDir).filter((f) =>
        f.endsWith(".ts"),
      );

      if (toolFiles.length === 0) {
        fail(
          results,
          "empty-tools",
          "tools/ directory exists but has no .ts files",
          "warning",
        );
      }

    } catch {
      // readdirSync failed — skip tools check
    }
  }

  // ── Auto-fix ──

  if (fixMode) {
    for (const r of results) {
      if (r.passed || !r.fixable) continue;

      switch (r.check) {
        case "name-match": {
          // Update frontmatter name to match directory
          const targetName = basename(skillPath).replace(/_/g, "-");
          const updated = content.replace(
            /^(name:\s*).+$/m,
            `$1${targetName}`,
          );
          writeFileSync(skillMdPath, updated);
          fixes.push(`Fixed name: '${fm!.name}' → '${targetName}'`);
          r.passed = true;
          r.message = `Name fixed: ${targetName}`;
          break;
        }
        case "no-readme": {
          unlinkSync(readmePath);
          fixes.push("Deleted README.md");
          r.passed = true;
          r.message = "README.md deleted";
          break;
        }
      }
    }
  }

  report(results);
}

function report(results: CheckResult[]) {
  const passed = results.filter((r) => r.passed).length;
  const errors = results.filter((r) => !r.passed && r.severity === "error");
  const warnings = results.filter(
    (r) => !r.passed && r.severity === "warning",
  );

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          passed,
          errors: errors.length,
          warnings: warnings.length,
          total: results.length,
          fixes,
          results,
        },
        null,
        2,
      ),
    );
  } else {
    for (const r of results) {
      if (r.passed) {
        console.log(`  [ok] ${r.message}`);
      } else if (r.severity === "warning") {
        console.log(`  [WARN] ${r.message}`);
      } else {
        console.log(`  [FAIL] ${r.message}`);
      }
    }
    if (fixes.length > 0) {
      console.log(`\nAuto-fixed ${fixes.length} issue(s):`);
      for (const f of fixes) {
        console.log(`  - ${f}`);
      }
    }
    console.log(
      `\n${passed} passed, ${errors.length} errors, ${warnings.length} warnings`,
    );
    if (errors.length > 0) process.exit(1);
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
