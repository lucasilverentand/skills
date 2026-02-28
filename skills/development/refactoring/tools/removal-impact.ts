const args = Bun.argv.slice(2);

const HELP = `
removal-impact — Simulate removing a symbol and report which files would be affected

Usage:
  bun run tools/removal-impact.ts <symbol-name> [options]

Options:
  --dir <path>    Project directory to search (default: current directory)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Searches the entire project for references to a symbol (function, class, type,
variable, file) and reports every file that would be affected by its removal.
Checks imports, dynamic imports, string references, and re-exports.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dirIdx = args.indexOf("--dir");
const projectDir = dirIdx !== -1 ? args[dirIdx + 1] : process.cwd();
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (dirIdx === -1 || i !== dirIdx + 1)
);

interface Reference {
  file: string;
  line: number;
  type: "import" | "dynamic-import" | "re-export" | "string-reference" | "type-reference";
  snippet: string;
}

async function findReferences(
  symbol: string,
  dir: string
): Promise<Reference[]> {
  const refs: Reference[] = [];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,mjs}");

  for await (const path of glob.scan({ cwd: dir, absolute: true })) {
    if (path.includes("node_modules")) continue;

    const content = await Bun.file(path).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const trimmed = line.trim();

      // Static imports: import { symbol } from '...'
      const importRegex = new RegExp(
        `import\\s*\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from`
      );
      if (importRegex.test(line)) {
        refs.push({
          file: path,
          line: lineNum,
          type: "import",
          snippet: trimmed.length > 120 ? trimmed.substring(0, 120) + "..." : trimmed,
        });
        continue;
      }

      // Default import with symbol name
      const defaultImportRegex = new RegExp(
        `import\\s+${symbol}\\s+from`
      );
      if (defaultImportRegex.test(line)) {
        refs.push({
          file: path,
          line: lineNum,
          type: "import",
          snippet: trimmed.length > 120 ? trimmed.substring(0, 120) + "..." : trimmed,
        });
        continue;
      }

      // Re-exports: export { symbol } from '...'
      const reExportRegex = new RegExp(
        `export\\s*\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from`
      );
      if (reExportRegex.test(line)) {
        refs.push({
          file: path,
          line: lineNum,
          type: "re-export",
          snippet: trimmed.length > 120 ? trimmed.substring(0, 120) + "..." : trimmed,
        });
        continue;
      }

      // Dynamic imports: import("...").symbol or await import("...").then(m => m.symbol)
      if (
        line.includes("import(") &&
        new RegExp(`\\.${symbol}\\b`).test(line)
      ) {
        refs.push({
          file: path,
          line: lineNum,
          type: "dynamic-import",
          snippet: trimmed.length > 120 ? trimmed.substring(0, 120) + "..." : trimmed,
        });
        continue;
      }

      // Type references: : SymbolType, as SymbolType, extends SymbolType
      const typeRefRegex = new RegExp(
        `(?::\\s*|as\\s+|extends\\s+|implements\\s+|<)${symbol}\\b`
      );
      if (typeRefRegex.test(line)) {
        refs.push({
          file: path,
          line: lineNum,
          type: "type-reference",
          snippet: trimmed.length > 120 ? trimmed.substring(0, 120) + "..." : trimmed,
        });
        continue;
      }

      // String references (eval, config, dynamic loading)
      const stringRefRegex = new RegExp(`['"\`]${symbol}['"\`]`);
      if (stringRefRegex.test(line) && !line.includes("import") && !line.includes("export")) {
        refs.push({
          file: path,
          line: lineNum,
          type: "string-reference",
          snippet: trimmed.length > 120 ? trimmed.substring(0, 120) + "..." : trimmed,
        });
      }
    }
  }

  return refs;
}

async function main() {
  const symbol = filteredArgs[0];
  if (!symbol) {
    console.error("Error: missing required symbol name argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedDir = resolve(projectDir);

  const refs = await findReferences(symbol, resolvedDir);

  // Group by file
  const byFile = new Map<string, Reference[]>();
  for (const ref of refs) {
    if (!byFile.has(ref.file)) byFile.set(ref.file, []);
    byFile.get(ref.file)!.push(ref);
  }

  const typeCounts = {
    import: refs.filter((r) => r.type === "import").length,
    "dynamic-import": refs.filter((r) => r.type === "dynamic-import").length,
    "re-export": refs.filter((r) => r.type === "re-export").length,
    "string-reference": refs.filter((r) => r.type === "string-reference").length,
    "type-reference": refs.filter((r) => r.type === "type-reference").length,
  };

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          symbol,
          totalReferences: refs.length,
          affectedFiles: byFile.size,
          typeCounts,
          references: refs,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Removal Impact: "${symbol}" — ${refs.length} references in ${byFile.size} files\n`);

    if (refs.length === 0) {
      console.log("No references found. Safe to remove.");
    } else {
      console.log("References by type:");
      for (const [type, count] of Object.entries(typeCounts)) {
        if (count > 0) console.log(`  ${type}: ${count}`);
      }

      console.log("\nAffected files:\n");
      for (const [file, fileRefs] of byFile) {
        console.log(`  ${file}:`);
        for (const ref of fileRefs) {
          console.log(`    line ${ref.line} [${ref.type}] ${ref.snippet}`);
        }
        console.log();
      }

      if (typeCounts["dynamic-import"] > 0) {
        console.log(
          "WARNING: Dynamic import references found — removal may cause runtime failures that TypeScript won't catch.\n"
        );
      }
      if (typeCounts["string-reference"] > 0) {
        console.log(
          "WARNING: String references found — may indicate eval(), config-driven loading, or reflection usage.\n"
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
