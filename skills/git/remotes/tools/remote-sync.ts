const args = Bun.argv.slice(2);

const HELP = `
remote-sync — Sync a fork with its upstream remote

Usage:
  bun run tools/remote-sync.ts [options]

Options:
  --remote <name>  Name of the upstream remote (default: upstream)
  --branch <name>  Branch to sync (default: main)
  --rebase         Rebase instead of merge
  --push           Push to origin after syncing
  --json           Output as JSON instead of plain text
  --help           Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const useRebase = args.includes("--rebase");
const autoPush = args.includes("--push");

function getArg(flag: string, defaultVal: string): string {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const remoteName = getArg("--remote", "upstream");
const branchName = getArg("--branch", "main");

async function run(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

function fail(msg: string): never {
  if (jsonOutput) {
    console.log(JSON.stringify({ status: "error", message: msg }));
  } else {
    console.error(`Error: ${msg}`);
  }
  process.exit(1);
}

async function main() {
  // Validate remote exists
  const { stdout: remoteList } = await run(["git", "remote"]);
  const remotes = remoteList.split("\n").map((r) => r.trim()).filter(Boolean);
  if (!remotes.includes(remoteName)) {
    fail(`Remote '${remoteName}' not found. Available remotes: ${remotes.join(", ")}`);
  }

  // Get current branch
  const { stdout: currentBranch } = await run(["git", "branch", "--show-current"]);
  if (!currentBranch) fail("Not on any branch (detached HEAD state)");

  // Check for uncommitted changes
  const { stdout: statusOutput } = await run(["git", "status", "--porcelain"]);
  if (statusOutput) fail("Working tree has uncommitted changes. Commit or stash them first.");

  // Fetch from upstream
  console.error(`Fetching from ${remoteName}...`);
  const fetchResult = await run(["git", "fetch", remoteName, branchName]);
  if (fetchResult.exitCode !== 0) {
    fail(`Failed to fetch ${remoteName}/${branchName}: ${fetchResult.stderr}`);
  }

  // Count commits behind
  const { stdout: behindCount } = await run(["git", "rev-list", "--count", `HEAD..${remoteName}/${branchName}`]);
  const commitsBehind = parseInt(behindCount, 10) || 0;
  const strategy = useRebase ? "rebase" : "merge";

  if (commitsBehind === 0) {
    const result = { remote: remoteName, branch: branchName, strategy, currentBranch, fetchedCommits: 0, pushed: false, status: "up-to-date", message: `Already up to date with ${remoteName}/${branchName}.` };
    if (jsonOutput) { console.log(JSON.stringify(result, null, 2)); } else { console.log(result.message); }
    process.exit(0);
  }

  // Merge or rebase
  const syncCmd = useRebase
    ? ["git", "rebase", `${remoteName}/${branchName}`]
    : ["git", "merge", `${remoteName}/${branchName}`, "--no-edit"];

  console.error(`${useRebase ? "Rebasing" : "Merging"} ${commitsBehind} commit(s) from ${remoteName}/${branchName}...`);
  const syncResult = await run(syncCmd);

  if (syncResult.exitCode !== 0) {
    const isConflict = syncResult.stdout.includes("CONFLICT") || syncResult.stderr.includes("CONFLICT");
    const msg = isConflict
      ? `Conflicts detected while ${strategy}ing. Resolve them and run again.`
      : `${strategy} failed: ${syncResult.stderr}`;
    const result = { remote: remoteName, branch: branchName, strategy, currentBranch, fetchedCommits: commitsBehind, pushed: false, status: isConflict ? "conflict" : "error", message: msg };
    if (jsonOutput) { console.log(JSON.stringify(result, null, 2)); } else { console.error(`Error: ${msg}`); }
    process.exit(1);
  }

  // Optionally push to origin
  let pushed = false;
  if (autoPush) {
    console.error(`Pushing to origin/${currentBranch}...`);
    const pushResult = await run(["git", "push", "origin", currentBranch]);
    if (pushResult.exitCode !== 0) {
      console.error(`Warning: push failed: ${pushResult.stderr}`);
    } else {
      pushed = true;
    }
  }

  const message = `Synced ${commitsBehind} commit(s) from ${remoteName}/${branchName} via ${strategy}.${pushed ? " Pushed to origin." : ""}`;
  const result = { remote: remoteName, branch: branchName, strategy, currentBranch, fetchedCommits: commitsBehind, pushed, status: "success", message };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(message);
    if (!autoPush) {
      console.log(`\nRun \`git push origin ${currentBranch}\` to push the changes.`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
