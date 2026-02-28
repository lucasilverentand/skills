#!/usr/bin/env bun
/**
 * Generate marketplace.json from all SKILL.md files on disk.
 *
 * Scans all SKILL.md files under skills/, parses frontmatter, groups by
 * top-level category, and writes a valid .claude-plugin/marketplace.json.
 *
 * Usage: bun run scripts/generate-marketplace.ts [--dry-run]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";

// --- Config ---

const REPO_ROOT = resolve(import.meta.dirname, "..");
const SKILLS_DIR = resolve(REPO_ROOT, "skills");
const OUTPUT_PATH = resolve(REPO_ROOT, ".claude-plugin/marketplace.json");

/** Map top-level skill directories to marketplace plugin categories. */
const CATEGORY_MAP: Record<string, string> = {
  communication: "devtools",
  data: "devtools",
  deployment: "devtools",
  development: "devtools",
  documentation: "devtools",
  editors: "editor",
  git: "devtools",
  infrastructure: "devtools",
  project: "web-development",
  research: "devtools",
  security: "devtools",
  skills: "devtools",
};

/** Human-readable plugin descriptions keyed by category directory name. */
const PLUGIN_DESCRIPTIONS: Record<string, string> = {
  communication: "Communication platform integrations: Discord bots, webhooks, and channel management",
  data: "Data analysis and analytics toolkit: dashboards, metrics, and data pipelines",
  deployment: "Deployment toolkit: Cloudflare Workers, Kubernetes, and Railway deployments",
  development: "Development workflow toolkit: debugging, testing, refactoring, CI, planning, and more",
  documentation: "Documentation toolkit: READMEs, API references, internal docs, and contributor guides",
  editors: "Editor configuration toolkit: Neovim, VS Code, Zed, Xcode, and terminal setup",
  git: "Git workflow toolkit: committing, branching, conflicts, history, and worktrees",
  infrastructure: "Infrastructure toolkit: Docker, GitOps, and secrets management",
  project: "Project scaffolding toolkit: monorepo structure, workspace parts, and service templates",
  research: "Research toolkit: codebase analysis, API exploration, market research, and UX audits",
  security: "Security toolkit: vulnerability audits, dependency scanning, and security best practices",
  skills: "Skill management toolkit: authoring skills and managing the marketplace catalog",
};

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

// --- Scan & group ---

interface SkillEntry {
  path: string; // relative to repo root, e.g. "skills/git/committing"
  frontmatter: Frontmatter;
}

function discoverSkills(): Map<string, SkillEntry[]> {
  const grouped = new Map<string, SkillEntry[]>();
  const glob = new Bun.Glob("**/SKILL.md");

  for (const match of glob.scanSync({ cwd: SKILLS_DIR })) {
    const skillDir = dirname(match);
    const relativePath = `skills/${skillDir}`;
    const absolutePath = resolve(SKILLS_DIR, match);

    const content = readFileSync(absolutePath, "utf-8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      console.warn(`  skip: ${relativePath} (invalid or missing frontmatter)`);
      continue;
    }

    // Top-level category is the first path segment
    const category = skillDir.split("/")[0];

    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push({ path: relativePath, frontmatter: fm });
  }

  // Sort skills within each category for stable output
  for (const [, skills] of grouped) {
    skills.sort((a, b) => a.path.localeCompare(b.path));
  }

  return grouped;
}

// --- Generate ---

function generate(dryRun: boolean) {
  const grouped = discoverSkills();
  const categories = [...grouped.keys()].sort();

  console.log(`Found ${categories.length} categories:\n`);

  const plugins: Record<string, unknown>[] = [];

  for (const category of categories) {
    const skills = grouped.get(category)!;
    console.log(`  ${category} (${skills.length} skills)`);
    for (const s of skills) {
      console.log(`    - ${s.path} [${s.frontmatter.name}]`);
    }

    plugins.push({
      name: category,
      source: "./",
      description: PLUGIN_DESCRIPTIONS[category] ?? `Skills for ${category}`,
      category: CATEGORY_MAP[category] ?? "devtools",
      skills: skills.map((s) => `./${s.path}`),
      strict: false,
    });
  }

  const marketplace = {
    name: "skills-of-luca",
    owner: {
      name: "Luca Silverentand",
      url: "https://github.com/lucasilverentand",
    },
    metadata: {
      description:
        "Development workflow skills: debugging, testing, deployment, documentation, editor configuration, git workflows, infrastructure, project scaffolding, research, security audits, and skill authoring.",
      version: "0.2.0",
      homepage: "https://github.com/lucasilverentand/skills",
      repository: "https://github.com/lucasilverentand/skills",
      license: "MIT",
    },
    plugins,
  };

  const json = JSON.stringify(marketplace, null, 2) + "\n";

  console.log(`\nTotal: ${plugins.reduce((sum, p) => sum + (p.skills as string[]).length, 0)} skills in ${plugins.length} plugins`);

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
