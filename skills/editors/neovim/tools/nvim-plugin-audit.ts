const args = Bun.argv.slice(2);

const HELP = `
nvim-plugin-audit — Check for outdated, unused, or conflicting Neovim plugins

Usage:
  bun run tools/nvim-plugin-audit.ts [config-dir] [options]

Arguments:
  config-dir   Path to Neovim config (default: ~/.config/nvim)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Examples:
  bun run tools/nvim-plugin-audit.ts
  bun run tools/nvim-plugin-audit.ts ~/.config/nvim
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface PluginInfo {
  name: string;
  shortName: string;
  file: string;
  line: number;
  hasConfig: boolean;
  dependencies: string[];
}

interface AuditResult {
  plugins: PluginInfo[];
  duplicates: string[][];
  conflicts: { plugin1: string; plugin2: string; reason: string }[];
  missingDeps: { plugin: string; missing: string }[];
  lazyLoaded: number;
  totalPlugins: number;
}

// Known conflicts between popular plugins
const KNOWN_CONFLICTS: [string, string, string][] = [
  ["nvim-lspconfig", "coc.nvim", "Both provide LSP client — use one or the other"],
  ["null-ls", "none-ls", "none-ls is a fork of null-ls — use only one"],
  ["prettier.nvim", "conform.nvim", "Both provide formatting — configure one as primary"],
  ["eslint.nvim", "none-ls", "Both can provide ESLint diagnostics — pick one approach"],
  ["packer.nvim", "lazy.nvim", "Both are plugin managers — use one or the other"],
  ["nvim-compe", "nvim-cmp", "nvim-compe is deprecated — use nvim-cmp"],
  ["telescope.nvim", "fzf-lua", "Both provide fuzzy finding — typically use one"],
];

async function findPluginFiles(configDir: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*.lua");
  const files: string[] = [];

  for await (const path of glob.scan({ cwd: configDir, absolute: true })) {
    files.push(path);
  }

  return files.sort();
}

function extractPlugins(content: string, filePath: string): PluginInfo[] {
  const plugins: PluginInfo[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match lazy.nvim plugin specs: "owner/repo" or { "owner/repo", ... }
    const lazyMatch = line.match(/["']([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)["']/);
    if (lazyMatch) {
      const fullName = lazyMatch[1];
      const shortName = fullName.split("/")[1];

      // Skip if this looks like a require path, not a plugin spec
      if (line.includes("require(") && !line.includes("{")) continue;

      // Check if there's config nearby
      const contextWindow = lines.slice(i, Math.min(i + 10, lines.length)).join("\n");
      const hasConfig = /config\s*=/.test(contextWindow) || /opts\s*=/.test(contextWindow);

      // Check for dependencies
      const deps: string[] = [];
      const depMatch = contextWindow.match(/dependencies\s*=\s*\{([^}]+)\}/);
      if (depMatch) {
        const depStr = depMatch[1];
        const depPattern = /["']([^"']+)["']/g;
        let dm: RegExpExecArray | null;
        while ((dm = depPattern.exec(depStr)) !== null) {
          deps.push(dm[1]);
        }
      }

      plugins.push({
        name: fullName,
        shortName,
        file: filePath,
        line: i + 1,
        hasConfig,
        dependencies: deps,
      });
    }
  }

  return plugins;
}

function auditPlugins(plugins: PluginInfo[]): AuditResult {
  // Find duplicates (same plugin referenced multiple times)
  const byShortName = new Map<string, PluginInfo[]>();
  for (const p of plugins) {
    const existing = byShortName.get(p.shortName) || [];
    existing.push(p);
    byShortName.set(p.shortName, existing);
  }

  const duplicates: string[][] = [];
  for (const [name, instances] of byShortName) {
    if (instances.length > 1) {
      duplicates.push(instances.map((i) => `${i.name} (${i.file}:${i.line})`));
    }
  }

  // Find conflicts
  const pluginNames = new Set(plugins.map((p) => p.shortName));
  const conflicts: AuditResult["conflicts"] = [];

  for (const [p1, p2, reason] of KNOWN_CONFLICTS) {
    if (pluginNames.has(p1) && pluginNames.has(p2)) {
      conflicts.push({ plugin1: p1, plugin2: p2, reason });
    }
  }

  // Find missing dependencies
  const missingDeps: AuditResult["missingDeps"] = [];
  for (const p of plugins) {
    for (const dep of p.dependencies) {
      const depShort = dep.split("/")[1] || dep;
      if (!pluginNames.has(depShort)) {
        missingDeps.push({ plugin: p.name, missing: dep });
      }
    }
  }

  const lazyLoaded = plugins.filter((p) => p.hasConfig).length;

  return {
    plugins,
    duplicates,
    conflicts,
    missingDeps,
    lazyLoaded,
    totalPlugins: plugins.length,
  };
}

async function main() {
  const homeDir = process.env.HOME || "~";
  const configDir = filteredArgs[0] || `${homeDir}/.config/nvim`;
  const resolvedDir = configDir.replace(/^~/, homeDir);

  const exists = await Bun.file(`${resolvedDir}/init.lua`).exists() ||
    await Bun.file(`${resolvedDir}/init.vim`).exists();

  if (!exists) {
    // Check for lua directory
    const luaExists = await Bun.file(`${resolvedDir}/lua`).exists().catch(() => false);
    if (!luaExists) {
      console.error(`Error: no Neovim config found at ${resolvedDir}`);
      process.exit(1);
    }
  }

  const files = await findPluginFiles(resolvedDir);
  const allPlugins: PluginInfo[] = [];

  for (const file of files) {
    const content = await Bun.file(file).text();
    const plugins = extractPlugins(content, file);
    allPlugins.push(...plugins);
  }

  // Deduplicate by full name (keep first occurrence)
  const seen = new Set<string>();
  const uniquePlugins = allPlugins.filter((p) => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });

  const result = auditPlugins(uniquePlugins);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Neovim Plugin Audit: ${resolvedDir}`);
    console.log(`Total plugins: ${result.totalPlugins}`);
    console.log(`With config: ${result.lazyLoaded}\n`);

    console.log("Plugins:");
    for (const p of result.plugins) {
      const config = p.hasConfig ? " [configured]" : "";
      console.log(`  ${p.name}${config}`);
      console.log(`    ${p.file}:${p.line}`);
    }

    if (result.duplicates.length > 0) {
      console.log(`\nDuplicates (${result.duplicates.length}):`);
      for (const dup of result.duplicates) {
        console.log(`  ${dup.join(" <-> ")}`);
      }
    }

    if (result.conflicts.length > 0) {
      console.log(`\nConflicts (${result.conflicts.length}):`);
      for (const c of result.conflicts) {
        console.log(`  ${c.plugin1} vs ${c.plugin2}`);
        console.log(`    ${c.reason}`);
      }
    }

    if (result.missingDeps.length > 0) {
      console.log(`\nMissing dependencies (${result.missingDeps.length}):`);
      for (const m of result.missingDeps) {
        console.log(`  ${m.plugin} requires ${m.missing}`);
      }
    }

    if (result.duplicates.length === 0 && result.conflicts.length === 0 && result.missingDeps.length === 0) {
      console.log("\nNo issues found.");
    }
  }

  if (result.conflicts.length > 0 || result.missingDeps.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
