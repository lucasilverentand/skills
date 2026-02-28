const args = Bun.argv.slice(2);

const HELP = `
key-extract — Extract translation keys used in source code

Usage:
  bun run tools/key-extract.ts [path] [options]

Arguments:
  path    Path to the project root to scan (default: current directory)

Options:
  --locales <dir>    Path to locales directory (default: packages/i18n/locales)
  --base <locale>    Base locale for comparison (default: en)
  --json             Output as JSON instead of plain text
  --help             Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const baseIdx = args.indexOf("--base");
const baseLocale = baseIdx !== -1 ? args[baseIdx + 1] : "en";
const localesIdx = args.indexOf("--locales");
const localesOverride = localesIdx !== -1 ? args[localesIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--base" && args[i - 1] !== "--locales"
);

interface KeyReport {
  usedKeys: string[];
  definedKeys: string[];
  undefinedKeys: string[];
  unusedKeys: string[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const localesDir = localesOverride || `${root}/packages/i18n/locales`;

  // Extract keys used in source code
  // Matches: t("key"), t('key'), t(`key`)
  const keyPattern = /\bt\(\s*["'`]([^"'`]+)["'`]/g;
  const usedKeys = new Set<string>();

  const sourceGlob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const ignorePatterns = ["node_modules", "dist", ".next", "drizzle"];

  for await (const file of sourceGlob.scan({ cwd: root })) {
    if (ignorePatterns.some((p) => file.includes(p))) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    let match: RegExpExecArray | null;
    keyPattern.lastIndex = 0;
    while ((match = keyPattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  }

  // Load defined keys from base locale
  const definedKeys = new Set<string>();
  const jsonGlob = new Bun.Glob("*.json");

  try {
    for await (const file of jsonGlob.scan({ cwd: `${localesDir}/${baseLocale}` })) {
      const namespace = file.replace(".json", "");
      const content = await Bun.file(`${localesDir}/${baseLocale}/${file}`).text();
      try {
        const data = JSON.parse(content) as Record<string, string>;
        for (const key of Object.keys(data)) {
          definedKeys.add(`${namespace}.${key}`);
        }
      } catch {
        // Skip invalid JSON
      }
    }
  } catch {
    // No locales directory found — just report used keys
  }

  const report: KeyReport = {
    usedKeys: Array.from(usedKeys).sort(),
    definedKeys: Array.from(definedKeys).sort(),
    undefinedKeys: Array.from(usedKeys)
      .filter((k) => definedKeys.size > 0 && !definedKeys.has(k))
      .sort(),
    unusedKeys: Array.from(definedKeys)
      .filter((k) => !usedKeys.has(k))
      .sort(),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Translation key analysis:\n`);
    console.log(`  Keys used in code: ${report.usedKeys.length}`);
    console.log(`  Keys defined in ${baseLocale}: ${report.definedKeys.length}`);

    if (report.undefinedKeys.length > 0) {
      console.log(`\n  Undefined keys (used but not in ${baseLocale}): ${report.undefinedKeys.length}`);
      for (const key of report.undefinedKeys) {
        console.log(`    [!] ${key}`);
      }
    }

    if (report.unusedKeys.length > 0) {
      console.log(`\n  Unused keys (defined but not found in code): ${report.unusedKeys.length}`);
      for (const key of report.unusedKeys) {
        console.log(`    [-] ${key}`);
      }
    }

    if (report.undefinedKeys.length === 0 && report.unusedKeys.length === 0) {
      console.log("\n  All keys are defined and used.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
