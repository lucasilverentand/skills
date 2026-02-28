const args = Bun.argv.slice(2);

const HELP = `
worktree-prune — Detect and remove worktrees whose branches have been merged or deleted

Usage:
  bun run tools/worktree-prune.ts [options]

Options:
  --dry-run   Only show what would be removed (default behavior)
  --remove    Actually remove stale worktrees
  --json      Output as JSON instead of plain text
  --help      Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const doRemove = args.includes("--remove");

interface PruneCandidate {
  path: string;
  branch: string;
  reason: string;
  removed: boolean;
}

async function run(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

async function main() {
  const { stdout: listRaw } = await run(["git", "worktree", "list", "--porcelain"]);
  if (!listRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify({ candidates: [], message: "No worktrees found" }));
    } else {
      console.log("No worktrees found.");
    }
    process.exit(0);
  }

  // Get merged branches
  const { stdout: mergedRaw } = await run(["git", "branch", "--merged", "main", "--format", "%(refname:short)"]);
  const mergedSet = new Set(mergedRaw.split("\n").map((b) => b.trim()).filter(Boolean));

  // Parse worktrees
  const blocks = listRaw.split("\n\n").filter(Boolean);
  const candidates: PruneCandidate[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    let path = "";
    let branch = "";
    let isBare = false;

    for (const line of lines) {
      if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
      else if (line.startsWith("branch ")) branch = line.slice("branch ".length).replace("refs/heads/", "");
      else if (line === "bare") isBare = true;
    }

    if (!path || isBare) continue;

    // Check if directory exists
    const dirCheck = Bun.spawn(["test", "-d", path], { stdout: "pipe", stderr: "pipe" });
    const dirExists = (await dirCheck.exited) === 0;

    let reason = "";
    if (!dirExists) {
      reason = "Directory no longer exists";
    } else if (branch && mergedSet.has(branch) && branch !== "main" && branch !== "master") {
      reason = "Branch has been merged into main";
    }

    if (!reason) continue;

    let removed = false;
    if (doRemove) {
      const forceFlag = !dirExists ? "--force" : "";
      const removeArgs = ["git", "worktree", "remove", path];
      if (!dirExists) removeArgs.push("--force");
      const result = await run(removeArgs);
      removed = result.exitCode === 0;
    }

    candidates.push({ path, branch: branch || "(detached)", reason, removed });
  }

  // Also run git worktree prune for stale admin entries
  if (doRemove) {
    await run(["git", "worktree", "prune"]);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ dryRun: !doRemove, candidates }, null, 2));
  } else {
    if (candidates.length === 0) {
      console.log("No stale worktrees found.");
    } else {
      const label = doRemove ? "Pruned worktrees" : "Stale worktrees (dry run)";
      console.log(`${label}:\n`);
      for (const c of candidates) {
        const status = doRemove ? (c.removed ? "REMOVED" : "FAILED") : "STALE";
        console.log(`  [${status}] ${c.path}`);
        console.log(`    Branch: ${c.branch}`);
        console.log(`    Reason: ${c.reason}`);
        console.log();
      }

      if (!doRemove) {
        console.log("Run with --remove to actually remove these worktrees.");
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
