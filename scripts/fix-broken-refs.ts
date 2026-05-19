#!/usr/bin/env bun
/**
 * Cleans broken cross-reference links in plugin reference files.
 *
 * Scope: every `.md` file under `plugins/*/skills/*/references/**`.
 *
 * For each markdown link `[Label](target.md)` or `[Label](target.md#anchor)`:
 *   - Resolve `target.md` relative to the file's directory.
 *   - If the target file exists → leave the link intact.
 *   - If the target file is missing → replace the whole link with `**Label**`.
 *
 * Links with non-.md targets (apple:, http(s):, mailto:, anchors, etc.) are
 * ignored by the pattern and left untouched.
 *
 * Usage:
 *   bun scripts/fix-broken-refs.ts           # dry-run
 *   bun scripts/fix-broken-refs.ts --write   # apply
 */

import { Glob } from "bun";
import { readFile, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const write = process.argv.includes("--write");

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

// Match [label](target.md) or [label](target.md#anchor).
// - Captures label (group 1), target (group 2), anchor (group 3, may be empty).
// - Label cannot contain ] (simple; fine for our corpus).
// - Target cannot contain ) or # and must end in .md.
const LINK_RE = /\[([^\]]+)\]\(([^)#\s]+\.md)(#[^)\s]*)?\)/g;

async function fileExists(p: string): Promise<boolean> {
	try {
		const s = await stat(p);
		return s.isFile();
	} catch {
		return false;
	}
}

interface FileResult {
	file: string;
	preserved: number;
	dropped: number;
	newContent: string;
	droppedSamples: string[];
}

const glob = new Glob("*/skills/*/references/**/*.md");
const files: string[] = [];
for await (const path of glob.scan({ cwd: PLUGINS_DIR, absolute: true })) {
	files.push(path);
}
files.sort();

const results: FileResult[] = [];
let totalPreserved = 0;
let totalDropped = 0;
let filesChanged = 0;

for (const filePath of files) {
	const content = await readFile(filePath, "utf-8");
	const dir = dirname(filePath);

	let preserved = 0;
	let dropped = 0;
	const droppedSamples: string[] = [];

	// Collect all matches first, then do async existence checks in parallel.
	const matches = [...content.matchAll(LINK_RE)];
	if (matches.length === 0) continue;

	const existenceChecks = await Promise.all(
		matches.map((m) => fileExists(resolve(dir, m[2]!))),
	);

	let newContent = "";
	let cursor = 0;
	for (let i = 0; i < matches.length; i++) {
		const m = matches[i]!;
		const start = m.index!;
		const end = start + m[0].length;
		newContent += content.slice(cursor, start);
		if (existenceChecks[i]) {
			newContent += m[0];
			preserved++;
		} else {
			newContent += `**${m[1]}**`;
			dropped++;
			if (droppedSamples.length < 3) droppedSamples.push(`[${m[1]}](${m[2]}${m[3] ?? ""})`);
		}
		cursor = end;
	}
	newContent += content.slice(cursor);

	totalPreserved += preserved;
	totalDropped += dropped;

	if (newContent !== content) {
		filesChanged++;
		results.push({
			file: filePath,
			preserved,
			dropped,
			newContent,
			droppedSamples,
		});
	}
}

// ── Report ─────────────────────────────────────────────────────────

console.log("");
console.log(bold(`Scanned ${files.length} reference file(s).`));
console.log(
	`  ${green("preserved")} ${totalPreserved} link(s) with existing targets`,
);
console.log(
	`  ${yellow("broken   ")} ${totalDropped} link(s) with missing targets`,
);
console.log(
	`  ${bold(String(filesChanged))} file(s) ${write ? "updated" : "to update"}.`,
);
console.log("");

for (const r of results) {
	const rel = relative(ROOT, r.file);
	if (write) {
		await writeFile(r.file, r.newContent);
		console.log(
			`  ${green("updated")}  ${rel}  ${dim(`-${r.dropped} broken`)}${r.preserved > 0 ? dim(`, +${r.preserved} kept`) : ""}`,
		);
	} else {
		console.log(
			`  ${yellow("would update")}  ${rel}  ${dim(`-${r.dropped} broken`)}${r.preserved > 0 ? dim(`, +${r.preserved} kept`) : ""}`,
		);
		for (const s of r.droppedSamples) {
			console.log(`      ${red("drop")} ${dim(s)}`);
		}
	}
}

console.log("");
if (!write && filesChanged > 0) {
	console.log(dim("Run with --write to apply changes."));
}
