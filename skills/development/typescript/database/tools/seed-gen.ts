const args = Bun.argv.slice(2);

const HELP = `
seed-gen — Generate seed data for a given Drizzle schema

Usage:
  bun run tools/seed-gen.ts <schema-path> [options]

Options:
  --count <n>   Number of rows per table (default: 10)
  --output <f>  Output file path (default: stdout)
  --json        Output as JSON instead of a TypeScript seed script
  --help        Show this help message

Parses a Drizzle schema file, extracts table definitions, and generates
realistic seed data using column names and types as hints.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const count = parseInt(getFlag("--count") ?? "10");
const outputPath = getFlag("--output");
const filteredArgs = args.filter((a) => {
  if (a.startsWith("--")) return false;
  if (a === getFlag("--count") || a === getFlag("--output")) return false;
  return true;
});

interface ColumnDef {
  name: string;
  dbName: string;
  type: string;
  isPrimary: boolean;
  isNotNull: boolean;
  hasDefault: boolean;
  enumValues: string[];
}

interface TableDef {
  name: string;
  exportName: string;
  columns: ColumnDef[];
}

function parseSchema(content: string): TableDef[] {
  const tables: TableDef[] = [];
  const tableRegex = /export\s+const\s+(\w+)\s*=\s*(?:sqliteTable|pgTable|mysqlTable)\s*\(\s*["'`](\w+)["'`]\s*,\s*\{/g;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRegex.exec(content)) !== null) {
    const exportName = tableMatch[1];
    const tableName = tableMatch[2];

    // Extract the columns block
    let braceDepth = 1;
    let blockStart = tableMatch.index + tableMatch[0].length;
    let blockEnd = blockStart;
    for (let i = blockStart; i < content.length; i++) {
      if (content[i] === "{") braceDepth++;
      if (content[i] === "}") braceDepth--;
      if (braceDepth === 0) {
        blockEnd = i;
        break;
      }
    }
    const columnsBlock = content.substring(blockStart, blockEnd);

    const columns: ColumnDef[] = [];
    // Match column definitions
    const colRegex = /(\w+)\s*:\s*(text|integer|real|blob|varchar|char|boolean|timestamp|serial|bigint|smallint|uuid|jsonb?)\s*\(([^)]*)\)/g;
    let colMatch: RegExpExecArray | null;

    while ((colMatch = colRegex.exec(columnsBlock)) !== null) {
      const colName = colMatch[1];
      const colType = colMatch[2];
      const colArgs = colMatch[3];

      // Get the rest of the column chain
      let chainEnd = colMatch.index + colMatch[0].length;
      let parenDepth = 0;
      for (let i = chainEnd; i < columnsBlock.length; i++) {
        if (columnsBlock[i] === "(") parenDepth++;
        if (columnsBlock[i] === ")") parenDepth--;
        if ((columnsBlock[i] === "," && parenDepth === 0) || columnsBlock[i] === "\n") {
          chainEnd = i;
          break;
        }
      }
      const chain = columnsBlock.substring(colMatch.index, chainEnd);

      // Parse enum values
      const enumMatch = colArgs.match(/enum:\s*\[([^\]]+)\]/);
      let enumValues: string[] = [];
      if (enumMatch) {
        enumValues = enumMatch[1]
          .split(",")
          .map((v) => v.trim().replace(/["'`]/g, ""))
          .filter(Boolean);
      }

      // Check for db column name
      const dbNameMatch = colArgs.match(/["'`]([^"'`]+)["'`]/);
      const dbName = dbNameMatch ? dbNameMatch[1] : colName;

      columns.push({
        name: colName,
        dbName,
        type: colType,
        isPrimary: chain.includes(".primaryKey()"),
        isNotNull: chain.includes(".notNull()"),
        hasDefault: chain.includes("$defaultFn") || chain.includes(".default(") || chain.includes(".defaultNow()"),
        enumValues,
      });
    }

    tables.push({ name: tableName, exportName, columns });
  }

  return tables;
}

// Realistic data generators based on column name hints
const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Iris", "Jack"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore"];
const domains = ["example.com", "test.org", "demo.io", "acme.co", "sample.dev"];
const words = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet"];
const colors = ["red", "blue", "green", "yellow", "purple", "orange", "teal", "coral", "navy", "olive"];
const adjectives = ["fast", "bright", "quiet", "bold", "calm", "sharp", "warm", "cool", "fresh", "smart"];

function generateValue(col: ColumnDef, rowIndex: number): string {
  const name = col.name.toLowerCase();

  // Skip auto-generated columns
  if (col.hasDefault && (col.isPrimary || name === "createdat" || name === "updatedat")) {
    return "undefined // auto-generated";
  }

  if (col.enumValues.length > 0) {
    return `"${col.enumValues[rowIndex % col.enumValues.length]}"`;
  }

  // ID columns
  if (col.isPrimary || name === "id") {
    const prefix = col.name.replace(/Id$/, "").substring(0, 3).toLowerCase();
    return `"${prefix}_seed_${String(rowIndex + 1).padStart(3, "0")}"`;
  }

  // Foreign keys
  if (name.endsWith("id") && name !== "id") {
    const ref = name.replace(/Id$/, "").substring(0, 3).toLowerCase();
    return `"${ref}_seed_${String((rowIndex % count) + 1).padStart(3, "0")}"`;
  }

  // Name-based hints
  if (name === "email") {
    return `"${firstNames[rowIndex % firstNames.length].toLowerCase()}${rowIndex}@${domains[rowIndex % domains.length]}"`;
  }
  if (name === "name" || name === "displayname" || name === "fullname") {
    return `"${firstNames[rowIndex % firstNames.length]} ${lastNames[rowIndex % lastNames.length]}"`;
  }
  if (name === "firstname") {
    return `"${firstNames[rowIndex % firstNames.length]}"`;
  }
  if (name === "lastname") {
    return `"${lastNames[rowIndex % lastNames.length]}"`;
  }
  if (name === "title") {
    return `"${adjectives[rowIndex % adjectives.length]} ${words[rowIndex % words.length]}"`;
  }
  if (name === "description" || name === "bio" || name === "content") {
    return `"Seed data for ${col.name} row ${rowIndex + 1}"`;
  }
  if (name === "slug") {
    return `"${adjectives[rowIndex % adjectives.length]}-${words[rowIndex % words.length]}-${rowIndex + 1}"`;
  }
  if (name === "url" || name === "website" || name === "avatar" || name === "image") {
    return `"https://${domains[rowIndex % domains.length]}/${words[rowIndex % words.length]}"`;
  }
  if (name === "color") {
    return `"${colors[rowIndex % colors.length]}"`;
  }
  if (name === "phone") {
    return `"+1555${String(1000 + rowIndex).padStart(4, "0")}"`;
  }

  // Type-based fallbacks
  switch (col.type) {
    case "text":
    case "varchar":
    case "char":
      return `"${col.name}_${rowIndex + 1}"`;
    case "integer":
    case "serial":
    case "bigint":
    case "smallint":
      return `${rowIndex + 1}`;
    case "real":
      return `${(rowIndex + 1) * 1.5}`;
    case "boolean":
      return `${rowIndex % 2 === 0}`;
    case "timestamp":
      return `new Date("2025-01-${String((rowIndex % 28) + 1).padStart(2, "0")}")`;
    case "json":
    case "jsonb":
      return `{}`;
    case "uuid":
      return `"00000000-0000-0000-0000-${String(rowIndex + 1).padStart(12, "0")}"`;
    case "blob":
      return `Buffer.from("seed_${rowIndex + 1}")`;
    default:
      return `"${col.name}_${rowIndex + 1}"`;
  }
}

function generateSeedScript(tables: TableDef[]): string {
  const imports = tables.map((t) => t.exportName).join(", ");
  let script = `import { db } from "./index";\nimport { ${imports} } from "./schema";\n\n`;
  script += `async function seed() {\n  console.log("Seeding database...");\n\n`;

  for (const table of tables) {
    const insertColumns = table.columns.filter((c) => {
      const name = c.name.toLowerCase();
      // Skip columns with auto-generated defaults
      if (c.hasDefault && (c.isPrimary || name === "createdat" || name === "updatedat")) return false;
      return true;
    });

    script += `  // ${table.name}\n`;
    script += `  await db.insert(${table.exportName}).values([\n`;

    for (let i = 0; i < count; i++) {
      const values = insertColumns.map((col) => `      ${col.name}: ${generateValue(col, i)}`);
      script += `    {\n${values.join(",\n")},\n    },\n`;
    }

    script += `  ]);\n`;
    script += `  console.log("  ${table.name}: ${count} rows inserted");\n\n`;
  }

  script += `  console.log("Seeding complete.");\n}\n\n`;
  script += `seed().catch((err) => {\n  console.error("Seed failed:", err);\n  process.exit(1);\n});\n`;

  return script;
}

function generateJsonOutput(tables: TableDef[]): Record<string, Array<Record<string, unknown>>> {
  const result: Record<string, Array<Record<string, unknown>>> = {};

  for (const table of tables) {
    const rows: Array<Record<string, unknown>> = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, unknown> = {};
      for (const col of table.columns) {
        const val = generateValue(col, i);
        // Parse the generated string value back to a primitive
        if (val.startsWith('"') && val.endsWith('"')) {
          row[col.name] = val.slice(1, -1);
        } else if (val === "true" || val === "false") {
          row[col.name] = val === "true";
        } else if (val.startsWith("new Date")) {
          row[col.name] = val;
        } else if (!isNaN(Number(val))) {
          row[col.name] = Number(val);
        } else {
          row[col.name] = val;
        }
      }
      rows.push(row);
    }
    result[table.name] = rows;
  }

  return result;
}

async function main() {
  const schemaPath = filteredArgs[0];
  if (!schemaPath) {
    console.error("Error: provide a schema file path");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedPath = resolve(schemaPath);
  const file = Bun.file(resolvedPath);

  if (!(await file.exists())) {
    console.error(`Error: schema file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = await file.text();
  const tables = parseSchema(content);

  if (tables.length === 0) {
    console.error("No Drizzle table definitions found in the schema file");
    process.exit(1);
  }

  let output: string;
  if (jsonOutput) {
    output = JSON.stringify(generateJsonOutput(tables), null, 2);
  } else {
    output = generateSeedScript(tables);
  }

  if (outputPath) {
    await Bun.write(resolve(outputPath), output);
    console.log(`Seed ${jsonOutput ? "data" : "script"} written to ${outputPath}`);
  } else {
    console.log(output);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
