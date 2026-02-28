const args = Bun.argv.slice(2);

const HELP = `
marketplace-lint — Validate marketplace.json against schema and report errors

Usage:
  bun run tools/marketplace-lint.ts [marketplace-path] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Defaults to .claude-plugin/marketplace.json in the repo root if no path is given.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface LintError {
  path: string;
  code: string;
  message: string;
}

async function main() {
  const { existsSync, readFileSync } = await import("node:fs");
  const { resolve, dirname } = await import("node:path");

  // Find repo root by walking up to find .claude-plugin/
  let dir = resolve(".");
  while (dir !== "/") {
    if (existsSync(resolve(dir, ".claude-plugin"))) break;
    dir = dirname(dir);
  }

  const target = filteredArgs[0] ?? resolve(dir, ".claude-plugin/marketplace.json");
  if (!existsSync(target)) {
    console.error(`Error: marketplace.json not found at ${target}`);
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");
  const errors: LintError[] = [];
  const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  const SEMVER = /^\d+\.\d+\.\d+$/;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(content);
  } catch {
    errors.push({ path: "root", code: "invalid-json", message: "Invalid JSON syntax" });
    report(errors);
    return;
  }

  // Top-level required fields
  if (!data.name) {
    errors.push({ path: "name", code: "missing-required-field", message: "Missing required field: name" });
  } else if (!KEBAB.test(data.name as string)) {
    errors.push({ path: "name", code: "invalid-name", message: `Name '${data.name}' must be kebab-case` });
  }

  if (!data.owner) {
    errors.push({ path: "owner", code: "missing-required-field", message: "Missing required field: owner" });
  } else {
    const owner = data.owner as Record<string, unknown>;
    if (!owner.name) {
      errors.push({ path: "owner.name", code: "missing-required-field", message: "Missing required field: owner.name" });
    }
  }

  // Metadata version
  const metadata = data.metadata as Record<string, unknown> | undefined;
  if (metadata?.version && !SEMVER.test(metadata.version as string)) {
    errors.push({ path: "metadata.version", code: "invalid-version", message: `Version '${metadata.version}' must be valid semver (X.Y.Z)` });
  }

  // Plugins
  if (!Array.isArray(data.plugins)) {
    errors.push({ path: "plugins", code: "missing-required-field", message: "Missing required field: plugins (must be an array)" });
    report(errors);
    return;
  }

  const seenNames = new Set<string>();
  const plugins = data.plugins as Array<Record<string, unknown>>;

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    const prefix = `plugins[${i}]`;

    if (!plugin.name) {
      errors.push({ path: `${prefix}.name`, code: "missing-required-field", message: `Plugin at index ${i} missing 'name'` });
    } else {
      const name = plugin.name as string;
      if (!KEBAB.test(name)) {
        errors.push({ path: `${prefix}.name`, code: "invalid-name", message: `Plugin name '${name}' must be kebab-case` });
      }
      if (seenNames.has(name)) {
        errors.push({ path: `${prefix}.name`, code: "duplicate-name", message: `Duplicate plugin name: '${name}'` });
      }
      seenNames.add(name);
    }

    if (!plugin.source) {
      errors.push({ path: `${prefix}.source`, code: "missing-required-field", message: `Plugin at index ${i} missing 'source'` });
    }

    // Check skill paths exist
    if (Array.isArray(plugin.skills)) {
      for (const skillPath of plugin.skills as string[]) {
        const resolved = resolve(dir, skillPath);
        if (!existsSync(resolved)) {
          errors.push({ path: `${prefix}.skills`, code: "source-not-found", message: `Skill path does not exist: ${skillPath}` });
        } else if (!existsSync(resolve(resolved, "SKILL.md"))) {
          errors.push({ path: `${prefix}.skills`, code: "missing-skill-md", message: `No SKILL.md found at: ${skillPath}` });
        }
      }
    }
  }

  report(errors);
}

function report(errors: LintError[]) {
  if (jsonOutput) {
    console.log(JSON.stringify({ errors, total: errors.length, passed: errors.length === 0 }, null, 2));
  } else {
    if (errors.length === 0) {
      console.log("marketplace.json is valid. No errors found.");
    } else {
      console.log(`Found ${errors.length} error(s):\n`);
      for (const err of errors) {
        console.log(`  [${err.code}] ${err.path}: ${err.message}`);
      }
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
