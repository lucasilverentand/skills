const args = Bun.argv.slice(2);

const HELP = `
complexity-scan — Find functions exceeding cyclomatic complexity thresholds

Usage:
  bun run tools/complexity-scan.ts <path> [options]

Options:
  --threshold <n>   Complexity threshold (default: 10)
  --json            Output as JSON instead of plain text
  --help            Show this help message

Scans TypeScript/JavaScript files and estimates cyclomatic complexity for each
function. Reports functions that exceed the threshold, ranked by complexity.
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

interface FunctionComplexity {
  file: string;
  line: number;
  name: string;
  complexity: number;
  lineCount: number;
}

function estimateComplexity(body: string): number {
  let complexity = 1; // Base path

  // Count decision points
  const patterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bwhile\s*\(/g,
    /\bfor\s*\(/g,
    /\bfor\s+of\b/g,
    /\bfor\s+in\b/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /\?\?/g,       // Nullish coalescing
    /\?\./g,       // Optional chaining (can indicate branching logic)
    /&&(?!=)/g,    // Logical AND
    /\|\|(?!=)/g,  // Logical OR
    /\?[^.?:]/g,   // Ternary operator
  ];

  for (const pattern of patterns) {
    const matches = body.match(pattern);
    if (matches) complexity += matches.length;
  }

  return complexity;
}

function findFunctions(
  content: string,
  filePath: string
): FunctionComplexity[] {
  const functions: FunctionComplexity[] = [];
  const lines = content.split("\n");

  // Match function declarations and expressions
  const patterns = [
    // function name(...) {
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g,
    // const name = (...) => {
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*\w+)?\s*=>/g,
    // const name = function(...) {
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\([^)]*\)/g,
    // method(...) { inside class
    /^\s+(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/gm,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      const startIdx = match.index;
      const startLine = content.substring(0, startIdx).split("\n").length;

      // Find the function body by counting braces
      const afterMatch = content.substring(startIdx);
      const braceStart = afterMatch.indexOf("{");
      if (braceStart === -1) continue;

      let depth = 0;
      let bodyEnd = -1;
      for (let i = braceStart; i < afterMatch.length; i++) {
        if (afterMatch[i] === "{") depth++;
        else if (afterMatch[i] === "}") {
          depth--;
          if (depth === 0) {
            bodyEnd = i;
            break;
          }
        }
      }

      if (bodyEnd === -1) continue;

      const body = afterMatch.substring(braceStart, bodyEnd + 1);
      const complexity = estimateComplexity(body);
      const lineCount = body.split("\n").length;

      functions.push({
        file: filePath,
        line: startLine,
        name,
        complexity,
        lineCount,
      });
    }
  }

  // Deduplicate by line number (multiple patterns may match the same function)
  const seen = new Set<string>();
  return functions.filter((f) => {
    const key = `${f.file}:${f.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,mjs}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    if (path.includes("node_modules")) continue;
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required path argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No source files found at the specified path");
    process.exit(1);
  }

  let allFunctions: FunctionComplexity[] = [];
  for (const file of files) {
    const content = await Bun.file(file).text();
    const functions = findFunctions(content, file);
    allFunctions.push(...functions);
  }

  // Filter by threshold and sort by complexity descending
  const overThreshold = allFunctions
    .filter((f) => f.complexity >= threshold)
    .sort((a, b) => b.complexity - a.complexity);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          filesScanned: files.length,
          totalFunctions: allFunctions.length,
          overThreshold: overThreshold.length,
          threshold,
          functions: overThreshold,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Complexity Scan: ${files.length} files, ${allFunctions.length} functions, ${overThreshold.length} over threshold (${threshold})\n`
    );

    if (overThreshold.length === 0) {
      console.log(`No functions exceed complexity threshold of ${threshold}.`);
    } else {
      for (const fn of overThreshold) {
        const severity =
          fn.complexity >= threshold * 2 ? "HIGH" : fn.complexity >= threshold * 1.5 ? "MEDIUM" : "LOW";
        console.log(
          `[${severity}] ${fn.file}:${fn.line} — ${fn.name}()`
        );
        console.log(
          `  complexity: ${fn.complexity}  lines: ${fn.lineCount}\n`
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
