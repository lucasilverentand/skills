const args = Bun.argv.slice(2);

const HELP = `
worktree-create — Create a new worktree linked to a branch with standard directory layout

Usage:
  bun run tools/worktree-create.ts <branch> [options]

Arguments:
  <branch>  Branch name to check out (creates it if it doesn't exist)

Options:
  --base <ref>   Base ref for new branches (default: origin/main)
  --path <dir>   Custom worktree path (default: ../<repo>-<branch>)
  --json         Output as JSON instead of plain text
  --help         Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getArg(flag: string, defaultVal: string): string {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const baseRef = getArg("--base", "origin/main");
const customPath = getArg("--path", "");
const filteredArgs = args.filter((a) => !a.startsWith("--") && a !== getArg("--base", "") && a !== getArg("--path", ""));

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
  const branch = filteredArgs[0];
  if (!branch) {
    console.error("Error: missing required <branch> argument");
    process.exit(1);
  }

  // Get repo name from the git toplevel path
  const { stdout: toplevel } = await run(["git", "rev-parse", "--show-toplevel"]);
  const repoName = toplevel.split("/").pop() || "repo";

  // Determine worktree path
  const sanitizedBranch = branch.replace(/\//g, "-");
  const worktreePath = customPath || `${toplevel}/../${repoName}-${sanitizedBranch}`;

  // Check if branch exists
  const { exitCode: branchExists } = await run(["git", "rev-parse", "--verify", `refs/heads/${branch}`]);
  const { exitCode: remoteBranchExists } = await run(["git", "rev-parse", "--verify", `refs/remotes/origin/${branch}`]);

  let worktreeArgs: string[];

  if (branchExists === 0) {
    // Branch exists locally — just check it out
    worktreeArgs = ["git", "worktree", "add", worktreePath, branch];
  } else if (remoteBranchExists === 0) {
    // Branch exists on remote — track it
    worktreeArgs = ["git", "worktree", "add", "--track", "-b", branch, worktreePath, `origin/${branch}`];
  } else {
    // New branch — create from base ref
    worktreeArgs = ["git", "worktree", "add", "-b", branch, worktreePath, baseRef];
  }

  const result = await run(worktreeArgs);

  if (result.exitCode !== 0) {
    console.error(`Error creating worktree: ${result.stderr}`);
    process.exit(1);
  }

  // Check if there's a package.json in the new worktree (needs bun install)
  const pkgCheck = Bun.spawn(["test", "-f", `${worktreePath}/package.json`], { stdout: "pipe", stderr: "pipe" });
  const needsInstall = (await pkgCheck.exited) === 0;

  const output = {
    path: worktreePath,
    branch,
    isNew: branchExists !== 0 && remoteBranchExists !== 0,
    base: branchExists !== 0 && remoteBranchExists !== 0 ? baseRef : undefined,
    needsInstall,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(`Worktree created:`);
    console.log(`  Branch: ${branch}${output.isNew ? ` (new, from ${baseRef})` : ""}`);
    console.log(`  Path: ${worktreePath}`);
    if (needsInstall) {
      console.log(`\n  Note: package.json found — run \`cd ${worktreePath} && bun install\``);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
