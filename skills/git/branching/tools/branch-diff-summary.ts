const args = Bun.argv.slice(2);

const HELP = `
branch-diff-summary — Summarize changes between two branches

Usage:
  bun run tools/branch-diff-summary.ts <base> <target> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  const base = filteredArgs[0];
  const target = filteredArgs[1];
  if (!base || !target) {
    console.error("Error: both <base> and <target> branches are required");
    process.exit(1);
  }

  // Get commit log between branches
  const logRaw = await run([
    "git", "log", "--oneline", `${base}...${target}`, "--left-right",
  ]);

  const commits = logRaw ? logRaw.split("\n").filter(Boolean) : [];
  const aheadCommits = commits.filter((c) => c.startsWith(">")).map((c) => c.slice(2));
  const behindCommits = commits.filter((c) => c.startsWith("<")).map((c) => c.slice(2));

  // Get diffstat
  const statRaw = await run(["git", "diff", "--stat", `${base}...${target}`]);
  const statLines = statRaw ? statRaw.split("\n").filter(Boolean) : [];
  const summaryLine = statLines.length > 0 ? statLines[statLines.length - 1].trim() : "No changes";

  // Get changed files with status
  const filesRaw = await run(["git", "diff", "--name-status", `${base}...${target}`]);
  const files: { status: string; path: string }[] = [];
  if (filesRaw) {
    for (const line of filesRaw.split("\n")) {
      if (!line.trim()) continue;
      const [status, ...pathParts] = line.split("\t");
      files.push({ status: status.trim(), path: pathParts.join("\t").trim() });
    }
  }

  // Group files by directory
  const byDir: Record<string, number> = {};
  for (const f of files) {
    const dir = f.path.includes("/") ? f.path.split("/").slice(0, -1).join("/") : ".";
    byDir[dir] = (byDir[dir] || 0) + 1;
  }

  const statusLabels: Record<string, string> = {
    A: "added",
    M: "modified",
    D: "deleted",
    R: "renamed",
    C: "copied",
  };

  const statusCounts: Record<string, number> = {};
  for (const f of files) {
    const label = statusLabels[f.status[0]] || f.status;
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  }

  const result = {
    base,
    target,
    ahead: aheadCommits.length,
    behind: behindCommits.length,
    filesChanged: files.length,
    statusCounts,
    topDirectories: Object.entries(byDir)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([dir, count]) => ({ dir, count })),
    summary: summaryLine,
    aheadCommits: aheadCommits.slice(0, 20),
    behindCommits: behindCommits.slice(0, 20),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Branch comparison: ${base} ↔ ${target}\n`);
    console.log(`  ${target} is ${result.ahead} commit(s) ahead, ${result.behind} commit(s) behind ${base}`);
    console.log(`  ${result.filesChanged} file(s) changed — ${summaryLine}\n`);

    if (Object.keys(statusCounts).length > 0) {
      console.log("  Changes by type:");
      for (const [label, count] of Object.entries(statusCounts)) {
        console.log(`    ${label}: ${count}`);
      }
      console.log();
    }

    if (result.topDirectories.length > 0) {
      console.log("  Most affected directories:");
      for (const { dir, count } of result.topDirectories) {
        console.log(`    ${dir}: ${count} file(s)`);
      }
      console.log();
    }

    if (aheadCommits.length > 0) {
      console.log(`  Commits in ${target} not in ${base}:`);
      for (const c of aheadCommits.slice(0, 20)) {
        console.log(`    ${c}`);
      }
      if (aheadCommits.length > 20) console.log(`    ... and ${aheadCommits.length - 20} more`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
