const args = Bun.argv.slice(2);

const HELP = `
status-gen — Collect git log, PR activity, and contributor stats to draft a status report

Usage:
  bun run tools/status-gen.ts [options]

Options:
  --since <period>   Period to cover (default: "1 week ago")
  --output <path>    Write to file instead of stdout
  --json             Output as JSON instead of Markdown
  --help             Show this help message

Examples:
  bun run tools/status-gen.ts --since "1 week ago"
  bun run tools/status-gen.ts --since "2 weeks ago" --output status.md
  bun run tools/status-gen.ts --since "2025-01-01" --json
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const sinceIdx = args.indexOf("--since");
const since = sinceIdx !== -1 ? args[sinceIdx + 1] : "1 week ago";
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const output = await new Response(proc.stdout).text();
  await proc.exited;
  return output.trim();
}

interface StatusData {
  period: string;
  date: string;
  commits: { hash: string; message: string }[];
  contributors: { name: string; count: number }[];
  filesChanged: number;
  insertions: number;
  deletions: number;
  branchCount: number;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];

  // Collect git log
  const logRaw = await run([
    "git", "log", `--since=${since}`, "--oneline", "--no-decorate", "--max-count=200",
  ]);
  const commits = logRaw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const spaceIdx = line.indexOf(" ");
      return {
        hash: line.slice(0, spaceIdx),
        message: line.slice(spaceIdx + 1),
      };
    });

  // Contributor summary
  const shortlogRaw = await run([
    "git", "shortlog", "-sn", `--since=${since}`,
  ]);
  const contributors = shortlogRaw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const match = line.trim().match(/^(\d+)\t(.+)$/);
      return match
        ? { name: match[2], count: parseInt(match[1], 10) }
        : { name: line.trim(), count: 0 };
    });

  // Diff stats
  const diffStatRaw = await run([
    "git", "diff", "--shortstat", `HEAD~${Math.min(commits.length, 200)}`, "HEAD",
  ]).catch(() => "");
  let filesChanged = 0;
  let insertions = 0;
  let deletions = 0;
  if (diffStatRaw) {
    const filesMatch = diffStatRaw.match(/(\d+) files? changed/);
    const insMatch = diffStatRaw.match(/(\d+) insertions?/);
    const delMatch = diffStatRaw.match(/(\d+) deletions?/);
    filesChanged = filesMatch ? parseInt(filesMatch[1], 10) : 0;
    insertions = insMatch ? parseInt(insMatch[1], 10) : 0;
    deletions = delMatch ? parseInt(delMatch[1], 10) : 0;
  }

  // Branch count
  const branchRaw = await run(["git", "branch", "--list"]);
  const branchCount = branchRaw.split("\n").filter(Boolean).length;

  const data: StatusData = {
    period: since,
    date: today,
    commits,
    contributors,
    filesChanged,
    insertions,
    deletions,
    branchCount,
  };

  if (jsonOutput) {
    const output = JSON.stringify(data, null, 2);
    if (outputPath) {
      await Bun.write(outputPath, output);
      console.log(`Written to ${outputPath}`);
    } else {
      console.log(output);
    }
    return;
  }

  // Generate markdown
  const lines: string[] = [
    `# Status Report`,
    "",
    `**Date:** ${today}`,
    `**Period:** since ${since}`,
    `**Audience:** <!-- who is this for? -->`,
    "",
    "## Summary",
    "",
    `${commits.length} commits by ${contributors.length} contributor(s). ${filesChanged} files changed (+${insertions}, -${deletions}).`,
    "",
    "<!-- Add 2-3 sentence overview of what happened this period -->",
    "",
    "## Accomplishments",
    "",
  ];

  // Group commits by conventional commit prefix
  const groups: Record<string, string[]> = {};
  for (const c of commits) {
    const prefixMatch = c.message.match(/^(\w+)[\(:]?/);
    const prefix = prefixMatch ? prefixMatch[1] : "other";
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(`- ${c.message} (\`${c.hash}\`)`);
  }
  for (const [prefix, items] of Object.entries(groups)) {
    lines.push(`### ${prefix}`, ...items, "");
  }

  lines.push(
    "## In Progress",
    "",
    "| Item | Owner | Status | ETA |",
    "|---|---|---|---|",
    "| <!-- item --> | <!-- owner --> | <!-- status --> | <!-- date --> |",
    "",
    "## Blockers and Risks",
    "",
    "| Blocker | Impact | Mitigation | Owner |",
    "|---|---|---|---|",
    "| <!-- blocker --> | <!-- impact --> | <!-- mitigation --> | <!-- owner --> |",
    "",
    "## Metrics",
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Commits | ${commits.length} |`,
    `| Contributors | ${contributors.length} |`,
    `| Files changed | ${filesChanged} |`,
    `| Lines added | +${insertions} |`,
    `| Lines removed | -${deletions} |`,
    `| Active branches | ${branchCount} |`,
    "",
    "## Contributors",
    "",
    "| Name | Commits |",
    "|---|---|",
    ...contributors.map((c) => `| ${c.name} | ${c.count} |`),
    "",
    "## Next Steps",
    "",
    "- [ ] <!-- what's planned for the next period -->",
    "- [ ] <!-- key milestones coming up -->",
    "",
  );

  const markdown = lines.join("\n");

  if (outputPath) {
    await Bun.write(outputPath, markdown);
    console.log(`Written to ${outputPath}`);
  } else {
    console.log(markdown);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
