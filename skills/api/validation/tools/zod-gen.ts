const args = Bun.argv.slice(2);

const HELP = `
zod-gen — Generate Zod schemas from TypeScript interfaces or type aliases

Usage:
  bun run tools/zod-gen.ts <file> [interface-name] [options]

Options:
  --output <path>   Write schema to a file instead of stdout
  --json            Output as JSON instead of plain text
  --help            Show this help message

Reads a TypeScript file, extracts the specified interface or type alias,
and generates the equivalent Zod schema code.
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

const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] === "--output")
);

interface ParsedField {
  name: string;
  type: string;
  optional: boolean;
  nullable: boolean;
}

interface ParsedInterface {
  name: string;
  fields: ParsedField[];
}

function typeToZod(tsType: string): string {
  const trimmed = tsType.trim();

  // Array types
  if (trimmed.endsWith("[]")) {
    const inner = trimmed.slice(0, -2);
    return `z.array(${typeToZod(inner)})`;
  }
  if (trimmed.startsWith("Array<") && trimmed.endsWith(">")) {
    const inner = trimmed.slice(6, -1);
    return `z.array(${typeToZod(inner)})`;
  }

  // Nullable
  if (trimmed.includes(" | null")) {
    const inner = trimmed.replace(/ \| null/g, "");
    return `${typeToZod(inner)}.nullable()`;
  }
  if (trimmed.includes(" | undefined")) {
    const inner = trimmed.replace(/ \| undefined/g, "");
    return `${typeToZod(inner)}.optional()`;
  }

  // Union types (string literals)
  if (trimmed.includes("|") && trimmed.includes('"')) {
    const parts = trimmed.split("|").map((p) => p.trim());
    const literals = parts.map((p) => {
      const match = p.match(/^["'](.+)["']$/);
      return match ? `"${match[1]}"` : p;
    });
    return `z.enum([${literals.join(", ")}])`;
  }

  // Primitive types
  switch (trimmed) {
    case "string": return "z.string()";
    case "number": return "z.number()";
    case "boolean": return "z.boolean()";
    case "Date": return "z.date()";
    case "bigint": return "z.bigint()";
    case "any": return "z.any()";
    case "unknown": return "z.unknown()";
    case "void": return "z.void()";
    case "never": return "z.never()";
    case "undefined": return "z.undefined()";
    case "null": return "z.null()";
    default:
      // Record types
      if (trimmed.startsWith("Record<")) {
        const inner = trimmed.slice(7, -1);
        const [keyType, valueType] = splitGenericArgs(inner);
        return `z.record(${typeToZod(keyType)}, ${typeToZod(valueType)})`;
      }
      // Assume it's a reference to another schema
      return `${trimmed}Schema`;
  }
}

function splitGenericArgs(inner: string): string[] {
  let depth = 0;
  let current = "";
  const parts: string[] = [];

  for (const char of inner) {
    if (char === "<") depth++;
    else if (char === ">") depth--;
    else if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseInterface(content: string, name?: string): ParsedInterface | null {
  // Find interface or type
  const interfaceRegex = name
    ? new RegExp(`(?:export\\s+)?(?:interface|type)\\s+${name}\\s*(?:=\\s*)?\\{([^}]+)\\}`, "s")
    : /(?:export\s+)?(?:interface|type)\s+(\w+)\s*(?:=\s*)?\{([^}]+)\}/s;

  const match = content.match(interfaceRegex);
  if (!match) return null;

  const interfaceName = name || match[1];
  const body = name ? match[1] : match[2];

  const fields: ParsedField[] = [];
  const fieldRegex = /(\w+)(\??):\s*([^;]+);/g;
  let fieldMatch;

  while ((fieldMatch = fieldRegex.exec(body)) !== null) {
    const fieldName = fieldMatch[1];
    const optional = fieldMatch[2] === "?";
    let fieldType = fieldMatch[3].trim();
    const nullable = fieldType.includes("| null");

    if (nullable) fieldType = fieldType.replace(/\s*\|\s*null/g, "").trim();

    fields.push({ name: fieldName, type: fieldType, optional, nullable });
  }

  return { name: interfaceName, fields };
}

async function main() {
  const filePath = filteredArgs[0];
  const interfaceName = filteredArgs[1];
  const outputPath = getFlag("--output");

  if (!filePath) {
    console.error("Error: file path required");
    process.exit(1);
  }

  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(1);
  }

  const content = await file.text();
  const parsed = parseInterface(content, interfaceName);

  if (!parsed) {
    console.error(
      `Error: ${interfaceName ? `interface '${interfaceName}' not found` : "no interface found"} in ${filePath}`
    );
    process.exit(1);
  }

  // Generate Zod schema
  const schemaName = `${parsed.name.charAt(0).toLowerCase()}${parsed.name.slice(1)}Schema`;

  let schemaCode = `import { z } from "zod";\n\n`;
  schemaCode += `export const ${schemaName} = z.object({\n`;

  for (const field of parsed.fields) {
    let zodType = typeToZod(field.type);
    if (field.nullable) zodType += ".nullable()";
    if (field.optional) zodType += ".optional()";
    schemaCode += `  ${field.name}: ${zodType},\n`;
  }

  schemaCode += `});\n\n`;
  schemaCode += `export type ${parsed.name} = z.infer<typeof ${schemaName}>;\n`;

  if (outputPath) {
    await Bun.write(outputPath, schemaCode);
  }

  const result = {
    sourceFile: filePath,
    interfaceName: parsed.name,
    schemaName,
    fields: parsed.fields.map((f) => ({
      name: f.name,
      type: f.type,
      zodType: typeToZod(f.type),
      optional: f.optional,
      nullable: f.nullable,
    })),
    schemaCode,
    outputPath: outputPath || null,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else if (outputPath) {
    console.log(`Schema written to: ${outputPath}`);
    console.log(`  Interface: ${parsed.name}`);
    console.log(`  Schema: ${schemaName}`);
    console.log(`  Fields: ${parsed.fields.length}`);
  } else {
    console.log(schemaCode);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
