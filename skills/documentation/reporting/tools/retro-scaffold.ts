const args = Bun.argv.slice(2);

const HELP = `
retro-scaffold — Create a retrospective document with timeline from git/issue history

Usage:
  bun run tools/retro-scaffold.ts [options]

Options:
  --since <period>   Period to cover (default: "2 weeks ago")
  --topic <topic>    Retro topic/title (default: "Sprint Retrospective")
  --type <type>      Type: sprint, project, incident, release (default: "sprint")
  --output <path>    Write to file instead of stdout
  --json             Output as JSON instead of Markdown
  --help             Show this help message

Examples:
  bun run tools/retro-scaffold.ts --since "2 weeks ago"
  bun run tools/retro-scaffold.ts --since "2025-01-01" --topic "Q1 Project Retro" --type project
  bun run tools/retro-scaffold.ts --type incident --topic "API outage 2025-02-15"
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const sinceIdx = args.indexOf("--since");
const since = sinceIdx !== -1 ? args[sinceIdx + 1] : "2 weeks ago";
const topicIdx = args.indexOf("--topic");
const topic = topicIdx !== -1 ? args[topicIdx + 1] : "Sprint Retrospective";
const typeIdx = args.indexOf("--type");
const retroType = typeIdx !== -1 ? args[typeIdx + 1] : "sprint";
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const output = await new Response(proc.stdout).text();
  await proc.exited;
  return output.trim();
}

interface TimelineEntry {
  date: string;
  message: string;
  hash: string;
}

interface RetroData {
  topic: string;
  type: string;
  date: string;
  period: string;
  timeline: TimelineEntry[];
  commitCount: number;
  contributors: { name: string; count: number }[];
  activeDays: number;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];

  // Collect timeline from git log with dates
  const logRaw = await run([
    "git", "log", `--since=${since}`, "--format=%ad|%h|%s",
    "--date=short", "--max-count=200",
  ]);
  const timeline: TimelineEntry[] = logRaw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [date, hash, ...rest] = line.split("|");
      return { date, hash, message: rest.join("|") };
    });

  // Contributors
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

  // Count active days
  const activeDays = new Set(timeline.map((e) => e.date)).size;

  const data: RetroData = {
    topic,
    type: retroType,
    date: today,
    period: since,
    timeline,
    commitCount: timeline.length,
    contributors,
    activeDays,
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

  const lines: string[] = [
    `# Retrospective: ${topic}`,
    "",
    `**Period:** since ${since}`,
    `**Date:** ${today}`,
    `**Type:** ${retroType}`,
    `**Participants:** <!-- who contributed to this retro -->`,
    "",
    "## Summary",
    "",
    `${timeline.length} commits by ${contributors.length} contributor(s) over ${activeDays} active day(s).`,
    "",
    "<!-- 2-3 sentences: overall assessment and the single most important takeaway -->",
    "",
    "## Timeline",
    "",
    "| Date | Event | Impact |",
    "|---|---|---|",
  ];

  // Group timeline by date, show key events
  const byDate = new Map<string, TimelineEntry[]>();
  for (const entry of timeline) {
    if (!byDate.has(entry.date)) byDate.set(entry.date, []);
    byDate.get(entry.date)!.push(entry);
  }

  for (const [date, entries] of byDate) {
    if (entries.length <= 3) {
      for (const e of entries) {
        lines.push(`| ${date} | ${e.message} (\`${e.hash}\`) | <!-- impact --> |`);
      }
    } else {
      lines.push(`| ${date} | ${entries.length} commits (${entries[0].message}, ...) | <!-- impact --> |`);
    }
  }

  lines.push(
    "",
    "## What Went Well",
    "",
    "### <!-- Theme 1 -->",
    "- <!-- specific practice or decision that worked -->",
    "- **Why it worked:** <!-- reasoning -->",
    "- **Keep doing:** <!-- action -->",
    "",
    "### <!-- Theme 2 -->",
    "- <!-- specific practice or decision -->",
    "- **Why it worked:** <!-- reasoning -->",
    "- **Keep doing:** <!-- action -->",
    "",
    "## What Didn't Go Well",
    "",
    "### <!-- Theme 1 -->",
    "- <!-- specific issue or pain point -->",
    "- **Impact:** <!-- what this cost -->",
    "- **Root cause:** <!-- why — focus on systems, not people -->",
    "",
    "## Patterns",
    "",
    "| Pattern | Frequency | Trend |",
    "|---|---|---|",
    "| <!-- pattern --> | <!-- how often --> | Getting better / worse / stable |",
    "",
    "## Metrics",
    "",
    "| Metric | Target | Actual | Notes |",
    "|---|---|---|---|",
    `| Commits | <!-- target --> | ${timeline.length} | <!-- context --> |`,
    `| Contributors | <!-- target --> | ${contributors.length} | <!-- context --> |`,
    `| Active days | <!-- target --> | ${activeDays} | <!-- context --> |`,
    "",
    "## Action Items",
    "",
    "| # | Action | Owner | Deadline | Priority |",
    "|---|---|---|---|---|",
    "| 1 | <!-- specific improvement --> | <!-- @name --> | <!-- date --> | High |",
    "| 2 | <!-- specific improvement --> | <!-- @name --> | <!-- date --> | Medium |",
    "| 3 | <!-- specific improvement --> | <!-- @name --> | <!-- date --> | Low |",
    "",
    "## Previous Action Items Review",
    "",
    "| # | Action from last retro | Status | Notes |",
    "|---|---|---|---|",
    "| 1 | <!-- what was committed --> | Done / In progress / Not started | <!-- context --> |",
    "",
  );

  // Add incident-specific sections
  if (retroType === "incident") {
    lines.push(
      "## Incident Details",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Severity | SEV1 / SEV2 / SEV3 |",
      "| Detection time | <!-- how long before noticed --> |",
      "| Resolution time | <!-- how long to fix --> |",
      "| Customer impact | <!-- description --> |",
      "",
      "## Prevention",
      "",
      "- <!-- what would have caught this earlier -->",
      "- <!-- what would have prevented it entirely -->",
      "",
    );
  }

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
