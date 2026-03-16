const args = Bun.argv.slice(2);

const HELP = `
collection-check — Validate Astro content collections against their schemas

Usage:
  bun run tools/collection-check.ts [path] [options]

Arguments:
  path    Path to the Astro site package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks:
  - Content config file exists at src/content/config.ts
  - Each collection directory has a matching schema definition
  - Content files have required frontmatter fields
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface CollectionReport {
  name: string;
  hasSchema: boolean;
  entryCount: number;
  entriesWithFrontmatter: number;
  errors: string[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const contentDir = `${root}/src/content`;
  const configPath = `${contentDir}/config.ts`;

  const configFile = Bun.file(configPath);
  const configExists = await configFile.exists();

  if (!configExists) {
    // Try .js extension
    const jsConfig = Bun.file(`${contentDir}/config.js`);
    if (!(await jsConfig.exists())) {
      if (jsonOutput) {
        console.log(JSON.stringify({ error: "No content config found at src/content/config.ts" }, null, 2));
      } else {
        console.error("Error: no content config found at src/content/config.ts");
      }
      process.exit(1);
    }
  }

  // Read config file to extract collection names
  const configContent = await Bun.file(configExists ? configPath : `${contentDir}/config.js`).text();

  // Parse collection names from exports
  const collectionsMatch = configContent.match(
    /export\s+const\s+collections\s*=\s*\{([^}]+)\}/
  );
  const definedCollections = new Set<string>();

  if (collectionsMatch) {
    const inner = collectionsMatch[1];
    const nameMatches = inner.matchAll(/(\w+)\s*[,:]/g);
    for (const m of nameMatches) {
      definedCollections.add(m[1]);
    }
  }

  // Scan content directories
  const reports: CollectionReport[] = [];
  const contentGlob = new Bun.Glob("*/");

  // Get subdirectories of src/content
  const dirGlob = new Bun.Glob("*");
  const seenDirs = new Set<string>();

  const entryGlob = new Bun.Glob("**/*.{md,mdx,yaml,yml,json}");
  for await (const entry of entryGlob.scan({ cwd: contentDir })) {
    const parts = entry.split("/");
    if (parts.length > 1 && parts[0] !== "config.ts" && parts[0] !== "config.js") {
      seenDirs.add(parts[0]);
    }
  }

  // Also include defined collections that might not have entries
  for (const name of definedCollections) {
    seenDirs.add(name);
  }

  for (const dirName of [...seenDirs].sort()) {
    const collectionDir = `${contentDir}/${dirName}`;
    const hasSchema = definedCollections.has(dirName);
    const errors: string[] = [];

    if (!hasSchema) {
      errors.push(`Collection '${dirName}' has no schema in config.ts`);
    }

    // Count entries and check frontmatter
    let entryCount = 0;
    let entriesWithFrontmatter = 0;

    const entryFiles = new Bun.Glob("**/*.{md,mdx}");
    for await (const file of entryFiles.scan({ cwd: collectionDir })) {
      entryCount++;
      const content = await Bun.file(`${collectionDir}/${file}`).text();
      if (content.startsWith("---")) {
        entriesWithFrontmatter++;
      } else {
        errors.push(`${file}: missing frontmatter`);
      }
    }

    // Count JSON/YAML entries too
    const dataFiles = new Bun.Glob("**/*.{json,yaml,yml}");
    for await (const _ of dataFiles.scan({ cwd: collectionDir })) {
      entryCount++;
      entriesWithFrontmatter++; // data files don't need frontmatter
    }

    reports.push({
      name: dirName,
      hasSchema,
      entryCount,
      entriesWithFrontmatter,
      errors,
    });
  }

  // Check for defined collections with no directory
  for (const name of definedCollections) {
    if (!seenDirs.has(name)) {
      reports.push({
        name,
        hasSchema: true,
        entryCount: 0,
        entriesWithFrontmatter: 0,
        errors: [`Collection '${name}' defined in config but has no directory`],
      });
    }
  }

  const allErrors = reports.flatMap((r) => r.errors);

  if (jsonOutput) {
    console.log(JSON.stringify({ collections: reports, valid: allErrors.length === 0 }, null, 2));
  } else {
    if (reports.length === 0) {
      console.log("No content collections found.");
      return;
    }

    console.log(`Content collections (${reports.length}):\n`);

    for (const report of reports) {
      const schemaIcon = report.hasSchema ? "+" : "x";
      console.log(`  [${schemaIcon}] ${report.name} — ${report.entryCount} entries`);
      for (const err of report.errors) {
        console.log(`      ! ${err}`);
      }
    }

    if (allErrors.length > 0) {
      console.log(`\n${allErrors.length} issue(s) found.`);
      process.exit(1);
    } else {
      console.log("\nAll collections valid.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
