const args = Bun.argv.slice(2);

const HELP = `
perf-trace — Generate a CPU flamegraph profile for root cause analysis

Usage:
  bun run tools/perf-trace.ts --entry <path> [options]

Options:
  --entry <path>    Entry point to profile (required)
  --duration <ms>   How long to run the profiler (default: 10000)
  --out <path>      Output path for the .cpuprofile file (default: .perf-trace.cpuprofile)
  --top <n>         Number of top hot functions to show in summary (default: 10)
  --json            Output result summary as JSON
  --help            Show this help message

Runs the entry point with CPU profiling enabled, writes a .cpuprofile file, and
prints the hottest call paths to help identify where time is being spent.

To view the flamegraph interactively:
  1. Open Chrome and go to chrome://inspect
  2. Click "Open dedicated DevTools for Node"
  3. Go to the Profiler tab and load the .cpuprofile file
  Or: open https://www.speedscope.app and drag the file in.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

import { stat, readFile } from "node:fs/promises";
import { resolve } from "node:path";

interface CpuProfileNode {
  id: number;
  callFrame: {
    functionName: string;
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
  children?: number[];
  hitCount?: number;
}

interface CpuProfile {
  nodes: CpuProfileNode[];
  samples?: number[];
  timeDeltas?: number[];
  startTime: number;
  endTime: number;
}

interface HotFunction {
  name: string;
  url: string;
  line: number;
  selfTime: number;
  selfPercent: number;
}

function summarizeProfile(profile: CpuProfile, topN: number): HotFunction[] {
  const nodeMap = new Map<number, CpuProfileNode>();
  for (const node of profile.nodes) {
    nodeMap.set(node.id, node);
  }

  // Count self-time hits per node from samples array
  const hitCounts = new Map<number, number>();
  if (profile.samples) {
    for (const nodeId of profile.samples) {
      hitCounts.set(nodeId, (hitCounts.get(nodeId) ?? 0) + 1);
    }
  } else {
    // Fall back to hitCount on nodes
    for (const node of profile.nodes) {
      if (node.hitCount && node.hitCount > 0) {
        hitCounts.set(node.id, node.hitCount);
      }
    }
  }

  const totalSamples = [...hitCounts.values()].reduce((a, b) => a + b, 0) || 1;
  const profileDuration = (profile.endTime - profile.startTime) / 1000; // microseconds → ms

  const functions: HotFunction[] = [];
  for (const [nodeId, hits] of hitCounts) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    const name = node.callFrame.functionName || "(anonymous)";
    // Skip runtime internals unless they are the top culprit
    if (name === "(program)" || name === "(garbage collector)") {
      functions.push({
        name,
        url: "",
        line: 0,
        selfTime: (hits / totalSamples) * profileDuration,
        selfPercent: (hits / totalSamples) * 100,
      });
      continue;
    }

    const url = node.callFrame.url || "";
    functions.push({
      name,
      url,
      line: node.callFrame.lineNumber + 1,
      selfTime: (hits / totalSamples) * profileDuration,
      selfPercent: (hits / totalSamples) * 100,
    });
  }

  return functions.sort((a, b) => b.selfPercent - a.selfPercent).slice(0, topN);
}

async function main() {
  const entry = getFlag("--entry");
  if (!entry) {
    console.error("Error: --entry <path> is required");
    process.exit(1);
  }

  try {
    await stat(entry);
  } catch {
    console.error(`Error: entry point not found: ${entry}`);
    process.exit(1);
  }

  const duration = parseInt(getFlag("--duration") || "10000");
  const topN = parseInt(getFlag("--top") || "10");
  const outPath = resolve(getFlag("--out") || ".perf-trace.cpuprofile");

  console.error(`Profiling: ${entry} for ${duration}ms...`);
  console.error(`Output: ${outPath}`);

  const proc = Bun.spawn(
    ["bun", "--cpu-prof", `--cpu-prof-name=${outPath}`, "run", entry],
    { stdout: "pipe", stderr: "pipe" }
  );

  await new Promise<void>((resolve) => setTimeout(resolve, duration));
  proc.kill();
  await proc.exited;

  // Attempt to parse and summarize the profile
  let hotFunctions: HotFunction[] = [];
  let parseError: string | null = null;

  try {
    const contents = await readFile(outPath, "utf8");
    const profile = JSON.parse(contents) as CpuProfile;
    hotFunctions = summarizeProfile(profile, topN);
  } catch (e) {
    parseError = e instanceof Error ? e.message : String(e);
  }

  const result = {
    entry,
    duration,
    profilePath: outPath,
    parseError,
    hotFunctions,
    viewerInstructions: [
      "Chrome DevTools: chrome://inspect → Profiler tab → Load file",
      "Speedscope: https://www.speedscope.app (drag and drop)",
    ],
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nCPU Trace: ${entry} (${duration}ms)`);
    console.log(`Profile saved: ${outPath}`);

    if (parseError) {
      console.log(`\nNote: Could not parse profile summary — ${parseError}`);
      console.log("Load the file manually in Chrome DevTools or Speedscope.");
    } else if (hotFunctions.length === 0) {
      console.log("\nNo sample data found in profile.");
      console.log("Try increasing --duration or ensure the entry point runs long enough.");
    } else {
      console.log(`\nTop ${hotFunctions.length} hot functions (by self-time):\n`);
      console.log("  Self%   Self(ms)  Function");
      console.log("  ------  --------  --------");
      for (const fn of hotFunctions) {
        const pct = fn.selfPercent.toFixed(1).padStart(5);
        const ms = fn.selfTime.toFixed(1).padStart(7);
        const loc = fn.url ? `  (${fn.url}:${fn.line})` : "";
        console.log(`  ${pct}%  ${ms}ms  ${fn.name}${loc}`);
      }
    }

    console.log("\nView flamegraph:");
    for (const tip of result.viewerInstructions) {
      console.log(`  ${tip}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
