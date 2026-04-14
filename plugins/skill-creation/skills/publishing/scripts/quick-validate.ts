// Quick validation script for skills — minimal standalone version.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ALLOWED_PROPERTIES = new Set([
  "name",
  "description",
  "license",
  "allowed-tools",
  "metadata",
  "compatibility",
]);

export function validateSkill(
  skillPath: string
): { valid: boolean; message: string } {
  const skillMd = join(skillPath, "SKILL.md");
  if (!existsSync(skillMd)) {
    return { valid: false, message: "SKILL.md not found" };
  }

  const content = readFileSync(skillMd, "utf-8");
  if (!content.startsWith("---")) {
    return { valid: false, message: "No YAML frontmatter found" };
  }

  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { valid: false, message: "Invalid frontmatter format" };
  }

  // Simple key-value frontmatter parser (no yaml dependency)
  const frontmatter: Record<string, string> = {};
  let currentKey = "";
  let currentValue = "";

  for (const line of match[1].split("\n")) {
    const kvMatch = line.match(/^([a-z][a-z0-9-]*)\s*:\s*(.*)/);
    if (kvMatch) {
      if (currentKey) frontmatter[currentKey] = currentValue.trim();
      currentKey = kvMatch[1];
      currentValue = kvMatch[2];
    } else if (currentKey && (line.startsWith("  ") || line.startsWith("\t"))) {
      currentValue += " " + line.trim();
    }
  }
  if (currentKey) frontmatter[currentKey] = currentValue.trim();

  // Check for unexpected properties
  const unexpected = Object.keys(frontmatter).filter(
    (k) => !ALLOWED_PROPERTIES.has(k)
  );
  if (unexpected.length > 0) {
    return {
      valid: false,
      message: `Unexpected key(s) in SKILL.md frontmatter: ${unexpected.join(", ")}. Allowed properties are: ${[...ALLOWED_PROPERTIES].sort().join(", ")}`,
    };
  }

  // Check required fields
  if (!frontmatter.name) {
    return { valid: false, message: "Missing 'name' in frontmatter" };
  }
  if (!frontmatter.description) {
    return { valid: false, message: "Missing 'description' in frontmatter" };
  }

  const name = frontmatter.name.replace(/^["']|["']$/g, "").trim();
  if (name) {
    if (!/^[a-z0-9-]+$/.test(name)) {
      return {
        valid: false,
        message: `Name '${name}' should be kebab-case (lowercase letters, digits, and hyphens only)`,
      };
    }
    if (name.startsWith("-") || name.endsWith("-") || name.includes("--")) {
      return {
        valid: false,
        message: `Name '${name}' cannot start/end with hyphen or contain consecutive hyphens`,
      };
    }
    if (name.length > 64) {
      return {
        valid: false,
        message: `Name is too long (${name.length} characters). Maximum is 64 characters.`,
      };
    }
  }

  const description = frontmatter.description
    .replace(/^["']|["']$/g, "")
    .trim();
  if (description) {
    if (description.includes("<") || description.includes(">")) {
      return {
        valid: false,
        message: "Description cannot contain angle brackets (< or >)",
      };
    }
    if (description.length > 1024) {
      return {
        valid: false,
        message: `Description is too long (${description.length} characters). Maximum is 1024 characters.`,
      };
    }
  }

  const compatibility = frontmatter.compatibility || "";
  if (compatibility) {
    if (compatibility.length > 500) {
      return {
        valid: false,
        message: `Compatibility is too long (${compatibility.length} characters). Maximum is 500 characters.`,
      };
    }
  }

  return { valid: true, message: "Skill is valid!" };
}

// CLI entrypoint
if (import.meta.main) {
  const args = Bun.argv.slice(2);

  const HELP = `
quick-validate — Quick SKILL.md frontmatter validation

Usage:
  bun run scripts/quick-validate.ts <skill-directory>

Checks YAML frontmatter validity, name format, and description length.
`.trim();

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const { valid, message } = validateSkill(args[0]);
  console.log(message);
  process.exit(valid ? 0 : 1);
}
