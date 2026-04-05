#!/usr/bin/env bun
/**
 * Run all validations: generated metadata, skills structure, and marketplace integrity.
 */

import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";

const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

let errors = 0;
let warnings = 0;

async function runScript(label: string, args: string[]): Promise<boolean> {
  console.log(`━━━ ${label} ━━━`);
  const proc = Bun.spawn(["bun", "run", ...args], {
    stdout: "inherit",
    stderr: "inherit",
    cwd: process.cwd(),
  });
  const exitCode = await proc.exited;
  const ok = exitCode === 0;
  if (ok) console.log(`${GREEN}✔${NC} ${label} passed`);
  else {
    console.log(`${RED}✗${NC} ${label} failed`);
    errors++;
  }
  console.log();
  return ok;
}

console.log("🔍 Validating generated plugin metadata, skills, and marketplace...\n");

// 1. Custom metadata validation
await runScript("Custom Metadata Validation", ["scripts/validate-metadata.ts"]);

// 3. Skill directory validation
console.log("━━━ Skill Directory Validation ━━━");
const glob = new Bun.Glob("**/SKILL.md");
for (const match of glob.scanSync({ cwd: "skills" })) {
  const skillDir = `skills/${dirname(match)}`;
  const skillName = basename(dirname(match));

  // Check description in frontmatter
  const content = await Bun.file(`skills/${match}`).text();
  const descMatch = content.match(/^description:\s*(.+)$/m);
  if (descMatch && descMatch[1].trim()) {
    console.log(`${GREEN}✔${NC} ${skillName}`);
  } else {
    console.log(`${YELLOW}⚠${NC} ${skillName}: Missing description (recommended for auto-invocation)`);
    warnings++;
  }
}

// Check for misplaced skills
console.log();
console.log("Checking for misplaced skills...");
const rootGlob = new Bun.Glob("**/SKILL.md");
let hasOrphans = false;
for (const match of rootGlob.scanSync({ cwd: "." })) {
  if (!match.startsWith("skills/")) {
    console.log(`${YELLOW}⚠${NC} Found SKILL.md outside skills/ directory: ${match}`);
    warnings++;
    hasOrphans = true;
  }
}
if (!hasOrphans) console.log(`${GREEN}✔${NC} No misplaced skills`);
console.log();

// Summary
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
if (errors > 0) {
  console.log(`${RED}✘ Validation failed: ${errors} error(s), ${warnings} warning(s)${NC}`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`${YELLOW}⚠ Validation passed with ${warnings} warning(s)${NC}`);
} else {
  console.log(`${GREEN}✔ All validations passed${NC}`);
}
