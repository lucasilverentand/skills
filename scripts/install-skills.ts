#!/usr/bin/env bun
/**
 * Installs canonical root-level skills into a local agent skill directory.
 *
 * Examples:
 *   bun scripts/install-skills.ts --target codex
 *   bun scripts/install-skills.ts --target claude creating-commits creating-prs
 *   bun scripts/install-skills.ts --target codex --symlink --force
 */

import { existsSync, lstatSync } from "node:fs";
import { cp, mkdir, readdir, rm, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SKILLS_DIR = resolve(ROOT, "skills");
const args = process.argv.slice(2);

const targetIndex = args.indexOf("--target");
const target = targetIndex === -1 ? "" : args[targetIndex + 1];
const force = args.includes("--force");
const link = args.includes("--symlink") || args.includes("--link");

const selected = args.filter((arg, index) => {
	if (arg === "--target" || args[index - 1] === "--target") return false;
	return !arg.startsWith("--");
});

function usage(): never {
	console.error(
		[
			"Usage:",
			"  bun scripts/install-skills.ts --target codex [--force] [--symlink] [skill...]",
			"  bun scripts/install-skills.ts --target claude [--force] [--symlink] [skill...]",
		].join("\n"),
	);
	process.exit(1);
}

if (target !== "codex" && target !== "claude") usage();

const destination =
	target === "codex"
		? join(homedir(), ".agents", "skills")
		: join(homedir(), ".claude", "skills");

async function allSkills(): Promise<string[]> {
	const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
}

async function installSkill(skill: string): Promise<"installed" | "skipped"> {
	const src = resolve(SKILLS_DIR, skill);
	const dest = resolve(destination, skill);
	if (!existsSync(src)) {
		throw new Error(`Unknown skill: ${skill}`);
	}

	if (existsSync(dest)) {
		const existing = lstatSync(dest);
		if (!force && !(link && existing.isSymbolicLink())) {
			console.log(`skipped  ${skill}  exists; rerun with --force to replace`);
			return "skipped";
		}
		await rm(dest, { recursive: true, force: true });
	}

	if (link) {
		await symlink(src, dest, "dir");
	} else {
		await cp(src, dest, { recursive: true, dereference: true });
	}
	console.log(`${link ? "linked" : "copied"}   ${skill}`);
	return "installed";
}

await mkdir(destination, { recursive: true });

const skills = selected.length > 0 ? selected : await allSkills();
let installed = 0;
let skipped = 0;

for (const skill of skills) {
	const result = await installSkill(skill);
	if (result === "installed") installed++;
	else skipped++;
}

console.log("");
console.log(`${installed} installed, ${skipped} skipped in ${destination}`);
