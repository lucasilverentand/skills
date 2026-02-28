const args = Bun.argv.slice(2);

const HELP = `
diff-summary — Generate a human-readable summary of changes made during implementation

Usage:
  bun run tools/diff-summary.ts [base-ref] [options]

Arguments:
  base-ref  Git ref to compare against (default: HEAD)

Options:
  --staged  Only show staged changes
  --json    Output as JSON instead of plain text
  --help    Show this help message

Summarizes git changes by file, grouping by type (added, modified, deleted)
and showing line counts.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const stagedOnly = args.includes("--staged");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
}

async function main() {
  const baseRef = filteredArgs[0] || "HEAD";

  // Get file status with diff stats
  const diffArgs = stagedOnly
    ? ["git", "diff", "--cached", "--numstat", "--diff-filter=ADMR"]
    : ["git", "diff", "--numstat", "--diff-filter=ADMR", baseRef];

  const statusArgs = stagedOnly
    ? ["git", "diff", "--cached", "--name-status", "--diff-filter=ADMR"]
    : ["git", "diff", "--name-status", "--diff-filter=ADMR", baseRef];

  const numstatProc = Bun.spawn(diffArgs, { stdout: "pipe", stderr: "pipe" });
  const numstatOutput = await new Response(numstatProc.stdout).text();
  await numstatProc.exited;

  const statusProc = Bun.spawn(statusArgs, { stdout: "pipe", stderr: "pipe" });
  const statusOutput = await new Response(statusProc.stdout).text();
  await statusProc.exited;

  // Parse status
  const statusMap = new Map<string, string>();
  for (const line of statusOutput.trim().split("\n").filter(Boolean)) {
    const parts = line.split("\t");
    const status = parts[0][0]; // First char: A, M, D, R
    const filePath = parts[parts.length - 1];
    statusMap.set(filePath, status);
  }

  // Parse numstat
  const changes: FileChange[] = [];
  for (const line of numstatOutput.trim().split("\n").filter(Boolean)) {
    const [addStr, delStr, filePath] = line.split("\t");
    const additions = addStr === "-" ? 0 : parseInt(addStr);
    const deletions = delStr === "-" ? 0 : parseInt(delStr);
    const rawStatus = statusMap.get(filePath) || "M";

    const status =
      rawStatus === "A" ? "added" :
      rawStatus === "D" ? "deleted" :
      rawStatus === "R" ? "renamed" :
      "modified";

    changes.push({ path: filePath, status, additions, deletions });
  }

  // Also include untracked files if not staged-only
  if (!stagedOnly) {
    const untrackedProc = Bun.spawn(
      ["git", "ls-files", "--others", "--exclude-standard"],
      { stdout: "pipe", stderr: "pipe" }
    );
    const untrackedOutput = await new Response(untrackedProc.stdout).text();
    await untrackedProc.exited;

    for (const filePath of untrackedOutput.trim().split("\n").filter(Boolean)) {
      try {
        const content = await Bun.file(filePath).text();
        changes.push({
          path: filePath,
          status: "added",
          additions: content.split("\n").length,
          deletions: 0,
        });
      } catch {
        // skip binary files
      }
    }
  }

  const totalAdditions = changes.reduce((s, c) => s + c.additions, 0);
  const totalDeletions = changes.reduce((s, c) => s + c.deletions, 0);
  const added = changes.filter((c) => c.status === "added");
  const modified = changes.filter((c) => c.status === "modified");
  const deleted = changes.filter((c) => c.status === "deleted");
  const renamed = changes.filter((c) => c.status === "renamed");

  const result = {
    baseRef,
    stagedOnly,
    totalFiles: changes.length,
    totalAdditions,
    totalDeletions,
    added: added.map((c) => c.path),
    modified: modified.map((c) => c.path),
    deleted: deleted.map((c) => c.path),
    renamed: renamed.map((c) => c.path),
    changes,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Changes vs ${stagedOnly ? "staged" : baseRef}:`);
    console.log(`  ${changes.length} files | +${totalAdditions} -${totalDeletions}\n`);

    const printGroup = (label: string, files: FileChange[]) => {
      if (files.length === 0) return;
      console.log(`${label} (${files.length}):`);
      for (const f of files) {
        console.log(`  ${f.path}  +${f.additions} -${f.deletions}`);
      }
      console.log();
    };

    printGroup("Added", added);
    printGroup("Modified", modified);
    printGroup("Deleted", deleted);
    printGroup("Renamed", renamed);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
