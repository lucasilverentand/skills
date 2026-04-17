#!/usr/bin/env bun
/**
 * Optimizes all .md files in the repo for token efficiency without altering content.
 * Also flags structural issues.
 *
 * Usage:
 *   bun run check          # dry-run — show what would change
 *   bun run check:fix      # apply changes in-place
 *   bun run check --stdin   # read from stdin, write optimized to stdout (for editors)
 */

import { Glob } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const fix = process.argv.includes("--fix");
const stdin = process.argv.includes("--stdin");

// ── Stdin mode (for editors: stdin → optimized stdout) ──────────────
if (stdin) {
	const input = await Bun.stdin.text();
	process.stdout.write(optimize(input));
	process.exit(0);
}

// ── Token estimation ────────────────────────────────────────────────
// Rough GPT/Claude tokenizer heuristic: ~4 chars per token for English prose.
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

// ── Optimizations ───────────────────────────────────────────────────

/** Split text into alternating [prose, code, prose, code, …] segments. */
function splitCodeBlocks(text: string): { segments: string[]; fenced: boolean[] } {
	const segments: string[] = [];
	const fenced: boolean[] = [];
	const fence = /^(`{3,}|~{3,})/gm;
	let last = 0;
	let inCode = false;
	let openFence = "";

	for (const m of text.matchAll(fence)) {
		const tick = m[1];
		if (!inCode) {
			// Opening fence — everything before it is prose
			const lineStart = text.lastIndexOf("\n", m.index!) + 1;
			segments.push(text.slice(last, lineStart));
			fenced.push(false);
			last = lineStart;
			inCode = true;
			openFence = tick[0]; // ` or ~
		} else if (tick[0] === openFence && tick.length >= openFence.length) {
			// Closing fence — grab the full code block including this line
			const lineEnd = text.indexOf("\n", m.index!);
			const end = lineEnd === -1 ? text.length : lineEnd + 1;
			segments.push(text.slice(last, end));
			fenced.push(true);
			last = end;
			inCode = false;
		}
	}
	// Remainder
	segments.push(text.slice(last));
	fenced.push(inCode); // if still inside a code block, mark it
	return { segments, fenced };
}

function compactTableLine(line: string): string {
	// Match a table row: optional blockquote prefix, then | ... |
	const rowMatch = line.match(/^(\s*>?\s*)\|(.+)\|$/);
	if (!rowMatch) return line;

	const [, prefix, inner] = rowMatch;
	// Separator row: | --- | --- | → |---|---|
	if (/^\s*-{3,}(\s*\|\s*-{3,})*\s*$/.test(inner)) {
		const colCount = inner.split("|").length;
		return `${prefix}|${"---|".repeat(colCount)}`;
	}

	// Data row: | cell | cell | → |cell|cell|
	const cells = inner.split("|").map((c: string) => c.trim());
	return `${prefix}|${cells.join("|")}|`;
}

function optimizeProse(text: string): string {
	// 1. Strip trailing whitespace on every line
	let out = text.replace(/[ \t]+$/gm, "");

	// 2. Collapse runs of 2+ blank lines into one
	out = out.replace(/\n{3,}/g, "\n\n");

	// 3. Compact table rows (separator + data)
	out = out
		.split("\n")
		.map((line) => compactTableLine(line))
		.join("\n");

	// 4. Remove blank line directly after a heading (## Foo\n\n → ## Foo\n)
	//    Only when followed by non-blank content (not another heading)
	out = out.replace(/^(#{1,6} .+)\n\n(?!#)/gm, "$1\n");

	return out;
}

function optimizeCode(text: string): string {
	// Only strip trailing whitespace inside code blocks — don't touch content
	return text.replace(/[ \t]+$/gm, "");
}

function optimize(source: string): string {
	const { segments, fenced } = splitCodeBlocks(source);

	const result = segments
		.map((seg, i) => (fenced[i] ? optimizeCode(seg) : optimizeProse(seg)))
		.join("");

	// Ensure single trailing newline
	return result.replace(/\n+$/, "\n");
}

// ── Flagging ────────────────────────────────────────────────────────

interface Flag {
	file: string;
	line?: number;
	severity: "warn" | "error";
	message: string;
}

function parseFrontmatter(content: string): Record<string, string> | null {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;
	const fields: Record<string, string> = {};
	for (const line of match[1].split("\n")) {
		const kv = line.match(/^(\w[\w-]*):\s*(.*)/);
		if (kv) fields[kv[1]] = kv[2];
	}
	return fields;
}

const VAGUE_WORDS = /\b(helper|handler|processor|utility|misc|various|stuff|general)\b/i;
const TRIGGER_PHRASE = /\buse\s+(this\s+)?(skill\s+)?(when|for|if|after|before|proactively)\b/i;
const USER_SAYS = /\buser\s+(says|asks|wants|mentions|references|requests)\b/i;
const PROACTIVE = /\bproactively\b/i;
const FIRST_PERSON = /^(I |My |We |Our )/;
const QUOTED_PHRASES = /['"][^'"]{3,}['"]/g;

function flagTriggerQuality(
	rel: string,
	descLine: number,
	desc: string,
	fm: Record<string, string>,
): Flag[] {
	const flags: Flag[] = [];

	// ── Hard requirements ──

	if (desc.length > 1024) {
		flags.push({
			file: rel,
			line: descLine,
			severity: "error",
			message: `description is ${desc.length} chars — exceeds 1024 char max`,
		});
	}

	if (FIRST_PERSON.test(desc)) {
		flags.push({
			file: rel,
			line: descLine,
			severity: "error",
			message: 'description uses first person — use third person ("Generates..." not "I generate...")',
		});
	}

	// ── Trigger section ──

	if (!TRIGGER_PHRASE.test(desc)) {
		flags.push({
			file: rel,
			line: descLine,
			severity: "error",
			message: 'description has no trigger clause — add "Use when..." to tell Claude when to activate',
		});
	}

	// ── Trigger quality signals ──

	// Count distinct trigger contexts (phrases after "Use when" separated by commas/or)
	const triggerSection = desc.match(/use\s+(?:this\s+)?(?:skill\s+)?when\b(.*)/is);
	if (triggerSection) {
		// Split on commas and "or" to count distinct triggers
		const triggers = triggerSection[1]
			.split(/,\s*(?:or\s+)?|\.\s*(?:Also|Or)\s+/i)
			.filter((t) => t.trim().length > 10);
		if (triggers.length < 3) {
			flags.push({
				file: rel,
				line: descLine,
				severity: "warn",
				message: `only ${triggers.length} trigger context(s) — aim for 3+ to improve activation coverage`,
			});
		}
	}

	// Check for user-language quotes (helps matching natural requests)
	if (!USER_SAYS.test(desc) && !QUOTED_PHRASES.test(desc)) {
		flags.push({
			file: rel,
			line: descLine,
			severity: "warn",
			message: "no user language examples — add phrases like 'when the user says \"...\"' for better matching",
		});
	}

	// Check for vague words
	const vagueMatch = desc.match(VAGUE_WORDS);
	if (vagueMatch) {
		flags.push({
			file: rel,
			line: descLine,
			severity: "warn",
			message: `vague word "${vagueMatch[0]}" in description — use concrete action verbs instead`,
		});
	}

	return flags;
}

function flag(filePath: string, content: string): Flag[] {
	const rel = relative(ROOT, filePath);
	const flags: Flag[] = [];
	const lines = content.split("\n");
	const isSkill = filePath.endsWith("SKILL.md");
	// References and supporting docs are only loaded when Claude explicitly
	// reads them — they can be larger than the auto-injected SKILL.md.
	const isReference = /\/references\//.test(filePath);

	// ── Token budget ──
	// Thresholds are tighter for SKILL.md because it's auto-injected into
	// context whenever the skill triggers. References are opt-in reads.

	const tokens = estimateTokens(content);
	const tokenWarn = isReference ? 3000 : 2000;
	const tokenError = isReference ? 6000 : 4000;
	if (tokens > tokenError) {
		flags.push({
			file: rel,
			severity: "error",
			message: isSkill
				? `~${tokens} tokens — very large for a context-injected file`
				: `~${tokens} tokens — very large, split into multiple files`,
		});
	} else if (tokens > tokenWarn) {
		flags.push({
			file: rel,
			severity: "warn",
			message: `~${tokens} tokens — consider splitting or trimming`,
		});
	}

	// ── Frontmatter checks ──

	const fm = parseFrontmatter(content);

	if (isSkill) {
		const descLineNum = lines.findIndex((l) => l.startsWith("description:")) + 1;

		if (!fm) {
			flags.push({
				file: rel,
				severity: "error",
				message: "SKILL.md has no YAML frontmatter",
			});
		} else if (!fm.description) {
			flags.push({
				file: rel,
				severity: "error",
				message: "missing description — Claude cannot trigger this skill without one",
			});
		} else {
			flags.push(
				...flagTriggerQuality(rel, descLineNum, fm.description, fm),
			);
		}

		// Check name matches directory
		if (fm?.name) {
			const dirName = filePath.split("/").at(-2);
			if (fm.name !== dirName) {
				flags.push({
					file: rel,
					severity: "error",
					message: `name "${fm.name}" doesn't match directory "${dirName}"`,
				});
			}
		}
	}

	// ── Structural checks (all .md files) ──

	// Deep nesting (4+ levels of indentation in lists)
	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(/^(\s+)[-*\d]/);
		if (match && match[1].length >= 8) {
			flags.push({
				file: rel,
				line: i + 1,
				severity: "warn",
				message: `deep nesting (${Math.floor(match[1].length / 2)} levels) — harder for agents to parse`,
			});
		}
	}

	// Consecutive-blank bloat: the optimizer collapses 3+ blanks to 2 and
	// strips blanks immediately after headings. Anything leftover is
	// semantic paragraph separation, which is fine. We only flag files that
	// still have runs of 2+ blanks that slipped past the optimizer (should
	// be zero after --fix). This replaces the old blank-line-ratio heuristic
	// that incorrectly penalized naturally concise reference prose.

	let maxBlankRun = 0;
	let currentBlank = 0;
	for (const line of lines) {
		if (line.trim() === "") {
			currentBlank++;
			if (currentBlank > maxBlankRun) maxBlankRun = currentBlank;
		} else {
			currentBlank = 0;
		}
	}
	if (maxBlankRun >= 3) {
		flags.push({
			file: rel,
			severity: "warn",
			message: `${maxBlankRun} consecutive blank lines — run \`bun scripts/check.ts --fix\` to collapse`,
		});
	}

	return flags;
}

// ── Main ────────────────────────────────────────────────────────────

const glob = new Glob("**/*.md");
const files: string[] = [];
for await (const path of glob.scan({ cwd: ROOT, absolute: true })) {
	// Skip node_modules, .git, build artifacts, and caches
	if (/node_modules|\.git\/|\/build\/|\/\.cache\//.test(path)) continue;
	files.push(path);
}
files.sort();

// ── Diffing ─────────────────────────────────────────────────────────

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

async function printDiff(rel: string, original: string, optimized: string) {
	// Use system diff for a proper unified diff
	const oldTmp = `${import.meta.dir}/.check-old.tmp`;
	const newTmp = `${import.meta.dir}/.check-new.tmp`;
	await writeFile(oldTmp, original);
	await writeFile(newTmp, optimized);

	const proc = Bun.spawn(["diff", "-u", "--label", rel, "--label", rel, oldTmp, newTmp], {
		stdout: "pipe",
	});
	const output = await new Response(proc.stdout).text();
	await proc.exited;

	// Clean up
	await Bun.file(oldTmp).delete();
	await Bun.file(newTmp).delete();

	if (!output) return;

	const lines = output.split("\n");
	console.log(`\n${bold(cyan(rel))}`);
	for (const line of lines) {
		if (line.startsWith("@@")) {
			console.log(dim(`  ${line}`));
		} else if (line.startsWith("-") && !line.startsWith("---")) {
			console.log(red(`  ${line}`));
		} else if (line.startsWith("+") && !line.startsWith("+++")) {
			console.log(green(`  ${line}`));
		} else if (line.startsWith("---") || line.startsWith("+++")) {
			// skip file headers — we already printed the filename
		} else if (line) {
			console.log(dim(`  ${line}`));
		}
	}
}

// ── Main loop ───────────────────────────────────────────────────────

let totalSaved = 0;
let filesChanged = 0;
const allFlags: Flag[] = [];

for (const filePath of files) {
	const original = await readFile(filePath, "utf-8");
	const optimized = optimize(original);
	const saved = original.length - optimized.length;

	allFlags.push(...flag(filePath, optimized));

	if (saved > 0) {
		filesChanged++;
		totalSaved += saved;

		if (fix) {
			await writeFile(filePath, optimized);
			const rel = relative(ROOT, filePath);
			const pct = ((saved / original.length) * 100).toFixed(1);
			console.log(`  ${green("fixed")}  ${rel}  ${dim(`-${saved} chars (${pct}%)`)}`);
		} else {
			await printDiff(relative(ROOT, filePath), original, optimized);
		}
	}
}

// ── Report ──────────────────────────────────────────────────────────

console.log("");

if (allFlags.length > 0) {
	console.log(bold("Flags:"));
	for (const f of allFlags) {
		const loc = f.line ? `:${f.line}` : "";
		const icon = f.severity === "error" ? red("ERR ") : yellow("WARN");
		console.log(`  ${icon}  ${f.file}${loc}  ${dim(f.message)}`);
	}
	console.log("");
}

const summary = `${filesChanged} file(s) ${fix ? "fixed" : "to fix"}, ${totalSaved} chars saved (~${Math.round(totalSaved / 4)} tokens)`;
console.log(fix ? green(summary) : bold(summary));

if (!fix && filesChanged > 0) {
	console.log(dim("Run with --fix to apply changes."));
}

const hasErrors = allFlags.some((f) => f.severity === "error");
process.exit(hasErrors ? 1 : 0);
