const args = Bun.argv.slice(2);

const HELP = `
schema-check — Validate Drizzle schema files, list tables, and check for missing exports

Usage:
  bun run tools/schema-check.ts [path] [options]

Arguments:
  path    Path to the database package (default: current directory)

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

interface TableInfo {
  name: string;
  file: string;
  columns: string[];
  exported: boolean;
}

interface SchemaReport {
  tables: TableInfo[];
  indexFile: string | null;
  issues: string[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const schemaDir = `${root}/src/schema`;
  const report: SchemaReport = { tables: [], indexFile: null, issues: [] };

  // Check if schema directory exists
  const schemaDirFile = Bun.file(`${schemaDir}/index.ts`);
  if (await schemaDirFile.exists()) {
    report.indexFile = `${schemaDir}/index.ts`;
  } else {
    // Try flat schema file
    const flatSchema = Bun.file(`${root}/src/schema.ts`);
    if (await flatSchema.exists()) {
      report.indexFile = `${root}/src/schema.ts`;
    }
  }

  if (!report.indexFile) {
    report.issues.push("No schema index file found at src/schema/index.ts or src/schema.ts");
  }

  // Scan for table definitions
  const tablePattern = /export\s+const\s+(\w+)\s*=\s*(?:sqliteTable|pgTable|mysqlTable)\s*\(\s*["'](\w+)["']/g;
  const columnPattern = /(\w+)\s*:\s*(?:text|integer|real|blob|boolean|timestamp|varchar|serial|uuid|jsonb?)\s*\(/g;

  const glob = new Bun.Glob("src/schema/**/*.ts");
  const schemaFiles: string[] = [];

  try {
    for await (const file of glob.scan({ cwd: root })) {
      schemaFiles.push(file);
    }
  } catch {
    // Also try flat structure
    const flatGlob = new Bun.Glob("src/schema.ts");
    for await (const file of flatGlob.scan({ cwd: root })) {
      schemaFiles.push(file);
    }
  }

  // Read barrel file for export checking
  let barrelContent = "";
  if (report.indexFile) {
    barrelContent = await Bun.file(report.indexFile).text();
  }

  for (const file of schemaFiles) {
    if (file.endsWith("index.ts")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    let match: RegExpExecArray | null;

    // Reset regex
    tablePattern.lastIndex = 0;
    while ((match = tablePattern.exec(content)) !== null) {
      const varName = match[1];
      const tableName = match[2];

      // Find columns
      columnPattern.lastIndex = 0;
      const columns: string[] = [];
      let colMatch: RegExpExecArray | null;
      while ((colMatch = columnPattern.exec(content)) !== null) {
        columns.push(colMatch[1]);
      }

      const exported = barrelContent.includes(varName);

      report.tables.push({
        name: tableName,
        file,
        columns,
        exported,
      });

      if (!exported) {
        report.issues.push(`Table "${tableName}" (${varName}) in ${file} is not exported from the barrel file`);
      }
    }
  }

  // Check for drizzle config
  const configFile = Bun.file(`${root}/drizzle.config.ts`);
  if (!(await configFile.exists())) {
    report.issues.push("No drizzle.config.ts found — migrations will not work");
  }

  // Check for migrations directory
  const migrationsDir = Bun.file(`${root}/drizzle/meta/_journal.json`);
  if (!(await migrationsDir.exists())) {
    report.issues.push("No migrations found in drizzle/ — run 'bun run db:generate' to create initial migration");
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("Schema check:\n");

    if (report.tables.length === 0) {
      console.log("  No tables found.\n");
    } else {
      console.log(`  ${report.tables.length} table(s) found:\n`);
      for (const table of report.tables) {
        const icon = table.exported ? "+" : "x";
        console.log(`  [${icon}] ${table.name} (${table.file})`);
        if (table.columns.length > 0) {
          console.log(`      columns: ${table.columns.join(", ")}`);
        }
      }
    }

    if (report.issues.length > 0) {
      console.log(`\n  Issues (${report.issues.length}):\n`);
      for (const issue of report.issues) {
        console.log(`  [!] ${issue}`);
      }
    } else {
      console.log("\n  No issues found.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
