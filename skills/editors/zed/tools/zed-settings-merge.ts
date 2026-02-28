const args = Bun.argv.slice(2);

const HELP = `
zed-settings-merge — Merge project-level Zed settings from a shared team template

Usage:
  bun run tools/zed-settings-merge.ts <template-file> [options]

Arguments:
  template-file   Path to the team template settings.json

Options:
  --target <path>   Target .zed/settings.json (default: .zed/settings.json in cwd)
  --dry-run         Show what would change without writing
  --json            Output the merged result as JSON instead of writing
  --help            Show this help message

Examples:
  bun run tools/zed-settings-merge.ts shared/zed-settings.json
  bun run tools/zed-settings-merge.ts team-config.json --dry-run
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
  : `${process.cwd()}/.zed/settings.json`;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== targetIdx + 1
);

interface MergeResult {
  added: string[];
  updated: string[];
  unchanged: number;
  merged: Record<string, unknown>;
}

// Personal preference keys that should not be overwritten by team template
const PERSONAL_KEYS = new Set([
  "theme",
  "buffer_font_family",
  "buffer_font_size",
  "buffer_line_height",
  "ui_font_family",
  "ui_font_size",
  "cursor_blink",
  "vim_mode",
  "relative_line_numbers",
  "scrollbar",
  "minimap",
]);

async function readJsoncSafe(path: string): Promise<Record<string, unknown>> {
  try {
    const content = await Bun.file(path).text();
    const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const cleaned = stripped.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
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

    if (PERSONAL_KEYS.has(key)) {
      continue;
    }

    if (!(key in target)) {
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
      merged[key] = deepMerge(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>,
        result,
        fullKey
      );
    } else if (JSON.stringify(target[key]) !== JSON.stringify(value)) {
      merged[key] = value;
      result.updated.push(fullKey);
    } else {
      result.unchanged++;
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

  const template = await readJsoncSafe(resolvedTemplate);
  const current = await readJsoncSafe(resolvedTarget);

  if (Object.keys(template).length === 0) {
    console.error(`Error: template file is empty or invalid: ${resolvedTemplate}`);
    process.exit(1);
  }

  const result: MergeResult = {
    added: [],
    updated: [],
    unchanged: 0,
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
        unchanged: result.unchanged,
      },
      merged: result.merged,
    }, null, 2));
    return;
  }

  const action = dryRun ? "Dry run" : "Merging";
  console.log(`${action}: ${resolvedTemplate} into ${resolvedTarget}\n`);

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

  console.log(`Unchanged: ${result.unchanged}`);

  if (!dryRun && (result.added.length > 0 || result.updated.length > 0)) {
    const zedDir = resolvedTarget.replace(/\/settings\.json$/, "");
    Bun.spawnSync(["mkdir", "-p", zedDir]);

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
