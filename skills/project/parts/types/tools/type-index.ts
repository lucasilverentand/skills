const args = Bun.argv.slice(2);

const HELP = `
type-index — List all exported types, interfaces, and Zod schemas

Usage:
  bun run tools/type-index.ts [path] [options]

Arguments:
  path    Path to the types package (default: current directory)

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

interface ExportedItem {
  name: string;
  kind: "type" | "interface" | "zod-schema" | "function" | "const" | "enum";
  file: string;
  line: number;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const items: ExportedItem[] = [];

  const glob = new Bun.Glob("src/**/*.{ts,tsx}");

  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Export type
      const typeMatch = line.match(/export\s+type\s+(\w+)/);
      if (typeMatch) {
        items.push({ name: typeMatch[1], kind: "type", file, line: i + 1 });
        continue;
      }

      // Export interface
      const ifaceMatch = line.match(/export\s+interface\s+(\w+)/);
      if (ifaceMatch) {
        items.push({ name: ifaceMatch[1], kind: "interface", file, line: i + 1 });
        continue;
      }

      // Export enum
      const enumMatch = line.match(/export\s+enum\s+(\w+)/);
      if (enumMatch) {
        items.push({ name: enumMatch[1], kind: "enum", file, line: i + 1 });
        continue;
      }

      // Zod schema (export const FooSchema = z.object/z.string/etc)
      const zodMatch = line.match(/export\s+const\s+(\w+Schema)\s*=\s*z\./);
      if (zodMatch) {
        items.push({ name: zodMatch[1], kind: "zod-schema", file, line: i + 1 });
        continue;
      }

      // Regular const (non-schema)
      const constMatch = line.match(/export\s+const\s+(\w+)\s*=/);
      if (constMatch && !constMatch[1].endsWith("Schema")) {
        items.push({ name: constMatch[1], kind: "const", file, line: i + 1 });
        continue;
      }

      // Export function
      const funcMatch = line.match(/export\s+function\s+(\w+)/);
      if (funcMatch) {
        items.push({ name: funcMatch[1], kind: "function", file, line: i + 1 });
        continue;
      }
    }
  }

  // Group by kind
  const grouped = new Map<string, ExportedItem[]>();
  for (const item of items) {
    const list = grouped.get(item.kind) || [];
    list.push(item);
    grouped.set(item.kind, list);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(items, null, 2));
  } else {
    if (items.length === 0) {
      console.log("No exported types found in src/");
      return;
    }

    console.log(`Exported items (${items.length}):\n`);

    const kindOrder: ExportedItem["kind"][] = [
      "zod-schema",
      "type",
      "interface",
      "enum",
      "function",
      "const",
    ];

    for (const kind of kindOrder) {
      const list = grouped.get(kind);
      if (!list || list.length === 0) continue;

      const label =
        kind === "zod-schema" ? "Zod Schemas" :
        kind === "type" ? "Types" :
        kind === "interface" ? "Interfaces" :
        kind === "enum" ? "Enums" :
        kind === "function" ? "Functions" :
        "Constants";

      console.log(`  ${label} (${list.length}):`);
      for (const item of list.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`    ${item.name} (${item.file}:${item.line})`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
