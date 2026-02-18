#!/usr/bin/env bun
/**
 * Quick single-skill validation.
 * Usage: bun run scripts/verify-skill.ts <path-to-skill-directory>
 */

import { readFileSync, existsSync } from "node:fs";

const skillDir = process.argv[2];
if (!skillDir) {
  console.error("Usage: bun run scripts/verify-skill.ts <skill-directory>");
  process.exit(1);
}

const MAX_LINES = 500;
const NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
let errors = 0;
let warnings = 0;

function err(msg: string) {
  console.log(`  ERROR: ${msg}`);
  errors++;
}
function warn(msg: string) {
  console.log(`  WARN:  ${msg}`);
  warnings++;
}

console.log(`Checking ${skillDir} ...`);

const skillMd = `${skillDir}/SKILL.md`;
if (!existsSync(skillMd)) {
  err("SKILL.md not found");
  console.log(`\nResult: FAIL (${errors} errors, ${warnings} warnings)`);
  process.exit(1);
}

const content = readFileSync(skillMd, "utf-8");
const lines = content.split("\n");

// Check frontmatter
if (lines[0]?.trim() !== "---") {
  err("No YAML frontmatter (missing opening ---)");
}

// Extract frontmatter fields
const nameMatch = content.match(/^name:\s*(.+)$/m);
const descMatch = content.match(/^description:\s*(.+)$/m);

if (!nameMatch) {
  err("Missing 'name' in frontmatter");
} else {
  const name = nameMatch[1].trim();
  const dirName = skillDir.split("/").pop()!;
  if (name !== dirName) err(`Name '${name}' doesn't match directory '${dirName}'`);
  if (!NAME_RE.test(name)) err(`Name '${name}' has invalid format (need lowercase-hyphens)`);
}

if (!descMatch) {
  err("Missing 'description' in frontmatter");
}

if (lines.length > MAX_LINES) {
  warn(`SKILL.md is ${lines.length} lines (max ${MAX_LINES})`);
}

console.log();
if (errors > 0) {
  console.log(`Result: FAIL (${errors} errors, ${warnings} warnings)`);
  process.exit(1);
} else {
  console.log(`Result: PASS (${warnings} warnings)`);
}
