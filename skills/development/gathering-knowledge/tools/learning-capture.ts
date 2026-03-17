const args = Bun.argv.slice(2);

const HELP = `
learning-capture — Append a timestamped learning entry to the project knowledge base

Usage:
  bun run tools/learning-capture.ts <text> [--tags tag1,tag2] [options]

Options:
  --tags <tags>   Comma-separated tags for categorization
  --file <path>   Custom knowledge base file (default: .learnings.md)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Appends a structured learning entry with timestamp, text, and tags to the
project's .learnings.md file.
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

async function main() {
  const tags = getFlag("--tags")?.split(",").map((t) => t.trim()) || [];
  const kbFile = getFlag("--file") || ".learnings.md";

  // Collect text from args, skipping flags and their values
  const skipNext = new Set<number>();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tags" || args[i] === "--file") {
      skipNext.add(i);
      skipNext.add(i + 1);
    }
  }
  const textParts = args.filter(
    (a, i) => !a.startsWith("--") && !skipNext.has(i)
  );
  const text = textParts.join(" ").trim();

  if (!text) {
    console.error("Error: missing learning text");
    process.exit(1);
  }

  const now = new Date();
  const timestamp = now.toISOString().split("T")[0];
  const tagStr = tags.length > 0 ? ` [${tags.join(", ")}]` : "";

  const entry = `\n## ${timestamp}${tagStr}\n\n${text}\n`;

  const file = Bun.file(kbFile);
  let existing = "";
  if (await file.exists()) {
    existing = await file.text();
  } else {
    existing = "# Learnings\n\nProject knowledge base — discoveries, workarounds, and insights.\n";
  }

  await Bun.write(kbFile, existing + entry);

  const result = {
    file: kbFile,
    timestamp,
    tags,
    text,
    totalEntries: (existing + entry).match(/^## \d{4}-/gm)?.length || 1,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Learning captured in ${kbFile}`);
    console.log(`  Date: ${timestamp}`);
    if (tags.length > 0) console.log(`  Tags: ${tags.join(", ")}`);
    console.log(`  Text: ${text}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
