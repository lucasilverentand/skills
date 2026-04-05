#!/usr/bin/env bun
/**
 * Validate generated plugin metadata files.
 * Checks JSON syntax, required fields, naming conventions, and semver.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

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
  checks: (data: Record<string, unknown>, path: string) => void,
) {
  if (!existsSync(path)) {
    warn(`${label} not found at ${path}`);
    return;
  }

  console.log(`Checking ${label}...`);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    fail("Invalid JSON syntax");
    return;
  }

  pass("Valid JSON syntax");
  checks(data, path);
  console.log();
}

function resolveRelativeToManifest(manifestPath: string, target: string): string {
  return resolve(dirname(manifestPath), target);
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

console.log("🔍 Validating generated plugin metadata files...\n");

// Validate Codex plugin.json
validateJsonFile(".codex-plugin/plugin.json", "Codex plugin.json", (data, manifestPath) => {
  checkName(data);
  checkDescription(data);
  checkVersion(data);

  const authorName = (data.author as Record<string, unknown>)?.name;
  if (authorName) pass(`author.name is present: ${authorName}`);
  else warn("author.name is recommended");

  const skills = data.skills as string | undefined;
  if (!skills) {
    fail("Missing required field: skills");
  } else if (!existsSync(resolveRelativeToManifest(manifestPath, skills))) {
    fail(`skills path does not exist: ${skills}`);
  } else {
    pass(`skills path exists: ${skills}`);
  }

  const pluginInterface = data.interface as Record<string, unknown> | undefined;
  if (!pluginInterface) {
    fail("Missing required field: interface");
    return;
  }

  if (pluginInterface.displayName) pass(`interface.displayName is present: ${pluginInterface.displayName}`);
  else fail("interface.displayName is required");

  if (pluginInterface.category) pass(`interface.category is present: ${pluginInterface.category}`);
  else fail("interface.category is required");

  if (Array.isArray(pluginInterface.capabilities) && pluginInterface.capabilities.length > 0) {
    pass(`interface.capabilities has ${pluginInterface.capabilities.length} items`);
  } else {
    fail("interface.capabilities must be a non-empty array");
  }

  if (Array.isArray(pluginInterface.defaultPrompt) && pluginInterface.defaultPrompt.length > 0) {
    pass(`interface.defaultPrompt has ${pluginInterface.defaultPrompt.length} item(s)`);
  } else {
    fail("interface.defaultPrompt must be a non-empty array");
  }

  for (const field of ["composerIcon", "logo"] as const) {
    const assetPath = pluginInterface[field];
    if (typeof assetPath !== "string" || assetPath.length === 0) continue;
    if (existsSync(resolveRelativeToManifest(manifestPath, assetPath))) {
      pass(`interface.${field} exists: ${assetPath}`);
    } else {
      fail(`interface.${field} path does not exist: ${assetPath}`);
    }
  }
});

// Validate Claude marketplace.json
validateJsonFile(
  ".claude-plugin/marketplace.json",
  "Claude marketplace.json",
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
      const pluginNames = new Set<string>();
      for (let i = 0; i < plugins.length; i++) {
        if (!plugins[i].name) fail(`Plugin at index ${i} is missing 'name'`);
        else pluginNames.add(plugins[i].name as string);
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

      // Validate bundles
      const bundles = data.bundles as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(bundles)) {
        pass(`bundles array has ${bundles.length} items`);
        for (let i = 0; i < bundles.length; i++) {
          const b = bundles[i];
          if (!b.name) fail(`Bundle at index ${i} is missing 'name'`);
          else if (!KEBAB.test(b.name as string)) fail(`Bundle '${b.name}' name is not kebab-case`);
          if (!b.description) fail(`Bundle at index ${i} is missing 'description'`);
          if (!Array.isArray(b.plugins)) {
            fail(`Bundle at index ${i} is missing 'plugins' array`);
          } else {
            for (const ref of b.plugins as string[]) {
              if (ref !== "*" && !pluginNames.has(ref)) {
                fail(`Bundle '${b.name}' references unknown plugin '${ref}'`);
              }
            }
          }
        }
      } else if ("bundles" in data) {
        fail("bundles must be an array");
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
