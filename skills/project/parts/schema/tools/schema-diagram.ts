const args = Bun.argv.slice(2);

const HELP = `
schema-diagram — Generate a text-based ER diagram from Drizzle schema files

Usage:
  bun run tools/schema-diagram.ts [path] [options]

Arguments:
  path    Path to the schema package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Parses Drizzle ORM table definitions and outputs relationships.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface TableInfo {
  name: string;
  columns: { name: string; type: string; nullable: boolean; primaryKey: boolean }[];
  references: { column: string; targetTable: string; targetColumn: string; onDelete: string }[];
  file: string;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const tables: TableInfo[] = [];

  const glob = new Bun.Glob("src/**/*.{ts,js}");

  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();

    // Match pgTable/sqliteTable/mysqlTable definitions
    const tableMatches = content.matchAll(
      /(?:export\s+const\s+(\w+)\s*=\s*)?(?:pgTable|sqliteTable|mysqlTable)\s*\(\s*['"](\w+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/g
    );

    for (const m of tableMatches) {
      const varName = m[1] || m[2];
      const tableName = m[2];
      const columnsBlock = m[3];

      const columns: TableInfo["columns"] = [];
      const references: TableInfo["references"] = [];

      // Parse columns
      const colMatches = columnsBlock.matchAll(
        /(\w+)\s*:\s*(\w+)\s*\(\s*['"]([^'"]*)['"]/g
      );

      for (const col of colMatches) {
        const colName = col[1];
        const colType = col[2];

        // Check the full line for modifiers
        const lineStart = columnsBlock.indexOf(col[0]);
        const lineEnd = columnsBlock.indexOf("\n", lineStart);
        const fullLine = columnsBlock.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);

        const isPrimaryKey = fullLine.includes(".primaryKey()");
        const isNullable = !fullLine.includes(".notNull()") && !isPrimaryKey;

        columns.push({
          name: col[3] || colName,
          type: colType,
          nullable: isNullable,
          primaryKey: isPrimaryKey,
        });

        // Check for references
        const refMatch = fullLine.match(
          /\.references\s*\(\s*\(\)\s*=>\s*(\w+)\.(\w+)/
        );
        if (refMatch) {
          const onDeleteMatch = fullLine.match(/onDelete\s*:\s*['"](\w+)['"]/);
          references.push({
            column: col[3] || colName,
            targetTable: refMatch[1],
            targetColumn: refMatch[2],
            onDelete: onDeleteMatch ? onDeleteMatch[1] : "no action",
          });
        }
      }

      tables.push({ name: tableName, columns, references, file });
    }
  }

  tables.sort((a, b) => a.name.localeCompare(b.name));

  if (jsonOutput) {
    console.log(JSON.stringify(tables, null, 2));
  } else {
    if (tables.length === 0) {
      console.log("No Drizzle table definitions found in src/");
      return;
    }

    console.log(`Schema diagram (${tables.length} tables):\n`);

    for (const table of tables) {
      console.log(`  +${"─".repeat(table.name.length + 2)}+`);
      console.log(`  | ${table.name} |`);
      console.log(`  +${"─".repeat(table.name.length + 2)}+`);

      for (const col of table.columns) {
        const pk = col.primaryKey ? " PK" : "";
        const nullable = col.nullable ? "?" : "";
        console.log(`  | ${col.name}${nullable} (${col.type})${pk}`);
      }

      console.log();

      for (const ref of table.references) {
        console.log(
          `  ${table.name}.${ref.column} -> ${ref.targetTable}.${ref.targetColumn} [${ref.onDelete}]`
        );
      }

      if (table.references.length > 0) console.log();
    }

    // Summary
    const totalRefs = tables.reduce((sum, t) => sum + t.references.length, 0);
    console.log(`${tables.length} table(s), ${totalRefs} foreign key(s)`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
