const args = Bun.argv.slice(2);

const HELP = `
branch-naming-check — Validate branch names against naming conventions

Usage:
  bun run tools/branch-naming-check.ts [branch-name] [options]

If no branch name is given, checks the current branch.

Options:
  --all     Check all local branches
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const checkAll = args.includes("--all");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

const VALID_PREFIXES = ["feat", "fix", "refactor", "chore", "docs", "test", "hotfix", "release"];
const BRANCH_PATTERN = /^[a-z0-9]+\/[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const SPECIAL_BRANCHES = ["main", "master", "develop", "staging", "production"];

interface BranchCheck {
  branch: string;
  valid: boolean;
  issues: string[];
}

function checkBranch(name: string): BranchCheck {
  const issues: string[] = [];

  // Special branches are always valid
  if (SPECIAL_BRANCHES.includes(name)) {
    return { branch: name, valid: true, issues: [] };
  }

  // Check for prefix/description format
  if (!name.includes("/")) {
    issues.push(`Missing type prefix — expected one of: ${VALID_PREFIXES.join(", ")}`);
  } else {
    const [prefix, ...rest] = name.split("/");
    const description = rest.join("/");

    if (!VALID_PREFIXES.includes(prefix)) {
      issues.push(`Invalid prefix "${prefix}" — expected one of: ${VALID_PREFIXES.join(", ")}`);
    }

    if (!description) {
      issues.push("Missing description after prefix");
    } else {
      if (/[A-Z]/.test(description)) {
        issues.push("Description should be lowercase");
      }
      if (/\s/.test(description)) {
        issues.push("Description should not contain spaces — use hyphens");
      }
      if (/[_.]/.test(description)) {
        issues.push("Description should use hyphens, not underscores or dots");
      }
      if (description.startsWith("-") || description.endsWith("-")) {
        issues.push("Description should not start or end with a hyphen");
      }
      if (/--/.test(description)) {
        issues.push("Description should not contain consecutive hyphens");
      }
      if (description.length > 50) {
        issues.push(`Description is too long (${description.length} chars) — keep under 50`);
      }
    }
  }

  return { branch: name, valid: issues.length === 0, issues };
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  let branches: string[] = [];

  if (checkAll) {
    const raw = await run(["git", "branch", "--format", "%(refname:short)"]);
    branches = raw.split("\n").map((b) => b.trim()).filter(Boolean);
  } else if (filteredArgs.length > 0) {
    branches = [filteredArgs[0]];
  } else {
    const current = await run(["git", "branch", "--show-current"]);
    if (!current) {
      console.error("Error: not on a branch (detached HEAD)");
      process.exit(1);
    }
    branches = [current];
  }

  const results = branches.map(checkBranch);
  const hasIssues = results.some((r) => !r.valid);

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const r of results) {
      if (r.valid) {
        console.log(`OK: ${r.branch}`);
      } else {
        console.log(`FAIL: ${r.branch}`);
        for (const issue of r.issues) {
          console.log(`  - ${issue}`);
        }
      }
    }
  }

  if (hasIssues) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
