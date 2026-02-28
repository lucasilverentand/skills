const args = Bun.argv.slice(2);

const HELP = `
bundle-analyze — Analyze bundle size by module and identify large dependencies

Usage:
  bun run tools/bundle-analyze.ts [entry-point] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Runs the project's build tool with analysis enabled and reports the largest
modules and dependencies in the output bundle.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { stat, readdir } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

interface ModuleSize {
  path: string;
  size: number;
  gzip: number | null;
}

async function getDirectorySize(dir: string): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();

  async function walk(d: string) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        const s = await stat(full);
        sizes.set(relative(dir, full), s.size);
      }
    }
  }

  await walk(dir);
  return sizes;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function findBuildOutput(): Promise<string | null> {
  const candidates = ["dist", "build", ".output", "out", ".next"];
  for (const dir of candidates) {
    try {
      const s = await stat(dir);
      if (s.isDirectory()) return dir;
    } catch {
      // continue
    }
  }
  return null;
}

async function main() {
  // Try to run the build first
  const pkgFile = Bun.file("package.json");
  if (await pkgFile.exists()) {
    const pkg = await pkgFile.json();
    const buildScript = pkg.scripts?.build;
    if (buildScript) {
      console.error(`Running build: bun run build`);
      const buildProc = Bun.spawn(["bun", "run", "build"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      await buildProc.exited;
    }
  }

  const outputDir = filteredArgs[0] || (await findBuildOutput());
  if (!outputDir) {
    console.error(
      "Error: No build output directory found. Run the build first or specify the output directory."
    );
    process.exit(1);
  }

  const sizes = await getDirectorySize(resolve(outputDir));

  // Group by top-level directory and file extension
  const byExtension = new Map<string, number>();
  const modules: ModuleSize[] = [];

  for (const [path, size] of sizes) {
    const ext = path.split(".").pop() || "other";
    byExtension.set(ext, (byExtension.get(ext) || 0) + size);
    modules.push({ path, size, gzip: null });
  }

  // Sort by size descending
  modules.sort((a, b) => b.size - a.size);

  const totalSize = modules.reduce((s, m) => s + m.size, 0);
  const jsSize = modules
    .filter((m) => /\.(js|mjs|cjs)$/.test(m.path))
    .reduce((s, m) => s + m.size, 0);
  const cssSize = modules
    .filter((m) => m.path.endsWith(".css"))
    .reduce((s, m) => s + m.size, 0);

  // Check for known large dependencies by looking at node_modules in bundle
  const largeDeps: { name: string; size: number }[] = [];
  const depSizes = new Map<string, number>();
  for (const m of modules) {
    const nmMatch = m.path.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
    if (nmMatch) {
      const dep = nmMatch[1];
      depSizes.set(dep, (depSizes.get(dep) || 0) + m.size);
    }
  }
  for (const [name, size] of [...depSizes.entries()].sort((a, b) => b[1] - a[1])) {
    largeDeps.push({ name, size });
  }

  const result = {
    outputDir,
    totalSize,
    jsSize,
    cssSize,
    fileCount: modules.length,
    byExtension: Object.fromEntries(byExtension),
    largestFiles: modules.slice(0, 20).map((m) => ({
      path: m.path,
      size: m.size,
      formatted: formatSize(m.size),
    })),
    largeDependencies: largeDeps.slice(0, 10),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Bundle Analysis: ${outputDir}`);
    console.log(`  Total: ${formatSize(totalSize)} (${modules.length} files)`);
    console.log(`  JS:    ${formatSize(jsSize)}`);
    console.log(`  CSS:   ${formatSize(cssSize)}\n`);

    console.log("By extension:");
    for (const [ext, size] of [...byExtension.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  .${ext}: ${formatSize(size)}`);
    }

    console.log("\nLargest files:");
    for (const m of modules.slice(0, 15)) {
      console.log(`  ${formatSize(m.size).padStart(10)}  ${m.path}`);
    }

    if (largeDeps.length > 0) {
      console.log("\nLargest dependencies:");
      for (const dep of largeDeps.slice(0, 10)) {
        console.log(`  ${formatSize(dep.size).padStart(10)}  ${dep.name}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
