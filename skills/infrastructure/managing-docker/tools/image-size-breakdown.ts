const args = Bun.argv.slice(2);

const HELP = `
image-size-breakdown — Analyze Docker image layers and identify the largest contributors

Usage:
  bun run tools/image-size-breakdown.ts <image> [options]

Arguments:
  <image>  Docker image name or ID to analyze

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

interface Layer {
  id: string;
  createdBy: string;
  size: number;
  sizeHuman: string;
}

interface ImageBreakdown {
  image: string;
  totalSize: string;
  totalBytes: number;
  layers: Layer[];
  suggestions: string[];
}

async function run(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

function humanSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

async function main() {
  const image = filteredArgs[0];
  if (!image) {
    console.error("Error: missing required <image> argument");
    process.exit(1);
  }

  // Get image history with sizes
  const historyResult = await run([
    "docker", "history", image, "--no-trunc", "--format", "{{.ID}}|{{.CreatedBy}}|{{.Size}}",
  ]);

  if (historyResult.exitCode !== 0) {
    console.error(`Error: could not inspect image "${image}" — ${historyResult.stderr}`);
    process.exit(1);
  }

  // Get total image size
  const inspectResult = await run([
    "docker", "image", "inspect", image, "--format", "{{.Size}}",
  ]);

  const totalBytes = parseInt(inspectResult.stdout, 10) || 0;

  const layers: Layer[] = [];
  for (const line of historyResult.stdout.split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("|");
    if (parts.length < 3) continue;

    const [id, createdBy, sizeStr] = parts;

    // Parse Docker size string (e.g., "45.3MB", "0B", "1.2kB")
    let sizeBytes = 0;
    const sizeMatch = sizeStr.trim().match(/^([\d.]+)\s*(B|kB|KB|MB|GB)$/i);
    if (sizeMatch) {
      const num = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();
      const multipliers: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
      sizeBytes = num * (multipliers[unit] || 1);
    }

    layers.push({
      id: id.trim().slice(0, 12),
      createdBy: createdBy.trim().replace(/\/bin\/sh -c (#\(nop\)\s+)?/, "").slice(0, 120),
      size: Math.round(sizeBytes),
      sizeHuman: humanSize(Math.round(sizeBytes)),
    });
  }

  // Generate suggestions
  const suggestions: string[] = [];
  const totalMB = totalBytes / (1024 * 1024);

  if (totalMB > 500) {
    suggestions.push("Image is over 500 MB — consider using Alpine base and multi-stage builds");
  } else if (totalMB > 200) {
    suggestions.push("Image is over 200 MB — review if all files are needed in the final stage");
  }

  const largeLayers = layers.filter((l) => l.size > 50 * 1024 * 1024);
  if (largeLayers.length > 0) {
    for (const l of largeLayers) {
      if (l.createdBy.includes("COPY") && l.createdBy.includes("node_modules")) {
        suggestions.push("Large node_modules layer — ensure --production flag on install");
      }
      if (l.createdBy.includes("apt-get") || l.createdBy.includes("apk add")) {
        suggestions.push("Large package install layer — add --no-cache (apk) or clean up apt lists");
      }
    }
  }

  const copyLayers = layers.filter((l) => l.createdBy.startsWith("COPY"));
  if (copyLayers.length === 1 && copyLayers[0].size > 100 * 1024 * 1024) {
    suggestions.push("Single large COPY layer — split into multiple COPY instructions for better caching");
  }

  const result: ImageBreakdown = {
    image,
    totalSize: humanSize(totalBytes),
    totalBytes,
    layers: layers.filter((l) => l.size > 0),
    suggestions,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Image: ${image}`);
    console.log(`Total size: ${result.totalSize}\n`);

    console.log("Layers (largest first):\n");
    const sorted = [...result.layers].sort((a, b) => b.size - a.size);
    for (const l of sorted) {
      const pct = totalBytes > 0 ? Math.round((l.size / totalBytes) * 100) : 0;
      const bar = "█".repeat(Math.max(1, Math.round(pct / 3)));
      console.log(`  ${l.sizeHuman.padStart(10)} ${bar} ${pct}%`);
      console.log(`  ${"".padStart(10)} ${l.createdBy}`);
      console.log();
    }

    if (suggestions.length > 0) {
      console.log("Suggestions:");
      for (const s of suggestions) {
        console.log(`  - ${s}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
