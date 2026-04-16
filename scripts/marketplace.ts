#!/usr/bin/env bun
/**
 * Regenerates marketplace.json and each plugin.json from the folder structure on disk.
 *
 * What it discovers:
 *   - Skills:   plugins/<name>/skills/<skill>/SKILL.md
 *   - Commands: plugins/<name>/commands/<cmd>.md
 *
 * What it preserves (from existing plugin.json):
 *   - name, description, author
 *
 * Usage:
 *   bun scripts/generate-marketplace.ts          # dry-run — show what would change
 *   bun scripts/generate-marketplace.ts --write   # apply changes
 */

import { Glob } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const MARKETPLACE_PATH = resolve(ROOT, ".claude-plugin/marketplace.json");
const write = process.argv.includes("--write");

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

// ── Discover plugins ───────────────────────────────────────────────

const pluginDirs: string[] = [];
const pluginGlob = new Glob("*/.claude-plugin/plugin.json");
for await (const path of pluginGlob.scan({ cwd: PLUGINS_DIR, absolute: false, dot: true })) {
	pluginDirs.push(path.split("/")[0]);
}
pluginDirs.sort();

// ── Process each plugin ────────────────────────────────────────────

interface PluginJson {
	name: string;
	description: string;
	skills?: string[];
	commands?: string[];
	author: { name: string; email: string };
}

interface PluginUpdate {
	name: string;
	pluginJsonPath: string;
	oldContent: string;
	newContent: string;
	skills: string[];
	commands: string[];
}

const updates: PluginUpdate[] = [];

for (const dir of pluginDirs) {
	const pluginJsonPath = resolve(PLUGINS_DIR, dir, ".claude-plugin/plugin.json");
	const oldContent = await readFile(pluginJsonPath, "utf-8");
	const plugin: PluginJson = JSON.parse(oldContent);

	// Discover skills: directories under skills/ that contain SKILL.md
	const skills: string[] = [];
	const skillGlob = new Glob("skills/*/SKILL.md");
	for await (const path of skillGlob.scan({ cwd: resolve(PLUGINS_DIR, dir), absolute: false })) {
		// path = "skills/foo/SKILL.md" → "./skills/foo"
		skills.push(`./${path.replace("/SKILL.md", "")}`);
	}
	skills.sort();

	// Discover commands: .md files under commands/
	const commands: string[] = [];
	const cmdGlob = new Glob("commands/*.md");
	for await (const path of cmdGlob.scan({ cwd: resolve(PLUGINS_DIR, dir), absolute: false })) {
		commands.push(`./${path}`);
	}
	commands.sort();

	// Build updated plugin.json
	const updated: PluginJson = {
		name: plugin.name,
		description: plugin.description,
		skills,
	};
	if (commands.length > 0) {
		updated.commands = commands;
	}
	updated.author = plugin.author;

	const newContent = JSON.stringify(updated, null, "\t") + "\n";

	updates.push({
		name: plugin.name,
		pluginJsonPath,
		oldContent,
		newContent,
		skills,
		commands,
	});
}

// ── Generate marketplace.json ──────────────────────────────────────

const oldMarketplace = await readFile(MARKETPLACE_PATH, "utf-8");
let marketplace: Record<string, unknown>;
try {
	marketplace = JSON.parse(oldMarketplace);
} catch {
	console.log(`  ${yellow("warn")}  marketplace.json is invalid JSON — rebuilding from defaults`);
	marketplace = {
		name: "skills-of-luca",
		owner: { name: "Luca Silverentand", url: "https://github.com/lucasilverentand" },
		metadata: {
			version: "0.0.0",
			homepage: "https://github.com/lucasilverentand/skills",
			repository: "https://github.com/lucasilverentand/skills",
			license: "MIT",
		},
	};
}

marketplace.plugins = updates.map((u) => ({
	name: u.name,
	source: `./plugins/${u.name}`,
	category: "devtools",
}));

const newMarketplace = JSON.stringify(marketplace, null, "\t") + "\n";

// ── Report ─────────────────────────────────────────────────────────

let changes = 0;

for (const u of updates) {
	if (u.oldContent !== u.newContent) {
		changes++;
		const rel = relative(ROOT, u.pluginJsonPath);
		if (write) {
			await writeFile(u.pluginJsonPath, u.newContent);
			console.log(`  ${green("updated")}  ${rel}`);
		} else {
			console.log(`  ${yellow("changed")}  ${rel}`);
		}
	}
}

if (oldMarketplace !== newMarketplace) {
	changes++;
	const rel = relative(ROOT, MARKETPLACE_PATH);
	if (write) {
		await writeFile(MARKETPLACE_PATH, newMarketplace);
		console.log(`  ${green("updated")}  ${rel}`);
	} else {
		console.log(`  ${yellow("changed")}  ${rel}`);
	}
}

console.log("");
if (changes === 0) {
	console.log(green("Everything up to date."));
} else if (write) {
	console.log(green(`${changes} file(s) updated.`));
} else {
	console.log(bold(`${changes} file(s) to update.`));
	console.log(dim("Run with --write to apply changes."));
}
