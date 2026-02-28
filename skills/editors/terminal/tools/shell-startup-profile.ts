const args = Bun.argv.slice(2);

const HELP = `
shell-startup-profile — Measure zsh startup time and identify slow plugins or scripts

Usage:
  bun run tools/shell-startup-profile.ts [options]

Options:
  --iterations <n>   Number of startup measurements (default: 5)
  --json             Output as JSON instead of plain text
  --help             Show this help message

Examples:
  bun run tools/shell-startup-profile.ts
  bun run tools/shell-startup-profile.ts --iterations 10
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const iterIdx = args.indexOf("--iterations");
const iterations = iterIdx !== -1 ? parseInt(args[iterIdx + 1]) : 5;

interface ProfileResult {
  averageMs: number;
  minMs: number;
  maxMs: number;
  measurements: number[];
  slowSources: { file: string; timeMs: number }[];
  suggestions: string[];
}

async function measureStartupTime(): Promise<number> {
  const start = performance.now();
  const proc = Bun.spawnSync(["zsh", "-i", "-c", "exit"], {
    timeout: 10_000,
    env: { ...process.env },
  });
  const elapsed = performance.now() - start;

  if (proc.exitCode !== 0) {
    console.error("Warning: zsh exited with non-zero code");
  }

  return Math.round(elapsed);
}

async function profileWithTracing(): Promise<{ file: string; timeMs: number }[]> {
  const tmpFile = `${process.env.TMPDIR || "/tmp"}/zsh-profile-${Date.now()}.log`;

  // Use zsh's ZPROF module for profiling
  const proc = Bun.spawnSync([
    "zsh", "-c",
    `zmodload zsh/zprof; source ~/.zshrc 2>/dev/null; zprof > "${tmpFile}"; exit`,
  ], {
    timeout: 15_000,
    env: { ...process.env },
  });

  const slowSources: { file: string; timeMs: number }[] = [];

  try {
    const content = await Bun.file(tmpFile).text();
    const lines = content.split("\n");

    // Parse zprof output — format: num  calls  time  self  name
    for (const line of lines) {
      const match = line.match(/^\s*\d+\)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(.+)/);
      if (match) {
        const totalMs = parseFloat(match[2]);
        const name = match[6].trim();
        if (totalMs > 5) {
          slowSources.push({ file: name, timeMs: Math.round(totalMs) });
        }
      }
    }

    // Clean up
    Bun.spawnSync(["rm", "-f", tmpFile]);
  } catch {
    // Profile file might not exist
  }

  return slowSources.sort((a, b) => b.timeMs - a.timeMs);
}

function generateSuggestions(
  avgMs: number,
  slowSources: { file: string; timeMs: number }[]
): string[] {
  const suggestions: string[] = [];

  if (avgMs > 500) {
    suggestions.push("Shell startup is very slow (>500ms). Consider the following optimizations:");
  } else if (avgMs > 200) {
    suggestions.push("Shell startup is somewhat slow (>200ms). Some optimizations may help:");
  }

  for (const source of slowSources) {
    const name = source.file.toLowerCase();
    if (name.includes("nvm")) {
      suggestions.push(`nvm is slow (${source.timeMs}ms) — replace with fnm: brew install fnm`);
    }
    if (name.includes("rbenv") || name.includes("rvm")) {
      suggestions.push(`${source.file} is slow (${source.timeMs}ms) — use lazy loading`);
    }
    if (name.includes("pyenv")) {
      suggestions.push(`pyenv is slow (${source.timeMs}ms) — use lazy loading or mise`);
    }
    if (name.includes("brew")) {
      suggestions.push(`brew shellenv is slow (${source.timeMs}ms) — cache output in .zshrc`);
    }
    if (name.includes("compinit")) {
      suggestions.push(`compinit is slow (${source.timeMs}ms) — add zcompdump caching`);
    }
  }

  if (suggestions.length === 0 && avgMs <= 200) {
    suggestions.push("Shell startup is fast. No optimizations needed.");
  }

  return suggestions;
}

async function main() {
  console.error("Measuring shell startup time...");

  const measurements: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const ms = await measureStartupTime();
    measurements.push(ms);
  }

  const avgMs = Math.round(measurements.reduce((a, b) => a + b, 0) / measurements.length);
  const minMs = Math.min(...measurements);
  const maxMs = Math.max(...measurements);

  console.error("Profiling shell sources...");
  const slowSources = await profileWithTracing();
  const suggestions = generateSuggestions(avgMs, slowSources);

  const result: ProfileResult = {
    averageMs: avgMs,
    minMs,
    maxMs,
    measurements,
    slowSources: slowSources.slice(0, 15),
    suggestions,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nShell Startup Profile (${iterations} iterations)`);
    console.log(`  Average: ${avgMs}ms`);
    console.log(`  Min:     ${minMs}ms`);
    console.log(`  Max:     ${maxMs}ms\n`);

    if (slowSources.length > 0) {
      console.log("Slowest sources:");
      for (const s of slowSources.slice(0, 10)) {
        console.log(`  ${s.timeMs}ms  ${s.file}`);
      }
      console.log();
    }

    console.log("Suggestions:");
    for (const s of suggestions) {
      console.log(`  - ${s}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
