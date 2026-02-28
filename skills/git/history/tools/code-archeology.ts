const args = Bun.argv.slice(2);

const HELP = `
code-archeology — Trace the full history of a specific function or code pattern

Usage:
  bun run tools/code-archeology.ts <file> <pattern> [options]

Arguments:
  <file>     File path to trace
  <pattern>  String or function name to search for

Options:
  --limit <n>  Max commits to show (default: 20)
  --json       Output as JSON instead of plain text
  --help       Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx !== -1 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : 20;
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(limitIdx !== -1 && args[limitIdx + 1] === a));

interface HistoryEntry {
  hash: string;
  date: string;
  author: string;
  subject: string;
  linesAdded: number;
  linesRemoved: number;
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  const file = filteredArgs[0];
  const pattern = filteredArgs[1];
  if (!file || !pattern) {
    console.error("Error: both <file> and <pattern> are required");
    process.exit(1);
  }

  // Use git log -S to find commits that added/removed the pattern, with --follow for renames
  const logRaw = await run([
    "git", "log", `-S`, pattern, "--follow", `--format=%H|%ai|%an|%s`,
    "--numstat", `-${limit}`, "--", file,
  ]);

  if (!logRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify({ file, pattern, history: [] }));
    } else {
      console.log(`No history found for pattern "${pattern}" in ${file}.`);
    }
    process.exit(0);
  }

  const lines = logRaw.split("\n");
  const entries: HistoryEntry[] = [];
  let current: HistoryEntry | null = null;

  for (const line of lines) {
    if (line.includes("|") && line.split("|").length >= 4) {
      if (current) entries.push(current);
      const [hash, date, author, ...subjectParts] = line.split("|");
      current = {
        hash: hash.trim(),
        date: date.trim().split(" ")[0],
        author: author.trim(),
        subject: subjectParts.join("|").trim(),
        linesAdded: 0,
        linesRemoved: 0,
      };
    } else if (current && line.trim() && /^\d+\t\d+\t/.test(line)) {
      const [added, removed] = line.split("\t");
      current.linesAdded += parseInt(added, 10) || 0;
      current.linesRemoved += parseInt(removed, 10) || 0;
    }
  }
  if (current) entries.push(current);

  // Also try git log -G for regex-based search as a supplement
  const logGRaw = await run([
    "git", "log", `-G`, pattern, "--follow", `--format=%H|%ai|%an|%s`,
    `-${limit}`, "--", file,
  ]);

  const seenHashes = new Set(entries.map((e) => e.hash));
  if (logGRaw) {
    for (const line of logGRaw.split("\n")) {
      if (!line.includes("|")) continue;
      const [hash, date, author, ...subjectParts] = line.split("|");
      if (seenHashes.has(hash.trim())) continue;
      entries.push({
        hash: hash.trim(),
        date: date.trim().split(" ")[0],
        author: author.trim(),
        subject: subjectParts.join("|").trim(),
        linesAdded: 0,
        linesRemoved: 0,
      });
    }
  }

  // Sort by date descending
  entries.sort((a, b) => b.date.localeCompare(a.date));

  const result = { file, pattern, history: entries.slice(0, limit) };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`History of "${pattern}" in ${file}:\n`);
    for (const e of result.history) {
      console.log(`  ${e.hash.slice(0, 8)} ${e.date} ${e.author}`);
      console.log(`    ${e.subject}`);
      if (e.linesAdded || e.linesRemoved) {
        console.log(`    +${e.linesAdded} -${e.linesRemoved}`);
      }
      console.log();
    }
    console.log(`Total: ${result.history.length} commit(s)`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
