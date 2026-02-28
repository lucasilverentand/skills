const args = Bun.argv.slice(2);

const HELP = `
test-scaffold — Generate test file boilerplate for a given source file

Usage:
  bun run tools/test-scaffold.ts <source-file> [options]

Options:
  --output <path>   Custom output path for the test file
  --framework <fw>  Test framework: bun, vitest (default: bun)
  --json            Output as JSON instead of plain text
  --help            Show this help message

Reads the source file, extracts exported functions and types,
and generates a test file skeleton with describe blocks and test stubs.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    !(args[i - 1] === "--output") &&
    !(args[i - 1] === "--framework")
);

import { dirname, basename, extname, join, relative } from "node:path";
import { stat } from "node:fs/promises";

interface ExportedSymbol {
  name: string;
  kind: "function" | "class" | "const" | "type" | "interface";
  params?: string[];
  isAsync: boolean;
}

function extractExports(content: string): ExportedSymbol[] {
  const symbols: ExportedSymbol[] = [];

  // Functions
  const funcRegex = /export\s+(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const params = match[3]
      .split(",")
      .map((p) => p.trim().split(":")[0].trim())
      .filter(Boolean);
    symbols.push({
      name: match[2],
      kind: "function",
      params,
      isAsync: !!match[1],
    });
  }

  // Arrow functions
  const arrowRegex = /export\s+const\s+(\w+)\s*=\s*(async\s*)?\([^)]*\)\s*(?:=>|\{)/g;
  while ((match = arrowRegex.exec(content)) !== null) {
    symbols.push({
      name: match[1],
      kind: "function",
      isAsync: !!match[2],
    });
  }

  // Classes
  const classRegex = /export\s+class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    symbols.push({ name: match[1], kind: "class", isAsync: false });
  }

  // Constants (non-function)
  const constRegex = /export\s+const\s+(\w+)\s*[=:]/g;
  while ((match = constRegex.exec(content)) !== null) {
    // Skip if already captured as arrow function
    if (!symbols.some((s) => s.name === match![1])) {
      symbols.push({ name: match[1], kind: "const", isAsync: false });
    }
  }

  return symbols;
}

async function main() {
  const sourceFile = filteredArgs[0];
  if (!sourceFile) {
    console.error("Error: source file path required");
    process.exit(1);
  }

  try {
    await stat(sourceFile);
  } catch {
    console.error(`Error: source file not found: ${sourceFile}`);
    process.exit(1);
  }

  const framework = getFlag("--framework") || "bun";
  const ext = extname(sourceFile);
  const base = basename(sourceFile, ext);
  const dir = dirname(sourceFile);

  // Default output: co-located test file
  const defaultOutput = join(dir, `${base}.test${ext}`);
  const outputPath = getFlag("--output") || defaultOutput;

  const content = await Bun.file(sourceFile).text();
  const exports = extractExports(content);

  // Build the import path (relative from test file to source)
  const importPath = "./" + base;

  // Generate test file
  const importNames = exports
    .filter((e) => e.kind !== "type" && e.kind !== "interface")
    .map((e) => e.name);

  const importLine =
    importNames.length > 0
      ? `import { ${importNames.join(", ")} } from "${importPath}";\n`
      : "";

  const describeImport =
    framework === "vitest"
      ? `import { describe, it, expect } from "vitest";\n`
      : `import { describe, it, expect } from "bun:test";\n`;

  let testBody = "";

  for (const sym of exports) {
    if (sym.kind === "type" || sym.kind === "interface") continue;

    testBody += `\ndescribe("${sym.name}", () => {\n`;

    if (sym.kind === "function") {
      const asyncPrefix = sym.isAsync ? "async " : "";
      testBody += `  it("should handle the happy path", ${asyncPrefix}() => {\n`;
      testBody += `    // Arrange\n`;
      testBody += `    // Act\n`;
      if (sym.isAsync) {
        testBody += `    // const result = await ${sym.name}();\n`;
      } else {
        testBody += `    // const result = ${sym.name}();\n`;
      }
      testBody += `    // Assert\n`;
      testBody += `    // expect(result).toEqual(expected);\n`;
      testBody += `  });\n\n`;

      testBody += `  it("should handle edge cases", ${asyncPrefix}() => {\n`;
      testBody += `    // TODO: test boundary values, empty inputs, null\n`;
      testBody += `  });\n\n`;

      testBody += `  it("should handle errors", ${asyncPrefix}() => {\n`;
      testBody += `    // TODO: test error conditions\n`;
      testBody += `  });\n`;
    } else if (sym.kind === "class") {
      testBody += `  it("should instantiate correctly", () => {\n`;
      testBody += `    // const instance = new ${sym.name}();\n`;
      testBody += `    // expect(instance).toBeDefined();\n`;
      testBody += `  });\n`;
    } else {
      testBody += `  it("should have the expected value", () => {\n`;
      testBody += `    expect(${sym.name}).toBeDefined();\n`;
      testBody += `  });\n`;
    }

    testBody += `});\n`;
  }

  const testFile = `${describeImport}${importLine}${testBody}`;

  // Check if output file already exists
  try {
    await stat(outputPath);
    console.error(`Warning: ${outputPath} already exists — will not overwrite`);
    if (jsonOutput) {
      console.log(JSON.stringify({ error: "file exists", path: outputPath }, null, 2));
    } else {
      console.log(`Test file already exists: ${outputPath}`);
    }
    return;
  } catch {
    // File doesn't exist, good
  }

  await Bun.write(outputPath, testFile);

  const result = {
    sourceFile,
    outputFile: outputPath,
    framework,
    exports: exports.map((e) => ({ name: e.name, kind: e.kind })),
    testCount: exports.filter((e) => e.kind !== "type" && e.kind !== "interface").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Test scaffold generated: ${outputPath}`);
    console.log(`  Source: ${sourceFile}`);
    console.log(`  Framework: ${framework}`);
    console.log(`  Exports: ${exports.length}`);
    console.log(`  Test blocks: ${result.testCount}`);
    console.log("\nFill in the test implementations — the scaffold has placeholders marked with TODO.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
