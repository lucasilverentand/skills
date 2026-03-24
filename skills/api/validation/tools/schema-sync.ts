const args = Bun.argv.slice(2);

const HELP = `
schema-sync — Verify Zod schemas match their corresponding TypeScript types

Usage:
  bun run tools/schema-sync.ts [path] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans for Zod schemas and their inferred types, then checks for
mismatches between standalone TypeScript interfaces and Zod schemas
that should be kept in sync.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

interface SchemaInfo {
  file: string;
  schemaName: string;
  inferredType: string | null;
  standaloneType: string | null;
  synced: boolean;
  issue: string | null;
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

async function analyzeFile(filePath: string): Promise<SchemaInfo[]> {
  const content = await Bun.file(filePath).text();
  const schemas: SchemaInfo[] = [];

  // Find Zod schemas: const fooSchema = z.object({...})
  const schemaRegex = /(?:export\s+)?const\s+(\w+Schema)\s*=\s*z\./g;
  let match;

  while ((match = schemaRegex.exec(content)) !== null) {
    const schemaName = match[1];
    // Derive expected type name: fooSchema -> Foo
    const baseName = schemaName
      .replace(/Schema$/, "")
      .replace(/^./, (c) => c.toUpperCase());

    // Check if there's a z.infer usage
    const inferRegex = new RegExp(
      `type\\s+(\\w+)\\s*=\\s*z\\.infer<typeof\\s+${schemaName}>`,
    );
    const inferMatch = content.match(inferRegex);

    // Check if there's a standalone interface/type with the same name
    const standaloneRegex = new RegExp(
      `(?:export\\s+)?(?:interface|type)\\s+${baseName}\\s*(?:=|\\{)(?!.*z\\.infer)`,
    );
    const standaloneMatch = content.match(standaloneRegex);

    let synced = true;
    let issue: string | null = null;

    if (standaloneMatch && !inferMatch) {
      synced = false;
      issue = `Standalone type '${baseName}' exists alongside '${schemaName}' but type is not derived from schema. Use z.infer<typeof ${schemaName}> instead.`;
    }

    if (inferMatch && standaloneMatch) {
      synced = false;
      issue = `Both a standalone type '${baseName}' and an inferred type exist. Remove the standalone type — the schema should be the single source of truth.`;
    }

    if (!inferMatch && !standaloneMatch) {
      issue = `Schema '${schemaName}' has no corresponding type. Add: type ${baseName} = z.infer<typeof ${schemaName}>`;
      synced = false;
    }

    schemas.push({
      file: filePath,
      schemaName,
      inferredType: inferMatch?.[1] || null,
      standaloneType: standaloneMatch ? baseName : null,
      synced,
      issue,
    });
  }

  // Also detect standalone interfaces that could benefit from Zod schemas
  // at system boundaries
  const boundaryPatterns = /(?:request|response|body|payload|config|env|params|query)/i;
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)\s*\{/g;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const name = match[1];
    const hasSchema = schemas.some(
      (s) =>
        s.schemaName === `${name.charAt(0).toLowerCase()}${name.slice(1)}Schema` ||
        s.schemaName === `${name}Schema`
    );

    if (!hasSchema && boundaryPatterns.test(name)) {
      schemas.push({
        file: filePath,
        schemaName: `${name.charAt(0).toLowerCase()}${name.slice(1)}Schema`,
        inferredType: null,
        standaloneType: name,
        synced: false,
        issue: `Interface '${name}' looks like a system boundary type but has no Zod schema for runtime validation.`,
      });
    }
  }

  return schemas;
}

async function main() {
  const target = resolve(filteredArgs[0] || ".");
  let targetStat;
  try {
    targetStat = await stat(target);
  } catch {
    console.error(`Error: path not found: ${target}`);
    process.exit(1);
  }

  const files = targetStat.isDirectory()
    ? await collectFiles(target)
    : [target];

  const allSchemas: SchemaInfo[] = [];
  for (const file of files) {
    allSchemas.push(...(await analyzeFile(file)));
  }

  const synced = allSchemas.filter((s) => s.synced).length;
  const outOfSync = allSchemas.filter((s) => !s.synced);
  const root = resolve(".");

  const result = {
    scanned: files.length,
    totalSchemas: allSchemas.length,
    synced,
    outOfSync: outOfSync.length,
    issues: outOfSync.map((s) => ({
      file: relative(root, s.file),
      schema: s.schemaName,
      issue: s.issue,
    })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Schema Sync: ${files.length} files, ${allSchemas.length} schemas found`);
    console.log(`  Synced: ${synced}`);
    console.log(`  Out of sync: ${outOfSync.length}\n`);

    if (outOfSync.length === 0) {
      console.log("All schemas are in sync with their types.");
    } else {
      for (const s of outOfSync) {
        console.log(`  ${relative(root, s.file)}`);
        console.log(`    Schema: ${s.schemaName}`);
        console.log(`    ${s.issue}`);
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
