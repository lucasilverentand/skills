const args = Bun.argv.slice(2);

const HELP = `
rework-detector — Analyze git history for rework indicators that suggest skill gaps

Usage:
  bun run tools/rework-detector.ts [options]

Options:
  --days <n>         How many days back to analyze (default: 7)
  --min-churn <n>    Minimum commits touching same file to flag (default: 3)
  --json             Output as JSON
  --help             Show this help message

Analyzes recent git history for:
  - File churn: files changed in many commits within the time window
  - Fix-after-feat: fix: commits shortly after feat: commits on the same files
  - Reverts: revert commits indicating failed approaches
  - Rapid iteration: many commits in a short time span on the same files

Examples:
  bun run tools/rework-detector.ts --days 14
  bun run tools/rework-detector.ts --min-churn 5 --json
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

// ── Parse args ──

function getFlag(name: string, fallback: string): string {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
}

const daysBack = parseInt(getFlag("--days", "7"), 10);
const minChurn = parseInt(getFlag("--min-churn", "3"), 10);
const jsonOutput = args.includes("--json");

// ── Types ──

interface ReworkFinding {
  type: "churn" | "fix-after-feat" | "revert" | "rapid-iteration";
  files: string[];
  commits: string[];
  description: string;
  severity: "high" | "medium" | "low";
  suggestion: string;
}

interface CommitInfo {
  hash: string;
  date: string;
  timestamp: number;
  subject: string;
  files: string[];
}

// ── Main ──

async function main() {
  const { execSync } = await import("node:child_process");

  const since = `${daysBack}.days.ago`;

  // Get commit log with files
  let logOutput: string;
  try {
    logOutput = execSync(
      `git log --since="${since}" --pretty=format:"%H|%aI|%s" --name-only`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
    );
  } catch {
    console.error("Failed to read git log. Are you in a git repository?");
    process.exit(1);
  }

  const commits = parseGitLog(logOutput);

  if (commits.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ findings: [], commits: 0, daysBack }, null, 2));
    } else {
      console.log(`No commits found in the last ${daysBack} days.`);
    }
    process.exit(0);
  }

  const findings: ReworkFinding[] = [];

  // ── 1. File churn detection ──

  const fileCommitMap = new Map<string, CommitInfo[]>();
  for (const commit of commits) {
    for (const file of commit.files) {
      const existing = fileCommitMap.get(file) ?? [];
      existing.push(commit);
      fileCommitMap.set(file, existing);
    }
  }

  for (const [file, fileCommits] of fileCommitMap) {
    if (fileCommits.length >= minChurn) {
      // Skip common generated/config files
      if (isGeneratedFile(file)) continue;

      const severity =
        fileCommits.length >= minChurn * 2 ? "high" : fileCommits.length >= minChurn * 1.5 ? "medium" : "low";

      findings.push({
        type: "churn",
        files: [file],
        commits: fileCommits.map((c) => `${c.hash.slice(0, 7)} ${c.subject}`),
        description: `${file} was changed in ${fileCommits.length} commits within ${daysBack} days`,
        severity,
        suggestion: `High churn on ${file} — review if a skill could reduce trial-and-error here.`,
      });
    }
  }

  // ── 2. Fix-after-feat detection ──

  const featCommits = commits.filter((c) => /^feat[:(]/.test(c.subject));
  const fixCommits = commits.filter((c) => /^fix[:(]/.test(c.subject));

  for (const feat of featCommits) {
    const relatedFixes = fixCommits.filter((fix) => {
      // Fix came after the feat
      if (fix.timestamp <= feat.timestamp) return false;
      // Fix is within 48 hours of the feat
      const hoursDiff = (fix.timestamp - feat.timestamp) / (1000 * 60 * 60);
      if (hoursDiff > 48) return false;
      // Fix touches at least one of the same files
      return fix.files.some((f) => feat.files.includes(f));
    });

    if (relatedFixes.length > 0) {
      const allFiles = [...new Set([...feat.files, ...relatedFixes.flatMap((f) => f.files)])];
      findings.push({
        type: "fix-after-feat",
        files: allFiles,
        commits: [
          `${feat.hash.slice(0, 7)} ${feat.subject}`,
          ...relatedFixes.map((f) => `${f.hash.slice(0, 7)} ${f.subject}`),
        ],
        description: `feat "${feat.subject}" followed by ${relatedFixes.length} fix commit(s) on the same files`,
        severity: relatedFixes.length >= 3 ? "high" : relatedFixes.length >= 2 ? "medium" : "low",
        suggestion:
          "Feature needed quick fixes — a skill with better conventions or validation could prevent this.",
      });
    }
  }

  // ── 3. Revert detection ──

  const revertCommits = commits.filter((c) => /^revert[:(]|^Revert\s/i.test(c.subject));
  for (const revert of revertCommits) {
    findings.push({
      type: "revert",
      files: revert.files,
      commits: [`${revert.hash.slice(0, 7)} ${revert.subject}`],
      description: `Revert commit: ${revert.subject}`,
      severity: "medium",
      suggestion: "A reverted approach — review what went wrong and if a skill could guide better choices.",
    });
  }

  // ── 4. Rapid iteration detection ──

  // Find bursts: 5+ commits within 1 hour touching the same file
  const sortedCommits = [...commits].sort((a, b) => a.timestamp - b.timestamp);
  const seen = new Set<string>();

  for (let i = 0; i < sortedCommits.length; i++) {
    const windowEnd = sortedCommits[i].timestamp + 60 * 60 * 1000; // 1 hour
    const windowCommits = [sortedCommits[i]];

    for (let j = i + 1; j < sortedCommits.length && sortedCommits[j].timestamp <= windowEnd; j++) {
      windowCommits.push(sortedCommits[j]);
    }

    if (windowCommits.length >= 5) {
      // Find files that appear in 3+ of these commits
      const fileCounts = new Map<string, number>();
      for (const c of windowCommits) {
        for (const f of c.files) {
          fileCounts.set(f, (fileCounts.get(f) ?? 0) + 1);
        }
      }

      const hotFiles = [...fileCounts.entries()]
        .filter(([f, count]) => count >= 3 && !isGeneratedFile(f))
        .map(([f]) => f);

      if (hotFiles.length > 0) {
        const key = hotFiles.sort().join(",");
        if (!seen.has(key)) {
          seen.add(key);
          findings.push({
            type: "rapid-iteration",
            files: hotFiles,
            commits: windowCommits.map((c) => `${c.hash.slice(0, 7)} ${c.subject}`),
            description: `${windowCommits.length} commits within 1 hour touching ${hotFiles.join(", ")}`,
            severity: windowCommits.length >= 8 ? "high" : "medium",
            suggestion:
              "Rapid iteration burst — this area may need a skill for validation, linting, or better conventions.",
          });
        }
      }
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Output
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          daysBack,
          totalCommits: commits.length,
          findings,
          summary: {
            churn: findings.filter((f) => f.type === "churn").length,
            fixAfterFeat: findings.filter((f) => f.type === "fix-after-feat").length,
            reverts: findings.filter((f) => f.type === "revert").length,
            rapidIteration: findings.filter((f) => f.type === "rapid-iteration").length,
          },
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Analyzed ${commits.length} commits from the last ${daysBack} days.\n`);

    if (findings.length === 0) {
      console.log("No rework patterns detected.");
      return;
    }

    const byType = {
      churn: findings.filter((f) => f.type === "churn"),
      "fix-after-feat": findings.filter((f) => f.type === "fix-after-feat"),
      revert: findings.filter((f) => f.type === "revert"),
      "rapid-iteration": findings.filter((f) => f.type === "rapid-iteration"),
    };

    for (const [type, items] of Object.entries(byType)) {
      if (items.length === 0) continue;
      console.log(`## ${formatType(type)} (${items.length})\n`);
      for (const f of items) {
        console.log(`  [${f.severity.toUpperCase()}] ${f.description}`);
        console.log(`    Files: ${f.files.join(", ")}`);
        console.log(`    -> ${f.suggestion}\n`);
      }
    }
  }
}

// ── Helpers ──

function parseGitLog(output: string): CommitInfo[] {
  const commits: CommitInfo[] = [];
  const blocks = output.split("\n\n");

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;

    const headerLine = lines[0];
    const parts = headerLine.split("|");
    if (parts.length < 3) continue;

    const hash = parts[0];
    const date = parts[1];
    const subject = parts.slice(2).join("|"); // Subject might contain |
    const files = lines
      .slice(1)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.includes("|"));

    commits.push({
      hash,
      date,
      timestamp: new Date(date).getTime(),
      subject,
      files,
    });
  }

  return commits;
}

function isGeneratedFile(file: string): boolean {
  const generated = [
    "package-lock.json",
    "bun.lockb",
    "yarn.lock",
    "pnpm-lock.yaml",
    "Cargo.lock",
    ".claude-plugin/marketplace.json",
    "CHANGELOG.md",
  ];
  if (generated.includes(file)) return true;
  if (file.endsWith(".lock")) return true;
  if (file.endsWith(".min.js") || file.endsWith(".min.css")) return true;
  if (file.startsWith("dist/") || file.startsWith("build/") || file.startsWith(".next/")) return true;
  return false;
}

function formatType(type: string): string {
  switch (type) {
    case "churn":
      return "File Churn";
    case "fix-after-feat":
      return "Fix After Feature";
    case "revert":
      return "Reverts";
    case "rapid-iteration":
      return "Rapid Iteration";
    default:
      return type;
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
