const args = Bun.argv.slice(2);

const HELP = `
ownership-map — Generate a file/directory ownership map based on git blame data

Usage:
  bun run tools/ownership-map.ts <path> [options]

Arguments:
  <path>  File or directory to analyze

Options:
  --depth <n>  Directory depth to summarize (default: 2)
  --json       Output as JSON instead of plain text
  --help       Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const depthIdx = args.indexOf("--depth");
const depth = depthIdx !== -1 && args[depthIdx + 1] ? parseInt(args[depthIdx + 1], 10) : 2;
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(depthIdx !== -1 && args[depthIdx + 1] === a));

interface OwnershipEntry {
  path: string;
  owners: { author: string; lines: number; percentage: number }[];
  totalLines: number;
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function getBlameOwnership(filePath: string): Promise<Record<string, number>> {
  const blameRaw = await run(["git", "blame", "--line-porcelain", filePath]);
  if (!blameRaw) return {};

  const counts: Record<string, number> = {};
  const authorPattern = /^author (.+)$/;

  for (const line of blameRaw.split("\n")) {
    const match = line.match(authorPattern);
    if (match) {
      const author = match[1].trim();
      counts[author] = (counts[author] || 0) + 1;
    }
  }

  return counts;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required <path> argument");
    process.exit(1);
  }

  // Check if target is a file or directory
  const { exitCode } = await (async () => {
    const proc = Bun.spawn(["test", "-d", target], { stdout: "pipe", stderr: "pipe" });
    return { exitCode: await proc.exited };
  })();

  const isDir = exitCode === 0;
  const entries: OwnershipEntry[] = [];

  if (!isDir) {
    // Single file
    const counts = await getBlameOwnership(target);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const owners = Object.entries(counts)
      .map(([author, lines]) => ({ author, lines, percentage: Math.round((lines / total) * 100) }))
      .sort((a, b) => b.lines - a.lines);

    entries.push({ path: target, owners, totalLines: total });
  } else {
    // Directory — list tracked files, group by directory
    const filesRaw = await run(["git", "ls-files", target]);
    if (!filesRaw) {
      console.error(`Error: no tracked files in ${target}`);
      process.exit(1);
    }

    const files = filesRaw.split("\n").filter(Boolean);
    const dirOwnership: Record<string, Record<string, number>> = {};

    // Sample up to 100 files to keep runtime reasonable
    const sample = files.length > 100
      ? files.filter((_, i) => i % Math.ceil(files.length / 100) === 0)
      : files;

    for (const file of sample) {
      const counts = await getBlameOwnership(file);
      // Group by directory at the given depth
      const parts = file.split("/");
      const dirKey = parts.slice(0, Math.min(depth, parts.length - 1)).join("/") || ".";

      if (!dirOwnership[dirKey]) dirOwnership[dirKey] = {};
      for (const [author, lines] of Object.entries(counts)) {
        dirOwnership[dirKey][author] = (dirOwnership[dirKey][author] || 0) + lines;
      }
    }

    for (const [dir, counts] of Object.entries(dirOwnership)) {
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const owners = Object.entries(counts)
        .map(([author, lines]) => ({ author, lines, percentage: Math.round((lines / total) * 100) }))
        .sort((a, b) => b.lines - a.lines);

      entries.push({ path: dir, owners, totalLines: total });
    }

    entries.sort((a, b) => b.totalLines - a.totalLines);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(entries, null, 2));
  } else {
    for (const entry of entries) {
      console.log(`${entry.path} (${entry.totalLines} lines):`);
      for (const o of entry.owners.slice(0, 5)) {
        const bar = "█".repeat(Math.max(1, Math.round(o.percentage / 5)));
        console.log(`  ${bar} ${o.author} — ${o.percentage}% (${o.lines} lines)`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
