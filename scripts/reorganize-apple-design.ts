#!/usr/bin/env bun
/**
 * Reorganizes the apple-design plugin's skill assignments:
 *  - Moves topics duplicated identically across all 5 platforms into
 *    `foundations` (cross-cutting design content) or `services` (Apple
 *    framework integrations), based on the curated lists below.
 *  - Moves spatial-layout from foundations to visionos (it's Vision Pro–specific).
 *  - Removes the index meta file.
 *  - Regenerates all 7 SKILL.md glossary files.
 *
 * Usage:
 *   bun scripts/reorganize-apple-design.ts          # dry-run
 *   bun scripts/reorganize-apple-design.ts --write  # apply
 */

import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..", "plugins", "apple-design", "skills");
const write = process.argv.includes("--write");
const PLATFORMS = ["ios", "macos", "tvos", "visionos", "watchos"];
const PLATFORM_NAMES: Record<string, string> = {
	ios: "iOS & iPadOS",
	macos: "macOS",
	tvos: "tvOS",
	visionos: "visionOS",
	watchos: "watchOS",
};
const PLATFORM_DEVICES: Record<string, string> = {
	ios: "iPhone and iPad",
	macos: "Mac",
	tvos: "Apple TV",
	visionos: "Apple Vision Pro",
	watchos: "Apple Watch",
};

// ── Reorganization rules ────────────────────────────────────────

// Topics currently duplicated identically in every platform skill that
// should move into foundations (shared design content + meta TOCs + UI
// elements that are truly platform-agnostic).
const MOVE_TO_FOUNDATIONS = new Set([
	"activity-views",
	"components",
	"content",
	"designing-for-games",
	"digit-entry-views",
	"disclosure-controls",
	"getting-started",
	"image-wells",
	"lockups",
	"menus-and-actions",
	"navigation-and-search",
	"outline-views",
	"patterns",
	"rating-indicators",
	"searching",
	"selection-and-input",
	"status",
	"status-bars",
	"technologies",
	"web-views",
]);

// Topics currently duplicated identically in every platform skill that are
// Apple frameworks/services and should move into the services skill.
const MOVE_TO_SERVICES = new Set([
	"camera-control",
	"controls", // Control Center
	"gyro-and-accelerometer",
	"photo-editing",
]);

// Topics currently in foundations that don't belong there.
const MOVE_OUT_OF_FOUNDATIONS: Array<{ topic: string; toSkill: string }> = [
	{ topic: "spatial-layout", toSkill: "visionos" },
];

// Files in foundations to delete entirely.
const DELETE_FROM_FOUNDATIONS = new Set(["index.md"]);

// ── Helpers ─────────────────────────────────────────────────────

async function exists(p: string): Promise<boolean> {
	try {
		await stat(p);
		return true;
	} catch {
		return false;
	}
}

async function pathKind(p: string): Promise<"file" | "dir" | null> {
	try {
		const s = await stat(p);
		return s.isDirectory() ? "dir" : "file";
	} catch {
		return null;
	}
}

async function topicLocation(refDir: string, topic: string): Promise<{ path: string; kind: "file" | "dir" } | null> {
	const dirPath = resolve(refDir, topic);
	const filePath = `${dirPath}.md`;
	const dk = await pathKind(dirPath);
	if (dk === "dir") return { path: dirPath, kind: "dir" };
	const fk = await pathKind(filePath);
	if (fk === "file") return { path: filePath, kind: "file" };
	return null;
}

async function copyDir(src: string, dst: string): Promise<void> {
	await mkdir(dst, { recursive: true });
	for (const ent of await readdir(src, { withFileTypes: true })) {
		const s = resolve(src, ent.name);
		const d = resolve(dst, ent.name);
		if (ent.isDirectory()) await copyDir(s, d);
		else await copyFile(s, d);
	}
}

async function moveTopic(srcRefDir: string, dstRefDir: string, topic: string): Promise<boolean> {
	const loc = await topicLocation(srcRefDir, topic);
	if (!loc) return false;
	const dstName = loc.kind === "file" ? `${topic}.md` : topic;
	const dstPath = resolve(dstRefDir, dstName);
	await mkdir(dirname(dstPath), { recursive: true });
	if (await exists(dstPath)) {
		// already there; just delete src
		await rm(loc.path, { recursive: true, force: true });
		return true;
	}
	if (loc.kind === "file") await copyFile(loc.path, dstPath);
	else await copyDir(loc.path, dstPath);
	await rm(loc.path, { recursive: true, force: true });
	return true;
}

async function deleteTopicEverywhere(skill: string, topic: string): Promise<void> {
	const refDir = resolve(ROOT, skill, "references");
	const loc = await topicLocation(refDir, topic);
	if (loc) await rm(loc.path, { recursive: true, force: true });
}

function shortDescriptionFromBody(body: string): string {
	const lines = body.split("\n");
	let para = "";
	for (const line of lines) {
		const t = line.trim();
		if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("---") || t.startsWith("|")) continue;
		para = t;
		break;
	}
	const cleaned = para
		.replace(/\*\*/g, "")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/`/g, "");
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

interface GlossaryEntry {
	topic: string;
	primaryReference: string;
	fileCount: number;
	summary: string;
}

async function buildGlossary(skill: string): Promise<GlossaryEntry[]> {
	const refDir = resolve(ROOT, skill, "references");
	const ents = await readdir(refDir, { withFileTypes: true });
	const out: GlossaryEntry[] = [];
	for (const ent of ents) {
		const topic = ent.isDirectory() ? ent.name : ent.name.replace(/\.md$/, "");
		if (topic === "index") continue;
		if (ent.isDirectory()) {
			const files = await readdir(resolve(refDir, ent.name));
			const sample = await readFile(resolve(refDir, ent.name, files.sort()[0]), "utf8");
			out.push({
				topic,
				primaryReference: `${topic}/`,
				fileCount: files.length,
				summary: shortDescriptionFromBody(sample),
			});
		} else {
			const sample = await readFile(resolve(refDir, ent.name), "utf8");
			out.push({
				topic,
				primaryReference: `${topic}.md`,
				fileCount: 1,
				summary: shortDescriptionFromBody(sample),
			});
		}
	}
	return out.sort((a, b) => a.topic.localeCompare(b.topic));
}

function buildSkillMd(opts: {
	skillName: string;
	title: string;
	description: string;
	intro: string;
	howTo: string[];
	entries: GlossaryEntry[];
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
	lines.push("| Topic | Reference | Summary |");
	lines.push("| --- | --- | --- |");
	for (const e of opts.entries) {
		const ref = e.fileCount > 1 ? `\`${e.primaryReference}\` ×${e.fileCount}` : `\`${e.primaryReference}\``;
		const summary = e.summary.replace(/\|/g, "\\|");
		lines.push(`| \`${e.topic}\` | ${ref} | ${summary} |`);
	}
	lines.push("");
	return lines.join("\n");
}

// ── Plan ────────────────────────────────────────────────────────

interface Action {
	kind: "move" | "delete";
	topic: string;
	from: string; // skill
	to?: string; // skill
}

const actions: Action[] = [];

for (const topic of MOVE_TO_FOUNDATIONS) {
	for (const platform of PLATFORMS) {
		const refDir = resolve(ROOT, platform, "references");
		if (await topicLocation(refDir, topic)) {
			actions.push({ kind: "move", topic, from: platform, to: "foundations" });
		}
	}
}
for (const topic of MOVE_TO_SERVICES) {
	for (const platform of PLATFORMS) {
		const refDir = resolve(ROOT, platform, "references");
		if (await topicLocation(refDir, topic)) {
			actions.push({ kind: "move", topic, from: platform, to: "services" });
		}
	}
}
for (const m of MOVE_OUT_OF_FOUNDATIONS) {
	const refDir = resolve(ROOT, "foundations", "references");
	if (await topicLocation(refDir, m.topic)) {
		actions.push({ kind: "move", topic: m.topic, from: "foundations", to: m.toSkill });
	}
}
for (const f of DELETE_FROM_FOUNDATIONS) {
	const path = resolve(ROOT, "foundations", "references", f);
	if (await exists(path)) {
		actions.push({ kind: "delete", topic: f, from: "foundations" });
	}
}

console.log(`\nPlanned actions: ${actions.length}`);
const summary = new Map<string, number>();
for (const a of actions) {
	const key = a.kind === "delete" ? `delete from ${a.from}` : `${a.from} → ${a.to}`;
	summary.set(key, (summary.get(key) ?? 0) + 1);
}
for (const [k, n] of summary) console.log(`  ${n.toString().padStart(3)}  ${k}`);

if (!write) {
	console.log("\n(dry-run — re-run with --write to apply)");
	process.exit(0);
}

// ── Apply ───────────────────────────────────────────────────────

for (const action of actions) {
	if (action.kind === "delete") {
		const path = resolve(ROOT, action.from, "references", action.topic);
		await rm(path, { recursive: true, force: true });
		continue;
	}
	const srcRefDir = resolve(ROOT, action.from, "references");
	const dstRefDir = resolve(ROOT, action.to!, "references");
	await moveTopic(srcRefDir, dstRefDir, action.topic);
}

// ── Regenerate SKILL.md files ──────────────────────────────────

const FOUNDATIONS_HOW_TO = [
	"**Match the user's question to a topic** in the glossary below.",
	"**Read only the relevant reference** with `Read`. Topics with multiple files (`×N`) live in `references/<topic>/`.",
	"**Combine with the platform skill** when the user is targeting a specific device — e.g., color foundations + `ios` for iPhone-specific palettes.",
	"**Cite the topic** when giving guidance so the user can verify against Apple's source.",
];

const SERVICES_HOW_TO = [
	"**Identify the framework or service** the user wants to integrate, find it in the glossary.",
	"**Read the topic's references**. Multi-file topics (`×N`) typically split overview, design, privacy, and platform notes.",
	"**Combine with the platform skill** when the service surfaces UI on a specific device (e.g., Apple Pay button on iOS).",
	"**Honor service-mandated rules strictly** — many services (Pay, Sign in with Apple, Wallet) carry legal/branding requirements.",
];

const platformHowTo = (platform: string) => [
	"**Match the user's UI element to a topic** — most map directly to component or pattern names.",
	"**Read only the matched references**. Multi-file topics (`×N`) live in `references/<topic>/`.",
	"**Pull in `foundations`** for shared principles (color, typography, layout, accessibility, shared UI like rating indicators).",
	"**Pull in `services`** when integrating Apple frameworks (Pay, HealthKit, Siri, sensors, media playback).",
	`**Stay on ${PLATFORM_NAMES[platform]}.** For another Apple platform, point to the matching skill.`,
];

const skillSpecs: Array<{ skill: string; spec: Parameters<typeof buildSkillMd>[0] }> = [
	{
		skill: "foundations",
		spec: {
			skillName: "foundations",
			title: "Apple Design Foundations",
			description:
				'Cross-platform Apple Human Interface Guidelines: color, typography, layout, materials, motion, accessibility, SF Symbols, branding, plus shared UI elements (activity views, rating indicators, web views, …) and meta sections (components, patterns, technologies). Use when the design topic is platform-agnostic. User says: "iOS color tokens", "SF Symbols", "Apple typography", "dark mode guidance".',
			intro:
				"Foundational HIG topics shared across all Apple platforms — design principles, accessibility, shared UI elements with identical guidance everywhere, and meta indexes. For platform-specific component variations, see the matching `<platform>` skill.",
			howTo: FOUNDATIONS_HOW_TO,
			entries: await buildGlossary("foundations"),
		},
	},
	{
		skill: "services",
		spec: {
			skillName: "services",
			title: "Apple Services & Frameworks",
			description:
				'Apple framework and service integrations: Apple Pay, HealthKit, HomeKit, Siri, CarPlay, Sign in with Apple, App Clips, widgets, Camera, Control Center, sensors, and more. Use when integrating an Apple framework or designing UI that surfaces one. User says: "add Apple Pay", "Sign in with Apple", "HealthKit UI", "design a widget".',
			intro:
				"Apple framework/service integration guidance — design rules and constraints for surfacing services like Pay, HealthKit, Siri, Wallet, App Clips, widgets, and hardware framework features (camera, sensors, Control Center). Pair with the platform skill when the service has device-specific UI.",
			howTo: SERVICES_HOW_TO,
			entries: await buildGlossary("services"),
		},
	},
];

for (const platform of PLATFORMS) {
	skillSpecs.push({
		skill: platform,
		spec: {
			skillName: platform,
			title: `${PLATFORM_NAMES[platform]} Design`,
			description: `Apple Human Interface Guidelines for ${PLATFORM_NAMES[platform]} — UI components, controls, navigation, and platform conventions for ${PLATFORM_DEVICES[platform]}. Use when designing for ${PLATFORM_DEVICES[platform]}, building a ${PLATFORM_NAMES[platform]} UI, or auditing ${PLATFORM_NAMES[platform]} components. Pair with \`foundations\` for shared principles and \`services\` for framework integrations. User says: "design ${PLATFORM_DEVICES[platform]} UI", "${PLATFORM_NAMES[platform]} component", "audit my ${PLATFORM_NAMES[platform]} app".`,
			intro: `Platform-specific HIG for ${PLATFORM_NAMES[platform]}. Components, controls, navigation patterns, and conventions unique to ${PLATFORM_DEVICES[platform]}. Pair with \`foundations\` for cross-platform principles and \`services\` for framework integrations.`,
			howTo: platformHowTo(platform),
			entries: await buildGlossary(platform),
		},
	});
}

for (const { skill, spec } of skillSpecs) {
	const path = resolve(ROOT, skill, "SKILL.md");
	await writeFile(path, buildSkillMd(spec), "utf8");
	console.log(`  ✓ wrote ${relative(resolve(ROOT, "..", ".."), path)}`);
}

console.log("\n✓ reorganization complete");
