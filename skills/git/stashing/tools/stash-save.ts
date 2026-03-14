const args = Bun.argv.slice(2);

const HELP = `
stash-save — Smart git stash with auto-generated descriptive message

Usage:
  bun run tools/stash-save.ts [options]

Options:
  --include-untracked   Also stash untracked files (maps to git stash -u)
  --message <msg>       Use a custom stash message instead of auto-generating one
  --json                Output as JSON instead of plain text
  --help                Show this help message

Examples:
  bun run tools/stash-save.ts
  bun run tools/stash-save.ts --include-untracked
  bun run tools/stash-save.ts --message "WIP: auth refactor"
  bun run tools/stash-save.ts --json
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const includeUntracked = args.includes("--include-untracked");

function getCustomMessage(): string | null {
  const idx = args.indexOf("--message");
  if (idx === -1) return null;
  const msg = args[idx + 1];
  if (!msg || msg.startsWith("--")) {
    console.error("Error: --message requires a value");
    process.exit(1);
  }
  return msg;
}

async function run(
  cmd: string[],
  opts?: { allowFailure?: boolean },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0 && !opts?.allowFailure) {
    throw new Error(`Command failed (${exitCode}): ${cmd.join(" ")}\n${stderr}`);
  }
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

function categorizeFiles(files: string[]): Map<string, string[]> {
  const categories = new Map<string, string[]>();
  for (const file of files) {
    const parts = file.split("/");
    let category: string;
    if (parts.length === 1) {
      const ext = file.split(".").pop() ?? "file";
      category = ext;
    } else {
      category = parts[0];
    }
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(file);
  }
  return categories;
}

function generateMessage(files: string[]): string {
  if (files.length === 0) return "WIP: empty stash";
  if (files.length === 1) return `WIP: ${files[0]}`;

  const categories = categorizeFiles(files);

  if (categories.size === 1) {
    const [cat, catFiles] = [...categories.entries()][0];
    if (catFiles.length <= 3) {
      return `WIP: ${catFiles.join(", ")}`;
    }
    return `WIP: ${catFiles.length} files in ${cat}/`;
  }

  const parts: string[] = [];
  const sortedCategories = [...categories.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  );

  for (const [cat, catFiles] of sortedCategories.slice(0, 3)) {
    if (catFiles.length === 1) {
      parts.push(catFiles[0]);
    } else {
      parts.push(`${catFiles.length} in ${cat}/`);
    }
  }

  const remaining =
    files.length -
    sortedCategories
      .slice(0, 3)
      .reduce((sum, [, f]) => sum + f.length, 0);

  let message = `WIP: ${parts.join(", ")}`;
  if (remaining > 0) {
    message += ` (+${remaining} more)`;
  }

  if (message.length > 120) {
    return `WIP: ${files.length} files across ${categories.size} directories`;
  }

  return message;
}

async function main() {
  // Check if we're in a git repo
  const { exitCode: gitCheck } = await run(
    ["git", "rev-parse", "--is-inside-work-tree"],
    { allowFailure: true },
  );
  if (gitCheck !== 0) {
    console.error("Error: not inside a git repository");
    process.exit(1);
  }

  // Get list of changed files before stashing
  const { stdout: diffOutput } = await run(
    ["git", "diff", "--name-only", "HEAD"],
    { allowFailure: true },
  );
  const { stdout: stagedOutput } = await run(
    ["git", "diff", "--name-only", "--cached"],
    { allowFailure: true },
  );

  let untrackedFiles: string[] = [];
  if (includeUntracked) {
    const { stdout: untrackedOutput } = await run(
      ["git", "ls-files", "--others", "--exclude-standard"],
      { allowFailure: true },
    );
    untrackedFiles = untrackedOutput
      .split("\n")
      .filter(Boolean);
  }

  const allFiles = [
    ...new Set([
      ...diffOutput.split("\n").filter(Boolean),
      ...stagedOutput.split("\n").filter(Boolean),
      ...untrackedFiles,
    ]),
  ];

  if (allFiles.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ success: false, reason: "no changes to stash" }, null, 2));
    } else {
      console.log("Nothing to stash — working tree is clean.");
    }
    process.exit(0);
  }

  // Build the stash message
  const customMessage = getCustomMessage();
  const message = customMessage ?? generateMessage(allFiles);

  // Build the stash command
  const stashCmd = ["git", "stash", "push", "-m", message];
  if (includeUntracked) {
    stashCmd.push("-u");
  }

  const { exitCode, stderr } = await run(stashCmd, { allowFailure: true });

  if (exitCode !== 0) {
    if (jsonOutput) {
      console.log(
        JSON.stringify({ success: false, error: stderr }, null, 2),
      );
    } else {
      console.error(`Error: git stash failed\n${stderr}`);
    }
    process.exit(1);
  }

  // Get the stash reference
  const { stdout: stashList } = await run(["git", "stash", "list", "-1"]);

  const result = {
    success: true,
    message,
    files: allFiles,
    fileCount: allFiles.length,
    includeUntracked,
    stashRef: stashList.split(":")[0] ?? "stash@{0}",
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Stashed ${result.fileCount} file(s): ${message}`);
    console.log(`Ref: ${result.stashRef}`);
    console.log();
    for (const file of allFiles) {
      console.log(`  ${file}`);
    }
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
