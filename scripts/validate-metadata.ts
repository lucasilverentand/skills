#!/usr/bin/env bun
/**
 * Validate Claude Code metadata files (plugin.json, marketplace.json).
 * Checks JSON syntax, required fields, naming conventions, and semver.
 */

import { existsSync } from "node:fs";

const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

let errors = 0;

function pass(msg: string) {
  console.log(`  ${GREEN}✔${NC} ${msg}`);
}
function fail(msg: string) {
  console.log(`  ${RED}✗${NC} ${msg}`);
  errors++;
}
function warn(msg: string) {
  console.log(`  ${YELLOW}⚠${NC} ${msg}`);
}

const SEMVER = /^\d+\.\d+\.\d+$/;
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function validateJsonFile(
  path: string,
  label: string,
  checks: (data: Record<string, unknown>) => void,
) {
  if (!existsSync(path)) {
    warn(`${label} not found at ${path}`);
    return;
  }

  console.log(`Checking ${label}...`);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(Bun.file(path).text() as unknown as string);
  } catch {
    // Bun.file().text() returns a promise, use sync read instead
    const text = require("node:fs").readFileSync(path, "utf-8");
    try {
      data = JSON.parse(text);
    } catch {
      fail("Invalid JSON syntax");
      return;
    }
  }

  pass("Valid JSON syntax");
  checks(data);
  console.log();
}

function checkName(data: Record<string, unknown>) {
  const name = data.name as string | undefined;
  if (!name) return fail("Missing required field: name");
  if (!KEBAB.test(name)) return fail("name must be kebab-case");
  pass(`name is valid: ${name}`);
}

function checkDescription(data: Record<string, unknown>) {
  if (data.description) pass("description is present");
  else fail("Missing required field: description");
}

function checkVersion(data: Record<string, unknown>) {
  const version = data.version as string | undefined;
  if (!version) return fail("Missing required field: version");
  if (SEMVER.test(version)) pass(`version is valid semver: ${version}`);
  else warn(`version should follow semver (X.Y.Z): ${version}`);
}

console.log("🔍 Validating Claude Code metadata files...\n");

// Validate plugin.json
validateJsonFile(".claude-plugin/plugin.json", "plugin.json", (data) => {
  checkName(data);
  checkDescription(data);
  checkVersion(data);
  const authorName = (data.author as Record<string, unknown>)?.name;
  if (authorName) pass(`author.name is present: ${authorName}`);
  else warn("author.name is recommended");
});

// Validate marketplace.json
validateJsonFile(
  ".claude-plugin/marketplace.json",
  "marketplace.json",
  (data) => {
    checkName(data);

    // metadata.description and metadata.version (Claude Code schema)
    const metadata = data.metadata as Record<string, unknown> | undefined;
    if (metadata?.description) pass(`metadata.description is present`);
    else if (data.description) pass("description is present (top-level, consider moving to metadata)");
    else fail("Missing description (expected in metadata.description)");

    if (metadata?.version) {
      const v = metadata.version as string;
      if (SEMVER.test(v)) pass(`metadata.version is valid semver: ${v}`);
      else warn(`metadata.version should follow semver (X.Y.Z): ${v}`);
    } else {
      checkVersion(data);
    }

    const owner = data.owner as Record<string, unknown> | undefined;
    if (!owner) {
      fail("Missing required field: owner (must be an object)");
    } else if (owner.name) {
      pass(`owner.name is present: ${owner.name}`);
    } else {
      fail("owner.name is required");
    }

    const plugins = data.plugins as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(plugins)) {
      fail("Missing required field: plugins (must be an array)");
    } else {
      pass(`plugins array has ${plugins.length} items`);
      for (let i = 0; i < plugins.length; i++) {
        if (!plugins[i].name) fail(`Plugin at index ${i} is missing 'name'`);
        const source = plugins[i].source as string | undefined;
        if (!source) {
          fail(`Plugin at index ${i} is missing 'source'`);
        } else {
          const resolved = source.replace(/^@/, "").replace(/^\.\//, "") || ".";
          if (resolved !== "." && !existsSync(resolved)) {
            fail(`Plugin source directory does not exist: ${source}`);
          }
        }
      }
    }
  },
);

// Summary
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
if (errors === 0) {
  console.log(`${GREEN}✔ Validation passed${NC}`);
} else {
  console.log(`${RED}✗ Validation failed with ${errors} error(s)${NC}`);
  process.exit(1);
}
