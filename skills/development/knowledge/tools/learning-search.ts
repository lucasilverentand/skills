const args = Bun.argv.slice(2);

const HELP = `
learning-search — Full-text search across recorded learnings by keyword or tag

Usage:
  bun run tools/learning-search.ts <query> [options]

Options:
  --file <path>   Custom knowledge base file (default: .learnings.md)
  --tag <tag>     Filter results to a specific tag
  --json          Output as JSON instead of plain text
  --help          Show this help message

Searches the project's .learnings.md file for entries matching the query string.
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

interface LearningEntry {
  date: string;
  tags: string[];
  text: string;
  lineNumber: number;
}

function parseEntries(content: string): LearningEntry[] {
  const lines = content.split("\n");
  const entries: LearningEntry[] = [];
  let current: LearningEntry | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^## (\d{4}-\d{2}-\d{2})(?:\s*\[([^\]]+)\])?/);

    if (headerMatch) {
      if (current) entries.push(current);
      current = {
        date: headerMatch[1],
        tags: headerMatch[2]
          ? headerMatch[2].split(",").map((t) => t.trim())
          : [],
        text: "",
        lineNumber: i + 1,
      };
    } else if (current && line.trim()) {
      current.text += (current.text ? "\n" : "") + line.trim();
    }
  }
  if (current) entries.push(current);
  return entries;
}

async function main() {
  const kbFile = getFlag("--file") || ".learnings.md";
  const tagFilter = getFlag("--tag");

  const queryParts = args.filter(
    (a, i) =>
      !a.startsWith("--") &&
      !(args[i - 1] === "--file") &&
      !(args[i - 1] === "--tag")
  );
  const query = queryParts.join(" ").toLowerCase().trim();

  if (!query) {
    console.error("Error: missing search query");
    process.exit(1);
  }

  const file = Bun.file(kbFile);
  if (!(await file.exists())) {
    console.error(`Error: knowledge base file not found: ${kbFile}`);
    process.exit(1);
  }

  const content = await file.text();
  const entries = parseEntries(content);

  const queryTerms = query.split(/\s+/);
  let matches = entries.filter((entry) => {
    const searchText = `${entry.text} ${entry.tags.join(" ")}`.toLowerCase();
    return queryTerms.every((term) => searchText.includes(term));
  });

  if (tagFilter) {
    const tag = tagFilter.toLowerCase();
    matches = matches.filter((e) =>
      e.tags.some((t) => t.toLowerCase().includes(tag))
    );
  }

  // Sort by date descending (most recent first)
  matches.sort((a, b) => b.date.localeCompare(a.date));

  const result = {
    query,
    tagFilter,
    totalEntries: entries.length,
    matches: matches.length,
    results: matches,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Search: "${query}"${tagFilter ? ` (tag: ${tagFilter})` : ""}`);
    console.log(`Found ${matches.length} of ${entries.length} entries\n`);

    if (matches.length === 0) {
      console.log("No matching learnings found.");
    } else {
      for (const entry of matches) {
        const tagStr =
          entry.tags.length > 0 ? ` [${entry.tags.join(", ")}]` : "";
        console.log(`${entry.date}${tagStr}`);
        console.log(`  ${entry.text.split("\n")[0]}`);
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
