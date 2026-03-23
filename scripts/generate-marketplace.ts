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

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { CATEGORY_OVERRIDES, BUNDLES } from "./plugin-config";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const SKILLS_DIR = resolve(REPO_ROOT, "skills");
const OUTPUT_PATH = resolve(REPO_ROOT, ".claude-plugin/marketplace.json");

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
  const skillNames = skills.map((s) => s.name).sort();
  const formatted = skillNames.join(", ");
  const label = pluginName.replace(/-/g, " ");
  return `${label.charAt(0).toUpperCase() + label.slice(1)} toolkit: ${formatted}`;
}

// --- Read current version ---

function readVersion(): string {
  if (existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
      if (existing.metadata?.version) return existing.metadata.version;
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
    name: "skills-of-luca",
    owner: {
      name: "Luca Silverentand",
      url: "https://github.com/lucasilverentand",
    },
    metadata: {
      description:
        "Development workflow skills: debugging, testing, deployment, documentation, editor configuration, git workflows, infrastructure, project scaffolding, research, security audits, and skill authoring.",
      version,
      homepage: "https://github.com/lucasilverentand/skills",
      repository: "https://github.com/lucasilverentand/skills",
      license: "MIT",
    },
    plugins,
    bundles,
  };

  const json = JSON.stringify(marketplace, null, 2) + "\n";

  console.log(`\nTotal: ${skills.length} skills in ${plugins.length} plugins, ${bundles.length} bundles (v${version})`);

  if (check) {
    if (!existsSync(OUTPUT_PATH)) {
      console.error("\nmarketplace.json does not exist. Run `bun run generate` to create it.");
      process.exit(1);
    }
    const existing = readFileSync(OUTPUT_PATH, "utf-8");
    if (existing === json) {
      console.log("\nmarketplace.json is up to date.");
      process.exit(0);
    } else {
      console.error("\nmarketplace.json is out of date. Run `bun run generate` to update it.");
      process.exit(1);
    }
  }

  if (dryRun) {
    console.log("\n--- dry run, would write: ---\n");
    console.log(json);
  } else {
    writeFileSync(OUTPUT_PATH, json);
    console.log(`\nWrote ${OUTPUT_PATH}`);
  }
}

// --- Main ---

const dryRun = process.argv.includes("--dry-run");
const check = process.argv.includes("--check");
generate(dryRun, check);
