#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const GROUPS_PATH = resolve(ROOT, "plugin-groups.json");

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
	author: Owner;
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

interface Options {
	format: "text" | "json";
	includeDescriptions: boolean;
	includeKeywords: boolean;
	includeMetadata: boolean;
	includePaths: boolean;
	includeReferences: boolean;
	includeSupport: boolean;
	maxDescription: number;
	pluginFilters: Set<string>;
	skillFilters: Set<string>;
	unicode: boolean;
}

interface SkillNode {
	name: string;
	path: string;
	frontmatter: Record<string, string>;
	description?: string;
	references: string[];
	scripts: string[];
	agents: string[];
	otherSupport: string[];
}

interface PluginNode {
	name: string;
	displayName: string;
	path: string;
	category: string;
	shortDescription: string;
	description: string;
	keywords: string[];
	commands: string[];
	skills: SkillNode[];
}

const args = process.argv.slice(2);

function usage(): never {
	console.log(`Usage: bun run tree [options]

Print an AI-readable tree of plugin, skill, and reference metadata.

Options:
  --plugin <name>        Only include one plugin. Repeatable.
  --skill <name>         Only include one skill or plugin:skill. Repeatable.
  --references, --refs   List reference files instead of only counts.
  --support              Include scripts, agents, and other support files.
  --metadata             Include categories, keywords, commands, and frontmatter.
  --keywords             Include plugin keywords without full metadata.
  --paths                Include repo-relative paths.
  --descriptions         Include plugin and skill description snippets.
  --no-descriptions      Hide description snippets.
  --max-description <n>  Snippet length, default 120.
  --format <text|json>   Output format, default text.
  --ascii                Use plain ASCII tree characters.
  --unicode              Use box-drawing tree characters. Default.
  --all                  Shortcut for --references --support --metadata --paths.
  --help                 Show this help.
`);
	process.exit(0);
}

function parseOptions(): Options {
	const options: Options = {
		format: "text",
		includeDescriptions: false,
		includeKeywords: false,
		includeMetadata: false,
		includePaths: false,
		includeReferences: false,
		includeSupport: false,
		maxDescription: 120,
		pluginFilters: new Set(),
		skillFilters: new Set(),
		unicode: true,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const next = () => {
			const value = args[++i];
			if (!value) throw new Error(`${arg} needs a value`);
			return value;
		};

		switch (arg) {
			case "--help":
			case "-h":
				usage();
			case "--plugin":
				options.pluginFilters.add(next());
				break;
			case "--skill":
				options.skillFilters.add(next());
				break;
			case "--references":
			case "--refs":
				options.includeReferences = true;
				break;
			case "--support":
				options.includeSupport = true;
				break;
			case "--metadata":
				options.includeMetadata = true;
				break;
			case "--keywords":
				options.includeKeywords = true;
				break;
			case "--paths":
				options.includePaths = true;
				break;
			case "--descriptions":
				options.includeDescriptions = true;
				break;
			case "--no-descriptions":
				options.includeDescriptions = false;
				break;
			case "--max-description":
				options.maxDescription = Number.parseInt(next(), 10);
				if (!Number.isFinite(options.maxDescription) || options.maxDescription < 20) {
					throw new Error("--max-description must be a number >= 20");
				}
				break;
			case "--format": {
				const format = next();
				if (format !== "text" && format !== "json") throw new Error("--format must be text or json");
				options.format = format;
				break;
			}
			case "--ascii":
				options.unicode = false;
				break;
			case "--unicode":
				options.unicode = true;
				break;
			case "--all":
				options.includeReferences = true;
				options.includeSupport = true;
				options.includeMetadata = true;
				options.includePaths = true;
				break;
			default:
				throw new Error(`Unknown option: ${arg}`);
		}
	}

	return options;
}

async function readJson<T>(path: string): Promise<T> {
	return JSON.parse(await readFile(path, "utf-8")) as T;
}

function rel(path: string): string {
	return relative(ROOT, path);
}

function parseFrontmatter(content: string): Record<string, string> {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};

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

function compact(text: string | undefined, max: number): string | undefined {
	if (!text) return undefined;
	const flattened = text.replace(/\s+/g, " ").trim();
	if (flattened.length <= max) return flattened;
	return `${flattened.slice(0, max - 1).trimEnd()}...`;
}

async function walkFiles(root: string): Promise<string[]> {
	if (!existsSync(root)) return [];

	const files: string[] = [];
	async function walk(current: string) {
		const entries = await readdir(current, { withFileTypes: true });
		for (const entry of entries) {
			const abs = join(current, entry.name);
			if (entry.isDirectory()) {
				await walk(abs);
			} else if (entry.isFile()) {
				files.push(rel(abs));
			}
		}
	}

	await walk(root);
	return files.sort();
}

async function skillNode(plugin: PluginGroup, skillName: string): Promise<SkillNode> {
	const skillRoot = resolve(PLUGINS_DIR, plugin.name, "skills", skillName);
	const skillPath = resolve(skillRoot, "SKILL.md");
	const content = existsSync(skillPath) ? await readFile(skillPath, "utf-8") : "";
	const frontmatter = parseFrontmatter(content);
	const directFiles = existsSync(skillRoot)
		? (await readdir(skillRoot, { withFileTypes: true }))
				.filter((entry) => entry.isFile() && entry.name !== "SKILL.md")
				.map((entry) => rel(resolve(skillRoot, entry.name)))
				.sort()
		: [];

	return {
		name: skillName,
		path: rel(skillRoot),
		frontmatter,
		description: frontmatter.description,
		references: await walkFiles(resolve(skillRoot, "references")),
		scripts: await walkFiles(resolve(skillRoot, "scripts")),
		agents: await walkFiles(resolve(skillRoot, "agents")),
		otherSupport: directFiles,
	};
}

function skillMatches(options: Options, pluginName: string, skillName: string): boolean {
	if (options.skillFilters.size === 0) return true;
	return (
		options.skillFilters.has(skillName) ||
		options.skillFilters.has(`${pluginName}:${skillName}`) ||
		options.skillFilters.has(`${pluginName}/${skillName}`)
	);
}

async function buildTree(options: Options): Promise<{
	name: string;
	version: string;
	plugins: PluginNode[];
	totals: { plugins: number; skills: number; references: number; supportFiles: number };
}> {
	const groups = await readJson<PluginGroups>(GROUPS_PATH);
	const plugins: PluginNode[] = [];

	for (const group of groups.plugins.toSorted((a, b) => a.name.localeCompare(b.name))) {
		if (options.pluginFilters.size && !options.pluginFilters.has(group.name)) continue;

		const skills = (
			await Promise.all(
				group.skills
					.toSorted((a, b) => a.localeCompare(b))
					.filter((skill) => skillMatches(options, group.name, skill))
					.map((skill) => skillNode(group, skill)),
			)
		).filter(Boolean);

		if (options.skillFilters.size && skills.length === 0) continue;

		plugins.push({
			name: group.name,
			displayName: group.displayName,
			path: rel(resolve(PLUGINS_DIR, group.name)),
			category: group.category,
			shortDescription: group.shortDescription,
			description: group.description,
			keywords: group.keywords ?? [],
			commands: group.commands ?? [],
			skills,
		});
	}

	const totals = plugins.reduce(
		(acc, plugin) => {
			acc.skills += plugin.skills.length;
			for (const skill of plugin.skills) {
				acc.references += skill.references.length;
				acc.supportFiles += skill.scripts.length + skill.agents.length + skill.otherSupport.length;
			}
			return acc;
		},
		{ plugins: plugins.length, skills: 0, references: 0, supportFiles: 0 },
	);

	return {
		name: groups.name,
		version: groups.metadata.version,
		plugins,
		totals,
	};
}

function treeGlyphs(unicode: boolean) {
	return unicode
		? { tee: "\u251c\u2500\u2500", last: "\u2514\u2500\u2500", pipe: "\u2502  ", blank: "   " }
		: { tee: "|--", last: "`--", pipe: "|  ", blank: "   " };
}

function printChild(lines: string[], prefix: string, isLast: boolean, label: string, unicode: boolean) {
	const glyphs = treeGlyphs(unicode);
	lines.push(`${prefix}${isLast ? glyphs.last : glyphs.tee} ${label}`);
}

function detailLine(lines: string[], prefix: string, isLast: boolean, label: string, unicode: boolean) {
	printChild(lines, prefix, isLast, label, unicode);
}

function formatText(tree: Awaited<ReturnType<typeof buildTree>>, options: Options): string {
	const lines: string[] = [];
	const glyphs = treeGlyphs(options.unicode);
	lines.push(
		`${tree.name} v${tree.version} - ${tree.totals.plugins} plugins, ${tree.totals.skills} skills, ${tree.totals.references} references`,
	);

	for (const [pluginIndex, plugin] of tree.plugins.entries()) {
		const pluginLast = pluginIndex === tree.plugins.length - 1;
		const pluginDesc = options.includeDescriptions
			? ` - ${compact(plugin.shortDescription || plugin.description, options.maxDescription)}`
			: "";
		printChild(lines, "", pluginLast, `[P] ${plugin.name} (${plugin.skills.length} skills)${pluginDesc}`, options.unicode);

		const pluginPrefix = pluginLast ? glyphs.blank : glyphs.pipe;
		const pluginDetails: string[] = [];
		if (options.includePaths) pluginDetails.push(`path: ${plugin.path}`);
		if (options.includeMetadata) {
			pluginDetails.push(`category: ${plugin.category}`);
			if (plugin.commands.length) pluginDetails.push(`commands: ${plugin.commands.join(", ")}`);
		}
		if ((options.includeKeywords || options.includeMetadata) && plugin.keywords.length) {
			pluginDetails.push(`keywords: ${plugin.keywords.join(", ")}`);
		}

		for (const [detailIndex, detail] of pluginDetails.entries()) {
			const isLast = plugin.skills.length === 0 && detailIndex === pluginDetails.length - 1;
			detailLine(lines, pluginPrefix, isLast, detail, options.unicode);
		}

		for (const [skillIndex, skill] of plugin.skills.entries()) {
			const supportCount = skill.scripts.length + skill.agents.length + skill.otherSupport.length;
			const skillLast = skillIndex === plugin.skills.length - 1;
			const refSummary = `${skill.references.length} refs`;
			const supportSummary = supportCount > 0 ? `, ${supportCount} support` : "";
			const skillDesc = options.includeDescriptions
				? ` - ${compact(skill.description, options.maxDescription)}`
				: "";
			printChild(
				lines,
				pluginPrefix,
				skillLast,
				`[S] ${skill.name} (${refSummary}${supportSummary})${skillDesc}`,
				options.unicode,
			);

			const skillPrefix = `${pluginPrefix}${skillLast ? glyphs.blank : glyphs.pipe}`;
			const skillDetails: string[] = [];
			if (options.includePaths) skillDetails.push(`path: ${skill.path}`);
			if (options.includeMetadata) {
				for (const [key, value] of Object.entries(skill.frontmatter)) {
					if (key === "description" && options.includeDescriptions) continue;
					skillDetails.push(`${key}: ${compact(value, options.maxDescription)}`);
				}
			}
			if (options.includeReferences) {
				for (const reference of skill.references) skillDetails.push(`ref: ${reference}`);
			}
			if (options.includeSupport) {
				for (const agent of skill.agents) skillDetails.push(`agent: ${agent}`);
				for (const script of skill.scripts) skillDetails.push(`script: ${script}`);
				for (const file of skill.otherSupport) skillDetails.push(`file: ${file}`);
			}

			for (const [detailIndex, detail] of skillDetails.entries()) {
				detailLine(lines, skillPrefix, detailIndex === skillDetails.length - 1, detail, options.unicode);
			}
		}
	}

	return `${lines.join("\n")}\n`;
}

try {
	const options = parseOptions();
	const tree = await buildTree(options);
	if (options.format === "json") {
		console.log(JSON.stringify(tree, null, "\t"));
	} else {
		process.stdout.write(formatText(tree, options));
	}
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
