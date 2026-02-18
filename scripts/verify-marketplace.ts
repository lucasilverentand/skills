#!/usr/bin/env bun
/**
 * Verify marketplace.json integrity and skill compliance.
 * Checks marketplace structure, skill paths, frontmatter, naming, and orphans.
 *
 * Usage: bun run scripts/verify-marketplace.ts [--json] [--fix] [marketplace.json]
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, relative, basename, dirname } from "node:path";
import { parseArgs } from "node:util";
import { globSync } from "node:fs";

// --- Constants ---

const REQUIRED_MARKETPLACE_FIELDS = ["name", "plugins"] as const;
const REQUIRED_PLUGIN_FIELDS = ["name", "source"] as const;
const RECOMMENDED_PLUGIN_FIELDS = ["description", "category"] as const;
const REQUIRED_FRONTMATTER_FIELDS = ["name", "description"] as const;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_SKILL_LINES = 500;
const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const GERUND_SUFFIXES = ["ing", "ment", "tion", "sion"];
const FIRST_PERSON_STARTS = ["i ", "we ", "my ", "our "];

// --- Types ---

interface Entry {
  severity: "error" | "warning";
  rule: string;
  message: string;
  path?: string;
  fix?: string;
}

// --- Report ---

class Report {
  errors: Entry[] = [];
  warnings: Entry[] = [];
  stats = { plugins_checked: 0, skills_checked: 0, skills_missing: 0, orphans_found: 0 };

  error(rule: string, message: string, path?: string, fix?: string) {
    this.errors.push({ severity: "error", rule, message, ...(path && { path }), ...(fix && { fix }) });
  }
  warning(rule: string, message: string, path?: string, fix?: string) {
    this.warnings.push({ severity: "warning", rule, message, ...(path && { path }), ...(fix && { fix }) });
  }
  passed() {
    return this.errors.length === 0;
  }

  toDict() {
    return { status: this.passed() ? "PASS" : "FAIL", errors: this.errors, warnings: this.warnings, stats: this.stats };
  }

  toTable() {
    const lines: string[] = [];
    lines.push("## Marketplace Validation Report", "", `Status: ${this.passed() ? "PASS" : "FAIL"}`, "");

    if (this.errors.length) {
      lines.push(`### Errors (${this.errors.length})`);
      for (const e of this.errors) {
        const p = e.path ? ` ${e.path}` : "";
        const f = e.fix ? `\n  Fix: ${e.fix}` : "";
        lines.push(`- [${e.rule}]${p} - ${e.message}${f}`);
      }
      lines.push("");
    }

    if (this.warnings.length) {
      lines.push(`### Warnings (${this.warnings.length})`);
      for (const w of this.warnings) {
        const p = w.path ? ` ${w.path}` : "";
        const f = w.fix ? `\n  Fix: ${w.fix}` : "";
        lines.push(`- [${w.rule}]${p} - ${w.message}${f}`);
      }
      lines.push("");
    }

    lines.push(
      "### Summary",
      `- Plugins checked: ${this.stats.plugins_checked}`,
      `- Skills checked: ${this.stats.skills_checked}`,
      `- Skills missing: ${this.stats.skills_missing}`,
      `- Orphans found: ${this.stats.orphans_found}`,
      `- Errors: ${this.errors.length}`,
      `- Warnings: ${this.warnings.length}`,
    );
    return lines.join("\n");
  }
}

// --- Frontmatter parser ---

function parseFrontmatter(content: string): { data: Record<string, string | string[]> | null; error: string | null } {
  const lines = content.split("\n");
  if (!lines.length || lines[0].trim() !== "---") return { data: null, error: "No YAML frontmatter found (missing opening ---)" };

  let endIdx: number | null = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { endIdx = i; break; }
  }
  if (endIdx === null) return { data: null, error: "Unclosed YAML frontmatter (missing closing ---)" };

  const fm: Record<string, string | string[]> = {};
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const line of lines.slice(1, endIdx)) {
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#")) continue;

    if (stripped.startsWith("- ") && currentKey && currentList !== null) {
      currentList.push(stripped.slice(2).trim());
      continue;
    }

    const colonIdx = stripped.indexOf(":");
    if (colonIdx !== -1) {
      if (currentKey && currentList !== null) fm[currentKey] = currentList;
      const key = stripped.slice(0, colonIdx).trim();
      const value = stripped.slice(colonIdx + 1).trim();
      currentKey = key;
      if (value) { fm[key] = value; currentList = null; }
      else currentList = [];
    }
  }
  if (currentKey && currentList !== null) fm[currentKey] = currentList;

  return { data: fm, error: null };
}

// --- Validators ---

function validateName(name: string, skillPath: string, skillMdPath: string, report: Report) {
  if (name.length > MAX_NAME_LENGTH) report.error("name-too-long", `Name '${name}' exceeds ${MAX_NAME_LENGTH} chars (${name.length})`, skillMdPath);
  if (!NAME_PATTERN.test(name)) report.error("invalid-name-format", `Name '${name}' must be lowercase letters, numbers, and hyphens only`, skillMdPath);
  if (name.includes("--")) report.error("consecutive-hyphens", `Name '${name}' contains consecutive hyphens`, skillMdPath);

  const firstWord = name.split("-")[0];
  if (!GERUND_SUFFIXES.some((s) => firstWord.endsWith(s))) {
    report.warning("non-gerund-name", `Name '${name}' first word '${firstWord}' doesn't appear to be gerund form`, skillMdPath);
  }

  const parts = skillPath.split("/");
  const dirName = parts.at(-1) ?? "";
  const parentDir = parts.length >= 2 ? parts.at(-2) ?? "" : "";
  const parentPrefixed = parentDir ? `${parentDir}-${dirName}` : "";
  if (name !== dirName && name !== parentPrefixed) {
    report.warning("name-mismatch", `Frontmatter name '${name}' doesn't match directory name '${dirName}' or '${parentPrefixed}'`, skillMdPath);
  }
}

function validateDescription(desc: string, skillMdPath: string, report: Report) {
  if (desc.length > MAX_DESCRIPTION_LENGTH) report.error("description-too-long", `Description exceeds ${MAX_DESCRIPTION_LENGTH} chars (${desc.length})`, skillMdPath);
  const lower = desc.toLowerCase().trim();
  if (FIRST_PERSON_STARTS.some((p) => lower.startsWith(p))) report.warning("first-person-description", "Description should be third-person (avoid 'I', 'We')", skillMdPath);
  if (!lower.includes("use when")) report.warning("missing-use-when", "Description should include 'Use when' trigger clause", skillMdPath);
}

function validateSkillMd(skillMdPath: string, skillPath: string, report: Report) {
  let content: string;
  try {
    content = readFileSync(skillMdPath, "utf-8");
  } catch (e) {
    report.error("read-error", `Cannot read ${skillMdPath}: ${e}`, skillMdPath);
    return;
  }

  const lineCount = content.split("\n").length;
  if (lineCount > MAX_SKILL_LINES) report.warning("skill-too-large", `SKILL.md is ${lineCount} lines (max ${MAX_SKILL_LINES})`, skillMdPath);

  const { data: fm, error: err } = parseFrontmatter(content);
  if (err) { report.error("invalid-frontmatter", err, skillMdPath); return; }
  if (!fm) { report.error("missing-frontmatter", "No frontmatter found", skillMdPath); return; }

  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!(field in fm)) report.error("missing-frontmatter-field", `Missing required frontmatter field: ${field}`, skillMdPath);
  }

  const name = fm.name;
  if (typeof name === "string" && name) validateName(name, skillPath, skillMdPath, report);
  const desc = fm.description;
  if (typeof desc === "string" && desc) validateDescription(desc, skillMdPath, report);
}

function validatePlugin(
  plugin: Record<string, unknown>,
  idx: number,
  allSkillPaths: Map<string, string>,
  report: Report,
  repoRoot: string,
) {
  report.stats.plugins_checked++;
  const pluginName = (plugin.name as string) || `plugin[${idx}]`;

  for (const field of REQUIRED_PLUGIN_FIELDS) {
    if (!(field in plugin)) report.error("required-field", `Plugin '${pluginName}': missing required field '${field}'`);
  }
  for (const field of RECOMMENDED_PLUGIN_FIELDS) {
    if (!(field in plugin)) report.warning("recommended-field", `Plugin '${pluginName}': missing recommended field '${field}'`);
  }

  const skills = plugin.skills;
  if (!Array.isArray(skills)) {
    report.error("invalid-type", `Plugin '${pluginName}': 'skills' must be an array`);
    return;
  }

  for (const skillPath of skills as string[]) {
    report.stats.skills_checked++;
    const normalized = skillPath.replace(/^\.\//, "");
    const skillMd = resolve(repoRoot, normalized, "SKILL.md");

    if (!existsSync(skillMd)) {
      report.stats.skills_missing++;
      report.error("missing-skill", `Skill path does not exist: ${skillPath}`, skillMd, `Remove '${skillPath}' from plugin '${pluginName}' or create ${skillMd}`);
      continue;
    }

    if (allSkillPaths.has(normalized)) {
      report.error("duplicate-path", `Skill path '${skillPath}' appears in both '${allSkillPaths.get(normalized)}' and '${pluginName}'`);
    }
    allSkillPaths.set(normalized, pluginName);
    validateSkillMd(skillMd, normalized, report);
  }
}

function findOrphanSkills(repoRoot: string, registeredPaths: Map<string, string>, report: Report) {
  const skillsDir = resolve(repoRoot, "skills");
  if (!existsSync(skillsDir)) return;

  // Use Bun.glob for finding SKILL.md files
  const glob = new Bun.Glob("**/SKILL.md");
  for (const match of glob.scanSync({ cwd: skillsDir })) {
    const skillDir = dirname(match);
    const normalized = `skills/${skillDir}`;
    if (!registeredPaths.has(normalized)) {
      report.stats.orphans_found++;
      report.warning("orphan-skill", `Skill exists on disk but not in marketplace.json: ${normalized}`, resolve(skillsDir, match), `Add './${normalized}' to a plugin in marketplace.json`);
    }
  }
}

function applyFixes(marketplacePath: string, data: Record<string, unknown>, repoRoot: string) {
  let fixed = false;
  const plugins = data.plugins as Array<Record<string, unknown>>;

  for (const plugin of plugins) {
    const skills = plugin.skills as string[];
    const valid = skills.filter((sp) => {
      const normalized = sp.replace(/^\.\//, "");
      const skillMd = resolve(repoRoot, normalized, "SKILL.md");
      if (existsSync(skillMd)) return true;
      console.log(`  Removed missing: ${sp} from ${plugin.name ?? "?"}`);
      fixed = true;
      return false;
    });
    plugin.skills = valid;
  }

  const originalCount = plugins.length;
  data.plugins = plugins.filter((p) => (p.skills as string[]).length > 0);
  if ((data.plugins as unknown[]).length < originalCount) {
    console.log(`  Removed ${originalCount - (data.plugins as unknown[]).length} empty plugins`);
    fixed = true;
  }

  if (fixed) {
    writeFileSync(marketplacePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`\n  Fixed marketplace.json written to ${marketplacePath}`);
  }
  return fixed;
}

// --- Main ---

function verify(marketplacePath: string, fix: boolean): Report {
  const report = new Report();
  const resolved = resolve(marketplacePath);
  const repoRoot = resolve(dirname(resolved), "..");

  if (!existsSync(resolved)) {
    report.error("file-not-found", `File not found: ${resolved}`);
    return report;
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(resolved, "utf-8"));
  } catch (e) {
    report.error("invalid-json", `Invalid JSON: ${e}`);
    return report;
  }

  for (const field of REQUIRED_MARKETPLACE_FIELDS) {
    if (!(field in data)) report.error("required-field", `Missing required field: ${field}`);
  }
  if ("plugins" in data && !Array.isArray(data.plugins)) {
    report.error("invalid-type", "Field 'plugins' must be an array");
  }

  const plugins = data.plugins;
  if (!Array.isArray(plugins)) return report;

  // Check unique names
  const seen = new Map<string, number>();
  for (let i = 0; i < plugins.length; i++) {
    const name = plugins[i].name as string;
    if (!name) continue;
    if (seen.has(name)) report.error("duplicate-plugin-name", `Plugin name '${name}' is used by plugins at index ${seen.get(name)} and ${i}`);
    seen.set(name, i);
  }

  const allSkillPaths = new Map<string, string>();
  for (let i = 0; i < plugins.length; i++) {
    validatePlugin(plugins[i], i, allSkillPaths, report, repoRoot);
  }

  findOrphanSkills(repoRoot, allSkillPaths, report);

  if (fix && !report.passed()) applyFixes(resolved, data, repoRoot);

  return report;
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    json: { type: "boolean", default: false },
    fix: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const path = positionals[0] ?? ".claude-plugin/marketplace.json";
const report = verify(path, values.fix ?? false);

if (values.json) {
  console.log(JSON.stringify(report.toDict(), null, 2));
} else {
  console.log(report.toTable());
}

process.exit(report.passed() ? 0 : 1);
