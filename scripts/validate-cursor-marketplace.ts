#!/usr/bin/env bun
/**
 * Validates .cursor-plugin/marketplace.json and per-plugin manifests
 * against the fieldsphere cursor-team-marketplace-template conventions.
 */

import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { basename, dirname, extname, join, posix, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const MARKETPLACE_PATH = resolve(ROOT, ".cursor-plugin/marketplace.json");

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const marketplaceNamePattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const errors: string[] = [];
const warnings: string[] = [];

function addError(message: string): void {
	errors.push(message);
}

function addWarning(message: string): void {
	warnings.push(message);
}

async function pathExists(targetPath: string): Promise<boolean> {
	return existsSync(targetPath);
}

async function ensureDirectory(targetPath: string, context: string): Promise<boolean> {
	try {
		const info = await stat(targetPath);
		if (!info.isDirectory()) {
			addError(`${context} exists but is not a directory: ${targetPath}`);
			return false;
		}
		return true;
	} catch {
		addError(`${context} directory is missing: ${targetPath}`);
		return false;
	}
}

async function readJsonFile<T>(filePath: string, context: string): Promise<T | null> {
	try {
		return JSON.parse(await readFile(filePath, "utf-8")) as T;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (!existsSync(filePath)) {
			addError(`${context} is missing: ${filePath}`);
		} else {
			addError(`${context} contains invalid JSON (${filePath}): ${message}`);
		}
		return null;
	}
}

function normalizeNewlines(content: string): string {
	return content.replace(/\r\n/g, "\n");
}

function parseFrontmatter(content: string): Record<string, string> | null {
	const normalized = normalizeNewlines(content);
	if (!normalized.startsWith("---\n")) return null;

	const closingIndex = normalized.indexOf("\n---\n", 4);
	if (closingIndex === -1) return null;

	const fields: Record<string, string> = {};
	for (const line of normalized.slice(4, closingIndex).split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const separator = line.indexOf(":");
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		const value = line.slice(separator + 1).trim();
		fields[key] = value;
	}
	return fields;
}

async function walkFiles(dirPath: string): Promise<string[]> {
	const files: string[] = [];
	const stack = [dirPath];

	while (stack.length > 0) {
		const current = stack.pop()!;
		const entries = await readdir(current, { withFileTypes: true });
		for (const entry of entries) {
			const entryPath = join(current, entry.name);
			if (entry.isDirectory()) {
				stack.push(entryPath);
			} else if (entry.isFile()) {
				files.push(entryPath);
			}
		}
	}

	return files;
}

function isSafeRelativePath(value: string): boolean {
	if (typeof value !== "string" || value.length === 0) return false;
	if (value.startsWith("http://") || value.startsWith("https://")) return true;
	const normalized = posix.normalize(value.replace(/\\/g, "/"));
	return !normalized.startsWith("../") && normalized !== "..";
}

function extractPathValues(value: unknown): string[] {
	if (typeof value === "string") return [value];
	if (Array.isArray(value)) return value.flatMap((entry) => extractPathValues(entry));
	if (value && typeof value === "object") {
		const record = value as Record<string, unknown>;
		const candidates: string[] = [];
		if (typeof record.path === "string") candidates.push(record.path);
		if (typeof record.file === "string") candidates.push(record.file);
		return candidates;
	}
	return [];
}

async function validateReferencedPath(
	pluginDir: string,
	fieldName: string,
	pathValue: string,
	pluginName: string,
): Promise<void> {
	if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) return;
	if (!isSafeRelativePath(pathValue)) {
		addError(
			`${pluginName}: field "${fieldName}" has invalid path "${pathValue}". Use a relative path without ".." or absolute prefixes.`,
		);
		return;
	}
	const resolved = resolve(pluginDir, pathValue);
	if (!(await pathExists(resolved))) {
		addError(`${pluginName}: field "${fieldName}" references missing path "${pathValue}".`);
	}
}

async function validateFrontmatterFile(
	filePath: string,
	componentName: string,
	requiredKeys: string[],
	pluginName: string,
): Promise<void> {
	const content = await readFile(filePath, "utf-8");
	const parsed = parseFrontmatter(content);
	const relativeFile = relative(ROOT, filePath);

	if (!parsed) {
		addError(`${pluginName}: ${componentName} file missing YAML frontmatter: ${relativeFile}`);
		return;
	}

	for (const key of requiredKeys) {
		if (!parsed[key] || parsed[key].length === 0) {
			addError(`${pluginName}: ${componentName} file missing "${key}" in frontmatter: ${relativeFile}`);
		}
	}
}

async function validateComponentFrontmatter(pluginDir: string, pluginName: string): Promise<void> {
	const rulesDir = join(pluginDir, "rules");
	if (await pathExists(rulesDir)) {
		for (const file of await walkFiles(rulesDir)) {
			const ext = extname(file).toLowerCase();
			if (ext === ".md" || ext === ".mdc" || ext === ".markdown") {
				await validateFrontmatterFile(file, "rule", ["description"], pluginName);
			}
		}
	}

	const skillsDir = join(pluginDir, "skills");
	if (await pathExists(skillsDir)) {
		for (const file of await walkFiles(skillsDir)) {
			if (basename(file) === "SKILL.md") {
				await validateFrontmatterFile(file, "skill", ["name", "description"], pluginName);
			}
		}
	}

	const agentsDir = join(pluginDir, "agents");
	if (await pathExists(agentsDir)) {
		for (const file of await walkFiles(agentsDir)) {
			const ext = extname(file).toLowerCase();
			if (ext === ".md" || ext === ".mdc" || ext === ".markdown") {
				await validateFrontmatterFile(file, "agent", ["name", "description"], pluginName);
			}
		}
	}

	const commandsDir = join(pluginDir, "commands");
	if (await pathExists(commandsDir)) {
		for (const file of await walkFiles(commandsDir)) {
			const ext = extname(file).toLowerCase();
			if (ext === ".md" || ext === ".mdc" || ext === ".markdown" || ext === ".txt") {
				await validateFrontmatterFile(file, "command", ["description"], pluginName);
			}
		}
	}
}

function resolveMarketplaceSource(source: string, pluginRoot: string | undefined): string {
	if (!pluginRoot) return source;
	const normalizedRoot = pluginRoot.replace(/\\/g, "/").replace(/\/+$/, "");
	const normalizedSource = source.replace(/\\/g, "/");
	if (normalizedSource === normalizedRoot || normalizedSource.startsWith(`${normalizedRoot}/`)) {
		return normalizedSource;
	}
	return `${normalizedRoot}/${normalizedSource}`;
}

interface MarketplaceEntry {
	name?: string;
	source?: string;
}

interface Marketplace {
	name?: string;
	displayName?: string;
	owner?: { name?: string; email?: string };
	metadata?: { pluginRoot?: string };
	plugins?: MarketplaceEntry[];
}

interface PluginManifest {
	name?: string;
	logo?: string;
	rules?: unknown;
	skills?: unknown;
	agents?: unknown;
	commands?: unknown;
	hooks?: unknown;
	mcpServers?: unknown;
}

async function main(): Promise<void> {
	const marketplace = await readJsonFile<Marketplace>(MARKETPLACE_PATH, "Marketplace manifest");
	if (!marketplace) {
		summarizeAndExit();
		return;
	}

	if (typeof marketplace.name !== "string" || !marketplaceNamePattern.test(marketplace.name)) {
		addError('Marketplace "name" must be lowercase kebab-case and start/end with an alphanumeric character.');
	}

	if (typeof marketplace.displayName !== "string" || marketplace.displayName.length === 0) {
		addError('Marketplace "displayName" is required.');
	}

	if (!marketplace.owner || typeof marketplace.owner.name !== "string" || marketplace.owner.name.length === 0) {
		addError('Marketplace "owner.name" is required.');
	}

	if (!marketplace.owner?.email) {
		addWarning('Marketplace "owner.email" is missing (recommended for team marketplace import).');
	}

	if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
		addError('Marketplace "plugins" must be a non-empty array.');
		summarizeAndExit();
		return;
	}

	const pluginRoot = marketplace.metadata?.pluginRoot;
	if (pluginRoot !== undefined) {
		if (typeof pluginRoot !== "string" || !isSafeRelativePath(pluginRoot)) {
			addError('Marketplace "metadata.pluginRoot" must be a safe relative path.');
		} else {
			await ensureDirectory(join(ROOT, pluginRoot), 'Marketplace "metadata.pluginRoot"');
		}
	} else {
		addError('Marketplace "metadata.pluginRoot" is required (use "plugins").');
	}

	const seenNames = new Set<string>();
	for (const [index, entry] of marketplace.plugins.entries()) {
		const label = `plugins[${index}]`;

		if (!entry || typeof entry !== "object") {
			addError(`${label} must be an object.`);
			continue;
		}

		if (typeof entry.name !== "string" || !pluginNamePattern.test(entry.name)) {
			addError(`${label}.name must be lowercase and use only alphanumerics, hyphens, and periods.`);
			continue;
		}

		if (seenNames.has(entry.name)) {
			addError(`Duplicate plugin name in marketplace manifest: "${entry.name}"`);
		}
		seenNames.add(entry.name);

		const sourcePath = resolveMarketplaceSource(entry.source ?? "", pluginRoot ?? "");
		if (!sourcePath) {
			addError(`${label}.source must be a string path.`);
			continue;
		}
		if (!isSafeRelativePath(sourcePath)) {
			addError(`${label}.source is not a safe relative path: "${sourcePath}"`);
			continue;
		}

		const pluginDir = join(ROOT, sourcePath);
		if (!(await ensureDirectory(pluginDir, `${label}.source`))) continue;

		const manifestPath = join(pluginDir, ".cursor-plugin", "plugin.json");
		const pluginManifest = await readJsonFile<PluginManifest>(manifestPath, `${entry.name} plugin manifest`);
		if (!pluginManifest) continue;

		if (typeof pluginManifest.name !== "string" || !pluginNamePattern.test(pluginManifest.name)) {
			addError(
				`${entry.name}: "name" in plugin.json must be lowercase and use only alphanumerics, hyphens, and periods.`,
			);
		}

		if (pluginManifest.name && pluginManifest.name !== entry.name) {
			addError(
				`${entry.name}: marketplace entry name does not match plugin.json name ("${pluginManifest.name}").`,
			);
		}

		const manifestFields = ["logo", "rules", "skills", "agents", "commands", "hooks", "mcpServers"] as const;
		for (const field of manifestFields) {
			for (const value of extractPathValues(pluginManifest[field])) {
				await validateReferencedPath(pluginDir, field, value, entry.name);
			}
		}

		await validateComponentFrontmatter(pluginDir, entry.name);

		const hooksPath = join(pluginDir, "hooks", "hooks.json");
		if (!(await pathExists(hooksPath))) {
			addWarning(`${entry.name}: no hooks/hooks.json file found (only needed when using hooks).`);
		}

		const mcpPath = join(pluginDir, "mcp.json");
		if (!(await pathExists(mcpPath))) {
			addWarning(`${entry.name}: no mcp.json file found (only needed when using MCP servers).`);
		}
	}

	summarizeAndExit();
}

function summarizeAndExit(): void {
	if (warnings.length > 0) {
		console.log("Warnings:");
		for (const warning of warnings) {
			console.log(`- ${warning}`);
		}
		console.log("");
	}

	if (errors.length > 0) {
		console.error("Validation failed:");
		for (const error of errors) {
			console.error(`- ${error}`);
		}
		process.exit(1);
	}

	console.log("Cursor marketplace validation passed.");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
