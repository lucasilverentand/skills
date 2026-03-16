const args = Bun.argv.slice(2);

const HELP = `
nvim-config-diff — Diff local Neovim config against a remote or backup version

Usage:
  bun run tools/nvim-config-diff.ts <compare-dir> [options]

Arguments:
  compare-dir   Directory to compare against (e.g. dotfiles repo nvim dir)

Options:
  --config <path>  Path to local Neovim config (default: ~/.config/nvim)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Examples:
  bun run tools/nvim-config-diff.ts ~/.dotfiles/nvim
  bun run tools/nvim-config-diff.ts ~/backup/nvim --config ~/.config/nvim
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const configIdx = args.indexOf("--config");
const homeDir = process.env.HOME || "~";
const localDir = configIdx !== -1
  ? args[configIdx + 1].replace(/^~/, homeDir)
  : `${homeDir}/.config/nvim`;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== configIdx + 1
);

interface FileDiff {
  path: string;
  status: "added" | "removed" | "modified" | "identical";
  localSize?: number;
  compareSize?: number;
}

interface DiffResult {
  localDir: string;
  compareDir: string;
  files: FileDiff[];
  added: number;
  removed: number;
  modified: number;
  identical: number;
}

async function listFiles(dir: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const glob = new Bun.Glob("**/*.{lua,vim,json,toml}");

  try {
    for await (const path of glob.scan({ cwd: dir, absolute: false })) {
      // Skip common non-config dirs
      if (path.includes("plugin/packer_compiled") || path.includes(".git/")) continue;
      const content = await Bun.file(`${dir}/${path}`).text();
      files.set(path, content);
    }
  } catch {
    // Directory doesn't exist
  }

  return files;
}

async function main() {
  const compareDir = filteredArgs[0]?.replace(/^~/, homeDir);
  if (!compareDir) {
    console.error("Error: missing required argument <compare-dir>");
    process.exit(1);
  }

  const resolvedCompare = Bun.resolveSync(compareDir, process.cwd());

  const localFiles = await listFiles(localDir);
  const compareFiles = await listFiles(resolvedCompare);

  const allPaths = new Set([...localFiles.keys(), ...compareFiles.keys()]);
  const diffs: FileDiff[] = [];

  for (const path of [...allPaths].sort()) {
    const localContent = localFiles.get(path);
    const compareContent = compareFiles.get(path);

    if (localContent && !compareContent) {
      diffs.push({
        path,
        status: "added",
        localSize: localContent.length,
      });
    } else if (!localContent && compareContent) {
      diffs.push({
        path,
        status: "removed",
        compareSize: compareContent.length,
      });
    } else if (localContent !== compareContent) {
      diffs.push({
        path,
        status: "modified",
        localSize: localContent!.length,
        compareSize: compareContent!.length,
      });
    } else {
      diffs.push({
        path,
        status: "identical",
      });
    }
  }

  const result: DiffResult = {
    localDir,
    compareDir: resolvedCompare,
    files: diffs,
    added: diffs.filter((d) => d.status === "added").length,
    removed: diffs.filter((d) => d.status === "removed").length,
    modified: diffs.filter((d) => d.status === "modified").length,
    identical: diffs.filter((d) => d.status === "identical").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Comparing Neovim config:`);
    console.log(`  Local:   ${localDir}`);
    console.log(`  Compare: ${resolvedCompare}\n`);

    console.log(`Files: ${allPaths.size} total`);
    console.log(`  Identical: ${result.identical}`);
    console.log(`  Modified:  ${result.modified}`);
    console.log(`  Added (local only):   ${result.added}`);
    console.log(`  Removed (compare only): ${result.removed}\n`);

    const changes = diffs.filter((d) => d.status !== "identical");
    if (changes.length > 0) {
      console.log("Changes:");
      for (const d of changes) {
        const prefix = d.status === "added" ? "+" : d.status === "removed" ? "-" : "~";
        console.log(`  ${prefix} ${d.path}`);
      }

      console.log("\nTo see detailed diffs for modified files:");
      for (const d of diffs.filter((f) => f.status === "modified")) {
        console.log(`  diff "${localDir}/${d.path}" "${resolvedCompare}/${d.path}"`);
      }
    } else {
      console.log("Configs are identical.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
