#!/usr/bin/env bun
/**
 * Audits the apple-design plugin: finds topics that appear identically across
 * multiple platform skills and should likely live in foundations or services.
 */

import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";

const ROOT = resolve(import.meta.dir, "..", "plugins", "apple-design", "skills");
const PLATFORMS = ["ios", "macos", "tvos", "visionos", "watchos"];

async function hashFile(p: string): Promise<string> {
	return createHash("sha256").update(await readFile(p)).digest("hex");
}

async function topicSignature(skillRefDir: string, topic: string): Promise<string | null> {
	const path = resolve(skillRefDir, topic);
	let s;
	try {
		s = await stat(path);
	} catch {
		try {
			s = await stat(`${path}.md`);
		} catch {
			return null;
		}
	}
	if (s.isFile()) return await hashFile(path.endsWith(".md") ? path : `${path}.md`);
	// folder — combine sorted child file hashes
	const out: string[] = [];
	async function walk(dir: string): Promise<void> {
		for (const e of await readdir(dir, { withFileTypes: true })) {
			const f = resolve(dir, e.name);
			if (e.isDirectory()) await walk(f);
			else out.push(`${relative(path, f)}=${await hashFile(f)}`);
		}
	}
	await walk(path);
	out.sort();
	return createHash("sha256").update(out.join("|")).digest("hex");
}

const topicsByPlatform = new Map<string, Map<string, string>>(); // platform → topic → signature
for (const platform of PLATFORMS) {
	const refDir = resolve(ROOT, platform, "references");
	const map = new Map<string, string>();
	for (const ent of await readdir(refDir, { withFileTypes: true })) {
		const topic = ent.isDirectory() ? ent.name : ent.name.replace(/\.md$/, "");
		const sig = await topicSignature(refDir, topic);
		if (sig) map.set(topic, sig);
	}
	topicsByPlatform.set(platform, map);
}

// Collect all topics
const allTopics = new Set<string>();
for (const map of topicsByPlatform.values()) for (const t of map.keys()) allTopics.add(t);

console.log(`\nTopics appearing in all 5 platforms:`);
console.log(`(I=identical across all, V=varies)\n`);
const candidates: string[] = [];
for (const topic of [...allTopics].sort()) {
	const sigs = PLATFORMS.map((p) => topicsByPlatform.get(p)!.get(topic)).filter(Boolean) as string[];
	if (sigs.length === 5) {
		const allSame = new Set(sigs).size === 1;
		console.log(`  ${allSame ? "I" : "V"}  ${topic}${allSame ? "  ← move out of platform skills" : ""}`);
		if (allSame) candidates.push(topic);
	}
}

console.log(`\n${candidates.length} cross-platform-identical topics currently duplicated in platform skills:\n`);
for (const t of candidates) console.log(`  - ${t}`);
