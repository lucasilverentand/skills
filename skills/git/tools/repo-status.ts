const args = Bun.argv.slice(2);

const HELP = `
repo-status — Assess the full state of a git repository for cleanup

Usage:
  bun run tools/repo-status.ts [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  const [
    branch,
    statusRaw,
    stashRaw,
    worktreeRaw,
    unpushedRaw,
    mergedBranchesRaw,
    goneBranchesRaw,
    hasUpstream,
  ] = await Promise.all([
    run(["git", "branch", "--show-current"]),
    run(["git", "status", "--porcelain"]),
    run(["git", "stash", "list"]),
    run(["git", "worktree", "list", "--porcelain"]),
    run(["git", "log", "--oneline", "@{upstream}..HEAD"]).catch(() => ""),
    run(["git", "branch", "--merged", "main"]).catch(() => ""),
    run(["git", "branch", "-vv"]).catch(() => ""),
    run(["git", "rev-parse", "--abbrev-ref", "@{upstream}"]).catch(() => ""),
  ]);

  // Parse status
  const statusLines = statusRaw ? statusRaw.split("\n").filter(Boolean) : [];
  const staged = statusLines.filter((l) => l[0] !== " " && l[0] !== "?").length;
  const unstaged = statusLines.filter((l) => l[1] === "M" || l[1] === "D").length;
  const untracked = statusLines.filter((l) => l.startsWith("??")).length;

  // Parse worktrees (count directories beyond the first)
  const worktreePaths = worktreeRaw
    .split("\n")
    .filter((l) => l.startsWith("worktree "))
    .map((l) => l.replace("worktree ", ""));
  const extraWorktrees = worktreePaths.slice(1); // first is the main worktree

  // Parse unpushed
  const unpushedCommits = unpushedRaw ? unpushedRaw.split("\n").filter(Boolean) : [];

  // Parse merged branches (exclude current and main)
  const mergedBranches = mergedBranchesRaw
    ? mergedBranchesRaw
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b && !b.startsWith("*") && b !== "main" && b !== "master")
    : [];

  // Parse branches with gone remotes
  const goneBranches = goneBranchesRaw
    ? goneBranchesRaw
        .split("\n")
        .filter((l) => l.includes(": gone]"))
        .map((l) => l.trim().split(/\s+/)[0])
    : [];

  // Parse stashes
  const stashes = stashRaw ? stashRaw.split("\n").filter(Boolean) : [];

  const result = {
    branch,
    hasUpstream: !!hasUpstream,
    upstream: hasUpstream || null,
    uncommitted: {
      staged,
      unstaged,
      untracked,
      total: staged + unstaged + untracked,
      files: statusLines.map((l) => ({
        status: l.substring(0, 2),
        path: l.substring(3),
      })),
    },
    unpushedCommits: {
      count: unpushedCommits.length,
      commits: unpushedCommits,
    },
    worktrees: {
      total: worktreePaths.length,
      extra: extraWorktrees.length,
      paths: extraWorktrees,
    },
    staleBranches: {
      merged: mergedBranches,
      gone: goneBranches,
      total: new Set([...mergedBranches, ...goneBranches]).size,
    },
    stashes: {
      count: stashes.length,
      entries: stashes.slice(0, 10),
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Branch: ${branch}${hasUpstream ? ` → ${hasUpstream}` : " (no upstream)"}`);
    console.log(`Uncommitted: ${result.uncommitted.total} files (${staged} staged, ${unstaged} unstaged, ${untracked} untracked)`);
    console.log(`Unpushed: ${unpushedCommits.length} commit(s)`);
    console.log(`Worktrees: ${extraWorktrees.length} extra`);
    console.log(`Stale branches: ${result.staleBranches.total} (${mergedBranches.length} merged, ${goneBranches.length} gone)`);
    console.log(`Stashes: ${stashes.length}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
