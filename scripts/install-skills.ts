#!/usr/bin/env bun
/**
 * Installs plugin-owned skills into a local agent skill directory.
 *
 * Examples:
 *   bun scripts/install-skills.ts --target codex
 *   bun scripts/install-skills.ts --target claude creating-commits creating-prs
 *   bun scripts/install-skills.ts --target codex --symlink --force git:creating-commits
 */

import { existsSync, lstatSync } from "node:fs";
import { cp, mkdir, readdir, rm, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const args = process.argv.slice(2);

const targetIndex = args.indexOf("--target");
const target = targetIndex === -1 ? "" : args[targetIndex + 1];
const force = args.includes("--force");
const link = args.includes("--symlink") || args.includes("--link");

const selected = args.filter((arg, index) => {
	if (arg === "--target" || args[index - 1] === "--target") return false;
	return !arg.startsWith("--");
});

interface SkillEntry {
	plugin: string;
	skill: string;
	path: string;
}

function usage(): never {
	console.error(
		[
			"Usage:",
			"  bun scripts/install-skills.ts --target codex [--force] [--symlink] [skill...]",
			"  bun scripts/install-skills.ts --target claude [--force] [--symlink] [skill...]",
			"",
			"Skill names can be plain names such as creating-commits, or plugin-qualified names such as git:creating-commits.",
		].join("\n"),
	);
	process.exit(1);
}

if (target !== "codex" && target !== "claude") usage();

const destination =
	target === "codex"
		? join(homedir(), ".agents", "skills")
		: join(homedir(), ".claude", "skills");

async function collectSkills(): Promise<Map<string, SkillEntry>> {
	const registry = new Map<string, SkillEntry>();
	if (!existsSync(PLUGINS_DIR)) return registry;

	const plugins = await readdir(PLUGINS_DIR, { withFileTypes: true });
	for (const plugin of plugins) {
		if (!plugin.isDirectory()) continue;
		const skillsRoot = resolve(PLUGINS_DIR, plugin.name, "skills");
		if (!existsSync(skillsRoot)) continue;

		const skills = await readdir(skillsRoot, { withFileTypes: true });
		for (const skill of skills) {
			if (!skill.isDirectory()) continue;
			const entry = {
				plugin: plugin.name,
				skill: skill.name,
				path: resolve(skillsRoot, skill.name),
			};
			if (!existsSync(resolve(entry.path, "SKILL.md"))) continue;
			const existing = registry.get(skill.name);
			if (existing) {
				throw new Error(
					`Duplicate skill "${skill.name}" in ${existing.plugin} and ${plugin.name}; use one owning plugin before direct install`,
				);
			}
			registry.set(skill.name, entry);
			registry.set(`${plugin.name}:${skill.name}`, entry);
			registry.set(`${plugin.name}/${skill.name}`, entry);
		}
	}

	return registry;
}

async function installSkill(entry: SkillEntry): Promise<"installed" | "skipped"> {
	const dest = resolve(destination, entry.skill);
	if (existsSync(dest)) {
		const existing = lstatSync(dest);
		if (!force && !(link && existing.isSymbolicLink())) {
			console.log(`skipped  ${entry.skill}  exists; rerun with --force to replace`);
			return "skipped";
		}
		await rm(dest, { recursive: true, force: true });
	}

	if (link) {
		await symlink(entry.path, dest, "dir");
	} else {
		await cp(entry.path, dest, { recursive: true, dereference: true });
	}
	console.log(`${link ? "linked" : "copied"}   ${entry.skill}  ${entry.plugin}`);
	return "installed";
}

await mkdir(destination, { recursive: true });

const registry = await collectSkills();
const names =
	selected.length > 0
		? selected
		: [...new Set([...registry.values()].map((entry) => entry.skill))].sort();

let installed = 0;
let skipped = 0;

for (const name of names) {
	const entry = registry.get(name);
	if (!entry) throw new Error(`Unknown skill: ${name}`);
	const result = await installSkill(entry);
	if (result === "installed") installed++;
	else skipped++;
}

console.log("");
console.log(`${installed} installed, ${skipped} skipped in ${destination}`);
