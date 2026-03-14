const args = Bun.argv.slice(2);

const HELP = `
cherry-pick-range — Pick a range of commits with conflict handling

Usage:
  bun run tools/cherry-pick-range.ts <start-hash> <end-hash> [options]

Picks all commits from start-hash (exclusive) to end-hash (inclusive),
equivalent to cherry-picking the range (start-hash..end-hash].

Options:
  --no-commit  Stage changes without committing (useful for squashing)
  --json       Output as JSON instead of plain text
  --help       Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const noCommit = args.includes("--no-commit");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface PickResult {
  hash: string;
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

async function getCommitsInRange(start: string, end: string): Promise<{ hash: string; subject: string }[]> {
  const { stdout, exitCode, stderr } = await run([
    "git", "log", "--reverse", "--format=%H|%s", `${start}..${end}`,
  ]);
  if (exitCode !== 0) {
    console.error(`Error: failed to list commits in range ${start}..${end}`);
    console.error(stderr);
    process.exit(1);
  }
  if (!stdout) return [];
  return stdout.split("\n").filter(Boolean).map((line) => {
    const [hash, ...subjectParts] = line.split("|");
    return { hash: hash.trim(), subject: subjectParts.join("|").trim() };
  });
}

async function cherryPickOne(hash: string, opts: { noCommit: boolean }): Promise<PickResult> {
  const pickArgs = ["git", "cherry-pick"];
  if (opts.noCommit) pickArgs.push("--no-commit");
  pickArgs.push(hash);
  const { exitCode, stderr } = await run(pickArgs);
  if (exitCode === 0) {
    return { hash, subject: "", status: "success", message: "Applied successfully" };
  }
  const { stdout: statusOut } = await run(["git", "status", "--porcelain"]);
  const hasConflicts = statusOut.split("\n").some(
    (l) => l.startsWith("UU") || l.startsWith("AA") || l.startsWith("DD"),
  );
  if (hasConflicts) {
    return { hash, subject: "", status: "conflict", message: "Conflict detected. Resolve, then: git cherry-pick --continue" };
  }
  return { hash, subject: "", status: "error", message: stderr || "Unknown error" };
}

async function main() {
  const startHash = filteredArgs[0];
  const endHash = filteredArgs[1];

  if (!startHash || !endHash) {
    console.error("Error: both <start-hash> and <end-hash> are required");
    process.exit(1);
  }
  // Verify the hashes exist
  for (const [label, hash] of [["start", startHash], ["end", endHash]] as const) {
    const { exitCode } = await run(["git", "rev-parse", "--verify", hash]);
    if (exitCode !== 0) {
      console.error(`Error: ${label} hash "${hash}" does not exist`);
      process.exit(1);
    }
  }

  const { stdout: dirtyCheck } = await run(["git", "status", "--porcelain"]);
  if (dirtyCheck) {
    console.error("Error: working tree is not clean — commit or stash changes first");
    process.exit(1);
  }

  const commits = await getCommitsInRange(startHash, endHash);

  if (commits.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ commits: [], summary: "No commits found in range" }));
    } else {
      console.log(`No commits found in range ${startHash}..${endHash}`);
    }
    process.exit(0);
  }

  if (!jsonOutput) {
    console.log(`Cherry-picking ${commits.length} commit(s) from ${startHash.slice(0, 8)}..${endHash.slice(0, 8)}:\n`);
  }

  const results: PickResult[] = [];
  let stopped = false;

  for (const commit of commits) {
    const result = await cherryPickOne(commit.hash, { noCommit });
    result.subject = commit.subject;

    if (!jsonOutput) {
      const icon = result.status === "success" ? "OK" : result.status === "conflict" ? "CONFLICT" : "FAIL";
      console.log(`  [${icon}] ${commit.hash.slice(0, 8)} ${commit.subject}`);
      if (result.status !== "success") {
        console.log(`         ${result.message}`);
      }
    }

    results.push(result);

    if (result.status === "conflict" || result.status === "error") {
      stopped = true;
      break;
    }
  }

  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status !== "success").length;

  if (jsonOutput) {
    console.log(JSON.stringify({
      range: { start: startHash, end: endHash },
      total: commits.length,
      applied: succeeded,
      failed,
      stopped,
      noCommit,
      results: results.map((r) => ({
        hash: r.hash,
        subject: r.subject,
        status: r.status,
        message: r.message,
      })),
    }, null, 2));
  } else {
    console.log(`\nSummary: ${succeeded}/${commits.length} commit(s) applied${stopped ? " (stopped due to failure)" : ""}`);
    if (noCommit) {
      console.log("Note: --no-commit was used — changes are staged but not committed");
    }
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
