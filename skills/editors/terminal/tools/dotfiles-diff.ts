const args = Bun.argv.slice(2);

const HELP = `
dotfiles-diff — Compare local dotfiles against a dotfiles repo for drift detection

Usage:
  bun run tools/dotfiles-diff.ts <dotfiles-dir> [options]

Arguments:
  dotfiles-dir   Path to the dotfiles repository (e.g. ~/.dotfiles)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks these common dotfiles:
  .zshrc, .zshenv, .gitconfig, .gitignore_global, .tmux.conf,
  .config/starship.toml, .config/nvim/, .config/zed/

Examples:
  bun run tools/dotfiles-diff.ts ~/.dotfiles
  bun run tools/dotfiles-diff.ts ~/Developer/dotfiles --json
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface FileDiff {
  name: string;
  localPath: string;
  repoPath: string;
  status: "synced" | "modified" | "local-only" | "repo-only" | "missing-both";
}

interface DiffResult {
  dotfilesDir: string;
  homeDir: string;
  files: FileDiff[];
  synced: number;
  modified: number;
  localOnly: number;
  repoOnly: number;
}

// Common dotfiles to check, relative to home dir
const DOTFILES = [
  ".zshrc",
  ".zshenv",
  ".zprofile",
  ".bashrc",
  ".bash_profile",
  ".gitconfig",
  ".gitignore_global",
  ".tmux.conf",
  ".vimrc",
  ".config/starship.toml",
  ".config/alacritty/alacritty.toml",
  ".config/wezterm/wezterm.lua",
  ".config/ghostty/config",
];

async function fileContent(path: string): Promise<string | null> {
  try {
    return await Bun.file(path).text();
  } catch {
    return null;
  }
}

function findInRepo(repoDir: string, dotfileName: string): string {
  // Dotfiles repos often strip the leading dot or use a different structure
  // Try multiple conventions:
  // 1. Same name: .dotfiles/.zshrc
  // 2. Without dot: .dotfiles/zshrc
  // 3. In subdirectory: .dotfiles/zsh/.zshrc
  // 4. With home prefix: .dotfiles/home/.zshrc

  const variants = [
    `${repoDir}/${dotfileName}`,
    `${repoDir}/${dotfileName.replace(/^\./, "")}`,
    `${repoDir}/home/${dotfileName}`,
  ];

  // For .config/* files, also try without .config prefix
  if (dotfileName.startsWith(".config/")) {
    const subpath = dotfileName.replace(".config/", "");
    variants.push(`${repoDir}/config/${subpath}`);
    variants.push(`${repoDir}/${subpath}`);
  }

  return variants[0]; // Primary path — we'll check all in the compare step
}

async function compareDotfile(
  homeDir: string,
  repoDir: string,
  name: string
): Promise<FileDiff> {
  const localPath = `${homeDir}/${name}`;
  const localContent = await fileContent(localPath);

  // Try multiple repo conventions
  const repoPaths = [
    `${repoDir}/${name}`,
    `${repoDir}/${name.replace(/^\./, "")}`,
    `${repoDir}/home/${name}`,
  ];

  if (name.startsWith(".config/")) {
    repoPaths.push(`${repoDir}/config/${name.replace(".config/", "")}`);
    repoPaths.push(`${repoDir}/${name.replace(".config/", "")}`);
  }

  let repoContent: string | null = null;
  let foundRepoPath = repoPaths[0];

  for (const rp of repoPaths) {
    const content = await fileContent(rp);
    if (content !== null) {
      repoContent = content;
      foundRepoPath = rp;
      break;
    }
  }

  let status: FileDiff["status"];
  if (localContent !== null && repoContent !== null) {
    status = localContent === repoContent ? "synced" : "modified";
  } else if (localContent !== null && repoContent === null) {
    status = "local-only";
  } else if (localContent === null && repoContent !== null) {
    status = "repo-only";
  } else {
    status = "missing-both";
  }

  return {
    name,
    localPath,
    repoPath: foundRepoPath,
    status,
  };
}

async function main() {
  const homeDir = process.env.HOME || "~";
  const dotfilesDir = filteredArgs[0].replace(/^~/, homeDir);
  const resolvedDir = Bun.resolveSync(dotfilesDir, process.cwd());

  const diffs: FileDiff[] = [];
  for (const name of DOTFILES) {
    const diff = await compareDotfile(homeDir, resolvedDir, name);
    if (diff.status !== "missing-both") {
      diffs.push(diff);
    }
  }

  const result: DiffResult = {
    dotfilesDir: resolvedDir,
    homeDir,
    files: diffs,
    synced: diffs.filter((d) => d.status === "synced").length,
    modified: diffs.filter((d) => d.status === "modified").length,
    localOnly: diffs.filter((d) => d.status === "local-only").length,
    repoOnly: diffs.filter((d) => d.status === "repo-only").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Dotfiles Drift Check`);
    console.log(`  Home:     ${homeDir}`);
    console.log(`  Repo:     ${resolvedDir}\n`);

    console.log(`  Synced:     ${result.synced}`);
    console.log(`  Modified:   ${result.modified}`);
    console.log(`  Local only: ${result.localOnly}`);
    console.log(`  Repo only:  ${result.repoOnly}\n`);

    for (const d of diffs) {
      const icon =
        d.status === "synced" ? "=" :
          d.status === "modified" ? "~" :
            d.status === "local-only" ? "+" :
              "-";
      console.log(`  [${icon}] ${d.name}`);
    }

    const modified = diffs.filter((d) => d.status === "modified");
    if (modified.length > 0) {
      console.log("\nTo see changes for modified files:");
      for (const d of modified) {
        console.log(`  diff "${d.localPath}" "${d.repoPath}"`);
      }
    }

    if (result.modified === 0 && result.localOnly === 0 && result.repoOnly === 0) {
      console.log("\nAll dotfiles are in sync.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
