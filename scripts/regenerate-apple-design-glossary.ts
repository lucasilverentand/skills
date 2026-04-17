#!/usr/bin/env bun
/**
 * Regenerates the 7 apple-design SKILL.md files (foundations, services, ios,
 * macos, tvos, visionos, watchos) from whatever references currently exist on
 * disk. Does not move or delete any files — purely rewrites the SKILL.md
 * frontmatter, intro, how-to, and glossary table.
 *
 * Improvements over scripts/reorganize-apple-design.ts:
 *   - shortDescriptionFromBody strips a leading bullet marker so summaries
 *     no longer start with "- " when the first content line is a list item.
 *   - buildGlossary prefers `overview.md` / `guidelines-overview.md` / other
 *     overview-style files as the canonical summary source for multi-file
 *     topics instead of always picking the alphabetically-first file.
 *
 * Usage:
 *   bun scripts/regenerate-apple-design-glossary.ts          # dry-run
 *   bun scripts/regenerate-apple-design-glossary.ts --write  # apply
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..", "plugins", "apple-design", "skills");
const REPO_ROOT = resolve(import.meta.dir, "..");
const write = process.argv.includes("--write");

const PLATFORMS = ["ios", "macos", "tvos", "visionos", "watchos"] as const;
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

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

// ── Helpers ─────────────────────────────────────────────────────────

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
	// Strip a leading bullet marker so list-item fragments don't bleed into
	// the glossary ("- Prefer the system…" → "Prefer the system…").
	out = out.replace(/^[-*•]\s+/, "");
	out = out.replace(/^An? /i, "").replace(/^The /, "");
	const MAX = 80;
	if (out.length > MAX) {
		const trunc = out.slice(0, MAX);
		const lastSpace = trunc.lastIndexOf(" ");
		out = `${trunc.slice(0, lastSpace > 40 ? lastSpace : MAX)}…`;
	}
	return out;
}

/**
 * Picks the canonical file inside a folder topic. Preference order:
 *   1. `overview.md`
 *   2. `guidelines-overview.md`
 *   3. any `*-overview.md` (suffix, e.g. `designing-your-app-clip-overview.md`)
 *   4. any `guidelines-*.md`
 *   5. alphabetical fallback (original behavior)
 */
function pickCanonical(files: string[]): string {
	const sorted = files.slice().sort();
	return (
		sorted.find((f) => f === "overview.md") ??
		sorted.find((f) => f === "guidelines-overview.md") ??
		sorted.find((f) => /(^|-)overview\.md$/.test(f)) ??
		sorted.find((f) => f.startsWith("guidelines-")) ??
		sorted[0]!
	);
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
			const files = (await readdir(resolve(refDir, ent.name))).filter((f) => f.endsWith(".md"));
			if (files.length === 0) continue;
			const canonical = pickCanonical(files);
			const sample = await readFile(resolve(refDir, ent.name, canonical), "utf8");
			out.push({
				topic,
				primaryReference: `${topic}/`,
				fileCount: files.length,
				summary: shortDescriptionFromBody(sample),
			});
		} else {
			if (!ent.name.endsWith(".md")) continue;
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

// ── Specs (cloned from reorganize-apple-design.ts to stay identical) ────

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

// ── Diff + apply ────────────────────────────────────────────────────

let changes = 0;

for (const { skill, spec } of skillSpecs) {
	const path = resolve(ROOT, skill, "SKILL.md");
	const newContent = buildSkillMd(spec);
	const oldContent = await readFile(path, "utf8").catch(() => "");
	if (oldContent === newContent) continue;

	changes++;
	const rel = relative(REPO_ROOT, path);
	if (write) {
		await writeFile(path, newContent);
		console.log(`  ${green("updated")}  ${rel}`);
	} else {
		console.log(`  ${yellow("would update")}  ${rel}`);
	}
}

console.log("");
if (changes === 0) {
	console.log(green("All 7 SKILL.md files up to date."));
} else if (write) {
	console.log(green(`${changes} SKILL.md file(s) updated.`));
} else {
	console.log(bold(`${changes} SKILL.md file(s) to update.`));
	console.log(dim("Run with --write to apply changes."));
}
