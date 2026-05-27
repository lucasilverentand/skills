#!/usr/bin/env bun
/**
 * Smoke-parse committed JSON config and generated manifests.
 */

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const errors: string[] = [];

async function parseJson(path: string): Promise<void> {
	const rel = path.replace(`${ROOT}/`, "");
	try {
		JSON.parse(await readFile(path, "utf-8"));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		errors.push(`${rel}: ${message}`);
	}
}

const staticPaths = [
	join(ROOT, "plugin-groups.json"),
	join(ROOT, ".claude-plugin/marketplace.json"),
	join(ROOT, ".agents/plugins/marketplace.json"),
];

for (const path of staticPaths) {
	if (existsSync(path)) await parseJson(path);
}

const pluginsDir = join(ROOT, "plugins");
if (existsSync(pluginsDir)) {
	for (const plugin of await readdir(pluginsDir, { withFileTypes: true })) {
		if (!plugin.isDirectory()) continue;
		const root = join(pluginsDir, plugin.name);
		for (const sub of [".codex-plugin/plugin.json", ".claude-plugin/plugin.json"]) {
			const path = join(root, sub);
			if (existsSync(path)) await parseJson(path);
		}
	}
}

if (errors.length > 0) {
	console.error("Invalid JSON:");
	for (const error of errors) console.error(`  ${error}`);
	process.exit(1);
}

console.log("All JSON files parse successfully.");
