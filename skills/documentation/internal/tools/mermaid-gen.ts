const args = Bun.argv.slice(2);

const HELP = `
mermaid-gen — Generate Mermaid diagrams from module imports and database schema

Usage:
  bun run tools/mermaid-gen.ts <src-dir> [options]

Arguments:
  src-dir   Directory to analyze

Options:
  --type <type>   Diagram type: flowchart, er, sequence (default: flowchart)
  --depth <n>     Max directory depth for module analysis (default: 3)
  --output <path> Write diagram to file instead of stdout
  --json          Output as JSON with diagram and metadata
  --help          Show this help message

Examples:
  bun run tools/mermaid-gen.ts src/
  bun run tools/mermaid-gen.ts src/ --type er
  bun run tools/mermaid-gen.ts src/ --type flowchart --depth 2
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const typeIdx = args.indexOf("--type");
const diagramType = typeIdx !== -1 ? args[typeIdx + 1] : "flowchart";
const depthIdx = args.indexOf("--depth");
const maxDepth = depthIdx !== -1 ? parseInt(args[depthIdx + 1]) : 3;
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    i !== typeIdx + 1 &&
    i !== depthIdx + 1 &&
    i !== outputIdx + 1
);

interface ModuleEdge {
  from: string;
  to: string;
}

interface SchemaTable {
  name: string;
  columns: { name: string; type: string; references?: string }[];
}

async function analyzeImports(srcDir: string): Promise<ModuleEdge[]> {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const edges: ModuleEdge[] = [];
  const seenEdges = new Set<string>();

  for await (const filePath of glob.scan({ cwd: srcDir, absolute: false })) {
    // Check depth
    const depth = filePath.split("/").length;
    if (depth > maxDepth + 1) continue;

    const fullPath = `${srcDir}/${filePath}`;
    const content = await Bun.file(fullPath).text();

    // Extract import statements
    const importPattern = /(?:import|from)\s+["']([^"']+)["']/g;
    let match: RegExpExecArray | null;

    while ((match = importPattern.exec(content)) !== null) {
      const importPath = match[1];
      // Only track local imports
      if (!importPath.startsWith(".") && !importPath.startsWith("@/") && !importPath.startsWith("~/")) continue;

      const fromModule = simplifyPath(filePath);
      const toModule = resolveImportPath(filePath, importPath);

      const edgeKey = `${fromModule}->${toModule}`;
      if (!seenEdges.has(edgeKey) && fromModule !== toModule) {
        seenEdges.add(edgeKey);
        edges.push({ from: fromModule, to: toModule });
      }
    }
  }

  return edges;
}

function simplifyPath(filePath: string): string {
  // Remove extension and index files
  let simplified = filePath
    .replace(/\.(ts|tsx|js|jsx)$/, "")
    .replace(/\/index$/, "");

  // Use directory name as module name for short paths
  const parts = simplified.split("/");
  if (parts.length <= 2) return simplified;
  return parts.slice(0, 2).join("/");
}

function resolveImportPath(fromFile: string, importPath: string): string {
  if (importPath.startsWith("@/") || importPath.startsWith("~/")) {
    return simplifyPath(importPath.slice(2));
  }

  const fromDir = fromFile.split("/").slice(0, -1).join("/");
  const parts = importPath.split("/");
  const resolved: string[] = fromDir ? fromDir.split("/") : [];

  for (const part of parts) {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  }

  return simplifyPath(resolved.join("/"));
}

function generateFlowchart(edges: ModuleEdge[]): string {
  const lines: string[] = ["graph TD"];
  const nodeIds = new Map<string, string>();
  let counter = 0;

  function nodeId(name: string): string {
    if (!nodeIds.has(name)) {
      nodeIds.set(name, `N${counter++}`);
    }
    return nodeIds.get(name)!;
  }

  for (const edge of edges) {
    const fromId = nodeId(edge.from);
    const toId = nodeId(edge.to);
    lines.push(`  ${fromId}["${edge.from}"] --> ${toId}["${edge.to}"]`);
  }

  return lines.join("\n");
}

async function analyzeSchema(srcDir: string): Promise<SchemaTable[]> {
  const glob = new Bun.Glob("**/*.{ts,js}");
  const tables: SchemaTable[] = [];

  for await (const filePath of glob.scan({ cwd: srcDir, absolute: true })) {
    const content = await Bun.file(filePath).text();

    // Detect Drizzle schema definitions
    if (!content.includes("pgTable") && !content.includes("sqliteTable") && !content.includes("mysqlTable")) {
      continue;
    }

    // Match table definitions: export const users = pgTable("users", { ... })
    const tablePattern = /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:pg|sqlite|mysql)Table\s*\(\s*["'](\w+)["']\s*,\s*\{/g;
    let match: RegExpExecArray | null;

    while ((match = tablePattern.exec(content)) !== null) {
      const tableName = match[2];
      const startIdx = match.index + match[0].length;

      // Find matching closing brace
      let braceCount = 1;
      let endIdx = startIdx;
      for (let i = startIdx; i < content.length && braceCount > 0; i++) {
        if (content[i] === "{") braceCount++;
        if (content[i] === "}") braceCount--;
        endIdx = i;
      }

      const tableBody = content.slice(startIdx, endIdx);
      const columns: SchemaTable["columns"] = [];

      // Extract column definitions
      const colPattern = /(\w+)\s*:\s*(text|varchar|integer|serial|boolean|timestamp|uuid|bigint|real|numeric|json|jsonb)\s*\(/g;
      let colMatch: RegExpExecArray | null;
      while ((colMatch = colPattern.exec(tableBody)) !== null) {
        const col: SchemaTable["columns"][0] = {
          name: colMatch[1],
          type: colMatch[2],
        };

        // Check for references
        const refContext = tableBody.slice(colMatch.index, colMatch.index + 200);
        const refMatch = refContext.match(/references\s*\(\s*\(\)\s*=>\s*(\w+)\.(\w+)/);
        if (refMatch) {
          col.references = `${refMatch[1]}.${refMatch[2]}`;
        }

        columns.push(col);
      }

      tables.push({ name: tableName, columns });
    }
  }

  return tables;
}

function generateERDiagram(tables: SchemaTable[]): string {
  const lines: string[] = ["erDiagram"];

  for (const table of tables) {
    lines.push(`  ${table.name} {`);
    for (const col of table.columns) {
      lines.push(`    ${col.type} ${col.name}`);
    }
    lines.push("  }");

    // Add relationships from references
    for (const col of table.columns) {
      if (col.references) {
        const [refTable] = col.references.split(".");
        lines.push(`  ${refTable} ||--o{ ${table.name} : ""`);
      }
    }
  }

  return lines.join("\n");
}

async function main() {
  const srcDir = filteredArgs[0];
  if (!srcDir) {
    console.error("Error: missing required argument <src-dir>");
    process.exit(1);
  }

  const resolvedDir = Bun.resolveSync(srcDir, process.cwd());
  let diagram = "";
  let metadata: Record<string, unknown> = {};

  if (diagramType === "flowchart") {
    const edges = await analyzeImports(resolvedDir);
    if (edges.length === 0) {
      console.error("No local import relationships found");
      process.exit(1);
    }
    diagram = generateFlowchart(edges);
    metadata = { type: "flowchart", edgeCount: edges.length };
  } else if (diagramType === "er") {
    const tables = await analyzeSchema(resolvedDir);
    if (tables.length === 0) {
      console.error("No Drizzle schema tables found");
      process.exit(1);
    }
    diagram = generateERDiagram(tables);
    metadata = {
      type: "erDiagram",
      tableCount: tables.length,
      tables: tables.map((t) => t.name),
    };
  } else {
    console.error(`Error: unsupported diagram type "${diagramType}". Use: flowchart, er`);
    process.exit(1);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ ...metadata, diagram }, null, 2));
  } else {
    console.log("```mermaid");
    console.log(diagram);
    console.log("```");
  }

  if (outputPath) {
    const wrapped = `\`\`\`mermaid\n${diagram}\n\`\`\`\n`;
    await Bun.write(outputPath, wrapped);
    console.error(`\nDiagram written to ${outputPath}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
