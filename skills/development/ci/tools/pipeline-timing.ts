const args = Bun.argv.slice(2);

const HELP = `
pipeline-timing — Parse GitHub Actions workflow logs and report step durations

Usage:
  bun run tools/pipeline-timing.ts <log-file-or-dir> [options]

Options:
  --threshold <sec>   Only show steps slower than N seconds (default: 0)
  --json              Output as JSON instead of plain text
  --help              Show this help message

Parses GitHub Actions log output and produces a step-by-step duration breakdown,
identifying the slowest steps in the pipeline.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const thresholdIdx = args.indexOf("--threshold");
const threshold = thresholdIdx !== -1 ? parseInt(args[thresholdIdx + 1]) || 0 : 0;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (thresholdIdx === -1 || i !== thresholdIdx + 1)
);

interface StepTiming {
  name: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  durationFormatted: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function parseTimestamp(line: string): Date | null {
  // GitHub Actions log format: 2024-01-15T10:30:45.1234567Z ...
  const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/);
  if (match) return new Date(match[1]);

  // Also try common alternative: [2024-01-15 10:30:45]
  const altMatch = line.match(/^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]/);
  if (altMatch) return new Date(altMatch[1]);

  return null;
}

function parseStepName(line: string): string | null {
  // GitHub Actions step marker: ##[group]Step Name
  const groupMatch = line.match(/##\[group\](.+)/);
  if (groupMatch) return groupMatch[1].trim();

  // Run step: Run <command>
  const runMatch = line.match(/Run\s+(.+)/);
  if (runMatch && !runMatch[1].startsWith("##")) return `Run: ${runMatch[1].trim()}`;

  return null;
}

async function parseLogFile(filePath: string): Promise<StepTiming[]> {
  const steps: StepTiming[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return steps;

  const content = await file.text();
  const lines = content.split("\n");

  let currentStep: { name: string; startTime: Date } | null = null;

  for (const line of lines) {
    const timestamp = parseTimestamp(line);
    const stepName = parseStepName(line);

    if (stepName && timestamp) {
      // Close previous step
      if (currentStep) {
        const durationMs = timestamp.getTime() - currentStep.startTime.getTime();
        steps.push({
          name: currentStep.name,
          startTime: currentStep.startTime.toISOString(),
          endTime: timestamp.toISOString(),
          durationMs,
          durationFormatted: formatDuration(durationMs),
        });
      }
      currentStep = { name: stepName, startTime: timestamp };
    } else if (timestamp && currentStep) {
      // Update the end time to the last seen timestamp for the current step
      currentStep = { ...currentStep };
    }
  }

  // Close final step using last timestamp in file
  if (currentStep) {
    const lastTimestamp = lines
      .map(parseTimestamp)
      .filter(Boolean)
      .pop();
    if (lastTimestamp) {
      const durationMs = lastTimestamp.getTime() - currentStep.startTime.getTime();
      steps.push({
        name: currentStep.name,
        startTime: currentStep.startTime.toISOString(),
        endTime: lastTimestamp.toISOString(),
        durationMs,
        durationFormatted: formatDuration(durationMs),
      });
    }
  }

  // If no structured steps found, try a simpler heuristic: look for timestamp gaps
  if (steps.length === 0) {
    const timestamps: Array<{ time: Date; line: string; lineNum: number }> = [];
    for (let i = 0; i < lines.length; i++) {
      const ts = parseTimestamp(lines[i]);
      if (ts) timestamps.push({ time: ts, line: lines[i], lineNum: i });
    }

    if (timestamps.length >= 2) {
      for (let i = 1; i < timestamps.length; i++) {
        const durationMs = timestamps[i].time.getTime() - timestamps[i - 1].time.getTime();
        if (durationMs > 0) {
          steps.push({
            name: `Lines ${timestamps[i - 1].lineNum + 1}-${timestamps[i].lineNum + 1}`,
            startTime: timestamps[i - 1].time.toISOString(),
            endTime: timestamps[i].time.toISOString(),
            durationMs,
            durationFormatted: formatDuration(durationMs),
          });
        }
      }
    }
  }

  return steps;
}

async function parseWorkflowYaml(filePath: string): Promise<StepTiming[]> {
  // For YAML workflow files, analyze step structure (no timing, but provides step inventory)
  const file = Bun.file(filePath);
  if (!(await file.exists())) return [];

  const content = await file.text();
  const lines = content.split("\n");
  const steps: StepTiming[] = [];

  let inSteps = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s+steps:/.test(line)) {
      inSteps = true;
      continue;
    }
    if (inSteps) {
      const nameMatch = line.match(/^\s+-\s*name:\s*(.+)/);
      const usesMatch = line.match(/^\s+-?\s*uses:\s*(.+)/);
      const runMatch = line.match(/^\s+run:\s*(.+)/);

      if (nameMatch) {
        steps.push({
          name: nameMatch[1].trim(),
          startTime: "",
          endTime: "",
          durationMs: 0,
          durationFormatted: "N/A (from workflow file, no timing data)",
        });
      } else if (usesMatch && !steps.some((s) => s.name === usesMatch[1].trim())) {
        steps.push({
          name: `Action: ${usesMatch[1].trim()}`,
          startTime: "",
          endTime: "",
          durationMs: 0,
          durationFormatted: "N/A",
        });
      }
    }
  }

  return steps;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{log,txt,yml,yaml}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required log file or directory argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No log or workflow files found at the specified path");
    process.exit(1);
  }

  let allSteps: StepTiming[] = [];
  for (const file of files) {
    if (file.endsWith(".yml") || file.endsWith(".yaml")) {
      allSteps.push(...(await parseWorkflowYaml(file)));
    } else {
      allSteps.push(...(await parseLogFile(file)));
    }
  }

  // Filter by threshold
  if (threshold > 0) {
    allSteps = allSteps.filter((s) => s.durationMs >= threshold * 1000);
  }

  // Sort by duration descending
  allSteps.sort((a, b) => b.durationMs - a.durationMs);

  const totalMs = allSteps.reduce((sum, s) => sum + s.durationMs, 0);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          totalDurationMs: totalMs,
          totalFormatted: formatDuration(totalMs),
          steps: allSteps,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Pipeline Timing: ${allSteps.length} steps, total ${formatDuration(totalMs)}\n`);

    if (allSteps.length === 0) {
      console.log("No step timing data found.");
    } else {
      const maxNameLen = Math.min(60, Math.max(...allSteps.map((s) => s.name.length)));
      for (const step of allSteps) {
        const name = step.name.length > maxNameLen ? step.name.substring(0, maxNameLen - 3) + "..." : step.name;
        const pct = totalMs > 0 ? Math.round((step.durationMs / totalMs) * 100) : 0;
        const bar = "#".repeat(Math.max(1, Math.round(pct / 3)));
        console.log(
          `  ${name.padEnd(maxNameLen)}  ${step.durationFormatted.padStart(8)}  ${String(pct).padStart(3)}%  ${bar}`
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
