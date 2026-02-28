const args = Bun.argv.slice(2);

const HELP = `
learning-link — Find and attach related learnings to a given file or module

Usage:
  bun run tools/learning-link.ts <file-path> [options]

Options:
  --file <path>   Custom knowledge base file (default: .learnings.md)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Searches the learnings knowledge base for entries that reference or relate to
the given file path, module name, or technologies used in the file.
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

import { basename, extname } from "node:path";

interface LearningEntry {
  date: string;
  tags: string[];
  text: string;
}

function parseEntries(content: string): LearningEntry[] {
  const lines = content.split("\n");
  const entries: LearningEntry[] = [];
  let current: LearningEntry | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^## (\d{4}-\d{2}-\d{2})(?:\s*\[([^\]]+)\])?/);
    if (headerMatch) {
      if (current) entries.push(current);
      current = {
        date: headerMatch[1],
        tags: headerMatch[2]
          ? headerMatch[2].split(",").map((t) => t.trim())
          : [],
        text: "",
      };
    } else if (current && line.trim()) {
      current.text += (current.text ? "\n" : "") + line.trim();
    }
  }
  if (current) entries.push(current);
  return entries;
}

async function main() {
  const targetPath = args.filter(
    (a, i) => !a.startsWith("--") && !(args[i - 1] === "--file")
  )[0];

  if (!targetPath) {
    console.error("Error: missing file path");
    process.exit(1);
  }

  const kbFile = getFlag("--file") || ".learnings.md";

  const file = Bun.file(kbFile);
  if (!(await file.exists())) {
    if (jsonOutput) {
      console.log(JSON.stringify({ targetPath, matches: [], message: "No knowledge base found" }, null, 2));
    } else {
      console.log(`No knowledge base found at ${kbFile}`);
    }
    return;
  }

  const content = await file.text();
  const entries = parseEntries(content);

  // Build search terms from the file path and its contents
  const fileName = basename(targetPath, extname(targetPath));
  const pathParts = targetPath.split("/").filter((p) => p && p !== "." && p !== "..");

  // Try to read the file to extract import names and keywords
  const searchTerms = new Set<string>();
  searchTerms.add(fileName.toLowerCase());
  for (const part of pathParts) {
    if (part.length > 2) searchTerms.add(part.toLowerCase());
  }

  try {
    const targetContent = await Bun.file(targetPath).text();
    // Extract imported module names
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(targetContent)) !== null) {
      const mod = match[1].split("/").pop()?.replace(/\.(ts|js|tsx|jsx)$/, "");
      if (mod && mod.length > 2) searchTerms.add(mod.toLowerCase());
    }
  } catch {
    // file may not exist yet, just use path-based terms
  }

  // Score entries by relevance
  const scored = entries.map((entry) => {
    const searchText = `${entry.text} ${entry.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
      if (searchText.includes(term)) score++;
    }
    return { entry, score };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const result = {
    targetPath,
    searchTerms: [...searchTerms],
    matches: matches.map((m) => ({
      date: m.entry.date,
      tags: m.entry.tags,
      text: m.entry.text,
      relevance: m.score,
    })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Learnings related to: ${targetPath}`);
    console.log(`Search terms: ${[...searchTerms].join(", ")}\n`);

    if (matches.length === 0) {
      console.log("No related learnings found.");
    } else {
      for (const m of matches) {
        const tagStr =
          m.entry.tags.length > 0 ? ` [${m.entry.tags.join(", ")}]` : "";
        console.log(`${m.entry.date}${tagStr} (relevance: ${m.score})`);
        console.log(`  ${m.entry.text.split("\n")[0]}`);
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
