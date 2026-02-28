const args = Bun.argv.slice(2);

const HELP = `
conflict-forecast — Detect files likely to conflict between two branches

Usage:
  bun run tools/conflict-forecast.ts <base> <target> [options]

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

interface ConflictRisk {
  path: string;
  risk: "high" | "medium" | "low";
  reason: string;
  baseChanges: number;
  targetChanges: number;
}

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

  // Find the merge base
  const mergeBase = await run(["git", "merge-base", base, target]);
  if (!mergeBase) {
    console.error(`Error: no common ancestor between ${base} and ${target}`);
    process.exit(1);
  }

  // Get files changed in base since merge-base
  const baseFilesRaw = await run(["git", "diff", "--name-only", `${mergeBase}..${base}`]);
  const baseFiles = new Set(baseFilesRaw ? baseFilesRaw.split("\n").filter(Boolean) : []);

  // Get files changed in target since merge-base
  const targetFilesRaw = await run(["git", "diff", "--name-only", `${mergeBase}..${target}`]);
  const targetFiles = new Set(targetFilesRaw ? targetFilesRaw.split("\n").filter(Boolean) : []);

  // Files changed in both branches are conflict candidates
  const bothChanged = [...baseFiles].filter((f) => targetFiles.has(f));

  if (bothChanged.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ base, target, mergeBase, risks: [], message: "No overlapping changes" }));
    } else {
      console.log(`No overlapping file changes between ${base} and ${target}. Merge should be clean.`);
    }
    process.exit(0);
  }

  // For each overlapping file, count the changed lines on each side
  const risks: ConflictRisk[] = [];

  for (const path of bothChanged) {
    const baseDiff = await run(["git", "diff", "--numstat", `${mergeBase}..${base}`, "--", path]);
    const targetDiff = await run(["git", "diff", "--numstat", `${mergeBase}..${target}`, "--", path]);

    const baseChanges = parseStat(baseDiff);
    const targetChanges = parseStat(targetDiff);

    let risk: "high" | "medium" | "low" = "low";
    let reason = "Both branches modify this file";

    if (baseChanges > 50 && targetChanges > 50) {
      risk = "high";
      reason = "Heavy modifications on both sides";
    } else if (baseChanges > 20 || targetChanges > 20) {
      risk = "medium";
      reason = "Significant changes on at least one side";
    }

    // Lockfiles are almost always conflicts
    if (path.endsWith(".lockb") || path.endsWith("package-lock.json") || path.endsWith("yarn.lock")) {
      risk = "high";
      reason = "Lockfile changed on both sides — regeneration needed";
    }

    risks.push({ path, risk, reason, baseChanges, targetChanges });
  }

  risks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });

  const result = { base, target, mergeBase, risks };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const highCount = risks.filter((r) => r.risk === "high").length;
    const medCount = risks.filter((r) => r.risk === "medium").length;

    console.log(`Conflict forecast: ${base} ← ${target}\n`);
    console.log(`  Merge base: ${mergeBase.slice(0, 8)}`);
    console.log(`  Overlapping files: ${risks.length}`);
    console.log(`  High risk: ${highCount}, Medium risk: ${medCount}\n`);

    for (const r of risks) {
      const label = r.risk === "high" ? "HIGH" : r.risk === "medium" ? "MED " : "LOW ";
      console.log(`  [${label}] ${r.path}`);
      console.log(`         ${r.reason} (base: ${r.baseChanges} lines, target: ${r.targetChanges} lines)`);
    }
  }
}

function parseStat(raw: string): number {
  if (!raw) return 0;
  const parts = raw.split("\t");
  const added = parseInt(parts[0], 10) || 0;
  const removed = parseInt(parts[1], 10) || 0;
  return added + removed;
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
