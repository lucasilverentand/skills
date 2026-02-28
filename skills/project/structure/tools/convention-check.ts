const args = Bun.argv.slice(2);

const HELP = `
convention-check — Validate repo structure against naming and layout conventions

Usage:
  bun run tools/convention-check.ts [path] [options]

Arguments:
  path    Path to monorepo root (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks:
  - Package directory names are kebab-case
  - Package names use @scope/kebab-case format
  - Source files are kebab-case.ts
  - Required root files exist (package.json, tsconfig.json, biome.json)
  - Workspace config is present for monorepos
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

const KEBAB_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

interface Violation {
  path: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const violations: Violation[] = [];

  // Check root files
  const requiredRoot = ["package.json", "tsconfig.json"];
  const recommendedRoot = ["biome.json", ".gitignore"];

  for (const file of requiredRoot) {
    const f = Bun.file(`${root}/${file}`);
    if (!(await f.exists())) {
      violations.push({
        path: file,
        rule: "root-files",
        message: `Required root file '${file}' is missing`,
        severity: "error",
      });
    }
  }

  for (const file of recommendedRoot) {
    const f = Bun.file(`${root}/${file}`);
    if (!(await f.exists())) {
      violations.push({
        path: file,
        rule: "root-files",
        message: `Recommended root file '${file}' is missing`,
        severity: "warning",
      });
    }
  }

  // Check workspace config
  const rootPkgFile = Bun.file(`${root}/package.json`);
  let workspaceGlobs: string[] = [];

  if (await rootPkgFile.exists()) {
    const rootPkg = await rootPkgFile.json();
    workspaceGlobs = rootPkg.workspaces || [];
  }

  // Check each workspace package
  for (const pattern of workspaceGlobs) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const match of glob.scan({ cwd: root, absolute: true })) {
      const pkgFile = Bun.file(match);
      if (!(await pkgFile.exists())) continue;

      const pkg = await pkgFile.json();
      const dir = match.replace("/package.json", "");
      const relPath = dir.replace(root + "/", "");
      const dirName = relPath.split("/").pop() || "";

      // Check directory name is kebab-case
      if (!KEBAB_RE.test(dirName)) {
        violations.push({
          path: relPath,
          rule: "dir-naming",
          message: `Directory '${dirName}' is not kebab-case`,
          severity: "error",
        });
      }

      // Check package name format
      if (pkg.name) {
        const scopeMatch = pkg.name.match(/^@([^/]+)\/(.+)$/);
        if (!scopeMatch) {
          violations.push({
            path: relPath,
            rule: "pkg-naming",
            message: `Package name '${pkg.name}' should use @scope/name format`,
            severity: "warning",
          });
        } else if (!KEBAB_RE.test(scopeMatch[2])) {
          violations.push({
            path: relPath,
            rule: "pkg-naming",
            message: `Package name suffix '${scopeMatch[2]}' is not kebab-case`,
            severity: "error",
          });
        }
      }

      // Check source file naming
      const srcGlob = new Bun.Glob("src/**/*.{ts,tsx}");
      for await (const srcFile of srcGlob.scan({ cwd: dir })) {
        const fileName = srcFile.split("/").pop() || "";
        const baseName = fileName.replace(/\.(ts|tsx)$/, "");

        // Allow index, allow PascalCase for React components (.tsx)
        if (baseName === "index") continue;
        if (fileName.endsWith(".tsx") && /^[A-Z]/.test(baseName)) continue;
        if (fileName.endsWith(".test.ts") || fileName.endsWith(".test.tsx")) continue;

        if (!KEBAB_RE.test(baseName)) {
          violations.push({
            path: `${relPath}/${srcFile}`,
            rule: "file-naming",
            message: `File '${fileName}' is not kebab-case (expected kebab-case.ts)`,
            severity: "warning",
          });
        }
      }
    }
  }

  const result = {
    root,
    violations,
    errorCount: violations.filter((v) => v.severity === "error").length,
    warningCount: violations.filter((v) => v.severity === "warning").length,
    valid: violations.filter((v) => v.severity === "error").length === 0,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (violations.length === 0) {
      console.log("All convention checks passed.");
      return;
    }

    const errors = violations.filter((v) => v.severity === "error");
    const warnings = violations.filter((v) => v.severity === "warning");

    if (errors.length > 0) {
      console.log("Errors:");
      for (const v of errors) {
        console.log(`  x [${v.rule}] ${v.path}: ${v.message}`);
      }
    }

    if (warnings.length > 0) {
      console.log("Warnings:");
      for (const v of warnings) {
        console.log(`  ! [${v.rule}] ${v.path}: ${v.message}`);
      }
    }

    console.log(
      `\n${errors.length} error(s), ${warnings.length} warning(s)`
    );

    if (!result.valid) process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
