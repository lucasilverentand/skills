#!/usr/bin/env bun
/**
 * Generate marketplace.json from plugin-config.ts.
 *
 * Reads plugin and bundle definitions from the config, validates that every
 * skill path exists on disk, warns about orphan skills, and writes a valid
 * .claude-plugin/marketplace.json with both plugins[] and bundles[].
 *
 * Usage: bun run scripts/generate-marketplace.ts [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { PLUGINS, BUNDLES } from "./plugin-config";

// --- Config ---

const REPO_ROOT = resolve(import.meta.dirname, "..");
const SKILLS_DIR = resolve(REPO_ROOT, "skills");
const OUTPUT_PATH = resolve(REPO_ROOT, ".claude-plugin/marketplace.json");

// --- Frontmatter parser ---

interface Frontmatter {
  name: string;
  description: string;
  [key: string]: string;
}

function parseFrontmatter(content: string): Frontmatter | null {
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
  return fm as Frontmatter;
}

// --- Validation & generation ---

function generate(dryRun: boolean) {
  const pluginNames = Object.keys(PLUGINS).sort();
  let totalSkills = 0;
  let hasErrors = false;

  console.log(`Found ${pluginNames.length} plugins:\n`);

  // Validate all skill paths exist and have valid frontmatter
  const allConfiguredSkills = new Set<string>();

  for (const name of pluginNames) {
    const plugin = PLUGINS[name];
    console.log(`  ${name} (${plugin.skills.length} skills)`);

    for (const skill of plugin.skills) {
      const skillMd = resolve(SKILLS_DIR, skill, "SKILL.md");

      if (!existsSync(skillMd)) {
        console.error(`    ERROR: ${skill}/SKILL.md does not exist`);
        hasErrors = true;
        continue;
      }

      const content = readFileSync(skillMd, "utf-8");
      const fm = parseFrontmatter(content);
      if (!fm) {
        console.warn(`    WARN: ${skill}/SKILL.md has invalid frontmatter`);
      } else {
        console.log(`    - ${skill} [${fm.name}]`);
      }

      if (allConfiguredSkills.has(skill)) {
        console.error(`    ERROR: ${skill} appears in multiple plugins`);
        hasErrors = true;
      }
      allConfiguredSkills.add(skill);
      totalSkills++;
    }
  }

  // Detect orphan skills (on disk but not in any plugin)
  const glob = new Bun.Glob("**/SKILL.md");
  const orphans: string[] = [];
  for (const match of glob.scanSync({ cwd: SKILLS_DIR })) {
    const skillDir = dirname(match);
    if (!allConfiguredSkills.has(skillDir)) {
      orphans.push(skillDir);
    }
  }

  if (orphans.length) {
    console.warn(`\nOrphan skills (on disk but not in any plugin):`);
    for (const o of orphans) {
      console.warn(`  - ${o}`);
    }
    hasErrors = true;
  }

  // Validate bundles
  console.log(`\nFound ${Object.keys(BUNDLES).length} bundles:\n`);
  for (const [bundleName, bundle] of Object.entries(BUNDLES)) {
    const resolvedPlugins = bundle.plugins.includes("*")
      ? pluginNames
      : bundle.plugins;

    for (const p of resolvedPlugins) {
      if (!(p in PLUGINS)) {
        console.error(`  ERROR: Bundle '${bundleName}' references unknown plugin '${p}'`);
        hasErrors = true;
      }
    }

    const skillCount = resolvedPlugins.reduce(
      (sum, p) => sum + (PLUGINS[p]?.skills.length ?? 0),
      0,
    );
    console.log(`  ${bundleName}: ${resolvedPlugins.length} plugins, ${skillCount} skills — ${bundle.description}`);
  }

  if (hasErrors) {
    console.error("\nErrors found — fix them before generating.");
    process.exit(1);
  }

  // Build output
  const plugins = pluginNames.map((name) => ({
    name,
    source: "./",
    description: PLUGINS[name].description,
    category: PLUGINS[name].category,
    skills: PLUGINS[name].skills.map((s) => `./skills/${s}`),
    strict: false,
  }));

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
      version: "0.3.0",
      homepage: "https://github.com/lucasilverentand/skills",
      repository: "https://github.com/lucasilverentand/skills",
      license: "MIT",
    },
    plugins,
    bundles,
  };

  const json = JSON.stringify(marketplace, null, 2) + "\n";

  console.log(`\nTotal: ${totalSkills} skills in ${plugins.length} plugins, ${bundles.length} bundles`);

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
generate(dryRun);
