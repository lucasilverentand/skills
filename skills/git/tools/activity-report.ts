const args = Bun.argv.slice(2);

const HELP = `
activity-report — Summarize commit activity by author and directory for a given period

Usage:
  bun run tools/activity-report.ts [options]

Options:
  --since <date>   Start date (default: "2 weeks ago")
  --until <date>   End date (default: now)
  --author <name>  Filter by author name
  --json           Output as JSON instead of plain text
  --help           Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getArg(flag: string, defaultVal: string): string {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const since = getArg("--since", "2 weeks ago");
const until = getArg("--until", "now");
const authorFilter = getArg("--author", "");

interface AuthorStats {
  author: string;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  topDirectories: { dir: string; changes: number }[];
}

interface ActivityReport {
  since: string;
  until: string;
  totalCommits: number;
  authors: AuthorStats[];
  topDirectories: { dir: string; commits: number }[];
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  // Get commits with stats
  const logArgs = [
    "git", "log", `--since=${since}`, `--until=${until}`,
    "--format=%H|%an|%ai|%s", "--numstat",
  ];
  if (authorFilter) logArgs.push(`--author=${authorFilter}`);

  const logRaw = await run(logArgs);
  if (!logRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify({ since, until, totalCommits: 0, authors: [], topDirectories: [] }));
    } else {
      console.log(`No commits found between "${since}" and "${until}".`);
    }
    process.exit(0);
  }

  const authorData: Record<string, { commits: number; added: number; removed: number; dirs: Record<string, number> }> = {};
  const dirCommits: Record<string, number> = {};

  let currentAuthor = "";
  let currentHash = "";

  for (const line of logRaw.split("\n")) {
    if (line.includes("|") && line.split("|").length >= 4) {
      const [hash, author] = line.split("|");
      currentHash = hash.trim();
      currentAuthor = author.trim();

      if (!authorData[currentAuthor]) {
        authorData[currentAuthor] = { commits: 0, added: 0, removed: 0, dirs: {} };
      }
      authorData[currentAuthor].commits++;
    } else if (currentAuthor && line.trim() && /^\d+\t\d+\t/.test(line)) {
      const [added, removed, path] = line.split("\t");
      const a = parseInt(added, 10) || 0;
      const r = parseInt(removed, 10) || 0;

      authorData[currentAuthor].added += a;
      authorData[currentAuthor].removed += r;

      const dir = path.includes("/") ? path.split("/")[0] : ".";
      authorData[currentAuthor].dirs[dir] = (authorData[currentAuthor].dirs[dir] || 0) + a + r;
      dirCommits[dir] = (dirCommits[dir] || 0) + 1;
    }
  }

  const totalCommits = Object.values(authorData).reduce((a, b) => a + b.commits, 0);

  const authors: AuthorStats[] = Object.entries(authorData)
    .map(([author, data]) => ({
      author,
      commits: data.commits,
      linesAdded: data.added,
      linesRemoved: data.removed,
      topDirectories: Object.entries(data.dirs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([dir, changes]) => ({ dir, changes })),
    }))
    .sort((a, b) => b.commits - a.commits);

  const topDirectories = Object.entries(dirCommits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([dir, commits]) => ({ dir, commits }));

  const report: ActivityReport = { since, until, totalCommits, authors, topDirectories };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Activity report: ${since} → ${until}\n`);
    console.log(`Total commits: ${totalCommits}\n`);

    console.log("By author:");
    for (const a of authors) {
      console.log(`\n  ${a.author} — ${a.commits} commit(s), +${a.linesAdded} -${a.linesRemoved}`);
      if (a.topDirectories.length > 0) {
        console.log("    Top areas:");
        for (const d of a.topDirectories) {
          console.log(`      ${d.dir}: ${d.changes} lines changed`);
        }
      }
    }

    if (topDirectories.length > 0) {
      console.log("\nMost active directories:");
      for (const d of topDirectories) {
        console.log(`  ${d.dir}: ${d.commits} file change(s)`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
