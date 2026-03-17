const args = Bun.argv.slice(2);

const HELP = `
vscode-settings-merge — Merge workspace settings from a team template into the local config

Usage:
  bun run tools/vscode-settings-merge.ts <template-file> [options]

Arguments:
  template-file   Path to the team template settings.json

Options:
  --target <path>   Target .vscode/settings.json (default: .vscode/settings.json in cwd)
  --dry-run         Show what would change without writing
  --json            Output the merged result as JSON instead of writing
  --help            Show this help message

Examples:
  bun run tools/vscode-settings-merge.ts team-settings.json
  bun run tools/vscode-settings-merge.ts shared/vscode.json --dry-run
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dryRun = args.includes("--dry-run");
const targetIdx = args.indexOf("--target");
const targetPath = targetIdx !== -1
  ? args[targetIdx + 1]
  : `${process.cwd()}/.vscode/settings.json`;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== targetIdx + 1
);

interface MergeResult {
  added: string[];
  updated: string[];
  unchanged: string[];
  merged: Record<string, unknown>;
}

// Keys that should NOT be overwritten by template (personal preferences)
const PERSONAL_KEYS = new Set([
  "editor.fontSize",
  "editor.fontFamily",
  "editor.lineHeight",
  "workbench.colorTheme",
  "workbench.iconTheme",
  "editor.minimap.enabled",
  "editor.cursorStyle",
  "editor.cursorBlinking",
  "window.zoomLevel",
  "terminal.integrated.fontFamily",
  "terminal.integrated.fontSize",
]);

async function readJsonSafe(path: string): Promise<Record<string, unknown>> {
  try {
    const content = await Bun.file(path).text();
    // Strip comments (JSONC support) — simple approach
    const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    return JSON.parse(stripped);
  } catch {
    return {};
  }
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  result: MergeResult,
  prefix = ""
): Record<string, unknown> {
  const merged = { ...target };

  for (const [key, value] of Object.entries(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Skip personal preference keys
    if (PERSONAL_KEYS.has(fullKey)) {
      result.unchanged.push(fullKey);
      continue;
    }

    if (!(key in target)) {
      // New key
      merged[key] = value;
      result.added.push(fullKey);
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      // Recursively merge objects
      merged[key] = deepMerge(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>,
        result,
        fullKey
      );
    } else if (JSON.stringify(target[key]) !== JSON.stringify(value)) {
      // Different value — template wins (unless personal key)
      merged[key] = value;
      result.updated.push(fullKey);
    } else {
      result.unchanged.push(fullKey);
    }
  }

  return merged;
}

async function main() {
  const templateFile = filteredArgs[0];
  if (!templateFile) {
    console.error("Error: missing required argument <template-file>");
    process.exit(1);
  }

  const resolvedTemplate = Bun.resolveSync(templateFile, process.cwd());
  const resolvedTarget = targetPath.startsWith("/")
    ? targetPath
    : Bun.resolveSync(targetPath, process.cwd());

  const template = await readJsonSafe(resolvedTemplate);
  const current = await readJsonSafe(resolvedTarget);

  if (Object.keys(template).length === 0) {
    console.error(`Error: template file is empty or invalid: ${resolvedTemplate}`);
    process.exit(1);
  }

  const result: MergeResult = {
    added: [],
    updated: [],
    unchanged: [],
    merged: {},
  };

  result.merged = deepMerge(current, template, result);

  if (jsonOutput) {
    console.log(JSON.stringify({
      template: resolvedTemplate,
      target: resolvedTarget,
      changes: {
        added: result.added,
        updated: result.updated,
        unchanged: result.unchanged.length,
      },
      merged: result.merged,
    }, null, 2));
    return;
  }

  if (dryRun) {
    console.log(`Dry run: merging ${resolvedTemplate} into ${resolvedTarget}\n`);
  } else {
    console.log(`Merging ${resolvedTemplate} into ${resolvedTarget}\n`);
  }

  if (result.added.length > 0) {
    console.log(`Added (${result.added.length}):`);
    for (const key of result.added) {
      console.log(`  + ${key}`);
    }
  }

  if (result.updated.length > 0) {
    console.log(`Updated (${result.updated.length}):`);
    for (const key of result.updated) {
      console.log(`  ~ ${key}`);
    }
  }

  console.log(`Unchanged: ${result.unchanged.length}`);

  if (!dryRun && (result.added.length > 0 || result.updated.length > 0)) {
    // Ensure .vscode directory exists
    const vscodeDir = resolvedTarget.replace(/\/settings\.json$/, "");
    Bun.spawnSync(["mkdir", "-p", vscodeDir]);

    await Bun.write(resolvedTarget, JSON.stringify(result.merged, null, 2) + "\n");
    console.log(`\nWritten to ${resolvedTarget}`);
  } else if (result.added.length === 0 && result.updated.length === 0) {
    console.log("\nNo changes needed — settings are already in sync.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
