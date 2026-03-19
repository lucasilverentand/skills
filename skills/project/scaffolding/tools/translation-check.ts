const args = Bun.argv.slice(2);

const HELP = `
translation-check — Find missing, untranslated, and stale translation keys

Usage:
  bun run tools/translation-check.ts [path] [options]

Arguments:
  path    Path to the i18n package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function flattenKeys(obj: Record<string, unknown>, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      for (const [k, v] of flattenKeys(value as Record<string, unknown>, fullKey)) {
        result.set(k, v);
      }
    } else {
      result.set(fullKey, String(value));
    }
  }
  return result;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  const localeGlob = new Bun.Glob("src/locales/*.json");
  const locales: Map<string, Map<string, string>> = new Map();

  for await (const file of localeGlob.scan({ cwd: root })) {
    const name = file.replace("src/locales/", "").replace(".json", "");
    const content = await Bun.file(`${root}/${file}`).json();
    locales.set(name, flattenKeys(content));
  }

  if (locales.size === 0) {
    console.log("No locale files found in src/locales/.");
    process.exit(0);
  }

  const baseLocaleName = locales.has("en")
    ? "en"
    : [...locales.keys()].sort()[0];
  const baseKeys = locales.get(baseLocaleName)!;

  const issues: {
    locale: string;
    missing: string[];
    stale: string[];
    untranslated: string[];
  }[] = [];

  for (const [locale, keys] of locales) {
    if (locale === baseLocaleName) continue;

    const missing: string[] = [];
    const stale: string[] = [];
    const untranslated: string[] = [];

    for (const [key, baseValue] of baseKeys) {
      if (!keys.has(key)) {
        missing.push(key);
      } else if (keys.get(key) === baseValue) {
        untranslated.push(key);
      }
    }

    for (const key of keys.keys()) {
      if (!baseKeys.has(key)) {
        stale.push(key);
      }
    }

    issues.push({ locale, missing, stale, untranslated });
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify({
        baseLocale: baseLocaleName,
        totalKeys: baseKeys.size,
        locales: issues,
      }, null, 2)
    );
  } else {
    console.log(`Translation check (base: ${baseLocaleName}, ${baseKeys.size} keys):\n`);

    let clean = true;

    for (const issue of issues) {
      const hasIssues =
        issue.missing.length > 0 ||
        issue.stale.length > 0 ||
        issue.untranslated.length > 0;

      if (!hasIssues) {
        console.log(`  ${issue.locale}: all keys present`);
        continue;
      }

      clean = false;
      console.log(`  ${issue.locale}:`);

      if (issue.missing.length > 0) {
        console.log(`    Missing (${issue.missing.length}):`);
        for (const key of issue.missing.slice(0, 10)) {
          console.log(`      - ${key}`);
        }
        if (issue.missing.length > 10) {
          console.log(`      ... and ${issue.missing.length - 10} more`);
        }
      }

      if (issue.stale.length > 0) {
        console.log(`    Stale (${issue.stale.length}):`);
        for (const key of issue.stale.slice(0, 10)) {
          console.log(`      - ${key}`);
        }
        if (issue.stale.length > 10) {
          console.log(`      ... and ${issue.stale.length - 10} more`);
        }
      }

      if (issue.untranslated.length > 0) {
        console.log(`    Possibly untranslated (${issue.untranslated.length}):`);
        for (const key of issue.untranslated.slice(0, 5)) {
          console.log(`      - ${key}`);
        }
        if (issue.untranslated.length > 5) {
          console.log(`      ... and ${issue.untranslated.length - 5} more`);
        }
      }

      console.log();
    }

    if (clean) {
      console.log("\n  All translations are complete.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
