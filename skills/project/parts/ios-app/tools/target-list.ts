const args = Bun.argv.slice(2);

const HELP = `
target-list — List all Tuist targets with bundle IDs and dependencies

Usage:
  bun run tools/target-list.ts [path] [options]

Arguments:
  path    Path to the iOS project (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface TargetInfo {
  name: string;
  product: string;
  bundleId: string | null;
  deploymentTarget: string | null;
  dependencies: string[];
  sources: string[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Find Project.swift
  const projectFile = Bun.file(`${root}/Project.swift`);
  if (!(await projectFile.exists())) {
    console.error("Error: no Project.swift found in " + root);
    console.error("This tool requires a Tuist project.");
    process.exit(1);
  }

  const content = await projectFile.text();
  const targets: TargetInfo[] = [];

  // Parse .target() definitions
  const targetRegex =
    /\.target\(\s*name:\s*"([^"]+)"[^)]*product:\s*\.(\w+)[^)]*bundleId:\s*"([^"]+)"[^)]*(?:deploymentTargets:\s*\.iOS\("([^"]+)"\))?/gs;

  let match;
  while ((match = targetRegex.exec(content)) !== null) {
    const name = match[1];
    const product = match[2];
    const bundleId = match[3];
    const deploymentTarget = match[4] || null;

    // Extract dependencies for this target
    const deps: string[] = [];
    const afterTarget = content.substring(match.index);
    const depsMatch = afterTarget.match(
      /dependencies:\s*\[([^\]]*)\]/s
    );
    if (depsMatch) {
      const depNames = depsMatch[1].matchAll(
        /\.target\(name:\s*"([^"]+)"\)/g
      );
      for (const d of depNames) {
        deps.push(d[1]);
      }
      const extDeps = depsMatch[1].matchAll(
        /\.external\(name:\s*"([^"]+)"\)/g
      );
      for (const d of extDeps) {
        deps.push(`(external) ${d[1]}`);
      }
    }

    // Extract sources
    const sourcesMatch = afterTarget.match(
      /sources:\s*\[([^\]]*)\]/
    );
    const sources = sourcesMatch
      ? sourcesMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) || []
      : [];

    targets.push({
      name,
      product,
      bundleId,
      deploymentTarget,
      dependencies: deps,
      sources,
    });
  }

  // Fallback: try simple name extraction if regex didn't match
  if (targets.length === 0) {
    const simpleNames = content.matchAll(/name:\s*"([^"]+)"/g);
    for (const m of simpleNames) {
      targets.push({
        name: m[1],
        product: "unknown",
        bundleId: null,
        deploymentTarget: null,
        dependencies: [],
        sources: [],
      });
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(targets, null, 2));
  } else {
    if (targets.length === 0) {
      console.log("No targets found in Project.swift.");
      return;
    }

    console.log("Tuist targets:\n");

    for (const t of targets) {
      const icon = t.product === "unitTests" ? "T" : t.product === "app" ? "A" : "L";
      console.log(`  [${icon}] ${t.name}`);
      if (t.bundleId) console.log(`      bundle: ${t.bundleId}`);
      if (t.deploymentTarget) console.log(`      iOS: ${t.deploymentTarget}+`);
      if (t.product !== "unknown") console.log(`      product: ${t.product}`);
      if (t.dependencies.length > 0) {
        console.log(`      deps: ${t.dependencies.join(", ")}`);
      }
    }

    console.log(`\n${targets.length} target(s) found.`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
