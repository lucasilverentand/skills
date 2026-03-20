const args = Bun.argv.slice(2);

const HELP = `
pr-preflight — Check if a branch is ready to become a pull request

Usage:
  bun run tools/pr-preflight.ts [options]

Options:
  --check <area>  Run only a specific check: history, ci, all (default: all)
  --base <branch> Base branch to compare against (default: main)
  --json          Output as JSON
  --help          Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const checkArea = args.includes("--check")
  ? args[args.indexOf("--check") + 1] || "all"
  : "all";
const baseBranch = args.includes("--base")
  ? args[args.indexOf("--base") + 1] || "main"
  : "main";

async function run(cmd: string[]): Promise<{ stdout: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), exitCode };
}

interface Check {
  name: string;
  status: "pass" | "fail" | "warn" | "skip";
  message: string;
}

const CONVENTIONAL_PATTERN = /^(\w+)(\([\w./-]+\))?!?:\s.+$/;
const WIP_PATTERNS = [/^fixup!\s/, /^squash!\s/, /^wip[\s:]/i, /^WIP$/];
const ISSUE_PATTERN = /#\d+/;

async function checkCleanWorktree(): Promise<Check> {
  const { stdout } = await run(["git", "status", "--porcelain"]);
  const lines = stdout ? stdout.split("\n").filter(Boolean) : [];
  if (lines.length === 0) {
    return { name: "Clean worktree", status: "pass", message: "No uncommitted changes" };
  }
  return {
    name: "Clean worktree",
    status: "fail",
    message: `${lines.length} uncommitted file(s) — commit or stash before creating PR`,
  };
}

async function checkPushed(): Promise<Check> {
  const { stdout, exitCode } = await run([
    "git",
    "log",
    "--oneline",
    "@{upstream}..HEAD",
  ]);
  if (exitCode !== 0) {
    return {
      name: "Pushed",
      status: "fail",
      message: "Branch has no upstream — push with: git push -u origin <branch>",
    };
  }
  const unpushed = stdout ? stdout.split("\n").filter(Boolean) : [];
  if (unpushed.length === 0) {
    return { name: "Pushed", status: "pass", message: "All commits pushed to remote" };
  }
  return {
    name: "Pushed",
    status: "fail",
    message: `${unpushed.length} unpushed commit(s) — push before creating PR`,
  };
}

async function checkCommitMessages(): Promise<Check> {
  const { stdout } = await run([
    "git",
    "log",
    "--format=%s",
    `origin/${baseBranch}..HEAD`,
  ]);
  if (!stdout) {
    return {
      name: "Commit messages",
      status: "warn",
      message: "No commits found on this branch",
    };
  }
  const subjects = stdout.split("\n").filter(Boolean);
  const bad = subjects.filter((s) => !CONVENTIONAL_PATTERN.test(s));
  if (bad.length === 0) {
    return {
      name: "Commit messages",
      status: "pass",
      message: `All ${subjects.length} commit(s) follow conventional format`,
    };
  }
  return {
    name: "Commit messages",
    status: "fail",
    message: `${bad.length} commit(s) don't follow conventional format:\n${bad.map((b) => `  - "${b}"`).join("\n")}`,
  };
}

async function checkNoWip(): Promise<Check> {
  const { stdout } = await run([
    "git",
    "log",
    "--format=%s",
    `origin/${baseBranch}..HEAD`,
  ]);
  if (!stdout) {
    return { name: "No WIP/fixup", status: "pass", message: "No commits to check" };
  }
  const subjects = stdout.split("\n").filter(Boolean);
  const wip = subjects.filter((s) => WIP_PATTERNS.some((p) => p.test(s)));
  if (wip.length === 0) {
    return {
      name: "No WIP/fixup",
      status: "pass",
      message: "No WIP, fixup, or squash commits found",
    };
  }
  return {
    name: "No WIP/fixup",
    status: "fail",
    message: `${wip.length} WIP/fixup commit(s) need to be cleaned up:\n${wip.map((w) => `  - "${w}"`).join("\n")}`,
  };
}

async function checkCI(): Promise<Check> {
  const branch = (await run(["git", "branch", "--show-current"])).stdout;
  const { stdout, exitCode } = await run([
    "gh",
    "run",
    "list",
    "--branch",
    branch,
    "--limit",
    "1",
    "--json",
    "status,conclusion,name",
  ]);
  if (exitCode !== 0 || !stdout || stdout === "[]") {
    return {
      name: "CI status",
      status: "warn",
      message: "No CI runs found (gh CLI unavailable or no workflows configured)",
    };
  }
  try {
    const runs = JSON.parse(stdout);
    if (runs.length === 0) {
      return {
        name: "CI status",
        status: "warn",
        message: "No CI runs found for this branch",
      };
    }
    const latest = runs[0];
    if (latest.status === "completed" && latest.conclusion === "success") {
      return {
        name: "CI status",
        status: "pass",
        message: `CI passed: ${latest.name}`,
      };
    }
    if (latest.status === "in_progress" || latest.status === "queued") {
      return {
        name: "CI status",
        status: "warn",
        message: `CI still running: ${latest.name} (${latest.status})`,
      };
    }
    return {
      name: "CI status",
      status: "fail",
      message: `CI failed: ${latest.name} (${latest.conclusion})`,
    };
  } catch {
    return {
      name: "CI status",
      status: "warn",
      message: "Could not parse CI status",
    };
  }
}

async function checkLinkedIssues(): Promise<Check> {
  const { stdout } = await run([
    "git",
    "log",
    "--format=%s%n%b",
    `origin/${baseBranch}..HEAD`,
  ]);
  if (!stdout) {
    return {
      name: "Linked issues",
      status: "warn",
      message: "No commits to check",
    };
  }
  if (ISSUE_PATTERN.test(stdout)) {
    return {
      name: "Linked issues",
      status: "pass",
      message: "Found issue reference(s) in commit history",
    };
  }
  return {
    name: "Linked issues",
    status: "warn",
    message: "No issue references (#NNN) found in commit messages — consider linking an issue in the PR body",
  };
}

async function main() {
  const checks: Check[] = [];

  const shouldRun = (area: string) => checkArea === "all" || checkArea === area;

  if (shouldRun("history")) {
    checks.push(await checkCommitMessages());
    checks.push(await checkNoWip());
  }

  if (shouldRun("ci")) {
    checks.push(await checkCI());
  }

  if (checkArea === "all") {
    checks.push(await checkCleanWorktree());
    checks.push(await checkPushed());
    checks.push(await checkCommitMessages());
    checks.push(await checkNoWip());
    checks.push(await checkCI());
    checks.push(await checkLinkedIssues());
  }

  // Deduplicate (if --check all ran overlapping checks)
  const seen = new Set<string>();
  const unique = checks.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  const fails = unique.filter((c) => c.status === "fail");
  const warns = unique.filter((c) => c.status === "warn");
  const passes = unique.filter((c) => c.status === "pass");

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          ready: fails.length === 0,
          checks: unique,
          summary: {
            pass: passes.length,
            fail: fails.length,
            warn: warns.length,
          },
        },
        null,
        2,
      ),
    );
  } else {
    for (const check of unique) {
      const icon =
        check.status === "pass"
          ? "PASS"
          : check.status === "fail"
            ? "FAIL"
            : "WARN";
      console.log(`[${icon}] ${check.name}: ${check.message}`);
    }
    console.log("");
    if (fails.length === 0) {
      console.log(`Ready for PR (${passes.length} passed, ${warns.length} warning(s))`);
    } else {
      console.log(
        `Not ready: ${fails.length} issue(s) to fix, ${warns.length} warning(s)`,
      );
    }
  }

  if (fails.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
