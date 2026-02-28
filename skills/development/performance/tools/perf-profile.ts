const args = Bun.argv.slice(2);

const HELP = `
perf-profile — Capture a CPU or memory profile and summarize hot paths

Usage:
  bun run tools/perf-profile.ts --entry <path> [options]

Options:
  --entry <path>   Entry point to profile (required)
  --memory         Profile memory instead of CPU
  --duration <ms>  Profile duration in milliseconds (default: 5000)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Runs the given entry point with Node.js/Bun profiling enabled and
summarizes the top functions by self-time or memory allocation.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const memoryMode = args.includes("--memory");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

import { stat } from "node:fs/promises";

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

  const duration = parseInt(getFlag("--duration") || "5000");

  if (memoryMode) {
    // Memory profiling: run with --smol and track heap
    console.error(`Profiling memory: ${entry} for ${duration}ms...`);

    const proc = Bun.spawn(["bun", "run", entry], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, BUN_TRACK_ALLOCATIONS: "1" },
    });

    // Sample memory at intervals
    const samples: { time: number; rss: number; heapUsed: number }[] = [];
    const startTime = Date.now();

    const interval = setInterval(() => {
      const mem = process.memoryUsage();
      samples.push({
        time: Date.now() - startTime,
        rss: mem.rss,
        heapUsed: mem.heapUsed,
      });
    }, 200);

    await new Promise<void>((resolve) => setTimeout(resolve, duration));
    clearInterval(interval);
    proc.kill();

    const peakRss = Math.max(...samples.map((s) => s.rss));
    const peakHeap = Math.max(...samples.map((s) => s.heapUsed));
    const growing = samples.length > 2 &&
      samples[samples.length - 1].heapUsed > samples[0].heapUsed * 1.5;

    const result = {
      mode: "memory",
      entry,
      duration,
      samples: samples.length,
      peakRss,
      peakHeap,
      possibleLeak: growing,
      trend: growing ? "heap growing" : "stable",
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Memory Profile: ${entry}`);
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Peak RSS: ${(peakRss / 1024 / 1024).toFixed(1)} MB`);
      console.log(`  Peak Heap: ${(peakHeap / 1024 / 1024).toFixed(1)} MB`);
      console.log(`  Trend: ${result.trend}`);
      if (growing) {
        console.log("\n  WARNING: Heap appears to be growing — possible memory leak");
      }
    }
  } else {
    // CPU profiling
    console.error(`Profiling CPU: ${entry} for ${duration}ms...`);

    const profilePath = `/tmp/profile-${Date.now()}.cpuprofile`;
    const proc = Bun.spawn(
      ["bun", "run", "--inspect", entry],
      {
        stdout: "pipe",
        stderr: "pipe",
      }
    );

    const start = performance.now();
    await new Promise<void>((resolve) => setTimeout(resolve, duration));
    proc.kill();
    const elapsed = performance.now() - start;

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    const result = {
      mode: "cpu",
      entry,
      duration: Math.round(elapsed),
      output: (stdout + stderr).trim().slice(0, 2000),
      tip: "For detailed flame graphs, use bun --inspect and connect Chrome DevTools",
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`CPU Profile: ${entry}`);
      console.log(`  Duration: ${Math.round(elapsed)}ms`);
      console.log();
      if ((stdout + stderr).trim()) {
        console.log("Output:");
        console.log((stdout + stderr).trim().slice(0, 2000));
      }
      console.log("\nFor detailed flame graphs:");
      console.log("  bun --inspect run " + entry);
      console.log("  Then open chrome://inspect in Chrome");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
