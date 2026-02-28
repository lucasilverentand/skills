const args = Bun.argv.slice(2);

const HELP = `
smell-detect — Scan source files for common code smells

Usage:
  bun run tools/smell-detect.ts <path> [options]

Options:
  --threshold <n>   Cyclomatic complexity threshold (default: 10)
  --max-lines <n>   Max function length before flagging (default: 50)
  --json            Output as JSON instead of plain text
  --help            Show this help message

Detects long functions, deep nesting, high cyclomatic complexity,
excessive coupling, and vague naming patterns.
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
    !(args[i - 1] === "--threshold") &&
    !(args[i - 1] === "--max-lines")
);

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

interface Smell {
  file: string;
  line: number;
  category: "complexity" | "length" | "nesting" | "coupling" | "naming";
  severity: "info" | "warning" | "error";
  message: string;
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

async function analyzeFile(
  filePath: string,
  complexityThreshold: number,
  maxLines: number
): Promise<Smell[]> {
  const smells: Smell[] = [];
  const content = await Bun.file(filePath).text();
  const lines = content.split("\n");

  // Track function boundaries and nesting
  let braceDepth = 0;
  let maxNesting = 0;
  let funcStart = -1;
  let funcName = "";
  let funcCount = 0;
  let importCount = 0;
  const funcPattern = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\([^)]*\)\s*\{)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Count imports
    if (/^import\s/.test(line)) importCount++;

    // Detect function start
    const funcMatch = line.match(funcPattern);
    if (funcMatch) {
      if (funcStart >= 0) {
        // Close previous function
        const length = i - funcStart;
        if (length > maxLines) {
          smells.push({
            file: filePath,
            line: funcStart + 1,
            category: "length",
            severity: length > maxLines * 2 ? "error" : "warning",
            message: `Function '${funcName}' is ${length} lines (max: ${maxLines})`,
          });
        }
      }
      funcStart = i;
      funcName = funcMatch[1] || funcMatch[2] || funcMatch[3] || "anonymous";
      funcCount++;
    }

    // Track nesting depth
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceDepth += openBraces - closeBraces;
    if (braceDepth > maxNesting) maxNesting = braceDepth;

    if (braceDepth > 4) {
      smells.push({
        file: filePath,
        line: lineNum,
        category: "nesting",
        severity: braceDepth > 6 ? "error" : "warning",
        message: `Nesting depth is ${braceDepth} — consider early returns or extraction`,
      });
    }

    // Detect branching keywords for complexity estimation
    const branchKeywords = line.match(/\b(if|else if|case|catch|&&|\|\||\?)\b/g);
    // (complexity tracked per-function at function close)

    // Detect vague names
    const varMatch = line.match(/(?:const|let|var)\s+(data|temp|tmp|result|res|val|value|item|obj|x|y|z)\s*[=:]/);
    if (varMatch && !line.includes("// ")) {
      smells.push({
        file: filePath,
        line: lineNum,
        category: "naming",
        severity: "info",
        message: `Vague variable name '${varMatch[1]}' — use a more descriptive name`,
      });
    }
  }

  // Check last function
  if (funcStart >= 0) {
    const length = lines.length - funcStart;
    if (length > maxLines) {
      smells.push({
        file: filePath,
        line: funcStart + 1,
        category: "length",
        severity: length > maxLines * 2 ? "error" : "warning",
        message: `Function '${funcName}' is ${length} lines (max: ${maxLines})`,
      });
    }
  }

  // File-level smells
  if (lines.length > 300) {
    smells.push({
      file: filePath,
      line: 0,
      category: "length",
      severity: lines.length > 500 ? "error" : "warning",
      message: `File is ${lines.length} lines — consider splitting into modules`,
    });
  }

  if (importCount > 15) {
    smells.push({
      file: filePath,
      line: 0,
      category: "coupling",
      severity: importCount > 25 ? "error" : "warning",
      message: `File has ${importCount} imports — high coupling, consider restructuring`,
    });
  }

  // Cyclomatic complexity estimation (rough: count branches per file)
  const branches = content.match(/\b(if|else\s+if|case|catch|&&|\|\|)\b/g);
  const complexity = (branches?.length || 0) + 1;
  if (complexity > complexityThreshold) {
    smells.push({
      file: filePath,
      line: 0,
      category: "complexity",
      severity: complexity > complexityThreshold * 2 ? "error" : "warning",
      message: `Estimated cyclomatic complexity: ${complexity} (threshold: ${complexityThreshold})`,
    });
  }

  return smells;
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const complexityThreshold = parseInt(getFlag("--threshold") || "10");
  const maxLines = parseInt(getFlag("--max-lines") || "50");

  let targetStat;
  try {
    targetStat = await stat(target);
  } catch {
    console.error(`Error: path not found: ${target}`);
    process.exit(1);
  }

  const files = targetStat.isDirectory()
    ? await collectFiles(target)
    : [target];

  const allSmells: Smell[] = [];
  for (const file of files) {
    allSmells.push(...(await analyzeFile(file, complexityThreshold, maxLines)));
  }

  // Deduplicate nesting warnings (keep only the deepest per file)
  const nestingByFile = new Map<string, Smell[]>();
  const nonNesting: Smell[] = [];
  for (const smell of allSmells) {
    if (smell.category === "nesting") {
      const list = nestingByFile.get(smell.file) || [];
      list.push(smell);
      nestingByFile.set(smell.file, list);
    } else {
      nonNesting.push(smell);
    }
  }
  const deduped = [...nonNesting];
  for (const [, smells] of nestingByFile) {
    // Keep only the worst nesting smell per file
    smells.sort((a, b) => {
      const depthA = parseInt(a.message.match(/\d+/)?.[0] || "0");
      const depthB = parseInt(b.message.match(/\d+/)?.[0] || "0");
      return depthB - depthA;
    });
    deduped.push(smells[0]);
  }

  const byCat = new Map<string, number>();
  for (const smell of deduped) {
    byCat.set(smell.category, (byCat.get(smell.category) || 0) + 1);
  }

  const result = {
    scanned: files.length,
    smells: deduped.length,
    byCategory: Object.fromEntries(byCat),
    details: deduped,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Code Smell Detection: ${files.length} files scanned`);
    console.log(`  Found ${deduped.length} issues\n`);

    if (deduped.length === 0) {
      console.log("No code smells detected.");
    } else {
      for (const [cat, count] of byCat) {
        console.log(`  ${cat}: ${count}`);
      }
      console.log();

      const grouped = new Map<string, Smell[]>();
      for (const smell of deduped) {
        const list = grouped.get(smell.category) || [];
        list.push(smell);
        grouped.set(smell.category, list);
      }

      for (const [category, smells] of grouped) {
        console.log(`[${category}]`);
        for (const s of smells) {
          const loc = s.line > 0 ? `:${s.line}` : "";
          console.log(`  ${relative(resolve("."), s.file)}${loc}`);
          console.log(`    ${s.message}`);
        }
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
