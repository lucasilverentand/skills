const args = Bun.argv.slice(2);

const HELP = `
client-gen — Generate type-safe TypeScript client code from an OpenAPI spec

Usage:
  bun run tools/client-gen.ts <spec.json> [options]

Options:
  --output <file>   Write client to file instead of stdout
  --json            Output as JSON (wraps generated code in JSON)
  --help            Show this help message

Reads an OpenAPI 3.x JSON spec and generates a typed TypeScript API client
with methods for each endpoint, path parameter interpolation, and typed
request/response bodies.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const outputIdx = args.indexOf("--output");
const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (outputIdx === -1 || i !== outputIdx + 1)
);

function schemaToType(schema: any, indent = ""): string {
  if (!schema) return "unknown";

  if (schema.type === "string") return "string";
  if (schema.type === "number" || schema.type === "integer") return "number";
  if (schema.type === "boolean") return "boolean";
  if (schema.type === "null") return "null";

  if (schema.type === "array") {
    const itemType = schemaToType(schema.items, indent);
    return `${itemType}[]`;
  }

  if (schema.type === "object" || schema.properties) {
    const props = schema.properties ?? {};
    const required = new Set(schema.required ?? []);
    const lines: string[] = ["{"];
    for (const [name, prop] of Object.entries(props)) {
      const optional = required.has(name) ? "" : "?";
      const type = schemaToType(prop, indent + "  ");
      lines.push(`${indent}  ${name}${optional}: ${type};`);
    }
    lines.push(`${indent}}`);
    return lines.join("\n");
  }

  if (schema.oneOf || schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf).map((s: any) => schemaToType(s, indent));
    return variants.join(" | ");
  }

  return "unknown";
}

function operationIdToMethodName(operationId: string): string {
  return operationId.replace(/[^a-zA-Z0-9]/g, "");
}

function generateClient(spec: any): string {
  const lines: string[] = [];

  lines.push("// Auto-generated API client — do not edit by hand");
  lines.push("// Regenerate from OpenAPI spec with: bun run tools/client-gen.ts <spec.json>");
  lines.push("");
  lines.push("export interface ApiClientOptions {");
  lines.push("  baseUrl: string;");
  lines.push("  headers?: Record<string, string>;");
  lines.push("  fetch?: typeof fetch;");
  lines.push("}");
  lines.push("");
  lines.push("export function createApiClient(options: ApiClientOptions) {");
  lines.push("  const { baseUrl, headers: defaultHeaders = {}, fetch: fetchFn = fetch } = options;");
  lines.push("");
  lines.push("  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {");
  lines.push("    const res = await fetchFn(`${baseUrl}${path}`, {");
  lines.push("      method,");
  lines.push("      headers: { 'Content-Type': 'application/json', ...defaultHeaders },");
  lines.push("      body: body ? JSON.stringify(body) : undefined,");
  lines.push("    });");
  lines.push("    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);");
  lines.push("    return res.json() as Promise<T>;");
  lines.push("  }");
  lines.push("");
  lines.push("  return {");

  if (spec.paths) {
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, op] of Object.entries(methods as Record<string, any>)) {
        if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;

        const operationId = op.operationId ?? `${method}${path.replace(/[^a-zA-Z0-9]/g, "")}`;
        const methodName = operationIdToMethodName(operationId);

        // Collect path parameters
        const pathParams: string[] = [];
        const paramMatches = path.matchAll(/\{(\w+)\}/g);
        for (const m of paramMatches) {
          pathParams.push(m[1]);
        }

        // Build function signature
        const params: string[] = [];
        if (pathParams.length > 0) {
          params.push(`params: { ${pathParams.map((p) => `${p}: string`).join("; ")} }`);
        }

        const hasBody = ["post", "put", "patch"].includes(method);
        const bodySchema = op.requestBody?.content?.["application/json"]?.schema;
        if (hasBody) {
          const bodyType = bodySchema ? schemaToType(bodySchema, "    ") : "unknown";
          params.push(`body: ${bodyType}`);
        }

        const responseSchema = op.responses?.["200"]?.content?.["application/json"]?.schema;
        const responseType = responseSchema ? schemaToType(responseSchema, "    ") : "unknown";

        // Build path interpolation
        let pathExpr: string;
        if (pathParams.length > 0) {
          pathExpr = "`" + path.replace(/\{(\w+)\}/g, "${params.$1}") + "`";
        } else {
          pathExpr = `"${path}"`;
        }

        const paramStr = params.length > 0 ? params.join(", ") : "";
        const bodyArg = hasBody ? ", body" : "";

        lines.push(`    /** ${method.toUpperCase()} ${path} */`);
        lines.push(
          `    ${methodName}(${paramStr}): Promise<${responseType}> {`
        );
        lines.push(
          `      return request("${method.toUpperCase()}", ${pathExpr}${bodyArg});`
        );
        lines.push("    },");
        lines.push("");
      }
    }
  }

  lines.push("  };");
  lines.push("}");

  return lines.join("\n");
}

async function main() {
  const specPath = filteredArgs[0];
  if (!specPath) {
    console.error("Error: missing required spec file argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedPath = resolve(specPath);

  const file = Bun.file(resolvedPath);
  if (!(await file.exists())) {
    console.error(`Error: spec file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const spec = JSON.parse(await file.text());
  const clientCode = generateClient(spec);

  if (outputFile) {
    await Bun.write(resolve(outputFile), clientCode);
    console.log(`Client written to ${outputFile}`);
  } else if (jsonOutput) {
    console.log(JSON.stringify({ code: clientCode }, null, 2));
  } else {
    console.log(clientCode);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
