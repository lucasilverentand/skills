const args = Bun.argv.slice(2);

const HELP = `
package-scaffold — Generate a new workspace package with tsconfig, index.ts, and package.json

Usage:
  bun run tools/package-scaffold.ts <name> [options]

Arguments:
  name    Package name in kebab-case (used as directory name and @scope/name)

Options:
  --scope <scope>    Package scope without @ (default: inferred from root package.json)
  --json             Output as JSON instead of plain text
  --help             Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

async function main() {
  const name = filteredArgs[0];
  if (!name) {
    console.error("Error: missing required package name");
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    console.error(`Error: package name '${name}' must be kebab-case`);
    process.exit(1);
  }

  const root = process.cwd();

  // Infer scope from root package.json or existing packages
  let scope = getFlag("--scope");
  if (!scope) {
    const rootPkg = Bun.file(`${root}/package.json`);
    if (await rootPkg.exists()) {
      const pkg = await rootPkg.json();
      // Try to find scope from existing workspace packages
      const workspaces: string[] = pkg.workspaces || [];
      for (const pattern of workspaces) {
        const glob = new Bun.Glob(`${pattern}/package.json`);
        for await (const match of glob.scan({ cwd: root, absolute: true })) {
          const existingPkg = await Bun.file(match).json();
          const scopeMatch = existingPkg.name?.match(/^@([^/]+)\//);
          if (scopeMatch) {
            scope = scopeMatch[1];
            break;
          }
        }
        if (scope) break;
      }
    }
    if (!scope) scope = name;
  }

  const pkgDir = `${root}/packages/${name}`;

  // Check if already exists
  if (await Bun.file(`${pkgDir}/package.json`).exists()) {
    console.error(`Error: package already exists at packages/${name}`);
    process.exit(1);
  }

  const createdFiles: string[] = [];

  // package.json
  const pkgJson = {
    name: `@${scope}/${name}`,
    type: "module",
    version: "0.0.0",
    exports: {
      ".": "./src/index.ts",
    },
  };
  await Bun.write(`${pkgDir}/package.json`, JSON.stringify(pkgJson, null, 2) + "\n");
  createdFiles.push("package.json");

  // tsconfig.json
  const tsconfig = {
    extends: "../../tsconfig.json",
    compilerOptions: {
      outDir: "./dist",
      rootDir: "./src",
    },
    include: ["src"],
  };
  await Bun.write(`${pkgDir}/tsconfig.json`, JSON.stringify(tsconfig, null, 2) + "\n");
  createdFiles.push("tsconfig.json");

  // src/index.ts
  await Bun.write(`${pkgDir}/src/index.ts`, "export {};\n");
  createdFiles.push("src/index.ts");

  const result = {
    name: `@${scope}/${name}`,
    path: `packages/${name}`,
    files: createdFiles,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Created package: @${scope}/${name}`);
    console.log(`  path: packages/${name}/`);
    console.log("\nCreated files:");
    for (const f of createdFiles) {
      console.log(`  ${f}`);
    }
    console.log("\nNext steps:");
    console.log("  bun install");
    console.log(`  Add exports to packages/${name}/src/index.ts`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
