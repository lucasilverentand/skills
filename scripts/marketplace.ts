#!/usr/bin/env bun
/**
 * Regenerates marketplace manifests from plugin-owned skill packages.
 *
 * Source of truth:
 *   - plugins/<plugin>/skills/<skill>/SKILL.md
 *   - plugin-groups.json
 *
 * Generated output:
 *   - plugins/<plugin>/.claude-plugin/plugin.json
 *   - plugins/<plugin>/.codex-plugin/plugin.json
 *   - plugins/<plugin>/README.md
 *   - .claude-plugin/marketplace.json
 *   - .agents/plugins/marketplace.json
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const GROUPS_PATH = resolve(ROOT, "plugin-groups.json");
const CLAUDE_MARKETPLACE_PATH = resolve(ROOT, ".claude-plugin/marketplace.json");
const CODEX_MARKETPLACE_PATH = resolve(ROOT, ".agents/plugins/marketplace.json");
const OBSOLETE_ROOT_CODEX_PLUGIN_DIR = resolve(ROOT, ".codex-plugin");
const OBSOLETE_ROOT_SKILLS_DIR = resolve(ROOT, "skills");
const write = process.argv.includes("--write");

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

interface Owner {
	name: string;
	url?: string;
	email?: string;
}

interface PluginGroup {
	name: string;
	displayName: string;
	description: string;
	shortDescription: string;
	category: string;
	keywords?: string[];
	skills: string[];
	commands?: string[];
	readmeBody?: string;
	author: {
		name: string;
		email?: string;
		url?: string;
	};
}

interface PluginGroups {
	name: string;
	owner: Owner;
	metadata: {
		version: string;
		homepage?: string;
		repository?: string;
		license?: string;
	};
	plugins: PluginGroup[];
}

interface Change {
	path: string;
	reason: string;
}

const changes: Change[] = [];
const errors: string[] = [];

function json(data: unknown): string {
	return `${JSON.stringify(data, null, "\t")}\n`;
}

function rel(path: string): string {
	return relative(ROOT, path);
}

async function readJson<T>(path: string): Promise<T> {
	return JSON.parse(await readFile(path, "utf-8")) as T;
}

async function writeIfChanged(path: string, content: string): Promise<void> {
	const oldContent = existsSync(path) ? await readFile(path, "utf-8") : "";
	if (oldContent === content) return;

	changes.push({ path: rel(path), reason: existsSync(path) ? "changed" : "new" });
	if (!write) return;

	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content);
}

async function removeIfExists(path: string, reason: string): Promise<void> {
	if (!existsSync(path)) return;

	changes.push({ path: rel(path), reason });
	if (write) await rm(path, { recursive: true, force: true });
}

function pluginRoot(group: PluginGroup): string {
	return resolve(PLUGINS_DIR, group.name);
}

function skillDir(group: PluginGroup, skill: string): string {
	return resolve(pluginRoot(group), "skills", skill);
}

function skillLabel(group: PluginGroup, skill: string): string {
	return `plugins/${group.name}/skills/${skill}`;
}

function parseFrontmatter(content: string): Record<string, string> | null {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;

	const fields: Record<string, string> = {};
	for (const line of match[1].split("\n")) {
		const parts = line.match(/^(\w[\w-]*):\s*(.*)$/);
		if (!parts) continue;
		let value = parts[2].trim();
		if (
			(value.startsWith("\"") && value.endsWith("\"")) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		fields[parts[1]] = value;
	}
	return fields;
}

async function validateSkill(group: PluginGroup, skill: string): Promise<void> {
	const dir = skillDir(group, skill);
	const skillPath = resolve(dir, "SKILL.md");

	if (!existsSync(dir)) {
		errors.push(`plugin "${group.name}" references missing skill "${skill}" at ${skillLabel(group, skill)}`);
		return;
	}
	if (!existsSync(skillPath)) {
		errors.push(`${skillLabel(group, skill)} has no SKILL.md`);
		return;
	}

	const content = await readFile(skillPath, "utf-8");
	const fm = parseFrontmatter(content);
	if (!fm) {
		errors.push(`${skillLabel(group, skill)}/SKILL.md has no YAML frontmatter`);
		return;
	}
	if (fm.name && fm.name !== skill) {
		errors.push(`${skillLabel(group, skill)}/SKILL.md name "${fm.name}" does not match directory`);
	}
	if (!fm.description) {
		errors.push(`${skillLabel(group, skill)}/SKILL.md is missing description`);
	} else if (fm.description.length > 1024) {
		errors.push(`${skillLabel(group, skill)}/SKILL.md description exceeds 1024 characters`);
	}
}

async function validateGroups(groups: PluginGroups): Promise<void> {
	if (!groups.name || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(groups.name)) {
		errors.push("plugin-groups.json marketplace name must be kebab-case");
	}
	if (!groups.owner?.name) errors.push("plugin-groups.json owner.name is required");
	if (!groups.metadata?.version) errors.push("plugin-groups.json metadata.version is required");
	if (existsSync(OBSOLETE_ROOT_SKILLS_DIR)) {
		errors.push("root skills/ is not used; move skills into plugins/<plugin>/skills/<skill>");
	}

	const seenPlugins = new Set<string>();
	const skillOwners = new Map<string, string>();
	for (const group of groups.plugins) {
		if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(group.name)) {
			errors.push(`plugin "${group.name}" must use kebab-case`);
		}
		if (seenPlugins.has(group.name)) errors.push(`duplicate plugin "${group.name}"`);
		seenPlugins.add(group.name);

		if (!group.displayName) errors.push(`plugin "${group.name}" missing displayName`);
		if (!group.description) errors.push(`plugin "${group.name}" missing description`);
		if (!group.shortDescription) errors.push(`plugin "${group.name}" missing shortDescription`);
		if (!group.category) errors.push(`plugin "${group.name}" missing category`);
		if (!group.skills?.length) errors.push(`plugin "${group.name}" has no skills`);
		if (group.readmeBody && !existsSync(resolve(pluginRoot(group), group.readmeBody))) {
			errors.push(`plugin "${group.name}" readmeBody file is missing: ${group.readmeBody}`);
		}

		const localSeenSkills = new Set<string>();
		for (const skill of group.skills) {
			if (localSeenSkills.has(skill)) errors.push(`plugin "${group.name}" lists skill "${skill}" twice`);
			localSeenSkills.add(skill);

			const existingOwner = skillOwners.get(skill);
			if (existingOwner && existingOwner !== group.name) {
				errors.push(
					`skill "${skill}" is listed in both "${existingOwner}" and "${group.name}"; each skill needs one owning plugin`,
				);
			} else {
				skillOwners.set(skill, group.name);
			}

			await validateSkill(group, skill);
		}

		const skillsRoot = resolve(pluginRoot(group), "skills");
		if (existsSync(skillsRoot)) {
			const entries = await readdir(skillsRoot, { withFileTypes: true });
			for (const entry of entries) {
				if (entry.isDirectory() && !localSeenSkills.has(entry.name)) {
					errors.push(`${rel(resolve(skillsRoot, entry.name))} exists but is not listed in plugin-groups.json`);
				}
			}
		}

		for (const command of group.commands ?? []) {
			const commandPath = resolve(pluginRoot(group), "commands", `${command}.md`);
			if (!existsSync(commandPath)) {
				errors.push(`plugin "${group.name}" references missing command "${command}"`);
			}
		}
	}

	if (existsSync(PLUGINS_DIR)) {
		const pluginDirs = await readdir(PLUGINS_DIR, { withFileTypes: true });
		for (const entry of pluginDirs) {
			if (!entry.isDirectory()) continue;
			if (seenPlugins.has(entry.name)) continue;
			const skillsRoot = resolve(PLUGINS_DIR, entry.name, "skills");
			if (existsSync(skillsRoot)) {
				errors.push(`plugins/${entry.name}/skills exists but "${entry.name}" is not listed in plugin-groups.json`);
			}
		}
	}
}

function claudePluginManifest(group: PluginGroup, version: string, metadata: PluginGroups["metadata"]) {
	const manifest: Record<string, unknown> = {
		name: group.name,
		description: group.description,
		version,
		skills: group.skills.map((skill) => `./skills/${skill}`).sort(),
		author: group.author,
		homepage: metadata.homepage,
		repository: metadata.repository,
		license: metadata.license,
		keywords: group.keywords ?? [],
	};

	if (group.commands?.length) {
		manifest.commands = group.commands.map((command) => `./commands/${command}.md`).sort();
	}

	return manifest;
}

function codexPluginManifest(group: PluginGroup, version: string, metadata: PluginGroups["metadata"]) {
	return {
		name: group.name,
		version,
		description: group.description,
		author: group.author,
		homepage: metadata.homepage,
		repository: metadata.repository,
		license: metadata.license,
		keywords: group.keywords ?? [],
		skills: "./skills/",
		interface: {
			displayName: group.displayName,
			shortDescription: group.shortDescription,
			longDescription: group.description,
			developerName: group.author.name,
			category: group.category,
			capabilities: ["Read", "Write"],
			websiteURL: metadata.homepage,
			defaultPrompt: [
				`Use ${group.displayName} when the task matches one of its bundled skills.`,
			],
		},
	};
}

function claudeMarketplace(groups: PluginGroups) {
	return {
		name: groups.name,
		owner: groups.owner,
		description: "Reusable agent skills by Luca Silverentand.",
		version: groups.metadata.version,
		metadata: groups.metadata,
		plugins: groups.plugins.map((group) => ({
			name: group.name,
			source: `./plugins/${group.name}`,
			description: group.description,
			version: groups.metadata.version,
			author: group.author,
			category: group.category,
			keywords: group.keywords ?? [],
		})),
	};
}

function codexMarketplace(groups: PluginGroups) {
	return {
		name: groups.name,
		interface: {
			displayName: "Skills of Luca",
		},
		plugins: groups.plugins.map((group) => ({
			name: group.name,
			source: {
				source: "local",
				path: `./plugins/${group.name}`,
			},
			policy: {
				installation: "AVAILABLE",
				authentication: "ON_INSTALL",
			},
			category: group.category,
			interface: {
				displayName: group.displayName,
				shortDescription: group.shortDescription,
			},
		})),
	};
}

function marketplaceSource(metadata: PluginGroups["metadata"]): string {
	const match = metadata.repository?.match(/github\.com\/([^/]+\/[^/.#?]+)/);
	return match?.[1] ?? "owner/repo";
}

function pluginReadme(group: PluginGroup, marketplaceName: string, source: string, readmeBody = ""): string {
	const commandNote = group.commands?.length
		? `\nClaude Code also exposes legacy command shims for this plugin: ${group.commands.map((c) => `\`/${group.name}:${c}\``).join(", ")}. Prefer the portable skills above for Codex and other agents.\n`
		: "";
	const body = readmeBody.trim();
	const bodySection = body ? `\n${body}\n` : "";

	return `# ${group.displayName}
${group.description}

## Skills
${group.skills.map((skill) => `- \`${group.name}:${skill}\``).join("\n")}
${commandNote}
## Install
Codex:

\`\`\`bash
codex plugin marketplace add ${source}
\`\`\`

Claude Code:

\`\`\`text
/plugin marketplace add ${source}
/plugin install ${group.name}@${marketplaceName}
\`\`\`

This plugin owns its skill source under \`plugins/${group.name}/skills/\`. Edit those files directly, then run \`bun run marketplace:write\` to refresh generated manifests and marketplaces.
${bodySection}`;
}

async function validateRelativeRefs(root: string, label: string): Promise<void> {
	if (!existsSync(root)) return;

	const files = await walkMarkdown(root);
	const markdownLink = /\[([^\]]+)\]\(([^)#\s]+\.md)(#[^)\s]*)?\)/g;
	const backtickPath = /`((?:\.\.?\/)[^`]+)`/g;

	for (const file of files) {
		if (isTemplateReference(file)) continue;

		const content = stripFencedCode(await readFile(file, "utf-8"));
		const dir = dirname(file);

		for (const match of content.matchAll(markdownLink)) {
			const target = match[2];
			if (/^[a-z]+:/i.test(target)) continue;
			const resolved = resolve(dir, target);
			if (!existsSync(resolved)) {
				errors.push(`${label}: ${rel(file)} links to missing ${target}`);
			}
		}

		for (const match of content.matchAll(backtickPath)) {
			const target = match[1];
			if (target.includes("*") || target.includes("$")) continue;
			const resolved = resolve(dir, target);
			if (!existsSync(resolved)) {
				errors.push(`${label}: ${rel(file)} references missing ${target}`);
			}
		}
	}
}

function stripFencedCode(content: string): string {
	return content.replace(/^(```|~~~)[\s\S]*?^\1/gm, "");
}

function isTemplateReference(file: string): boolean {
	return file.endsWith(join("references", "template.md")) || file.endsWith("-template.md");
}

async function walkMarkdown(root: string): Promise<string[]> {
	const files: string[] = [];

	async function walk(current: string) {
		const entries = await readdir(current, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name === ".git" || entry.name === "node_modules") continue;
			const abs = join(current, entry.name);
			if (entry.isDirectory()) {
				await walk(abs);
			} else if (entry.isFile() && entry.name.endsWith(".md") && !basename(entry.name).startsWith(".")) {
				files.push(abs);
			}
		}
	}

	await walk(root);
	return files.sort();
}

async function failIfErrors(): Promise<void> {
	if (errors.length === 0) return;

	console.log("");
	console.log(bold(red("Validation errors:")));
	for (const error of errors) console.log(`  ${red("ERR")} ${error}`);
	process.exit(1);
}

async function main() {
	const groups = await readJson<PluginGroups>(GROUPS_PATH);
	groups.plugins.sort((a, b) => a.name.localeCompare(b.name));
	for (const group of groups.plugins) group.skills.sort();

	await validateGroups(groups);
	await validateRelativeRefs(PLUGINS_DIR, "plugins");
	await failIfErrors();

	await removeIfExists(OBSOLETE_ROOT_CODEX_PLUGIN_DIR, "remove obsolete root Codex plugin manifest");

	for (const group of groups.plugins) {
		const root = pluginRoot(group);
		await writeIfChanged(
			resolve(root, ".claude-plugin/plugin.json"),
			json(claudePluginManifest(group, groups.metadata.version, groups.metadata)),
		);
		await writeIfChanged(
			resolve(root, ".codex-plugin/plugin.json"),
			json(codexPluginManifest(group, groups.metadata.version, groups.metadata)),
		);
		await writeIfChanged(
			resolve(root, "README.md"),
			pluginReadme(
				group,
				groups.name,
				marketplaceSource(groups.metadata),
				group.readmeBody ? await readFile(resolve(root, group.readmeBody), "utf-8") : "",
			),
		);
	}

	await writeIfChanged(CLAUDE_MARKETPLACE_PATH, json(claudeMarketplace(groups)));
	await writeIfChanged(CODEX_MARKETPLACE_PATH, json(codexMarketplace(groups)));

	if (write || changes.length === 0) {
		await validateRelativeRefs(PLUGINS_DIR, "plugins");
		await failIfErrors();
	}

	console.log("");
	if (changes.length === 0) {
		console.log(green("Everything up to date."));
		return;
	}

	for (const change of changes) {
		console.log(`  ${write ? green("updated") : yellow("changed")}  ${change.path}  ${dim(change.reason)}`);
	}

	console.log("");
	if (write) {
		console.log(green(`${changes.length} generated path(s) updated.`));
	} else {
		console.log(bold(`${changes.length} generated path(s) to update.`));
		console.log(dim("Run with --write to apply changes."));
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
