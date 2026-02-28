const args = Bun.argv.slice(2);

const HELP = `
extract-candidate — Identify repeated code patterns suitable for extraction

Usage:
  bun run tools/extract-candidate.ts <path> [options]

Options:
  --min-lines <n>    Minimum lines for a duplicated block (default: 5)
  --min-tokens <n>   Minimum tokens for similarity (default: 50)
  --json             Output as JSON instead of plain text
  --help             Show this help message

Scans source files for duplicated or near-duplicated code blocks that are
candidates for extraction into shared utilities. Uses token-level comparison
to find structural similarity even when variable names differ.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const minLinesIdx = args.indexOf("--min-lines");
const minLines = minLinesIdx !== -1 ? parseInt(args[minLinesIdx + 1]) || 5 : 5;
const minTokensIdx = args.indexOf("--min-tokens");
const minTokens = minTokensIdx !== -1 ? parseInt(args[minTokensIdx + 1]) || 50 : 50;
const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (minLinesIdx === -1 || i !== minLinesIdx + 1) &&
    (minTokensIdx === -1 || i !== minTokensIdx + 1)
);

interface CodeBlock {
  file: string;
  startLine: number;
  endLine: number;
  content: string;
  normalized: string;
}

interface DuplicatePair {
  blockA: { file: string; startLine: number; endLine: number };
  blockB: { file: string; startLine: number; endLine: number };
  lineCount: number;
  similarity: number;
  preview: string;
}

function normalize(code: string): string {
  return code
    .replace(/\/\/.*$/gm, "")        // Remove line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
    .replace(/\b(?:const|let|var)\s+(\w+)/g, "VAR $1")  // Normalize declarations
    .replace(/["'`]([^"'`]*)["'`]/g, "STR")              // Normalize strings
    .replace(/\b\d+\.?\d*\b/g, "NUM")                     // Normalize numbers
    .replace(/\s+/g, " ")                                   // Normalize whitespace
    .trim();
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function similarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0;

  const tokensA = a.split(" ");
  const tokensB = b.split(" ");
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function extractBlocks(content: string, filePath: string): CodeBlock[] {
  const lines = content.split("\n");
  const blocks: CodeBlock[] = [];

  // Slide a window of minLines to minLines*3 size across the file
  for (let windowSize = minLines; windowSize <= Math.min(minLines * 3, 30); windowSize += minLines) {
    for (let i = 0; i <= lines.length - windowSize; i++) {
      const blockLines = lines.slice(i, i + windowSize);
      const blockContent = blockLines.join("\n");

      // Skip blocks that are mostly empty or just braces
      const nonEmptyLines = blockLines.filter((l) => l.trim().length > 2);
      if (nonEmptyLines.length < minLines) continue;

      const norm = normalize(blockContent);
      if (norm.split(" ").length < minTokens / 2) continue;

      blocks.push({
        file: filePath,
        startLine: i + 1,
        endLine: i + windowSize,
        content: blockContent,
        normalized: norm,
      });
    }
  }

  return blocks;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
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

  const { resolve, relative } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No source files found at the specified path");
    process.exit(1);
  }

  // Extract blocks from all files
  const allBlocks: CodeBlock[] = [];
  for (const file of files) {
    const content = await Bun.file(file).text();
    const blocks = extractBlocks(content, file);
    allBlocks.push(...blocks);
  }

  // Find duplicates using hash buckets for efficiency
  const buckets = new Map<number, CodeBlock[]>();
  for (const block of allBlocks) {
    const hash = simpleHash(block.normalized);
    if (!buckets.has(hash)) buckets.set(hash, []);
    buckets.get(hash)!.push(block);
  }

  const duplicates: DuplicatePair[] = [];
  const seen = new Set<string>();

  for (const [, bucket] of buckets) {
    if (bucket.length < 2) continue;

    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i];
        const b = bucket[j];

        // Skip same-file overlapping blocks
        if (a.file === b.file && Math.abs(a.startLine - b.startLine) < minLines) continue;

        const sim = similarity(a.normalized, b.normalized);
        if (sim < 0.8) continue;

        const key = [
          `${a.file}:${a.startLine}`,
          `${b.file}:${b.startLine}`,
        ]
          .sort()
          .join("-");
        if (seen.has(key)) continue;
        seen.add(key);

        duplicates.push({
          blockA: {
            file: relative(resolvedTarget, a.file),
            startLine: a.startLine,
            endLine: a.endLine,
          },
          blockB: {
            file: relative(resolvedTarget, b.file),
            startLine: b.startLine,
            endLine: b.endLine,
          },
          lineCount: a.endLine - a.startLine + 1,
          similarity: Math.round(sim * 100),
          preview:
            a.content.split("\n").slice(0, 3).join("\n").substring(0, 150) +
            (a.content.length > 150 ? "..." : ""),
        });
      }
    }
  }

  // Sort by similarity descending, then by line count
  duplicates.sort((a, b) => b.similarity - a.similarity || b.lineCount - a.lineCount);

  // Limit results
  const topDuplicates = duplicates.slice(0, 20);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          filesScanned: files.length,
          blocksAnalyzed: allBlocks.length,
          duplicatesFound: duplicates.length,
          topDuplicates,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Extract Candidates: ${files.length} files, ${duplicates.length} duplicate pairs found\n`
    );

    if (topDuplicates.length === 0) {
      console.log("No significant duplicated code blocks detected.");
    } else {
      for (const dup of topDuplicates) {
        console.log(
          `[${dup.similarity}% similar] ${dup.lineCount} lines`
        );
        console.log(
          `  A: ${dup.blockA.file}:${dup.blockA.startLine}-${dup.blockA.endLine}`
        );
        console.log(
          `  B: ${dup.blockB.file}:${dup.blockB.startLine}-${dup.blockB.endLine}`
        );
        console.log(`  preview: ${dup.preview.split("\n")[0]}`);
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
