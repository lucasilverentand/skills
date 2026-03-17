const args = Bun.argv.slice(2);

const HELP = `
stage-hunks — Stage specific files and hunks for a commit group from change-analyzer output

Usage:
  bun run tools/stage-hunks.ts <plan-json-file> <commit-index>
  bun run tools/stage-hunks.ts --files <file1> [file2 ...]
  bun run tools/stage-hunks.ts --reset

Options:
  <plan-json-file> <index>   Read the plan from a JSON file (change-analyzer --json output) and stage the commit at the given index (0-based)
  --files <paths...>          Stage the given files entirely
  --reset                     Unstage everything (git reset HEAD)
  --dry-run                   Show what would be staged without doing it
  --help                      Show this help message

The plan JSON should have a "proposals" array, each with:
  { type, scope, message, files: [{ path, hunks: "all" | number[] }] }
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const dryRun = args.includes("--dry-run");

async function run(cmd: string[]): Promise<{ stdout: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), exitCode };
}

async function resetStaging(): Promise<void> {
  const { exitCode } = await run(["git", "reset", "HEAD"]);
  if (exitCode !== 0) {
    // reset HEAD may fail on initial commit, try alternative
    await run(["git", "rm", "--cached", "-r", "."]);
  }
  console.log("Staging area reset.");
}

async function stageFile(path: string): Promise<void> {
  if (dryRun) {
    console.log(`  would stage: ${path} (all)`);
    return;
  }
  await run(["git", "add", "--", path]);
  console.log(`  staged: ${path}`);
}

async function stageFileHunks(path: string, hunkStartLines: number[]): Promise<void> {
  // Use git add -p with an automated script to select specific hunks
  // We check each hunk's start line against our target list
  const diffResult = await run(["git", "diff", "-U0", "--", path]);
  if (!diffResult.stdout) {
    // File might be untracked or fully staged already
    if (dryRun) {
      console.log(`  would stage: ${path} (no diff, staging whole file)`);
    } else {
      await run(["git", "add", "--", path]);
      console.log(`  staged: ${path} (whole file — no diff hunks)`);
    }
    return;
  }

  // Parse the diff to find hunk boundaries
  const lines = diffResult.stdout.split("\n");
  const hunkIndices: { index: number; startLine: number; matches: boolean }[] = [];
  let hunkIdx = 0;

  for (const line of lines) {
    if (line.startsWith("@@ ")) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      const start = match ? parseInt(match[1]) : 0;
      hunkIndices.push({
        index: hunkIdx++,
        startLine: start,
        matches: hunkStartLines.includes(start),
      });
    }
  }

  const matchingCount = hunkIndices.filter((h) => h.matches).length;

  if (matchingCount === 0) {
    console.log(`  skip: ${path} (no matching hunks)`);
    return;
  }

  if (matchingCount === hunkIndices.length) {
    // All hunks match — just add the whole file
    if (dryRun) {
      console.log(`  would stage: ${path} (all ${matchingCount} hunks)`);
    } else {
      await run(["git", "add", "--", path]);
      console.log(`  staged: ${path} (all hunks)`);
    }
    return;
  }

  if (dryRun) {
    console.log(`  would stage: ${path} (${matchingCount}/${hunkIndices.length} hunks at lines ${hunkStartLines.join(", ")})`);
    return;
  }

  // Build the patch input for git add -p: y for matching hunks, n for others
  const responses = hunkIndices.map((h) => (h.matches ? "y" : "n")).join("\n") + "\n";

  const proc = Bun.spawn(["git", "add", "-p", "--", path], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  const writer = proc.stdin.getWriter();
  await writer.write(new TextEncoder().encode(responses));
  await writer.close();
  await proc.exited;

  console.log(`  staged: ${path} (${matchingCount}/${hunkIndices.length} hunks)`);
}

async function main() {
  if (args.includes("--reset")) {
    await resetStaging();
    process.exit(0);
  }

  if (args.includes("--files")) {
    const fileIdx = args.indexOf("--files");
    const files = args.slice(fileIdx + 1).filter((a) => !a.startsWith("--"));
    if (files.length === 0) {
      console.error("No files specified after --files");
      process.exit(1);
    }
    for (const f of files) {
      await stageFile(f);
    }
    process.exit(0);
  }

  // Plan mode: read JSON plan and stage a specific commit group
  const planFile = args.find((a) => !a.startsWith("--"));
  const indexArg = args.find((a, i) => i > 0 && !a.startsWith("--") && a !== planFile);

  if (!planFile || indexArg === undefined) {
    console.error("Usage: stage-hunks.ts <plan-json-file> <commit-index>");
    console.error("       stage-hunks.ts --files <file1> [file2 ...]");
    console.error("       stage-hunks.ts --reset");
    process.exit(1);
  }

  const planContent = await Bun.file(planFile).text();
  const plan = JSON.parse(planContent);
  const commitIndex = parseInt(indexArg);

  if (!plan.proposals || commitIndex < 0 || commitIndex >= plan.proposals.length) {
    console.error(`Invalid commit index ${commitIndex}. Plan has ${plan.proposals?.length || 0} proposals.`);
    process.exit(1);
  }

  const proposal = plan.proposals[commitIndex];
  console.log(`Staging for commit ${commitIndex + 1}: ${proposal.message}\n`);

  // First reset staging area
  await resetStaging();

  // Stage each file/hunk group
  for (const fileEntry of proposal.files) {
    if (fileEntry.hunks === "all") {
      await stageFile(fileEntry.path);
    } else {
      await stageFileHunks(fileEntry.path, fileEntry.hunks);
    }
  }

  console.log(`\nReady to commit: ${proposal.message}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
