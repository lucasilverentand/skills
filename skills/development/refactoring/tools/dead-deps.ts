const args = Bun.argv.slice(2);

const HELP = `
dead-deps — List installed packages not referenced in any source file

Usage:
  bun run tools/dead-deps.ts <project-dir> [options]

Options:
  --include-dev   Also check devDependencies (default: production deps only)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Reads package.json dependencies, then searches all source files, config files,
and scripts for references to each package name. Reports packages with zero references.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const includeDev = args.includes("--include-dev");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface DeadDep {
  name: string;
  version: string;
  type: "dependency" | "devDependency";
  references: number;
}

async function findReferences(
  packageName: string,
  projectDir: string
): Promise<number> {
  let count = 0;

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,mjs,json,yaml,yml,toml,md}");

  for await (const path of glob.scan({ cwd: projectDir, absolute: true })) {
    if (path.includes("node_modules")) continue;
    if (path.endsWith("package-lock.json") || path.endsWith("bun.lockb")) continue;

    const content = await Bun.file(path).text();

    // Check for import/require references
    if (
      content.includes(`"${packageName}"`) ||
      content.includes(`'${packageName}'`) ||
      content.includes(`"${packageName}/`) ||
      content.includes(`'${packageName}/`) ||
      content.includes(`\`${packageName}\``)
    ) {
      count++;
    }

    // Check for scoped package partial references (e.g., just the package name without scope)
    if (packageName.startsWith("@")) {
      const shortName = packageName.split("/")[1];
      if (shortName && content.includes(shortName)) {
        // Only count if it's actually a reference to this package
        const regex = new RegExp(`['"\`]${packageName.replace("/", "/")}`, "g");
        const matches = content.match(regex);
        if (matches) count += matches.length;
      }
    }
  }

  return count;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required project directory argument");
    process.exit(1);
  }

  const { resolve, join } = await import("node:path");
  const resolvedTarget = resolve(target);
  const pkgPath = join(resolvedTarget, "package.json");

  const pkgFile = Bun.file(pkgPath);
  if (!(await pkgFile.exists())) {
    console.error(`Error: no package.json found at ${pkgPath}`);
    process.exit(1);
  }

  const pkg = JSON.parse(await pkgFile.text());

  const deps: Array<{ name: string; version: string; type: "dependency" | "devDependency" }> = [];

  if (pkg.dependencies) {
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      deps.push({ name, version: version as string, type: "dependency" });
    }
  }

  if (includeDev && pkg.devDependencies) {
    for (const [name, version] of Object.entries(pkg.devDependencies)) {
      deps.push({ name, version: version as string, type: "devDependency" });
    }
  }

  if (deps.length === 0) {
    console.log("No dependencies to check.");
    process.exit(0);
  }

  const dead: DeadDep[] = [];

  for (const dep of deps) {
    const refs = await findReferences(dep.name, resolvedTarget);

    // Also check package.json scripts for tool references
    let scriptRefs = 0;
    if (pkg.scripts) {
      const scriptsStr = JSON.stringify(pkg.scripts);
      if (scriptsStr.includes(dep.name)) scriptRefs++;
    }

    const totalRefs = refs + scriptRefs;
    if (totalRefs === 0) {
      dead.push({ ...dep, references: 0 });
    }
  }

  // Known false positives: packages that are typically used implicitly
  const implicitPackages = new Set([
    "typescript",
    "@types/node",
    "@types/bun",
    "prettier",
    "eslint",
    "@biomejs/biome",
  ]);

  const confirmed = dead.filter((d) => !implicitPackages.has(d.name));
  const maybeImplicit = dead.filter((d) => implicitPackages.has(d.name));

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          totalDeps: deps.length,
          deadDeps: confirmed.length,
          maybeImplicit: maybeImplicit.length,
          confirmed,
          maybeImplicit,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Dead Dependencies: ${confirmed.length} unused of ${deps.length} total\n`);

    if (confirmed.length === 0) {
      console.log("All dependencies appear to be in use.");
    } else {
      console.log("Unused packages (safe to remove):\n");
      for (const dep of confirmed) {
        console.log(`  ${dep.name}@${dep.version} (${dep.type})`);
      }
    }

    if (maybeImplicit.length > 0) {
      console.log("\nPossibly implicit (verify before removing):\n");
      for (const dep of maybeImplicit) {
        console.log(`  ${dep.name}@${dep.version} (${dep.type}) — typically used by tooling, not imported directly`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
