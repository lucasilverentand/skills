const args = Bun.argv.slice(2);

const HELP = `
backport — Cherry-pick commit(s) to a release or maintenance branch

Usage:
  bun run tools/backport.ts <target-branch> <commit...> [options]

Checks out the target branch using a worktree, cherry-picks the specified
commits, and optionally pushes the result.

Options:
  --no-push  Skip pushing the target branch after picking
  --json     Output as JSON instead of plain text
  --help     Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const noPush = args.includes("--no-push");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface BackportResult {
  commit: string;
  subject: string;
  status: "success" | "conflict" | "error";
  message: string;
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
  const targetBranch = filteredArgs[0];
  const commitHashes = filteredArgs.slice(1);

  if (!targetBranch) {
    console.error("Error: <target-branch> is required");
    process.exit(1);
  }
  if (commitHashes.length === 0) {
    console.error("Error: at least one <commit> hash is required");
    process.exit(1);
  }

  // Verify all commit hashes and target branch exist
  for (const hash of commitHashes) {
    const { exitCode } = await run(["git", "rev-parse", "--verify", hash]);
    if (exitCode !== 0) {
      console.error(`Error: commit "${hash}" does not exist`);
      process.exit(1);
    }
  }
  const { exitCode: branchExists } = await run(["git", "rev-parse", "--verify", targetBranch]);
  if (branchExists !== 0) {
    console.error(`Error: target branch "${targetBranch}" does not exist`);
    process.exit(1);
  }

  const { stdout: originalBranch } = await run(["git", "branch", "--show-current"]);

  // Use a worktree for the backport to avoid disturbing the working tree
  const worktreePath = `/tmp/backport-${targetBranch.replace(/\//g, "-")}-${Date.now()}`;
  const { exitCode: wtExit } = await run(["git", "worktree", "add", worktreePath, targetBranch]);

  if (wtExit !== 0) {
    const { stdout: dirtyCheck } = await run(["git", "status", "--porcelain"]);
    if (dirtyCheck) {
      console.error("Error: working tree is not clean — commit or stash changes first");
      process.exit(1);
    }
    const { exitCode: coExit, stderr: coErr } = await run(["git", "checkout", targetBranch]);
    if (coExit !== 0) {
      console.error(`Error: failed to checkout ${targetBranch}: ${coErr}`);
      process.exit(1);
    }
  }

  const useWorktree = wtExit === 0;
  const gitArgs = useWorktree ? ["-C", worktreePath] : [];

  if (!jsonOutput) {
    console.log(`Backporting ${commitHashes.length} commit(s) to ${targetBranch}:\n`);
  }

  const results: BackportResult[] = [];
  let stopped = false;

  for (const hash of commitHashes) {
    const { stdout: subject } = await run(["git", "log", "-1", "--format=%s", hash]);
    const { exitCode: pickExit, stderr: pickErr } = await run(["git", ...gitArgs, "cherry-pick", hash]);

    if (pickExit === 0) {
      results.push({ commit: hash, subject, status: "success", message: "Applied successfully" });
      if (!jsonOutput) console.log(`  [OK] ${hash.slice(0, 8)} ${subject}`);
    } else {
      const { stdout: statusOut } = await run(["git", ...gitArgs, "status", "--porcelain"]);
      const hasConflicts = statusOut.split("\n").some(
        (l) => l.startsWith("UU") || l.startsWith("AA") || l.startsWith("DD"),
      );
      if (hasConflicts) {
        await run(["git", ...gitArgs, "cherry-pick", "--abort"]);
        results.push({ commit: hash, subject, status: "conflict", message: "Conflict — skipped" });
        if (!jsonOutput) console.log(`  [CONFLICT] ${hash.slice(0, 8)} ${subject}`);
      } else {
        results.push({ commit: hash, subject, status: "error", message: pickErr || "Unknown error" });
        if (!jsonOutput) console.log(`  [FAIL] ${hash.slice(0, 8)} ${subject}\n         ${pickErr}`);
        stopped = true;
        break;
      }
    }
  }

  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status !== "success").length;

  // Push if requested and there were successful picks
  let pushed = false;
  if (!noPush && succeeded > 0) {
    const { exitCode: pushExit, stderr: pushErr } = await run(["git", ...gitArgs, "push", "origin", targetBranch]);
    pushed = pushExit === 0;
    if (!pushed && !jsonOutput) console.log(`\nWarning: push failed — ${pushErr}`);
  }

  // Clean up: remove worktree or switch back to original branch
  if (useWorktree) {
    await run(["git", "worktree", "remove", worktreePath, "--force"]);
  } else if (originalBranch) {
    await run(["git", "checkout", originalBranch]);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ targetBranch, total: commitHashes.length, applied: succeeded, failed, stopped, pushed, results }, null, 2));
  } else {
    console.log(`\nSummary: ${succeeded}/${commitHashes.length} commit(s) backported to ${targetBranch}`);
    if (pushed) console.log(`Pushed ${targetBranch} to origin`);
    else if (noPush) console.log("Skipped push (--no-push)");
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
