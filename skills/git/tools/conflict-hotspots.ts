const args = Bun.argv.slice(2);

const HELP = `
conflict-hotspots — Report files with the most merge conflicts in recent history

Usage:
  bun run tools/conflict-hotspots.ts [options]

Options:
  --limit <n>   Max results to show (default: 20)
  --since <date> Only look at merges since this date (default: 6 months ago)
  --json        Output as JSON instead of plain text
  --help        Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

const limitIdx = args.indexOf("--limit");
const limit = limitIdx !== -1 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : 20;

const sinceIdx = args.indexOf("--since");
const since = sinceIdx !== -1 && args[sinceIdx + 1] ? args[sinceIdx + 1] : "6 months ago";

interface Hotspot {
  path: string;
  conflictMerges: number;
  totalMerges: number;
  lastConflict: string;
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  // Find all merge commits in the given time range
  const mergesRaw = await run([
    "git", "log", "--merges", "--oneline", `--since=${since}`, "--format=%H|%ai|%s",
  ]);

  if (!mergesRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify({ hotspots: [], message: "No merge commits found" }));
    } else {
      console.log(`No merge commits found since "${since}".`);
    }
    process.exit(0);
  }

  const mergeCommits = mergesRaw.split("\n").filter(Boolean);
  const fileCounts: Record<string, { conflicts: number; total: number; lastDate: string }> = {};

  // For each merge commit, check which files were involved
  // We look at merges that touched files on both parents (potential conflict indicators)
  for (const line of mergeCommits) {
    const [hash, date] = line.split("|");
    if (!hash) continue;

    // Get files changed in this merge commit
    const filesRaw = await run(["git", "diff-tree", "--no-commit-id", "-r", "--name-only", hash.trim()]);
    if (!filesRaw) continue;

    const files = filesRaw.split("\n").filter(Boolean);

    // Check if the merge had conflicts by looking at the merge message
    const subject = line.split("|").slice(2).join("|");
    const hadConflict = subject.toLowerCase().includes("conflict") || subject.toLowerCase().includes("resolve");

    // Check the parents to see overlapping changes
    const parentsRaw = await run(["git", "rev-parse", `${hash.trim()}^1`, `${hash.trim()}^2`]);
    const parents = parentsRaw.split("\n").filter(Boolean);

    if (parents.length === 2) {
      const mergeBase = await run(["git", "merge-base", parents[0], parents[1]]);
      if (mergeBase) {
        const p1Files = await run(["git", "diff", "--name-only", `${mergeBase}..${parents[0]}`]);
        const p2Files = await run(["git", "diff", "--name-only", `${mergeBase}..${parents[1]}`]);

        const p1Set = new Set(p1Files ? p1Files.split("\n").filter(Boolean) : []);
        const p2Set = new Set(p2Files ? p2Files.split("\n").filter(Boolean) : []);

        // Files changed on both parents
        const overlapping = [...p1Set].filter((f) => p2Set.has(f));

        for (const f of overlapping) {
          if (!fileCounts[f]) fileCounts[f] = { conflicts: 0, total: 0, lastDate: "" };
          fileCounts[f].total++;
          fileCounts[f].conflicts++;
          if (!fileCounts[f].lastDate || date > fileCounts[f].lastDate) {
            fileCounts[f].lastDate = date.split(" ")[0];
          }
        }
      }
    }
  }

  const hotspots: Hotspot[] = Object.entries(fileCounts)
    .map(([path, data]) => ({
      path,
      conflictMerges: data.conflicts,
      totalMerges: data.total,
      lastConflict: data.lastDate,
    }))
    .sort((a, b) => b.conflictMerges - a.conflictMerges)
    .slice(0, limit);

  if (jsonOutput) {
    console.log(JSON.stringify({ since, totalMerges: mergeCommits.length, hotspots }, null, 2));
  } else {
    if (hotspots.length === 0) {
      console.log(`No conflict-prone files found in ${mergeCommits.length} merges since "${since}".`);
    } else {
      console.log(`Conflict hotspots (${mergeCommits.length} merges since "${since}"):\n`);
      for (const h of hotspots) {
        console.log(`  ${h.path}`);
        console.log(`    Overlapping merges: ${h.conflictMerges} | Last: ${h.lastConflict}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
