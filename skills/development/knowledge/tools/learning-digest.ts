const args = Bun.argv.slice(2);

const HELP = `
learning-digest — Generate a summary of recent learnings grouped by topic

Usage:
  bun run tools/learning-digest.ts [options]

Options:
  --days <n>      Number of days to include (default: 7)
  --file <path>   Custom knowledge base file (default: .learnings.md)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Reads the project's .learnings.md and produces a digest of entries
from the last N days, grouped by tag/topic.
`.trim();

if (args.includes("--help")) {
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
  const days = parseInt(getFlag("--days") || "7");
  const kbFile = getFlag("--file") || ".learnings.md";

  const file = Bun.file(kbFile);
  if (!(await file.exists())) {
    console.error(`Error: knowledge base file not found: ${kbFile}`);
    process.exit(1);
  }

  const content = await file.text();
  const entries = parseEntries(content);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const recent = entries.filter((e) => e.date >= cutoffStr);

  // Group by tag
  const byTag = new Map<string, LearningEntry[]>();
  for (const entry of recent) {
    const tags = entry.tags.length > 0 ? entry.tags : ["untagged"];
    for (const tag of tags) {
      const list = byTag.get(tag) || [];
      list.push(entry);
      byTag.set(tag, list);
    }
  }

  const result = {
    period: `${cutoffStr} to ${new Date().toISOString().split("T")[0]}`,
    days,
    totalEntries: entries.length,
    recentEntries: recent.length,
    groups: Object.fromEntries(
      [...byTag.entries()].map(([tag, items]) => [
        tag,
        items.map((e) => ({ date: e.date, text: e.text })),
      ])
    ),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Learning Digest (last ${days} days)`);
    console.log(`Period: ${result.period}`);
    console.log(`Entries: ${recent.length} of ${entries.length} total\n`);

    if (recent.length === 0) {
      console.log("No learnings recorded in this period.");
    } else {
      for (const [tag, items] of byTag) {
        console.log(`## ${tag} (${items.length})`);
        for (const item of items) {
          console.log(`  [${item.date}] ${item.text.split("\n")[0]}`);
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
