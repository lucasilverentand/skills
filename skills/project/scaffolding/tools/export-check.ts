const args = Bun.argv.slice(2);

const HELP = `
export-check — Verify exports map entries resolve to actual files

Usage:
  bun run tools/export-check.ts [path] [options]

Arguments:
  path    Path to monorepo root (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks every workspace package's exports map to ensure all entries
point to files that actually exist.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface ExportCheck {
  package: string;
  path: string;
  exports: { entry: string; target: string; exists: boolean }[];
  hasExports: boolean;
  valid: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const rootPkgFile = Bun.file(`${root}/package.json`);

  if (!(await rootPkgFile.exists())) {
    console.error("Error: no package.json found");
    process.exit(1);
  }

  const rootPkg = await rootPkgFile.json();
  const workspaceGlobs: string[] = rootPkg.workspaces || [];
  const results: ExportCheck[] = [];

  for (const pattern of workspaceGlobs) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const match of glob.scan({ cwd: root, absolute: true })) {
      const pkg = await Bun.file(match).json();
      const dir = match.replace("/package.json", "");
      const relPath = dir.replace(root + "/", "");

      const exports: ExportCheck["exports"] = [];
      let hasExports = false;

      if (pkg.exports) {
        hasExports = true;
        const exportMap =
          typeof pkg.exports === "string"
            ? { ".": pkg.exports }
            : pkg.exports;

        for (const [entry, value] of Object.entries(exportMap)) {
          const target = typeof value === "string" ? value : (value as Record<string, string>)?.import || (value as Record<string, string>)?.default || null;
          if (target) {
            const fullPath = `${dir}/${target}`;
            const exists = await Bun.file(fullPath).exists();
            exports.push({ entry, target, exists });
          }
        }
      } else if (pkg.main) {
        hasExports = true;
        const fullPath = `${dir}/${pkg.main}`;
        const exists = await Bun.file(fullPath).exists();
        exports.push({ entry: "main", target: pkg.main, exists });
      }

      const valid = exports.every((e) => e.exists);

      results.push({
        package: pkg.name || relPath,
        path: relPath,
        exports,
        hasExports,
        valid,
      });
    }
  }

  results.sort((a, b) => a.package.localeCompare(b.package));

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    if (results.length === 0) {
      console.log("No workspace packages found.");
      return;
    }

    let totalIssues = 0;

    console.log(`Export check (${results.length} packages):\n`);

    for (const r of results) {
      const icon = r.valid ? "+" : "x";
      console.log(`  [${icon}] ${r.package}`);

      if (!r.hasExports) {
        console.log("      ! No exports or main field defined");
        totalIssues++;
      }

      for (const e of r.exports) {
        if (!e.exists) {
          console.log(`      x ${e.entry} -> ${e.target} (file not found)`);
          totalIssues++;
        }
      }
    }

    if (totalIssues > 0) {
      console.log(`\n${totalIssues} issue(s) found.`);
      process.exit(1);
    } else {
      console.log("\nAll exports resolve correctly.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
