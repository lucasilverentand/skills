const args = Bun.argv.slice(2);

const HELP = `
stale-branches — List branches with no commits in the last N days

Usage:
  bun run tools/stale-branches.ts [options]

Options:
  --days <n>  Staleness threshold in days (default: 30)
  --remote    Include remote-tracking branches
  --json      Output as JSON instead of plain text
  --help      Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const includeRemote = args.includes("--remote");

const daysIdx = args.indexOf("--days");
const days = daysIdx !== -1 && args[daysIdx + 1] ? parseInt(args[daysIdx + 1], 10) : 30;

if (isNaN(days) || days <= 0) {
  console.error("Error: --days must be a positive integer");
  process.exit(1);
}

interface StaleBranch {
  name: string;
  lastCommitDate: string;
  daysSinceCommit: number;
  lastCommitMessage: string;
  merged: boolean;
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString();

  // Get merged branches into main
  const mergedRaw = await run(["git", "branch", "--merged", "main", "--format", "%(refname:short)"]);
  const mergedSet = new Set(mergedRaw.split("\n").map((b) => b.trim()).filter(Boolean));

  // Get branches
  const branchFlag = includeRemote ? "-a" : "";
  const branchArgs = ["git", "branch", "--format", "%(refname:short)|%(committerdate:iso-strict)|%(subject)"];
  if (includeRemote) branchArgs.splice(1, 0, "-a");

  const raw = await run(branchArgs);
  if (!raw) {
    if (jsonOutput) {
      console.log(JSON.stringify([]));
    } else {
      console.log("No branches found.");
    }
    process.exit(0);
  }

  const now = Date.now();
  const stale: StaleBranch[] = [];

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const [name, dateStr, ...msgParts] = line.split("|");
    if (!name || !dateStr) continue;

    // Skip main, master, HEAD
    const trimmedName = name.trim();
    if (["main", "master", "HEAD"].includes(trimmedName)) continue;
    if (trimmedName.startsWith("origin/HEAD")) continue;

    const commitDate = new Date(dateStr.trim());
    const daysSince = Math.floor((now - commitDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince >= days) {
      stale.push({
        name: trimmedName,
        lastCommitDate: commitDate.toISOString().split("T")[0],
        daysSinceCommit: daysSince,
        lastCommitMessage: msgParts.join("|").trim(),
        merged: mergedSet.has(trimmedName),
      });
    }
  }

  stale.sort((a, b) => b.daysSinceCommit - a.daysSinceCommit);

  if (jsonOutput) {
    console.log(JSON.stringify(stale, null, 2));
  } else {
    if (stale.length === 0) {
      console.log(`No branches older than ${days} days.`);
    } else {
      console.log(`Stale branches (no commits in ${days}+ days):\n`);
      for (const b of stale) {
        const tag = b.merged ? " [merged]" : "";
        console.log(`  ${b.name}${tag}`);
        console.log(`    Last commit: ${b.lastCommitDate} (${b.daysSinceCommit} days ago)`);
        console.log(`    Message: ${b.lastCommitMessage}`);
        console.log();
      }
      console.log(`Total: ${stale.length} stale branch(es)`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
