#!/usr/bin/env bun
/**
 * Restructures the 5 apple-design-<platform> plugins into a single
 * `apple-design` plugin with skills:
 *   - foundations  (cross-platform design principles)
 *   - services     (Apple framework integrations: Pay, HealthKit, Siri, …)
 *   - ios, macos, tvos, visionos, watchos  (platform-specific UI)
 *
 * For foundations/services topics the script deduplicates identical files
 * across platforms (most are identical except per-platform guidance files).
 *
 * Usage:
 *   bun scripts/restructure-apple-design.ts          # dry-run
 *   bun scripts/restructure-apple-design.ts --write  # apply
 */

import { Glob } from "bun";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PLUGINS_DIR = resolve(ROOT, "plugins");
const TARGET = resolve(PLUGINS_DIR, "apple-design");
const write = process.argv.includes("--write");

const PLATFORMS = [
	{ slug: "ios", name: "iOS & iPadOS", device: "iPhone and iPad" },
	{ slug: "macos", name: "macOS", device: "Mac" },
	{ slug: "tvos", name: "tvOS", device: "Apple TV" },
	{ slug: "visionos", name: "visionOS", device: "Apple Vision Pro" },
	{ slug: "watchos", name: "watchOS", device: "Apple Watch" },
];

// ── Topic categorization ────────────────────────────────────────

const FOUNDATIONS = new Set([
	"accessibility",
	"app-icons",
	"branding",
	"charting-data",
	"charts",
	"color",
	"dark-mode",
	"eyes",
	"feedback",
	"foundations",
	"gestures",
	"icons",
	"inclusion",
	"index",
	"inputs",
	"keyboards",
	"launching",
	"layout",
	"layout-and-organization",
	"loading",
	"materials",
	"modality",
	"motion",
	"offering-help",
	"onboarding",
	"pointing-devices",
	"presentation",
	"privacy",
	"right-to-left",
	"sf-symbols",
	"spatial-layout",
	"system-experiences",
	"typography",
	"virtual-keyboards",
	"voiceover",
	"writing",
]);

const SERVICES = new Set([
	"airplay",
	"apple-pay",
	"apple-pencil-and-scribble",
	"app-clips",
	"app-shortcuts",
	"carekit",
	"carplay",
	"game-center",
	"generative-ai",
	"healthkit",
	"home-screen-quick-actions",
	"homekit",
	"icloud",
	"id-verifier",
	"imessage-apps-and-stickers",
	"in-app-purchase",
	"live-activities",
	"live-photos",
	"live-viewing-apps",
	"machine-learning",
	"managing-accounts",
	"managing-notifications",
	"maps",
	"nearby-interactions",
	"nfc",
	"notifications",
	"ratings-and-reviews",
	"researchkit",
	"shareplay",
	"shazamkit",
	"sign-in-with-apple",
	"siri",
	"tap-to-pay-on-iphone",
	"wallet",
	"widgets",
]);

// ── Helpers ──────────────────────────────────────────────────────

interface SourceEntry {
	platform: string;
	srcPath: string; // file
	relWithinTopic: string; // for folders: subpath like "ios.md", for single files: "" (empty)
	isFolder: boolean; // whether the topic itself is a folder in the source
	hash: string;
}

interface TopicCollection {
	topic: string;
	bucket: "foundations" | "services" | string; // platform slug for platform-only
	entries: SourceEntry[]; // grouped by topic; for folders multiple per platform
}

async function hashFile(path: string): Promise<string> {
	const buf = await readFile(path);
	return createHash("sha256").update(buf).digest("hex");
}

async function walk(dir: string): Promise<string[]> {
	const out: string[] = [];
	for (const ent of await readdir(dir, { withFileTypes: true })) {
		const full = resolve(dir, ent.name);
		if (ent.isDirectory()) out.push(...(await walk(full)));
		else out.push(full);
	}
	return out;
}

function bucketForTopic(topic: string): string {
	if (FOUNDATIONS.has(topic)) return "foundations";
	if (SERVICES.has(topic)) return "services";
	return "platform";
}

function shortDescriptionFromBody(body: string): string {
	// Take the first non-heading paragraph as a quick summary.
	const lines = body.split("\n");
	let para = "";
	for (const line of lines) {
		const t = line.trim();
		if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("---") || t.startsWith("|")) continue;
		para = t;
		break;
	}
	const cleaned = para.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, "");
	const cutAt = cleaned.indexOf(". ");
	let out = (cutAt > 0 ? cleaned.slice(0, cutAt) : cleaned).trim().replace(/\.$/, "");
	out = out.replace(/^An? /i, "").replace(/^The /, "");
	const MAX = 80;
	if (out.length > MAX) {
		const trunc = out.slice(0, MAX);
		const lastSpace = trunc.lastIndexOf(" ");
		out = `${trunc.slice(0, lastSpace > 40 ? lastSpace : MAX)}…`;
	}
	return out;
}

// ── Collect source entries ──────────────────────────────────────

const collections = new Map<string, TopicCollection>();

for (const platform of PLATFORMS) {
	const refsRoot = resolve(
		PLUGINS_DIR,
		`apple-design-${platform.slug}`,
		"skills",
		`${platform.slug}-design`,
		"references",
	);
	const ents = await readdir(refsRoot, { withFileTypes: true });
	for (const ent of ents) {
		const topic = ent.isDirectory() ? ent.name : ent.name.replace(/\.md$/, "");
		const isFolder = ent.isDirectory();
		const bucket = bucketForTopic(topic);
		const finalBucket = bucket === "platform" ? platform.slug : bucket;
		const key = `${finalBucket}::${topic}`;
		if (!collections.has(key)) {
			collections.set(key, { topic, bucket: finalBucket, entries: [] });
		}
		const collection = collections.get(key)!;
		if (isFolder) {
			const dirAbs = resolve(refsRoot, ent.name);
			const files = await walk(dirAbs);
			for (const f of files) {
				const rel = relative(dirAbs, f);
				collection.entries.push({
					platform: platform.slug,
					srcPath: f,
					relWithinTopic: rel,
					isFolder: true,
					hash: await hashFile(f),
				});
			}
		} else {
			const filePath = resolve(refsRoot, ent.name);
			collection.entries.push({
				platform: platform.slug,
				srcPath: filePath,
				relWithinTopic: "",
				isFolder: false,
				hash: await hashFile(filePath),
			});
		}
	}
}

// ── Plan writes ──────────────────────────────────────────────────

interface Plan {
	srcPath: string;
	destPath: string; // relative to TARGET
}

const plans: Plan[] = [];

interface GlossaryEntry {
	topic: string;
	primaryReference: string; // path used in the table
	fileCount: number;
	platforms?: string[]; // for foundations/services: which platforms have content
	summary: string;
}

const glossaryByBucket = new Map<string, GlossaryEntry[]>();

for (const collection of collections.values()) {
	const bucketDir = `skills/${collection.bucket === "platform" ? "??" : collection.bucket}/references`;
	const skillSlug = collection.bucket; // "foundations", "services", or platform slug
	const refRoot = `skills/${skillSlug}/references`;

	if (skillSlug === "foundations" || skillSlug === "services") {
		// Group entries by relWithinTopic (file path within the topic folder)
		const byRel = new Map<string, SourceEntry[]>();
		for (const e of collection.entries) {
			const rel = e.relWithinTopic;
			if (!byRel.has(rel)) byRel.set(rel, []);
			byRel.get(rel)!.push(e);
		}

		const isMultiFile = collection.entries.some((e) => e.isFolder);
		const platformsSeen = [...new Set(collection.entries.map((e) => e.platform))];

		if (!isMultiFile && byRel.size === 1) {
			// Single file per platform — dedupe by hash
			const entries = byRel.get("")!;
			const hashes = new Set(entries.map((e) => e.hash));
			if (hashes.size === 1) {
				// Identical across platforms — one canonical file
				const dest = `${refRoot}/${collection.topic}.md`;
				plans.push({ srcPath: entries[0].srcPath, destPath: dest });
				glossaryByBucket.set(skillSlug, glossaryByBucket.get(skillSlug) ?? []);
				glossaryByBucket.get(skillSlug)!.push({
					topic: collection.topic,
					primaryReference: `${collection.topic}.md`,
					fileCount: 1,
					platforms: platformsSeen.length === PLATFORMS.length ? undefined : platformsSeen,
					summary: shortDescriptionFromBody(await readFile(entries[0].srcPath, "utf8")),
				});
			} else {
				// Differs — write one per platform
				for (const e of entries) {
					const dest = `${refRoot}/${collection.topic}/${e.platform}.md`;
					plans.push({ srcPath: e.srcPath, destPath: dest });
				}
				const sample = await readFile(entries[0].srcPath, "utf8");
				glossaryByBucket.set(skillSlug, glossaryByBucket.get(skillSlug) ?? []);
				glossaryByBucket.get(skillSlug)!.push({
					topic: collection.topic,
					primaryReference: `${collection.topic}/`,
					fileCount: entries.length,
					platforms: platformsSeen,
					summary: shortDescriptionFromBody(sample),
				});
			}
		} else {
			// Multi-file folder topic — dedupe per relative path
			const writtenFiles: string[] = [];
			let sampleContent = "";
			for (const [rel, entries] of byRel.entries()) {
				const hashes = new Set(entries.map((e) => e.hash));
				if (hashes.size === 1) {
					const dest = `${refRoot}/${collection.topic}/${rel}`;
					plans.push({ srcPath: entries[0].srcPath, destPath: dest });
					writtenFiles.push(rel);
					if (!sampleContent) sampleContent = await readFile(entries[0].srcPath, "utf8");
				} else {
					for (const e of entries) {
						const parts = rel.split("/");
						const base = parts.pop()!.replace(/\.md$/, "");
						const subdir = parts.length ? `${parts.join("/")}/` : "";
						const dest = `${refRoot}/${collection.topic}/${subdir}${base}.${e.platform}.md`;
						plans.push({ srcPath: e.srcPath, destPath: dest });
						writtenFiles.push(`${subdir}${base}.${e.platform}.md`);
					}
				}
			}
			glossaryByBucket.set(skillSlug, glossaryByBucket.get(skillSlug) ?? []);
			glossaryByBucket.get(skillSlug)!.push({
				topic: collection.topic,
				primaryReference: `${collection.topic}/`,
				fileCount: writtenFiles.length,
				platforms: platformsSeen.length === PLATFORMS.length ? undefined : platformsSeen,
				summary: shortDescriptionFromBody(sampleContent || (await readFile(collection.entries[0].srcPath, "utf8"))),
			});
		}
	} else {
		// Platform-only topic — keep as-is in the platform skill.
		const isFolder = collection.entries.some((e) => e.isFolder);
		if (isFolder) {
			for (const e of collection.entries) {
				const dest = `${refRoot}/${collection.topic}/${e.relWithinTopic}`;
				plans.push({ srcPath: e.srcPath, destPath: dest });
			}
			const sample = await readFile(collection.entries[0].srcPath, "utf8");
			glossaryByBucket.set(skillSlug, glossaryByBucket.get(skillSlug) ?? []);
			glossaryByBucket.get(skillSlug)!.push({
				topic: collection.topic,
				primaryReference: `${collection.topic}/`,
				fileCount: collection.entries.length,
				summary: shortDescriptionFromBody(sample),
			});
		} else {
			const e = collection.entries[0];
			const dest = `${refRoot}/${collection.topic}.md`;
			plans.push({ srcPath: e.srcPath, destPath: dest });
			glossaryByBucket.set(skillSlug, glossaryByBucket.get(skillSlug) ?? []);
			glossaryByBucket.get(skillSlug)!.push({
				topic: collection.topic,
				primaryReference: `${collection.topic}.md`,
				fileCount: 1,
				summary: shortDescriptionFromBody(await readFile(e.srcPath, "utf8")),
			});
		}
	}
}

// ── SKILL.md generators ─────────────────────────────────────────

function buildSkillMd(opts: {
	skillName: string;
	title: string;
	description: string;
	intro: string;
	howTo: string[];
	entries: GlossaryEntry[];
	includePlatformsCol: boolean;
}): string {
	const lines: string[] = [];
	lines.push("---");
	lines.push(`name: ${opts.skillName}`);
	lines.push(`description: "${opts.description.replace(/"/g, '\\"')}"`);
	lines.push("allowed-tools: Read Grep Glob");
	lines.push("---");
	lines.push("");
	lines.push(`# ${opts.title}`);
	lines.push("");
	lines.push(opts.intro);
	lines.push("");
	lines.push("## How to use");
	lines.push("");
	opts.howTo.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
	lines.push("");
	lines.push("## Glossary");
	lines.push("");
	if (opts.includePlatformsCol) {
		lines.push("| Topic | Reference | Platforms | Summary |");
		lines.push("| --- | --- | --- | --- |");
	} else {
		lines.push("| Topic | Reference | Summary |");
		lines.push("| --- | --- | --- |");
	}
	const sorted = [...opts.entries].sort((a, b) => a.topic.localeCompare(b.topic));
	for (const e of sorted) {
		const ref = e.fileCount > 1 ? `\`${e.primaryReference}\` ×${e.fileCount}` : `\`${e.primaryReference}\``;
		const summary = e.summary.replace(/\|/g, "\\|");
		if (opts.includePlatformsCol) {
			const plats = e.platforms ? e.platforms.join(", ") : "all";
			lines.push(`| \`${e.topic}\` | ${ref} | ${plats} | ${summary} |`);
		} else {
			lines.push(`| \`${e.topic}\` | ${ref} | ${summary} |`);
		}
	}
	lines.push("");
	return lines.join("\n");
}

const skillFiles: Array<{ path: string; content: string }> = [];

skillFiles.push({
	path: "skills/foundations/SKILL.md",
	content: buildSkillMd({
		skillName: "foundations",
		title: "Apple Design Foundations",
		description:
			'Cross-platform Apple Human Interface Guidelines: color, typography, layout, materials, motion, accessibility, SF Symbols, branding, and other shared design principles. Use when designing for any Apple platform and the topic is platform-agnostic. User says: "iOS color tokens", "SF Symbols", "Apple typography", "dark mode guidance".',
		intro:
			"Foundational HIG topics shared across all Apple platforms. Use this skill for design principles that don't depend on a specific device. For platform-specific UI components, see the matching `<platform>` skill in this plugin.",
		howTo: [
			"**Match the user's question to a topic** in the glossary below.",
			"**Read only the relevant reference** with `Read`. Topics with multiple files (`×N` in the table) live in `references/<topic>/`.",
			"**Cross-reference platform skills** when the user is targeting a specific device — e.g., color foundations + `ios` skill for iPhone-specific palettes.",
			"**Cite the topic name** in recommendations so the user can verify against Apple's source.",
		],
		entries: glossaryByBucket.get("foundations") ?? [],
		includePlatformsCol: true,
	}),
});

skillFiles.push({
	path: "skills/services/SKILL.md",
	content: buildSkillMd({
		skillName: "services",
		title: "Apple Services & Frameworks",
		description:
			'Apple framework and service integrations: Apple Pay, HealthKit, HomeKit, Siri, CarPlay, Sign in with Apple, App Clips, widgets, and more. Use when integrating an Apple service or designing UI that surfaces one. User says: "add Apple Pay", "Sign in with Apple", "HealthKit UI", "design a widget".',
		intro:
			"Apple framework/service integration guidance — design rules and constraints for surfacing services like Pay, HealthKit, Siri, Wallet, App Clips, and widgets. Use this skill alongside a platform skill when the service has device-specific UI.",
		howTo: [
			"**Identify the service** the user is integrating and find the topic in the glossary.",
			"**Read the topic's references** (single file or `references/<topic>/` folder). Multi-file topics typically split overview, design, privacy, and platform notes.",
			"**Combine with the platform skill** when the service surfaces UI on a specific device (e.g., Apple Pay button on iOS → also read `ios` for button conventions).",
			"**Honor service-mandated rules** strictly — many services (Pay, Sign in with Apple, Wallet) have legal/branding requirements that can't be deviated from.",
		],
		entries: glossaryByBucket.get("services") ?? [],
		includePlatformsCol: true,
	}),
});

for (const platform of PLATFORMS) {
	skillFiles.push({
		path: `skills/${platform.slug}/SKILL.md`,
		content: buildSkillMd({
			skillName: platform.slug,
			title: `${platform.name} Design`,
			description: `Apple Human Interface Guidelines for ${platform.name} — UI components, controls, navigation, and platform conventions for ${platform.device}. Use when designing for ${platform.device}, building a ${platform.name} UI, or auditing ${platform.name} components. Pair with \`foundations\` for shared principles and \`services\` for framework integrations. User says: "design ${platform.device} UI", "${platform.name} component", "audit my ${platform.name} app".`,
			intro: `Platform-specific HIG for ${platform.name}. Components, controls, navigation patterns, and platform conventions unique to ${platform.device}. Pair with \`foundations\` for cross-platform principles and \`services\` for framework integrations.`,
			howTo: [
				`**Match the user's UI element to a topic** in the glossary below — most map directly to component or pattern names.`,
				`**Read only the matched references**. Multi-file topics (marked \`×N\`) live in \`references/<topic>/\`.`,
				`**Pull in foundations** when the answer involves shared principles like color, typography, or accessibility.`,
				`**Stay on ${platform.name}.** If the user is targeting another Apple platform, point to the matching skill in this plugin.`,
			],
			entries: glossaryByBucket.get(platform.slug) ?? [],
			includePlatformsCol: false,
		}),
	});
}

// ── Plugin manifest ─────────────────────────────────────────────

const pluginJson = {
	name: "apple-design",
	description:
		"Apple Human Interface Guidelines as a single plugin: foundations (shared principles), services (framework integrations), and a skill per platform (iOS, macOS, tvOS, visionOS, watchOS).",
	author: { name: "Luca Silverentand", email: "luca.silverentand@gmail.com" },
};

// ── Report ──────────────────────────────────────────────────────

console.log(`Plans: ${plans.length} files to copy`);
console.log(`Skill files: ${skillFiles.length}`);
for (const [bucket, entries] of glossaryByBucket.entries()) {
	console.log(`  ${bucket}: ${entries.length} topics`);
}

if (!write) {
	console.log("\n(dry-run — re-run with --write to apply)");
	process.exit(0);
}

// ── Apply ───────────────────────────────────────────────────────

await rm(TARGET, { recursive: true, force: true });
await mkdir(resolve(TARGET, ".claude-plugin"), { recursive: true });
await writeFile(resolve(TARGET, ".claude-plugin", "plugin.json"), `${JSON.stringify(pluginJson, null, "\t")}\n`);

for (const p of plans) {
	const dest = resolve(TARGET, p.destPath);
	await mkdir(dirname(dest), { recursive: true });
	await copyFile(p.srcPath, dest);
}
for (const sf of skillFiles) {
	const dest = resolve(TARGET, sf.path);
	await mkdir(dirname(dest), { recursive: true });
	await writeFile(dest, sf.content, "utf8");
}

// Remove the 5 old plugins
for (const platform of PLATFORMS) {
	await rm(resolve(PLUGINS_DIR, `apple-design-${platform.slug}`), { recursive: true, force: true });
}

console.log("✓ wrote apple-design plugin");
console.log("✓ removed 5 platform plugins");
