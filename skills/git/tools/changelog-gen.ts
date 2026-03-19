const args = Bun.argv.slice(2);

const HELP = `
changelog-gen — Generate a changelog from commits between two refs

Usage:
  bun run tools/changelog-gen.ts <from-ref> <to-ref> [options]

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

interface ChangelogEntry {
  hash: string;
  type: string;
  scope: string;
  description: string;
  breaking: boolean;
}

interface Changelog {
  from: string;
  to: string;
  sections: Record<string, ChangelogEntry[]>;
  breaking: ChangelogEntry[];
  uncategorized: string[];
}

const TYPE_LABELS: Record<string, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  refactor: "Refactoring",
  perf: "Performance",
  docs: "Documentation",
  test: "Tests",
  chore: "Chores",
  ci: "CI/CD",
  build: "Build",
  style: "Style",
  revert: "Reverts",
};

const COMMIT_PATTERN = /^(\w+)(\(([^)]+)\))?(!)?:\s*(.+)$/;

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  const fromRef = filteredArgs[0];
  const toRef = filteredArgs[1];
  if (!fromRef || !toRef) {
    console.error("Error: both <from-ref> and <to-ref> are required");
    process.exit(1);
  }

  const logRaw = await run([
    "git", "log", "--pretty=format:%h|%s|%b%n---COMMIT-END---", `${fromRef}..${toRef}`,
  ]);

  if (!logRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify({ from: fromRef, to: toRef, sections: {}, breaking: [], uncategorized: [] }));
    } else {
      console.log(`No commits between ${fromRef} and ${toRef}.`);
    }
    process.exit(0);
  }

  const commitBlocks = logRaw.split("---COMMIT-END---").filter((b) => b.trim());
  const sections: Record<string, ChangelogEntry[]> = {};
  const breaking: ChangelogEntry[] = [];
  const uncategorized: string[] = [];

  for (const block of commitBlocks) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    const [hash, ...subjectParts] = firstLine.split("|");
    const subject = subjectParts[0] || "";
    const body = subjectParts.slice(1).join("|") + "\n" + lines.slice(1).join("\n");

    const match = subject.match(COMMIT_PATTERN);
    if (!match) {
      uncategorized.push(`${hash} ${subject}`);
      continue;
    }

    const [, type, , scope, bang, description] = match;
    const isBreaking = bang === "!" || body.includes("BREAKING CHANGE:");

    const entry: ChangelogEntry = {
      hash: hash.trim(),
      type,
      scope: scope || "",
      description: description.trim(),
      breaking: isBreaking,
    };

    if (!sections[type]) sections[type] = [];
    sections[type].push(entry);

    if (isBreaking) breaking.push(entry);
  }

  const changelog: Changelog = { from: fromRef, to: toRef, sections, breaking, uncategorized };

  if (jsonOutput) {
    console.log(JSON.stringify(changelog, null, 2));
  } else {
    console.log(`# Changelog: ${fromRef}..${toRef}\n`);

    if (breaking.length > 0) {
      console.log("## BREAKING CHANGES\n");
      for (const e of breaking) {
        const scopeStr = e.scope ? `**${e.scope}**: ` : "";
        console.log(`- ${scopeStr}${e.description} (${e.hash})`);
      }
      console.log();
    }

    // Sort sections by importance: feat, fix, then alphabetical
    const order = ["feat", "fix", "perf", "refactor", "docs", "test", "chore", "ci", "build", "style", "revert"];
    const sortedTypes = Object.keys(sections).sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    for (const type of sortedTypes) {
      const label = TYPE_LABELS[type] || type;
      console.log(`## ${label}\n`);
      for (const e of sections[type]) {
        const scopeStr = e.scope ? `**${e.scope}**: ` : "";
        console.log(`- ${scopeStr}${e.description} (${e.hash})`);
      }
      console.log();
    }

    if (uncategorized.length > 0) {
      console.log("## Other\n");
      for (const c of uncategorized) {
        console.log(`- ${c}`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
