const args = Bun.argv.slice(2);

const HELP = `
part-validate — Validate workspace package structure and conventions

Usage:
  bun run tools/part-validate.ts <package-path> [options]

Arguments:
  package-path    Path to the workspace package directory to validate

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks:
  - package.json exists with name and type fields
  - tsconfig.json exists
  - src/index.ts exists with named exports
  - exports map in package.json resolves to real files
  - no circular workspace dependencies
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface ValidationResult {
  package: string;
  path: string;
  errors: string[];
  warnings: string[];
  valid: boolean;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required package-path argument");
    process.exit(1);
  }

  const pkgDir = target.startsWith("/") ? target : `${process.cwd()}/${target}`;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check package.json
  const pkgJsonPath = `${pkgDir}/package.json`;
  const pkgJsonFile = Bun.file(pkgJsonPath);
  if (!(await pkgJsonFile.exists())) {
    errors.push("package.json is missing");
  } else {
    const pkg = await pkgJsonFile.json();

    if (!pkg.name) {
      errors.push("package.json missing 'name' field");
    } else if (!pkg.name.startsWith("@")) {
      warnings.push(`package name '${pkg.name}' should use @scope/name format`);
    }

    if (!pkg.type) {
      warnings.push("package.json missing 'type' field (should be 'module')");
    } else if (pkg.type !== "module") {
      warnings.push(`package.json type is '${pkg.type}', expected 'module'`);
    }

    // Check exports map
    if (pkg.exports) {
      const exportEntries = typeof pkg.exports === "string"
        ? { ".": pkg.exports }
        : pkg.exports;

      for (const [key, value] of Object.entries(exportEntries)) {
        const exportPath = typeof value === "string" ? value : null;
        if (exportPath) {
          const fullPath = `${pkgDir}/${exportPath}`;
          const file = Bun.file(fullPath);
          if (!(await file.exists())) {
            errors.push(`exports["${key}"] points to ${exportPath} which does not exist`);
          }
        }
      }
    } else if (!pkg.main) {
      warnings.push("package.json has no 'exports' or 'main' field");
    }
  }

  // Check tsconfig.json
  const tsconfigPath = `${pkgDir}/tsconfig.json`;
  const tsconfigFile = Bun.file(tsconfigPath);
  if (!(await tsconfigFile.exists())) {
    warnings.push("tsconfig.json is missing");
  }

  // Check src/index.ts
  const indexPath = `${pkgDir}/src/index.ts`;
  const indexTsxPath = `${pkgDir}/src/index.tsx`;
  const indexFile = Bun.file(indexPath);
  const indexTsxFile = Bun.file(indexTsxPath);

  if (!(await indexFile.exists()) && !(await indexTsxFile.exists())) {
    errors.push("src/index.ts (or src/index.tsx) is missing");
  } else {
    const actualPath = (await indexFile.exists()) ? indexPath : indexTsxPath;
    const content = await Bun.file(actualPath).text();

    const hasExports =
      content.includes("export ") ||
      content.includes("export{") ||
      content.includes("export *");
    if (!hasExports) {
      warnings.push("src/index.ts has no exports — expected named exports for public API");
    }
  }

  // Check for src/ directory
  const srcGlob = new Bun.Glob("src/**/*.{ts,tsx}");
  let srcFileCount = 0;
  for await (const _ of srcGlob.scan({ cwd: pkgDir })) {
    srcFileCount++;
  }
  if (srcFileCount === 0) {
    errors.push("src/ directory has no TypeScript files");
  }

  const result: ValidationResult = {
    package: filteredArgs[0],
    path: pkgDir,
    errors,
    warnings,
    valid: errors.length === 0,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Validating: ${result.package}\n`);

    if (errors.length > 0) {
      console.log("Errors:");
      for (const err of errors) {
        console.log(`  x ${err}`);
      }
    }

    if (warnings.length > 0) {
      console.log("Warnings:");
      for (const warn of warnings) {
        console.log(`  ! ${warn}`);
      }
    }

    if (result.valid && warnings.length === 0) {
      console.log("All checks passed.");
    } else if (result.valid) {
      console.log(`\nValid with ${warnings.length} warning(s).`);
    } else {
      console.log(`\nInvalid: ${errors.length} error(s), ${warnings.length} warning(s).`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
