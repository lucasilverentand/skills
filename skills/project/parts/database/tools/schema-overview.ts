const args = Bun.argv.slice(2);

const HELP = `
schema-overview — Display all tables, columns, relations, and indexes in the schema

Usage:
  bun run tools/schema-overview.ts [path] [options]

Arguments:
  path    Path to the schema package (default: current directory)

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

interface ColumnInfo {
  name: string;
  type: string;
  constraints: string[];
}

interface TableInfo {
  name: string;
  file: string;
  columns: ColumnInfo[];
  relations: string[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const tables: TableInfo[] = [];

  // Scan schema files
  const schemaGlob = new Bun.Glob("src/schema/*.{ts,tsx}");

  for await (const file of schemaGlob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();

    // Match table definitions: sqliteTable("name", { ... }) or pgTable("name", { ... })
    const tableMatches = content.matchAll(
      /(?:sqliteTable|pgTable|mysqlTable)\s*\(\s*['"](\w+)['"]\s*,\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g
    );

    for (const match of tableMatches) {
      const tableName = match[1];
      const columnsBlock = match[2];
      const columns: ColumnInfo[] = [];

      // Extract column definitions
      const colMatches = columnsBlock.matchAll(
        /(\w+)\s*:\s*(text|integer|real|blob|serial|varchar|timestamp|boolean|uuid|bigint|smallint|numeric|json|jsonb)\s*\(([^)]*)\)([^,\n]*)/g
      );

      for (const col of colMatches) {
        const constraints: string[] = [];
        const chain = col[4];
        if (chain.includes("primaryKey")) constraints.push("pk");
        if (chain.includes("notNull")) constraints.push("not null");
        if (chain.includes("unique")) constraints.push("unique");
        if (chain.includes("default")) constraints.push("default");
        if (chain.includes("references")) constraints.push("fk");

        columns.push({
          name: col[1],
          type: col[2],
          constraints,
        });
      }

      tables.push({
        name: tableName,
        file,
        columns,
        relations: [],
      });
    }
  }

  // Scan for relations
  for await (const file of schemaGlob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();

    const relationMatches = content.matchAll(
      /(\w+)Relations\s*=\s*relations\s*\(\s*(\w+)\s*,.*?(?:one|many)\s*\(\s*(\w+)/gs
    );

    for (const rel of relationMatches) {
      const sourceTable = rel[2];
      const targetTable = rel[3];
      const table = tables.find((t) => t.name === sourceTable);
      if (table) {
        table.relations.push(targetTable);
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ tables }, null, 2));
  } else {
    if (tables.length === 0) {
      console.log("No tables found in src/schema/.");
      console.log("Tip: create table files using sqliteTable() or pgTable().");
      return;
    }

    console.log(`Schema overview (${tables.length} tables):\n`);

    for (const table of tables) {
      console.log(`  ${table.name} (${table.file})`);

      for (const col of table.columns) {
        const constraints = col.constraints.length > 0
          ? ` [${col.constraints.join(", ")}]`
          : "";
        console.log(`    ${col.name}: ${col.type}${constraints}`);
      }

      if (table.relations.length > 0) {
        console.log(`    relations: ${table.relations.join(", ")}`);
      }

      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
