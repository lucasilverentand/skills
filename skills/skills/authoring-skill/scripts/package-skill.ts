// Package a skill folder into a distributable .skill (zip) file.

import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative, basename, resolve } from "node:path";
import { validateSkill } from "./quick-validate.ts";

const EXCLUDE_DIRS = new Set(["__pycache__", "node_modules"]);
const EXCLUDE_GLOBS = new Set(["*.pyc"]);
const EXCLUDE_FILES = new Set([".DS_Store"]);
const ROOT_EXCLUDE_DIRS = new Set(["evals"]);

function shouldExclude(relPath: string, skillDirName: string): boolean {
  const parts = relPath.split("/");
  if (parts.some((p) => EXCLUDE_DIRS.has(p))) return true;
  // parts[0] is the skill folder name, parts[1] is the first subdir
  if (parts.length > 1 && ROOT_EXCLUDE_DIRS.has(parts[1])) return true;
  const name = basename(relPath);
  if (EXCLUDE_FILES.has(name)) return true;
  return [...EXCLUDE_GLOBS].some((pattern) => {
    // Convert glob pattern to regex: *.pyc -> /^.*\.pyc$/
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    return new RegExp(`^${escaped}$`).test(name);
  });
}

function walkDir(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function packageSkill(
  skillPath: string,
  outputDir?: string
): Promise<string | null> {
  const resolved = resolve(skillPath);

  if (!existsSync(resolved)) {
    console.error(`Error: Skill folder not found: ${resolved}`);
    return null;
  }

  if (!statSync(resolved).isDirectory()) {
    console.error(`Error: Path is not a directory: ${resolved}`);
    return null;
  }

  if (!existsSync(join(resolved, "SKILL.md"))) {
    console.error(`Error: SKILL.md not found in ${resolved}`);
    return null;
  }

  // Validate
  console.log("Validating skill...");
  const { valid, message } = validateSkill(resolved);
  if (!valid) {
    console.error(`Validation failed: ${message}`);
    console.error("   Please fix the validation errors before packaging.");
    return null;
  }
  console.log(`${message}\n`);

  const skillName = basename(resolved);
  const outDir = outputDir ? resolve(outputDir) : process.cwd();
  const skillFilename = join(outDir, `${skillName}.skill`);
  const parentDir = resolve(resolved, "..");
  const skillDirName = basename(resolved);

  // Collect files
  const allFiles = walkDir(resolved);
  const filesToAdd: { path: string; arcname: string }[] = [];

  for (const filePath of allFiles) {
    const arcname = relative(parentDir, filePath);
    if (shouldExclude(arcname, skillDirName)) {
      console.log(`  Skipped: ${arcname}`);
      continue;
    }
    filesToAdd.push({ path: filePath, arcname });
    console.log(`  Added: ${arcname}`);
  }

  // Create zip using the system zip command
  if (outputDir) {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(outDir, { recursive: true });
  }

  const entries = filesToAdd.map((f) => f.arcname).join("\n");

  const proc = Bun.spawn(["zip", "-@", skillFilename], {
    cwd: parentDir,
    stdin: new Blob([entries]),
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    console.error(`Error creating .skill file: ${stderr}`);
    return null;
  }

  console.log(`\nSuccessfully packaged skill to: ${skillFilename}`);
  return skillFilename;
}

// CLI entrypoint
if (import.meta.main) {
  const args = Bun.argv.slice(2);

  const HELP = `
package-skill — Package a skill folder into a distributable .skill file

Usage:
  bun run scripts/package-skill.ts <path/to/skill-folder> [output-directory]

Example:
  bun run scripts/package-skill.ts skills/public/my-skill
  bun run scripts/package-skill.ts skills/public/my-skill ./dist
`.trim();

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const filteredArgs = args.filter((a) => !a.startsWith("--"));
  const skillPath = filteredArgs[0];
  const outputDir = filteredArgs[1];

  console.log(`Packaging skill: ${skillPath}`);
  if (outputDir) console.log(`   Output directory: ${outputDir}`);
  console.log();

  const result = await packageSkill(skillPath, outputDir);
  process.exit(result ? 0 : 1);
}
