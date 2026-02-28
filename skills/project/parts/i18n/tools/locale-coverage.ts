const args = Bun.argv.slice(2);

const HELP = `
locale-coverage — Show translation completeness percentage per locale

Usage:
  bun run tools/locale-coverage.ts [path] [options]

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

function countKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...countKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  const localeGlob = new Bun.Glob("src/locales/*.json");
  const locales: Map<string, string[]> = new Map();

  for await (const file of localeGlob.scan({ cwd: root })) {
    const name = file.replace("src/locales/", "").replace(".json", "");
    const content = await Bun.file(`${root}/${file}`).json();
    locales.set(name, countKeys(content));
  }

  if (locales.size === 0) {
    console.log("No locale files found in src/locales/.");
    process.exit(0);
  }

  const baseLocaleName = locales.has("en")
    ? "en"
    : [...locales.keys()].sort()[0];
  const baseKeys = new Set(locales.get(baseLocaleName)!);
  const totalKeys = baseKeys.size;

  const coverage: {
    locale: string;
    translated: number;
    total: number;
    percentage: number;
    isBase: boolean;
  }[] = [];

  for (const [locale, keys] of locales) {
    const translated = keys.filter((k) => baseKeys.has(k)).length;
    coverage.push({
      locale,
      translated,
      total: totalKeys,
      percentage: Math.round((translated / totalKeys) * 100),
      isBase: locale === baseLocaleName,
    });
  }

  coverage.sort((a, b) => b.percentage - a.percentage);

  if (jsonOutput) {
    console.log(JSON.stringify({ baseLocale: baseLocaleName, totalKeys, coverage }, null, 2));
  } else {
    console.log(`Locale coverage (base: ${baseLocaleName}, ${totalKeys} keys):\n`);

    for (const c of coverage) {
      const bar = "=".repeat(Math.floor(c.percentage / 5));
      const empty = " ".repeat(20 - bar.length);
      const label = c.isBase ? " (base)" : "";
      console.log(
        `  ${c.locale.padEnd(6)} [${bar}${empty}] ${c.percentage}% (${c.translated}/${c.total})${label}`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
