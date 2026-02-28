const args = Bun.argv.slice(2);

const HELP = `
bisect-runner — Automate git bisect with a test command

Usage:
  bun run tools/bisect-runner.ts <test-command> [options]

Options:
  --good <ref>    Known good commit (default: first commit on branch)
  --bad <ref>     Known bad commit (default: HEAD)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Wraps git bisect to automatically find the commit that introduced a regression.
Runs the provided test command at each bisect step — exit code 0 means good,
non-zero means bad.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const goodIdx = args.indexOf("--good");
const goodRef = goodIdx !== -1 ? args[goodIdx + 1] : null;
const badIdx = args.indexOf("--bad");
const badRef = badIdx !== -1 ? args[badIdx + 1] : "HEAD";
const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (goodIdx === -1 || i !== goodIdx + 1) &&
    (badIdx === -1 || i !== badIdx + 1)
);

interface BisectResult {
  foundCommit: string | null;
  commitMessage: string | null;
  commitAuthor: string | null;
  commitDate: string | null;
  stepsRun: number;
  totalCommits: number;
  log: string[];
}

async function run(cmd: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
    cwd: process.cwd(),
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  return { exitCode, stdout: stdout.trim(), stderr: stderr.trim() };
}

async function runShell(cmd: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["sh", "-c", cmd], {
    stdout: "pipe",
    stderr: "pipe",
    cwd: process.cwd(),
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  return { exitCode, stdout: stdout.trim(), stderr: stderr.trim() };
}

async function main() {
  const testCommand = filteredArgs[0];
  if (!testCommand) {
    console.error("Error: missing required test command argument");
    process.exit(1);
  }

  // Verify we're in a git repo
  const gitCheck = await run(["git", "rev-parse", "--is-inside-work-tree"]);
  if (gitCheck.exitCode !== 0) {
    console.error("Error: not inside a git repository");
    process.exit(1);
  }

  // Check for uncommitted changes
  const statusCheck = await run(["git", "status", "--porcelain"]);
  if (statusCheck.stdout) {
    console.error("Error: uncommitted changes detected. Commit or stash before bisecting.");
    process.exit(1);
  }

  // Determine good ref
  let good = goodRef;
  if (!good) {
    // Use first commit on the current branch
    const firstCommit = await run(["git", "rev-list", "--max-parents=0", "HEAD"]);
    good = firstCommit.stdout.split("\n")[0];
    if (!good) {
      console.error("Error: could not determine first commit");
      process.exit(1);
    }
  }

  // Count commits in range
  const commitCount = await run(["git", "rev-list", "--count", `${good}..${badRef}`]);
  const totalCommits = parseInt(commitCount.stdout) || 0;

  const log: string[] = [];
  log.push(`Bisecting between ${good} and ${badRef} (${totalCommits} commits)`);
  log.push(`Test command: ${testCommand}`);

  if (!jsonOutput) {
    console.log(log[0]);
    console.log(log[1]);
    console.log();
  }

  // Start bisect
  await run(["git", "bisect", "start"]);
  await run(["git", "bisect", "bad", badRef]);
  await run(["git", "bisect", "good", good]);

  let stepsRun = 0;
  let foundCommit: string | null = null;
  let commitMessage: string | null = null;
  let commitAuthor: string | null = null;
  let commitDate: string | null = null;

  try {
    // Run bisect with the test command
    const bisectResult = await runShell(`git bisect run sh -c '${testCommand.replace(/'/g, "'\\''")}'`);

    stepsRun = (bisectResult.stdout.match(/Bisecting:/g) || []).length + 1;

    // Extract the found commit
    const commitMatch = bisectResult.stdout.match(
      /([0-9a-f]{40}) is the first bad commit/
    );
    if (commitMatch) {
      foundCommit = commitMatch[1];

      // Get commit details
      const showResult = await run([
        "git",
        "show",
        "--no-patch",
        "--format=%s%n%an%n%ai",
        foundCommit,
      ]);
      const parts = showResult.stdout.split("\n");
      commitMessage = parts[0] || null;
      commitAuthor = parts[1] || null;
      commitDate = parts[2] || null;
    }

    log.push(bisectResult.stdout);
    if (bisectResult.stderr) log.push(bisectResult.stderr);
  } finally {
    // Always reset bisect
    await run(["git", "bisect", "reset"]);
  }

  const result: BisectResult = {
    foundCommit,
    commitMessage,
    commitAuthor,
    commitDate,
    stepsRun,
    totalCommits,
    log,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (foundCommit) {
      console.log(`Found bad commit: ${foundCommit}`);
      console.log(`  Message: ${commitMessage}`);
      console.log(`  Author:  ${commitAuthor}`);
      console.log(`  Date:    ${commitDate}`);
      console.log(`\nBisected in ${stepsRun} steps across ${totalCommits} commits.`);
      console.log(`\nNext step: review the diff with 'git show ${foundCommit}'`);
    } else {
      console.log("Bisect did not find a definitive bad commit.");
      console.log("This may mean the test command is unreliable or the good/bad range is wrong.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
