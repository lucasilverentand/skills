const args = Bun.argv.slice(2);

const HELP = `
rn-perf-profile — Parse a Hermes CPU profile and summarize hot paths for React Native

Usage:
  bun run tools/rn-perf-profile.ts <profile.cpuprofile> [options]
  bun run tools/rn-perf-profile.ts --help-capture

Options:
  --top <n>        Show top N functions by self-time (default: 20)
  --json           Output as JSON instead of plain text
  --help           Show this help message
  --help-capture   Show instructions for capturing a Hermes CPU profile

How to capture a profile:
  1. In your React Native app, call: Hermes.startSamplingProfiler()
  2. Reproduce the slow interaction
  3. Call: Hermes.stopSamplingProfiler() — this returns a JSON string
  4. Write the string to a file with extension .cpuprofile
  5. Pass that file to this tool

Alternatively, use Flipper's "Hermes Debugger (RN)" plugin to capture and export profiles.
`.trim();

const CAPTURE_HELP = `
How to capture a Hermes CPU profile:

── Option A: Programmatic (in-app) ──────────────────────────────────────
In your app code:
  import { HermesInternal } from 'hermes-engine'; // New Architecture
  // or: global.HermesInternal for Old Architecture

  // Start profiling
  HermesInternal.enableSamplingProfiler?.();

  // ... do the slow thing ...

  // Stop and get the profile
  const profile = HermesInternal.stopSamplingProfiler?.();
  // Write profile to a file (e.g., via expo-file-system):
  import * as FileSystem from 'expo-file-system';
  await FileSystem.writeAsStringAsync(
    FileSystem.documentDirectory + 'profile.cpuprofile',
    profile
  );
  // Then pull from device:
  //   adb pull /data/user/0/<package>/files/profile.cpuprofile ./
  //   xcrun simctl get_app_container booted <bundle-id> data

── Option B: Metro / dev tools ─────────────────────────────────────────
  1. Open the in-app developer menu (shake device or Cmd+D in simulator)
  2. Tap "Perf Monitor" to see live JS/UI thread FPS
  3. For detailed profiling, open the Hermes inspector:
     - In Metro, press 'j' to open the inspector
     - Or open chrome://inspect in Chrome while app is running

── Option C: Flipper ───────────────────────────────────────────────────
  1. Open Flipper (https://fbflipper.com)
  2. Connect your device/simulator
  3. Open "Hermes Debugger (RN)" plugin
  4. Click "Start" to begin profiling
  5. Click "Stop" and export the .cpuprofile file

Once you have the .cpuprofile file, run:
  bun run tools/rn-perf-profile.ts <path-to-profile.cpuprofile>
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

if (args.includes("--help-capture")) {
  console.log(CAPTURE_HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const topN = parseInt(getFlag("--top") || "20");
const profilePath = args.find((a) => !a.startsWith("--") && a !== getFlag("--top"));

interface HermesNode {
  id: number;
  callFrame: {
    functionName: string;
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
  hitCount?: number;
  children?: number[];
  selfTime?: number;
  totalTime?: number;
}

interface HermesProfile {
  nodes: HermesNode[];
  startTime: number;
  endTime: number;
  samples?: number[];
  timeDeltas?: number[];
}

interface ChromeCpuProfile {
  head?: HermesNode;
  nodes?: HermesNode[];
  startTime: number;
  endTime: number;
  samples?: number[];
  timeDeltas?: number[];
}

function flattenNodes(profile: ChromeCpuProfile): HermesNode[] {
  if (profile.nodes) return profile.nodes;
  // Legacy format with head node
  if (!profile.head) return [];
  const nodes: HermesNode[] = [];
  function walk(node: HermesNode) {
    nodes.push(node);
    for (const childId of node.children || []) {
      // In old format children are inline nodes, not IDs
      const child = (node as unknown as { childNodes?: HermesNode[] }).childNodes?.[childId];
      if (child) walk(child);
    }
  }
  walk(profile.head);
  return nodes;
}

function formatTime(micros: number): string {
  if (micros < 1000) return `${micros}µs`;
  if (micros < 1_000_000) return `${(micros / 1000).toFixed(1)}ms`;
  return `${(micros / 1_000_000).toFixed(2)}s`;
}

function isInternalFrame(name: string): boolean {
  return name === "(root)" || name === "(garbage collector)" || name === "(idle)" || name === "";
}

async function main() {
  if (!profilePath) {
    console.error("Error: profile path is required.");
    console.error("Usage: bun run tools/rn-perf-profile.ts <profile.cpuprofile>");
    console.error("Run with --help-capture to learn how to get a profile from your device.");
    process.exit(1);
  }

  const file = Bun.file(profilePath);
  if (!(await file.exists())) {
    console.error(`Error: file not found: ${profilePath}`);
    process.exit(1);
  }

  let raw: string;
  try {
    raw = await file.text();
  } catch (e) {
    console.error(`Error reading file: ${(e as Error).message}`);
    process.exit(1);
  }

  let profile: ChromeCpuProfile;
  try {
    profile = JSON.parse(raw);
  } catch {
    console.error("Error: file is not valid JSON. Make sure it is a .cpuprofile file.");
    process.exit(1);
  }

  const nodes = flattenNodes(profile);
  if (nodes.length === 0) {
    console.error("Error: no nodes found in profile. The profile may be in an unsupported format.");
    process.exit(1);
  }

  const totalDuration = profile.endTime - profile.startTime;

  // Compute self-time from samples
  const selfTimes = new Map<number, number>();

  if (profile.samples && profile.timeDeltas) {
    for (let i = 0; i < profile.samples.length; i++) {
      const nodeId = profile.samples[i];
      const delta = profile.timeDeltas[i] || 0;
      selfTimes.set(nodeId, (selfTimes.get(nodeId) || 0) + delta);
    }
  } else {
    // Fall back to hitCount if available
    for (const node of nodes) {
      if (node.hitCount) selfTimes.set(node.id, node.hitCount * 1000); // rough micros
    }
  }

  interface FunctionSummary {
    name: string;
    url: string;
    line: number;
    selfTime: number;
    selfPct: number;
  }

  const summaries: FunctionSummary[] = [];
  for (const node of nodes) {
    const selfTime = selfTimes.get(node.id) || 0;
    if (selfTime === 0) continue;
    const name = node.callFrame.functionName || "(anonymous)";
    if (isInternalFrame(name)) continue;
    summaries.push({
      name,
      url: node.callFrame.url || "",
      line: node.callFrame.lineNumber,
      selfTime,
      selfPct: totalDuration > 0 ? (selfTime / totalDuration) * 100 : 0,
    });
  }

  summaries.sort((a, b) => b.selfTime - a.selfTime);
  const top = summaries.slice(0, topN);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          profilePath,
          totalDuration,
          totalDurationFormatted: formatTime(totalDuration),
          nodeCount: nodes.length,
          topFunctions: top,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Hermes CPU Profile: ${profilePath}`);
    console.log(`  Duration: ${formatTime(totalDuration)}`);
    console.log(`  Nodes:    ${nodes.length}`);
    console.log();

    if (top.length === 0) {
      console.log("No function timing data found.");
      console.log("Ensure the profile was captured with sampling enabled.");
    } else {
      console.log(`Top ${top.length} functions by self-time:`);
      console.log(
        `  ${"Self Time".padEnd(12)} ${"Self %".padEnd(8)} Function`
      );
      console.log(`  ${"-".repeat(50)}`);
      for (const fn of top) {
        const pct = fn.selfPct.toFixed(1).padStart(5) + "%";
        const time = formatTime(fn.selfTime).padEnd(12);
        const loc = fn.url ? ` (${fn.url.split("/").pop()}:${fn.line})` : "";
        console.log(`  ${time} ${pct.padEnd(8)} ${fn.name}${loc}`);
      }
      console.log();
      console.log("Tip: Functions near the top are the best targets for optimization.");
      console.log("Tip: For flame graphs, open the .cpuprofile in Flipper or Chrome DevTools.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
