const args = Bun.argv.slice(2);

const HELP = `
ci-lint — Validate GitHub Actions workflow files for common misconfigurations

Usage:
  bun run tools/ci-lint.ts <workflow-path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks GitHub Actions YAML workflow files for:
- Unpinned action versions (should use SHA, not @latest or @v1)
- Missing permissions block
- continue-on-error hiding failures
- Missing --frozen-lockfile on install steps
- Deprecated syntax
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface LintIssue {
  file: string;
  line: number;
  rule: string;
  severity: "error" | "warning";
  message: string;
}

async function lintWorkflow(filePath: string): Promise<LintIssue[]> {
  const issues: LintIssue[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const content = await file.text();
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for unpinned action versions
    const usesMatch = line.match(/^\s*-?\s*uses:\s*([^\s#]+)/);
    if (usesMatch) {
      const action = usesMatch[1];
      // Check if it uses a tag like @v1, @v2, @latest instead of a SHA
      if (action.includes("@") && !action.match(/@[0-9a-f]{40}/) && !action.startsWith("./")) {
        const versionPart = action.split("@")[1];
        if (versionPart === "latest" || versionPart === "main" || versionPart === "master") {
          issues.push({
            file: filePath,
            line: lineNum,
            rule: "pinned-action",
            severity: "error",
            message: `Action "${action}" uses mutable tag — pin to a full SHA for security`,
          });
        } else if (/^v?\d+$/.test(versionPart)) {
          issues.push({
            file: filePath,
            line: lineNum,
            rule: "pinned-action",
            severity: "warning",
            message: `Action "${action}" uses major version tag — consider pinning to full SHA (add a comment with the version)`,
          });
        }
      }
    }

    // Check for continue-on-error: true
    if (/^\s*continue-on-error:\s*true/.test(line)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "no-continue-on-error",
        severity: "warning",
        message: "continue-on-error: true hides failures — remove unless you have a specific reason",
      });
    }

    // Check for install without --frozen-lockfile
    const runMatch = line.match(/^\s*run:\s*(.+)/);
    if (runMatch) {
      const cmd = runMatch[1].trim();
      if (
        (cmd.includes("npm install") || cmd.includes("npm ci")) &&
        !cmd.includes("--frozen-lockfile") &&
        !cmd.includes("npm ci")
      ) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "frozen-lockfile",
          severity: "warning",
          message: "Use 'npm ci' instead of 'npm install' in CI to respect the lockfile",
        });
      }
      if (cmd.includes("bun install") && !cmd.includes("--frozen-lockfile")) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "frozen-lockfile",
          severity: "warning",
          message: "Add --frozen-lockfile to 'bun install' in CI to catch lockfile drift",
        });
      }
      if (cmd.includes("yarn install") && !cmd.includes("--frozen-lockfile") && !cmd.includes("--immutable")) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "frozen-lockfile",
          severity: "warning",
          message: "Add --frozen-lockfile (yarn v1) or --immutable (yarn v2+) in CI",
        });
      }
    }

    // Check for deprecated set-output
    if (line.includes("::set-output name=")) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "deprecated-syntax",
        severity: "error",
        message: "::set-output is deprecated — use $GITHUB_OUTPUT instead",
      });
    }

    // Check for deprecated save-state
    if (line.includes("::save-state name=")) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "deprecated-syntax",
        severity: "error",
        message: "::save-state is deprecated — use $GITHUB_STATE instead",
      });
    }

    // Check for deprecated set-env
    if (line.includes("::set-env name=")) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "deprecated-syntax",
        severity: "error",
        message: "::set-env is deprecated — use $GITHUB_ENV instead",
      });
    }

    // Check for node 16 / node 12 actions
    if (/node-version:\s*['"]?1[26]['"]?/.test(line)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "eol-node",
        severity: "warning",
        message: "Node.js 12 and 16 are end-of-life — use 18+ in CI",
      });
    }
  }

  // Check for missing permissions block at top level
  if (!content.includes("permissions:")) {
    issues.push({
      file: filePath,
      line: 1,
      rule: "permissions",
      severity: "warning",
      message: "No top-level permissions block — add explicit permissions for least-privilege (e.g., contents: read)",
    });
  }

  return issues;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{yml,yaml}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required workflow path argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No YAML workflow files found at the specified path");
    process.exit(1);
  }

  const allIssues: LintIssue[] = [];
  for (const file of files) {
    const issues = await lintWorkflow(file);
    allIssues.push(...issues);
  }

  const errors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");

  if (jsonOutput) {
    console.log(
      JSON.stringify({ total: allIssues.length, errors: errors.length, warnings: warnings.length, issues: allIssues }, null, 2)
    );
  } else {
    console.log(`CI Lint: ${files.length} files — ${errors.length} errors, ${warnings.length} warnings\n`);

    if (allIssues.length === 0) {
      console.log("No issues found.");
    } else {
      for (const issue of allIssues) {
        const icon = issue.severity === "error" ? "ERROR" : "WARN";
        console.log(`[${icon}] ${issue.file}:${issue.line} — ${issue.rule}`);
        console.log(`  ${issue.message}\n`);
      }
    }
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
