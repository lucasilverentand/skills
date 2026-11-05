#!/usr/bin/env bun
/**
 * Checks Cursor folder-discovered components (rules, agents, commands) for the
 * frontmatter Cursor requires. Manifests, marketplaces, and skill frontmatter
 * are already verified by `scripts/marketplace.ts`.
 */

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PLUGINS_DIR = join(ROOT, "plugins");

const components = [
	{ dir: "rules", kind: "rule", required: ["description"], exts: [".md", ".mdc", ".markdown"] },
	{ dir: "agents", kind: "agent", required: ["name", "description"], exts: [".md", ".mdc", ".markdown"] },
	{ dir: "commands", kind: "command", required: ["description"], exts: [".md", ".mdc", ".markdown", ".txt"] },
];

function parseFrontmatter(content: string): Record<string, string> | null {
	const normalized = content.replace(/\r\n/g, "\n");
	if (!normalized.startsWith("---\n")) return null;
	const end = normalized.indexOf("\n---\n", 4);
	if (end === -1) return null;
	const fields: Record<string, string> = {};
	for (const line of normalized.slice(4, end).split("\n")) {
		const sep = line.indexOf(":");
		if (sep === -1 || line.trim().startsWith("#")) continue;
		fields[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
	}
	return fields;
}

async function walk(dir: string): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(path)));
		else if (entry.isFile()) files.push(path);
	}
	return files;
}

const errors: string[] = [];

if (existsSync(PLUGINS_DIR)) {
	for (const plugin of await readdir(PLUGINS_DIR, { withFileTypes: true })) {
		if (!plugin.isDirectory()) continue;
		for (const { dir, kind, required, exts } of components) {
			const root = join(PLUGINS_DIR, plugin.name, dir);
			if (!existsSync(root)) continue;
			for (const file of await walk(root)) {
				if (!exts.includes(extname(file).toLowerCase())) continue;
				const rel = relative(ROOT, file);
				const fm = parseFrontmatter(await readFile(file, "utf-8"));
				if (!fm) {
					errors.push(`${plugin.name}: ${kind} file missing YAML frontmatter: ${rel}`);
					continue;
				}
				for (const key of required) {
					if (!fm[key]) errors.push(`${plugin.name}: ${kind} file missing "${key}" in frontmatter: ${rel}`);
				}
			}
		}
	}
}

if (errors.length > 0) {
	console.error("Cursor validation failed:");
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}
console.log("Cursor component validation passed.");
