const args = Bun.argv.slice(2);

const HELP = `
worker-size — Analyze Worker bundle size and flag oversized scripts

Usage:
  bun run tools/worker-size.ts [entry] [options]

Arguments:
  [entry]  Entry point to bundle (default: src/index.ts)

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
const entryPoint = filteredArgs[0] || "src/index.ts";

// Cloudflare Worker limits
const UNCOMPRESSED_LIMIT = 1 * 1024 * 1024; // 1 MB (free plan)
const COMPRESSED_LIMIT = 25 * 1024 * 1024; // 25 MB (paid plan compressed limit isn't typically hit)

function humanSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

async function main() {
  const file = Bun.file(entryPoint);
  if (!(await file.exists())) {
    console.error(`Error: entry point not found: ${entryPoint}`);
    console.error("Specify the entry point as the first argument.");
    process.exit(1);
  }

  // Use Bun's bundler to get the bundle size
  const tmpDir = `${import.meta.dir}/.tmp-bundle-${Date.now()}`;
  try {
    const result = await Bun.build({
      entrypoints: [entryPoint],
      outdir: tmpDir,
      target: "bun",
      minify: true,
    });

    if (!result.success) {
      console.error("Error: bundle failed:");
      for (const log of result.logs) {
        console.error(`  ${log}`);
      }
      process.exit(1);
    }

    // Read the bundled output
    let totalSize = 0;
    const outputs: { path: string; size: number }[] = [];

    for (const output of result.outputs) {
      const blob = output;
      const bytes = blob.size;
      totalSize += bytes;
      outputs.push({ path: output.path, size: bytes });
    }

    // Estimate gzip size (rough estimate: ~30-40% of original for JS)
    const estimatedGzipSize = Math.round(totalSize * 0.35);

    const overLimit = totalSize > UNCOMPRESSED_LIMIT;
    const warnings: string[] = [];

    if (overLimit) {
      warnings.push(`Bundle exceeds 1 MB uncompressed limit (${humanSize(totalSize)})`);
    }
    if (totalSize > 500 * 1024) {
      warnings.push("Large bundle may cause slow cold starts — consider code splitting or reducing dependencies");
    }

    // Analyze what's in node_modules vs source
    const sourceContent = await Bun.file(entryPoint).text();
    const importMatches = sourceContent.matchAll(/(?:import|require)\s*\(?['"]([@a-z][^'"]*)['"]\)?/g);
    const externalDeps = new Set<string>();
    for (const m of importMatches) {
      const dep = m[1].startsWith("@") ? m[1].split("/").slice(0, 2).join("/") : m[1].split("/")[0];
      if (!dep.startsWith(".") && !dep.startsWith("/")) {
        externalDeps.add(dep);
      }
    }

    const analysis = {
      entryPoint,
      bundleSize: totalSize,
      bundleSizeHuman: humanSize(totalSize),
      estimatedGzipSize,
      estimatedGzipHuman: humanSize(estimatedGzipSize),
      overLimit,
      uncompressedLimit: humanSize(UNCOMPRESSED_LIMIT),
      externalDependencies: [...externalDeps],
      warnings,
      outputs: outputs.map((o) => ({ ...o, sizeHuman: humanSize(o.size) })),
    };

    if (jsonOutput) {
      console.log(JSON.stringify(analysis, null, 2));
    } else {
      console.log(`Worker bundle analysis: ${entryPoint}\n`);
      console.log(`  Bundle size: ${analysis.bundleSizeHuman} (uncompressed)`);
      console.log(`  Est. gzip:   ${analysis.estimatedGzipHuman}`);
      console.log(`  Limit:       ${analysis.uncompressedLimit} (uncompressed)\n`);

      if (externalDeps.size > 0) {
        console.log(`  External dependencies (${externalDeps.size}):`);
        for (const dep of externalDeps) {
          console.log(`    ${dep}`);
        }
        console.log();
      }

      if (warnings.length > 0) {
        console.log("  Warnings:");
        for (const w of warnings) {
          console.log(`    - ${w}`);
        }
      } else {
        console.log("  OK: bundle is within limits.");
      }
    }

    if (overLimit) process.exit(1);
  } finally {
    // Clean up temp directory
    const proc = Bun.spawn(["rm", "-rf", tmpDir], { stdout: "pipe", stderr: "pipe" });
    await proc.exited;
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
