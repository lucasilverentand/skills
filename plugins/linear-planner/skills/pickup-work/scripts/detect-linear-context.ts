#!/usr/bin/env bun

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

type Evidence = {
	type: "linear-url" | "issue-id" | "project-hint" | "initiative-hint" | "product-hint";
	value: string;
	file?: string;
	line?: number;
};

type Candidate = {
	value: string;
	score: number;
	reasons: string[];
};

const startCwd = resolve(process.argv[2] ?? process.cwd());
const maxFiles = 80;
const maxBytes = 200_000;

function git(args: string[], cwd: string): string | null {
	const result = spawnSync("git", args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});
	if (result.status !== 0) return null;
	return result.stdout.trim() || null;
}

function unique<T>(values: T[]): T[] {
	return [...new Set(values)];
}

function remoteRepoName(remote: string): string | null {
	const normalized = remote.trim().replace(/\.git$/, "");
	const match = normalized.match(/[:/]([^/:]+\/[^/]+)$/);
	if (!match) return null;
	return match[1].split("/").pop() ?? null;
}

function titleizeSlug(value: string): string {
	return value
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

function addCandidate(map: Map<string, Candidate>, value: string, score: number, reason: string) {
	const cleaned = value.trim();
	if (!cleaned) return;
	const key = cleaned.toLowerCase();
	const current = map.get(key);
	if (current) {
		current.score += score;
		current.reasons.push(reason);
		return;
	}
	map.set(key, { value: cleaned, score, reasons: [reason] });
}

function isIgnoredDir(name: string): boolean {
	return [
		".git",
		"node_modules",
		"vendor",
		"dist",
		"build",
		"coverage",
		".next",
		".nuxt",
		".cache",
		"target",
		".turbo",
	].includes(name);
}

function shouldScanFile(path: string): boolean {
	const lower = path.toLowerCase();
	return [
		"readme",
		"linear",
		"context",
		"agent",
		"agents",
		"claude",
		"codex",
		"project",
		"product",
		"planning",
		"roadmap",
		"spec",
		"brief",
		"adr",
		"docs",
		"document",
	].some((part) => lower.includes(part));
}

function collectFiles(root: string): string[] {
	const files: string[] = [];
	const stack = [root];

	while (stack.length && files.length < maxFiles) {
		const dir = stack.pop()!;
		let entries;
		try {
			entries = readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}

		for (const entry of entries) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) {
				if (!isIgnoredDir(entry.name)) stack.push(path);
				continue;
			}
			if (!entry.isFile() || !shouldScanFile(path)) continue;
			try {
				if (statSync(path).size <= maxBytes) files.push(path);
			} catch {
				continue;
			}
			if (files.length >= maxFiles) break;
		}
	}

	return files;
}

const gitRoot = git(["rev-parse", "--show-toplevel"], startCwd);
const root = gitRoot ?? startCwd;
const repoName = basename(root);
const remoteLines = git(["remote", "-v"], root)?.split("\n").filter(Boolean) ?? [];
const remotes = unique(remoteLines.map((line) => line.split(/\s+/)[1]).filter(Boolean));
const remoteRepoNames = unique(remotes.map(remoteRepoName).filter((name): name is string => Boolean(name)));

const evidence: Evidence[] = [];
const candidates = new Map<string, Candidate>();

addCandidate(candidates, repoName, 10, "repository directory name");
addCandidate(candidates, titleizeSlug(repoName), 8, "titleized repository directory name");
for (const name of remoteRepoNames) {
	addCandidate(candidates, name, 12, "git remote repository name");
	addCandidate(candidates, titleizeSlug(name), 9, "titleized git remote repository name");
}

const linearUrl = /https?:\/\/(?:[a-z0-9-]+\.)?linear\.app\/[^\s)>"']+/gi;
const issueId = /\b[A-Z][A-Z0-9]+-\d+\b/g;
const namedHint = /^\s*(?:[-*]\s*)?(?:Linear\s+)?(project|initiative|product)(?:\s+(?:name|slug|url|id))?\s*[:=]\s*([A-Za-z0-9][A-Za-z0-9 _./-]{1,80})/i;
const nonIssuePrefixes = new Set(["SHA", "UTF", "ISO", "RFC", "HTTP", "TLS"]);

for (const file of collectFiles(root)) {
	let content;
	try {
		content = readFileSync(file, "utf8");
	} catch {
		continue;
	}
	const relFile = file.startsWith(root) ? file.slice(root.length + 1) : file;
	const lines = content.split("\n");

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		for (const match of line.matchAll(linearUrl)) {
			evidence.push({ type: "linear-url", value: match[0], file: relFile, line: index + 1 });
			addCandidate(candidates, match[0], 5, `Linear URL in ${relFile}:${index + 1}`);
		}
		for (const match of line.matchAll(issueId)) {
			const prefix = match[0].split("-")[0];
			if (nonIssuePrefixes.has(prefix)) continue;
			evidence.push({ type: "issue-id", value: match[0], file: relFile, line: index + 1 });
		}
		const hint = line.match(namedHint);
		if (hint) {
			const hintType = `${hint[1].toLowerCase()}-hint` as Evidence["type"];
			const value = hint[2].replace(/[.,;:]$/, "").trim();
			evidence.push({ type: hintType, value, file: relFile, line: index + 1 });
			addCandidate(candidates, value, hint[1].toLowerCase() === "product" ? 9 : 11, `${hint[1]} hint in ${relFile}:${index + 1}`);
		}
	}
}

const output = {
	cwd: startCwd,
	gitRoot,
	repoName,
	remotes,
	remoteRepoNames,
	candidates: [...candidates.values()]
		.sort((a, b) => b.score - a.score || a.value.localeCompare(b.value))
		.slice(0, 20),
	evidence: evidence.slice(0, 80),
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
