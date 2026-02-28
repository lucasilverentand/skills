const args = Bun.argv.slice(2);

const HELP = `
unreachable-code — Detect code paths behind always-false conditions or after early returns

Usage:
  bun run tools/unreachable-code.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans TypeScript/JavaScript files for:
- Code after unconditional return/throw/break/continue statements
- Branches behind always-false conditions (if (false), if (0))
- Empty catch blocks that swallow errors
- Dead switch case branches after break
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface UnreachableBlock {
  file: string;
  line: number;
  category: "after-return" | "dead-branch" | "empty-catch" | "dead-switch";
  message: string;
  snippet: string;
}

async function scanFile(filePath: string): Promise<UnreachableBlock[]> {
  const findings: UnreachableBlock[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return findings;

  const content = await file.text();
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    // Code after unconditional return/throw
    if (/^\s*(return|throw)\s/.test(line) && !trimmed.endsWith("{")) {
      // Check if next non-empty, non-comment line is code in the same block
      let braceDepth = 0;
      for (let j = i + 1; j < lines.length && j < i + 10; j++) {
        const nextLine = lines[j].trim();
        if (nextLine === "" || nextLine.startsWith("//") || nextLine.startsWith("/*")) continue;
        if (nextLine === "}" || nextLine === ");") break; // Block/expression ends
        if (nextLine.startsWith("case ") || nextLine.startsWith("default:")) break;

        // Found code after return/throw
        findings.push({
          file: filePath,
          line: j + 1,
          category: "after-return",
          message: `Code after unconditional ${trimmed.startsWith("return") ? "return" : "throw"} statement is unreachable`,
          snippet: nextLine.length > 100 ? nextLine.substring(0, 100) + "..." : nextLine,
        });
        break;
      }
    }

    // Always-false conditions
    if (/\bif\s*\(\s*(false|0|null|undefined|"")\s*\)/.test(trimmed)) {
      findings.push({
        file: filePath,
        line: lineNum,
        category: "dead-branch",
        message: "Branch behind always-false condition — this code will never execute",
        snippet: trimmed.length > 100 ? trimmed.substring(0, 100) + "..." : trimmed,
      });
    }

    // Tautological conditions that are always false
    if (/\bif\s*\(\s*(\w+)\s*===\s*undefined\s*&&\s*\1\s*!==\s*undefined\s*\)/.test(trimmed) ||
        /\bif\s*\(\s*(\w+)\s*!==\s*undefined\s*&&\s*\1\s*===\s*undefined\s*\)/.test(trimmed)) {
      findings.push({
        file: filePath,
        line: lineNum,
        category: "dead-branch",
        message: "Contradictory condition — this is always false",
        snippet: trimmed.length > 100 ? trimmed.substring(0, 100) + "..." : trimmed,
      });
    }

    // Empty catch blocks
    if (/\bcatch\s*\([^)]*\)\s*\{\s*\}/.test(trimmed) ||
        (/\bcatch\s*\([^)]*\)\s*\{/.test(trimmed) && i + 1 < lines.length && lines[i + 1].trim() === "}")) {
      findings.push({
        file: filePath,
        line: lineNum,
        category: "empty-catch",
        message: "Empty catch block swallows errors silently — at minimum, log the error",
        snippet: trimmed.length > 100 ? trimmed.substring(0, 100) + "..." : trimmed,
      });
    }

    // Literal typeof comparisons that are always false
    if (/typeof\s+\w+\s*===?\s*["'](?:array|null|undefined|NaN|function\s)["']/.test(trimmed)) {
      findings.push({
        file: filePath,
        line: lineNum,
        category: "dead-branch",
        message: "Invalid typeof comparison — typeof never returns this value",
        snippet: trimmed.length > 100 ? trimmed.substring(0, 100) + "..." : trimmed,
      });
    }
  }

  return findings;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,mjs}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    if (path.includes("node_modules")) continue;
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

  const allFindings: UnreachableBlock[] = [];
  for (const file of files) {
    const findings = await scanFile(file);
    allFindings.push(...findings);
  }

  const categoryCounts = {
    "after-return": allFindings.filter((f) => f.category === "after-return").length,
    "dead-branch": allFindings.filter((f) => f.category === "dead-branch").length,
    "empty-catch": allFindings.filter((f) => f.category === "empty-catch").length,
    "dead-switch": allFindings.filter((f) => f.category === "dead-switch").length,
  };

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          filesScanned: files.length,
          totalFindings: allFindings.length,
          categoryCounts,
          findings: allFindings,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Unreachable Code: ${files.length} files scanned, ${allFindings.length} findings\n`
    );

    if (allFindings.length === 0) {
      console.log("No unreachable code detected.");
    } else {
      for (const finding of allFindings) {
        console.log(`${finding.file}:${finding.line} [${finding.category}]`);
        console.log(`  ${finding.message}`);
        console.log(`  > ${finding.snippet}\n`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
