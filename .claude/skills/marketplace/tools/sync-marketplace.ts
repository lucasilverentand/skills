const args = Bun.argv.slice(2);

const HELP = `
sync-marketplace — Compare marketplace.json against skills on disk and optionally sync

Usage:
  bun run tools/sync-marketplace.ts [options]

Options:
  --fix     Auto-update marketplace.json to match disk state
  --json    Output as JSON
  --help    Show this help message

Reports:
  - Orphan skills: exist on disk but not in marketplace.json
  - Stale entries: in marketplace.json but not on disk
  - Plugin suggestions for orphan skills based on directory structure
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const autoFix = args.includes("--fix");
const jsonOutput = args.includes("--json");

interface SyncResult {
  orphans: { path: string; suggestedPlugin: string }[];
  stale: { path: string; plugin: string }[];
  matched: number;
}

function parseFrontmatter(content: string): Record<string, string> | null {
  const lines = content.split("\n");
  if (!lines.length || lines[0].trim() !== "---") return null;
  let endIdx: number | null = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { endIdx = i; break; }
  }
  if (endIdx === null) return null;
  const fm: Record<string, string> = {};
  for (const line of lines.slice(1, endIdx)) {
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#")) continue;
    const colonIdx = stripped.indexOf(":");
    if (colonIdx !== -1) {
      const key = stripped.slice(0, colonIdx).trim();
      const value = stripped.slice(colonIdx + 1).trim();
      if (value) fm[key] = value;
    }
  }
  return fm;
}

async function main() {
  const { existsSync, readFileSync, writeFileSync } = await import("node:fs");
  const { resolve, dirname, basename, relative } = await import("node:path");

  // Find repo root
  let dir = resolve(".");
  while (dir !== "/") {
    if (existsSync(resolve(dir, ".claude-plugin"))) break;
    dir = dirname(dir);
  }
  if (dir === "/" && !existsSync(resolve(dir, ".claude-plugin"))) {
    console.error("Error: could not find .claude-plugin directory");
    process.exit(1);
  }

  const marketplacePath = resolve(dir, ".claude-plugin/marketplace.json");

  // Bootstrap: create a minimal marketplace.json if it doesn't exist
  let data: Record<string, unknown>;
  if (!existsSync(marketplacePath)) {
    if (!autoFix) {
      console.error("Error: marketplace.json not found. Run with --fix to create it from disk.");
      process.exit(1);
    }
    const { mkdirSync } = await import("node:fs");
    mkdirSync(dirname(marketplacePath), { recursive: true });
    data = {
      name: basename(dir),
      owner: { name: "Unknown" },
      metadata: { version: "0.1.0" },
      plugins: [],
    };
  } else {
    data = JSON.parse(readFileSync(marketplacePath, "utf-8"));
  }

  const plugins = (data.plugins ?? []) as Array<Record<string, unknown>>;

  // Collect all skill paths from marketplace.json
  const marketplaceSkills = new Map<string, string>(); // path -> plugin name
  for (const plugin of plugins) {
    const name = plugin.name as string;
    const skills = (plugin.skills ?? []) as string[];
    for (const skillPath of skills) {
      marketplaceSkills.set(skillPath, name);
    }
  }

  // Scan disk for all SKILL.md files under plugins/
  const diskSkills = new Set<string>();
  const pluginsDir = resolve(dir, "plugins");
  if (existsSync(pluginsDir)) {
    const glob = new Bun.Glob("*/skills/*/SKILL.md");
    for (const match of glob.scanSync({ cwd: pluginsDir })) {
      const skillDir = dirname(match);
      const marketplacePath = `./plugins/${skillDir}`;
      diskSkills.add(marketplacePath);
    }

    // Also scan nested skill directories (plugins/X/skills/category/skill/)
    const deepGlob = new Bun.Glob("*/skills/*/*/SKILL.md");
    for (const match of deepGlob.scanSync({ cwd: pluginsDir })) {
      const skillDir = dirname(match);
      const marketplacePath = `./plugins/${skillDir}`;
      diskSkills.add(marketplacePath);
    }
  }

  const result: SyncResult = { orphans: [], stale: [], matched: 0 };

  // Find orphans (on disk, not in marketplace)
  for (const diskPath of diskSkills) {
    if (!marketplaceSkills.has(diskPath)) {
      // Suggest plugin based on directory structure: plugins/<plugin-name>/skills/...
      const parts = diskPath.split("/");
      const suggestedPlugin = parts[2] ?? "unknown"; // plugins/<this>/skills/...
      result.orphans.push({ path: diskPath, suggestedPlugin });
    } else {
      result.matched++;
    }
  }

  // Find stale entries (in marketplace, not on disk)
  for (const [mPath, pluginName] of marketplaceSkills) {
    const resolved = resolve(dir, mPath);
    if (!existsSync(resolved) || !existsSync(resolve(resolved, "SKILL.md"))) {
      result.stale.push({ path: mPath, plugin: pluginName });
    }
  }

  // Auto-fix
  if (autoFix && (result.orphans.length > 0 || result.stale.length > 0)) {
    // Remove stale entries
    for (const { path: stalePath } of result.stale) {
      for (const plugin of plugins) {
        const skills = plugin.skills as string[] | undefined;
        if (skills) {
          const idx = skills.indexOf(stalePath);
          if (idx !== -1) skills.splice(idx, 1);
        }
      }
    }

    // Add orphans to their suggested plugin
    for (const { path: orphanPath, suggestedPlugin } of result.orphans) {
      let targetPlugin = plugins.find(p => p.name === suggestedPlugin);

      if (!targetPlugin) {
        // Create new plugin entry
        targetPlugin = {
          name: suggestedPlugin,
          source: `./plugins/${suggestedPlugin}`,
          description: `Skills from ${suggestedPlugin}`,
          category: "devtools",
          skills: [],
          strict: false,
        };
        plugins.push(targetPlugin);
      }

      if (!targetPlugin.skills) targetPlugin.skills = [];
      (targetPlugin.skills as string[]).push(orphanPath);
    }

    // Sort everything
    plugins.sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
    for (const plugin of plugins) {
      if (Array.isArray(plugin.skills)) {
        (plugin.skills as string[]).sort();
      }
    }

    // Remove empty plugins
    data.plugins = plugins.filter(p => Array.isArray(p.skills) && (p.skills as unknown[]).length > 0);

    writeFileSync(marketplacePath, JSON.stringify(data, null, 2) + "\n");
  }

  // Report
  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.orphans.length === 0 && result.stale.length === 0) {
      console.log(`Marketplace is in sync. ${result.matched} skills matched.`);
    } else {
      if (result.orphans.length > 0) {
        console.log(`Orphan skills (on disk, not in marketplace):\n`);
        for (const o of result.orphans) {
          console.log(`  ${o.path}  (suggested plugin: ${o.suggestedPlugin})`);
        }
      }
      if (result.stale.length > 0) {
        if (result.orphans.length > 0) console.log();
        console.log(`Stale entries (in marketplace, not on disk):\n`);
        for (const s of result.stale) {
          console.log(`  ${s.path}  (plugin: ${s.plugin})`);
        }
      }
      console.log(`\n${result.matched} skills matched.`);
      if (autoFix) {
        console.log("\nAuto-fixed: updated marketplace.json.");
      } else {
        console.log("\nRun with --fix to auto-update marketplace.json.");
      }
    }
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
