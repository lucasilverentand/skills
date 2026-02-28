const args = Bun.argv.slice(2);

const HELP = `
worktree-status — List all worktrees with their branch, path, and staleness info

Usage:
  bun run tools/worktree-status.ts [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

interface WorktreeInfo {
  path: string;
  branch: string;
  head: string;
  isBare: boolean;
  isDetached: boolean;
  lastCommitDate: string;
  daysSinceCommit: number;
  directoryExists: boolean;
  branchMerged: boolean;
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  const listRaw = await run(["git", "worktree", "list", "--porcelain"]);
  if (!listRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify([]));
    } else {
      console.log("No worktrees found.");
    }
    process.exit(0);
  }

  // Parse porcelain output
  const blocks = listRaw.split("\n\n").filter(Boolean);
  const worktrees: WorktreeInfo[] = [];
  const now = Date.now();

  // Get merged branches
  const mergedRaw = await run(["git", "branch", "--merged", "main", "--format", "%(refname:short)"]);
  const mergedSet = new Set(mergedRaw.split("\n").map((b) => b.trim()).filter(Boolean));

  for (const block of blocks) {
    const lines = block.split("\n");
    let path = "";
    let head = "";
    let branch = "";
    let isBare = false;
    let isDetached = false;

    for (const line of lines) {
      if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
      else if (line.startsWith("HEAD ")) head = line.slice("HEAD ".length);
      else if (line.startsWith("branch ")) branch = line.slice("branch ".length).replace("refs/heads/", "");
      else if (line === "bare") isBare = true;
      else if (line === "detached") isDetached = true;
    }

    if (!path) continue;

    // Check if directory still exists
    const dirCheck = Bun.spawn(["test", "-d", path], { stdout: "pipe", stderr: "pipe" });
    const directoryExists = (await dirCheck.exited) === 0;

    // Get last commit date
    let lastCommitDate = "";
    let daysSince = 0;
    if (head) {
      const dateRaw = await run(["git", "log", "-1", "--format=%ai", head]);
      if (dateRaw) {
        lastCommitDate = dateRaw.split(" ")[0];
        const commitTime = new Date(dateRaw).getTime();
        daysSince = Math.floor((now - commitTime) / (1000 * 60 * 60 * 24));
      }
    }

    worktrees.push({
      path,
      branch: branch || (isDetached ? `(detached at ${head.slice(0, 8)})` : "(bare)"),
      head: head.slice(0, 8),
      isBare,
      isDetached,
      lastCommitDate,
      daysSinceCommit: daysSince,
      directoryExists,
      branchMerged: branch ? mergedSet.has(branch) : false,
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify(worktrees, null, 2));
  } else {
    if (worktrees.length === 0) {
      console.log("No worktrees found.");
      process.exit(0);
    }

    console.log(`Worktrees (${worktrees.length}):\n`);
    for (const wt of worktrees) {
      const flags: string[] = [];
      if (wt.isBare) flags.push("bare");
      if (wt.isDetached) flags.push("detached");
      if (!wt.directoryExists) flags.push("MISSING");
      if (wt.branchMerged && !wt.isBare) flags.push("merged");
      if (wt.daysSinceCommit > 30) flags.push("stale");

      const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
      console.log(`  ${wt.branch} → ${wt.path}${flagStr}`);
      console.log(`    HEAD: ${wt.head} | Last commit: ${wt.lastCommitDate || "unknown"} (${wt.daysSinceCommit}d ago)`);
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
