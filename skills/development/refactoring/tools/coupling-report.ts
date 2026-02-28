const args = Bun.argv.slice(2);

const HELP = `
coupling-report — Map import dependencies between modules and flag tight coupling

Usage:
  bun run tools/coupling-report.ts <path> [options]

Options:
  --threshold <n>   Flag modules with more than N incoming/outgoing imports (default: 10)
  --json            Output as JSON instead of plain text
  --help            Show this help message

Scans source files to build a module dependency map. Flags modules with
excessive incoming imports (many dependents), excessive outgoing imports
(many dependencies), or bidirectional imports (coupling).
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const thresholdIdx = args.indexOf("--threshold");
const threshold = thresholdIdx !== -1 ? parseInt(args[thresholdIdx + 1]) || 10 : 10;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (thresholdIdx === -1 || i !== thresholdIdx + 1)
);

interface ModuleInfo {
  file: string;
  imports: string[];        // Files this module imports from
  importedBy: string[];     // Files that import this module
  importCount: number;
  importedByCount: number;
}

interface CouplingIssue {
  type: "high-fan-out" | "high-fan-in" | "circular";
  file: string;
  count: number;
  message: string;
  relatedFiles: string[];
}

function resolveImportPath(
  importPath: string,
  sourceFile: string,
  allFiles: Set<string>
): string | null {
  if (importPath.startsWith(".")) {
    const { resolve, dirname, join } = require("node:path") as typeof import("node:path");
    const dir = dirname(sourceFile);
    const extensions = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"];

    // Try exact match first
    const exact = resolve(dir, importPath);
    if (allFiles.has(exact)) return exact;

    // Try with extensions
    for (const ext of extensions) {
      const withExt = resolve(dir, importPath + ext);
      if (allFiles.has(withExt)) return withExt;
    }
  }
  return null; // External package or unresolvable
}

async function collectFiles(target: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,mjs}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    if (path.includes("node_modules")) continue;
    files.push(path);
  }
  return files;
}

async function extractImports(filePath: string): Promise<string[]> {
  const content = await Bun.file(filePath).text();
  const imports: string[] = [];

  // Static imports
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Dynamic imports
  const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // require()
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required path argument");
    process.exit(1);
  }

  const { resolve, relative } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No source files found at the specified path");
    process.exit(1);
  }

  const fileSet = new Set(files);
  const modules = new Map<string, ModuleInfo>();

  // Initialize modules
  for (const file of files) {
    modules.set(file, {
      file,
      imports: [],
      importedBy: [],
      importCount: 0,
      importedByCount: 0,
    });
  }

  // Build dependency graph
  for (const file of files) {
    const rawImports = await extractImports(file);
    const module = modules.get(file)!;

    for (const importPath of rawImports) {
      const resolved = resolveImportPath(importPath, file, fileSet);
      if (resolved && resolved !== file) {
        module.imports.push(resolved);
        const target = modules.get(resolved);
        if (target) {
          target.importedBy.push(file);
        }
      }
    }

    module.importCount = module.imports.length;
  }

  // Update importedBy counts
  for (const [, module] of modules) {
    module.importedByCount = module.importedBy.length;
  }

  // Detect issues
  const issues: CouplingIssue[] = [];

  for (const [file, module] of modules) {
    const relFile = relative(resolvedTarget, file);

    // High fan-out (too many imports)
    if (module.importCount > threshold) {
      issues.push({
        type: "high-fan-out",
        file: relFile,
        count: module.importCount,
        message: `Imports ${module.importCount} internal modules — consider splitting or reducing dependencies`,
        relatedFiles: module.imports.map((f) => relative(resolvedTarget, f)),
      });
    }

    // High fan-in (too many dependents — might be doing too much)
    if (module.importedByCount > threshold) {
      issues.push({
        type: "high-fan-in",
        file: relFile,
        count: module.importedByCount,
        message: `Imported by ${module.importedByCount} modules — may be a god module doing too much`,
        relatedFiles: module.importedBy.map((f) => relative(resolvedTarget, f)),
      });
    }

    // Circular dependencies
    for (const imported of module.imports) {
      const importedModule = modules.get(imported);
      if (importedModule && importedModule.imports.includes(file)) {
        const relImported = relative(resolvedTarget, imported);
        // Avoid reporting both directions
        if (relFile < relImported) {
          issues.push({
            type: "circular",
            file: relFile,
            count: 0,
            message: `Circular dependency between ${relFile} and ${relImported}`,
            relatedFiles: [relImported],
          });
        }
      }
    }
  }

  // Sort: circular first, then by count descending
  const typePriority = { circular: 0, "high-fan-out": 1, "high-fan-in": 2 };
  issues.sort((a, b) => typePriority[a.type] - typePriority[b.type] || b.count - a.count);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          filesScanned: files.length,
          totalIssues: issues.length,
          issues,
          modules: [...modules.values()].map((m) => ({
            file: relative(resolvedTarget, m.file),
            importCount: m.importCount,
            importedByCount: m.importedByCount,
          })),
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Coupling Report: ${files.length} modules, ${issues.length} issues (threshold: ${threshold})\n`
    );

    if (issues.length === 0) {
      console.log("No coupling issues detected.");
    } else {
      for (const issue of issues) {
        const icon =
          issue.type === "circular" ? "CIRCULAR" : issue.type === "high-fan-out" ? "FAN-OUT" : "FAN-IN";
        console.log(`[${icon}] ${issue.file}`);
        console.log(`  ${issue.message}`);
        if (issue.relatedFiles.length <= 5) {
          for (const rel of issue.relatedFiles) {
            console.log(`    - ${rel}`);
          }
        } else {
          for (const rel of issue.relatedFiles.slice(0, 5)) {
            console.log(`    - ${rel}`);
          }
          console.log(`    ... and ${issue.relatedFiles.length - 5} more`);
        }
        console.log();
      }
    }
  }

  const hasCircular = issues.some((i) => i.type === "circular");
  if (hasCircular) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
