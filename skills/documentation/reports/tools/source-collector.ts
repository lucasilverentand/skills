const args = Bun.argv.slice(2);

const HELP = `
source-collector — Gather and summarize source material from files and git history

Usage:
  bun run tools/source-collector.ts [options]

Options:
  --git-log          Include recent git log
  --since <period>   Git log period (default: "1 week ago")
  --files <glob>     Include file contents matching glob pattern
  --diff             Include git diff of uncommitted changes
  --shortlog         Include contributor summary
  --json             Output as JSON instead of plain text
  --help             Show this help message

Examples:
  bun run tools/source-collector.ts --git-log --since "2 weeks ago"
  bun run tools/source-collector.ts --git-log --diff --shortlog
  bun run tools/source-collector.ts --files "docs/**/*.md"
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const includeGitLog = args.includes("--git-log");
const includeDiff = args.includes("--diff");
const includeShortlog = args.includes("--shortlog");

const sinceIdx = args.indexOf("--since");
const since = sinceIdx !== -1 ? args[sinceIdx + 1] : "1 week ago";

const filesIdx = args.indexOf("--files");
const filesGlob = filesIdx !== -1 ? args[filesIdx + 1] : null;

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const output = await new Response(proc.stdout).text();
  await proc.exited;
  return output.trim();
}

async function main() {
  const result: Record<string, string> = {};

  if (includeGitLog) {
    result.gitLog = await run([
      "git",
      "log",
      `--since=${since}`,
      "--oneline",
      "--no-decorate",
      "--max-count=100",
    ]);
  }

  if (includeDiff) {
    result.gitDiff = await run(["git", "diff", "--stat"]);
  }

  if (includeShortlog) {
    result.shortlog = await run([
      "git",
      "shortlog",
      "-sn",
      `--since=${since}`,
    ]);
  }

  if (filesGlob) {
    const glob = new Bun.Glob(filesGlob);
    const entries: string[] = [];
    for await (const path of glob.scan({ dot: false })) {
      entries.push(path);
    }
    const fileContents: Record<string, string> = {};
    for (const path of entries.slice(0, 20)) {
      const file = Bun.file(path);
      if (await file.exists()) {
        const text = await file.text();
        fileContents[path] = text.length > 5000 ? text.slice(0, 5000) + "\n...(truncated)" : text;
      }
    }
    result.files = JSON.stringify(fileContents, null, 2);
  }

  if (Object.keys(result).length === 0) {
    console.error("No sources requested. Run with --help for options.");
    process.exit(1);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const [key, value] of Object.entries(result)) {
      if (!value) continue;
      console.log(`--- ${key} ---`);
      console.log(value);
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
