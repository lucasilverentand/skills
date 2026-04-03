#!/usr/bin/env bun
/**
 * Generate marketplace.json by scanning the skills/ directory.
 *
 * Plugins are derived from the directory structure — each top-level directory
 * under skills/ becomes a plugin, and each SKILL.md found within becomes a
 * skill entry. No manual skill-to-plugin mapping needed.
 *
 * Usage: bun run scripts/generate-marketplace.ts [--dry-run] [--check]
 *
 * --dry-run: Print what would be written without writing
 * --check:   Exit 1 if marketplace.json is out of date (for CI)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { CATEGORY_OVERRIDES, BUNDLES, REPO_PLUGIN } from "./plugin-config";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const SKILLS_DIR = resolve(REPO_ROOT, "skills");
const CLAUDE_OUTPUT_PATH = resolve(REPO_ROOT, ".claude-plugin/marketplace.json");
const CODEX_OUTPUT_PATH = resolve(REPO_ROOT, ".codex-plugin/plugin.json");

// --- Frontmatter parser ---

function parseFrontmatter(content: string): { name: string; description: string } | null {
  const lines = content.split("\n");
  if (!lines.length || lines[0].trim() !== "---") return null;

  let endIdx: number | null = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
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

  if (!fm.name || !fm.description) return null;
  return { name: fm.name, description: fm.description };
}

// --- Discover skills ---

interface DiscoveredSkill {
  /** Relative path from skills/ dir, e.g. "git/committing" */
  relPath: string;
  /** Plugin name (top-level dir), e.g. "git" */
  plugin: string;
  /** Skill name from frontmatter */
  name: string;
  /** Skill description from frontmatter */
  description: string;
}

function discoverSkills(): DiscoveredSkill[] {
  const glob = new Bun.Glob("**/SKILL.md");
  const skills: DiscoveredSkill[] = [];

  for (const match of glob.scanSync({ cwd: SKILLS_DIR })) {
    const skillDir = dirname(match);
    const parts = skillDir.split("/");
    const plugin = parts[0]; // top-level dir = plugin name

    const content = readFileSync(resolve(SKILLS_DIR, match), "utf-8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      console.warn(`  WARN: ${match} has invalid frontmatter, skipping`);
      continue;
    }

    skills.push({
      relPath: skillDir,
      plugin,
      name: fm.name,
      description: fm.description,
    });
  }

  return skills.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

// --- Build plugin description from skills ---

function buildPluginDescription(pluginName: string, skills: DiscoveredSkill[]): string {
  const label = pluginName.replace(/-/g, " ");
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

  // Group skills by immediate subdirectory under the plugin
  const groups = new Map<string, string[]>();
  for (const skill of skills) {
    // relPath like "development/typescript/api" → relative is "typescript/api"
    const relative = skill.relPath.replace(`${pluginName}/`, "");
    const parts = relative.split("/");
    const group = parts.length > 1 ? parts[0] : "";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(skill.name);
  }

  // If only one group (flat or single subdir), list names directly
  if (groups.size <= 1) {
    const names = skills.map((s) => s.name).sort().join(", ");
    return `${capitalized} toolkit: ${names}`;
  }

  // Multiple groups — format as "Group (names), Group (names), top-level"
  const formatted: string[] = [];
  for (const [group, names] of [...groups.entries()].sort()) {
    const sorted = names.sort().join(", ");
    if (group === "") {
      formatted.push(sorted);
    } else {
      const groupLabel = group.charAt(0).toUpperCase() + group.slice(1);
      formatted.push(`${groupLabel} (${sorted})`);
    }
  }
  return `${capitalized} toolkit: ${formatted.join(", ")}`;
}

// --- Read current version ---

function readVersion(): string {
  for (const path of [CODEX_OUTPUT_PATH, CLAUDE_OUTPUT_PATH]) {
    if (!existsSync(path)) continue;
    try {
      const existing = JSON.parse(readFileSync(path, "utf-8"));
      if (existing.metadata?.version) return existing.metadata.version;
      if (existing.version) return existing.version;
    } catch {}
  }

  return "0.0.0";
}

// --- Generate ---

function generate(dryRun: boolean, check: boolean) {
  const skills = discoverSkills();
  const version = readVersion();

  // Group skills by plugin
  const pluginMap = new Map<string, DiscoveredSkill[]>();
  for (const skill of skills) {
    if (!pluginMap.has(skill.plugin)) pluginMap.set(skill.plugin, []);
    pluginMap.get(skill.plugin)!.push(skill);
  }

  const pluginNames = [...pluginMap.keys()].sort();
  let hasErrors = false;

  console.log(`Discovered ${skills.length} skills in ${pluginNames.length} plugins:\n`);

  for (const name of pluginNames) {
    const pluginSkills = pluginMap.get(name)!;
    console.log(`  ${name} (${pluginSkills.length} skills)`);
    for (const s of pluginSkills) {
      console.log(`    - ${s.relPath} [${s.name}]`);
    }
  }

  // Validate bundles reference valid plugins
  console.log(`\n${Object.keys(BUNDLES).length} bundles:\n`);
  for (const [bundleName, bundle] of Object.entries(BUNDLES)) {
    if (bundle.plugins.includes("*")) {
      console.log(`  ${bundleName}: all plugins — ${bundle.description}`);
      continue;
    }
    for (const p of bundle.plugins) {
      if (!pluginMap.has(p)) {
        console.error(`  ERROR: Bundle '${bundleName}' references unknown plugin '${p}'`);
        hasErrors = true;
      }
    }
    const skillCount = bundle.plugins.reduce(
      (sum, p) => sum + (pluginMap.get(p)?.length ?? 0),
      0,
    );
    console.log(`  ${bundleName}: ${bundle.plugins.length} plugins, ${skillCount} skills — ${bundle.description}`);
  }

  if (hasErrors) {
    console.error("\nErrors found — fix them before generating.");
    process.exit(1);
  }

  // Build output
  const plugins = pluginNames.map((name) => {
    const pluginSkills = pluginMap.get(name)!;
    return {
      name,
      source: "./",
      description: buildPluginDescription(name, pluginSkills),
      category: CATEGORY_OVERRIDES[name] ?? "devtools",
      skills: pluginSkills.map((s) => `./skills/${s.relPath}`),
      strict: false,
    };
  });

  const bundles = Object.entries(BUNDLES).map(([name, def]) => ({
    name,
    description: def.description,
    plugins: def.plugins,
  }));

  const marketplace = {
    name: REPO_PLUGIN.name,
    owner: REPO_PLUGIN.owner,
    metadata: {
      description: REPO_PLUGIN.description,
      version,
      homepage: REPO_PLUGIN.metadata.homepage,
      repository: REPO_PLUGIN.metadata.repository,
      license: REPO_PLUGIN.metadata.license,
    },
    plugins,
    bundles,
  };

  const claudeJson = JSON.stringify(marketplace, null, 2) + "\n";

  const codexPlugin = {
    name: REPO_PLUGIN.name,
    version,
    description: REPO_PLUGIN.description,
    author: REPO_PLUGIN.owner,
    homepage: REPO_PLUGIN.metadata.homepage,
    repository: REPO_PLUGIN.metadata.repository,
    license: REPO_PLUGIN.metadata.license,
    keywords: REPO_PLUGIN.codex.keywords,
    skills: "../skills/",
    interface: {
      ...REPO_PLUGIN.codex.interface,
      websiteURL: REPO_PLUGIN.metadata.homepage,
      screenshots: [],
    },
  };

  const codexJson = JSON.stringify(codexPlugin, null, 2) + "\n";

  console.log(`\nTotal: ${skills.length} skills in ${plugins.length} plugins, ${bundles.length} bundles (v${version})`);

  if (check) {
    const missing = [CLAUDE_OUTPUT_PATH, CODEX_OUTPUT_PATH].filter((path) => !existsSync(path));
    if (missing.length > 0) {
      console.error("\nGenerated metadata is missing. Run `bun run generate` to create the output files.");
      process.exit(1);
    }

    const mismatches = [
      { path: CLAUDE_OUTPUT_PATH, expected: claudeJson },
      { path: CODEX_OUTPUT_PATH, expected: codexJson },
    ].filter(({ path, expected }) => readFileSync(path, "utf-8") !== expected);

    if (mismatches.length === 0) {
      console.log("\nGenerated metadata is up to date.");
      process.exit(0);
    } else {
      console.error("\nGenerated metadata is out of date. Run `bun run generate` to update it.");
      process.exit(1);
    }
  }

  if (dryRun) {
    console.log("\n--- dry run, would write: ---\n");
    console.log(`# ${CLAUDE_OUTPUT_PATH}\n${claudeJson}`);
    console.log(`# ${CODEX_OUTPUT_PATH}\n${codexJson}`);
  } else {
    mkdirSync(dirname(CLAUDE_OUTPUT_PATH), { recursive: true });
    mkdirSync(dirname(CODEX_OUTPUT_PATH), { recursive: true });
    writeFileSync(CLAUDE_OUTPUT_PATH, claudeJson);
    writeFileSync(CODEX_OUTPUT_PATH, codexJson);
    console.log(`\nWrote ${CLAUDE_OUTPUT_PATH}`);
    console.log(`Wrote ${CODEX_OUTPUT_PATH}`);
  }
}

// --- Main ---

const dryRun = process.argv.includes("--dry-run");
const check = process.argv.includes("--check");
generate(dryRun, check);
