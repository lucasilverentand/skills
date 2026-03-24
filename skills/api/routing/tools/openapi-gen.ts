const args = Bun.argv.slice(2);

const HELP = `
openapi-gen — Generate an OpenAPI 3.1 spec from Hono route definitions

Usage:
  bun run tools/openapi-gen.ts <routes-dir> [options]

Options:
  --output <file>   Write spec to file instead of stdout
  --json            Output as JSON (default is YAML-like text)
  --help            Show this help message

Scans Hono router files for route definitions (.get, .post, .put, .patch, .delete)
and generates an OpenAPI 3.1 specification. Extracts Zod validators where found.
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

interface RouteInfo {
  method: string;
  path: string;
  file: string;
  line: number;
  hasValidator: boolean;
  validatorType: string | null;
  operationId: string;
  tag: string;
}

function pathToOperationId(method: string, routePath: string): string {
  const parts = routePath
    .replace(/[{}:]/g, "")
    .split("/")
    .filter(Boolean);
  const verb = method === "get" ? "get" : method === "post" ? "create" : method === "delete" ? "delete" : "update";
  return verb + parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function pathToTag(routePath: string): string {
  const parts = routePath.split("/").filter(Boolean);
  // Use first non-parameter segment as the tag
  for (const part of parts) {
    if (!part.startsWith(":") && !part.startsWith("{")) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
  }
  return "Default";
}

function honoParamsToOpenAPI(routePath: string): string {
  // Convert :param to {param}
  return routePath.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{$1}");
}

async function scanFile(filePath: string): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return routes;

  const content = await file.text();
  const lines = content.split("\n");

  // Match Hono route patterns: .get("/path", ...), app.post("/path", ...)
  const routeRegex =
    /\.(get|post|put|patch|delete)\s*\(\s*["'`](\/[^"'`]*)["'`]/gi;
  let match: RegExpExecArray | null;

  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toLowerCase();
    const routePath = match[2];
    const lineNum = content.substring(0, match.index).split("\n").length;

    // Check if there's a Zod validator nearby (within 5 lines ahead)
    const nearbyLines = lines.slice(lineNum - 1, lineNum + 5).join("\n");
    const hasZodValidator = /zValidator|z\.object|\.parse\(|validator\(/i.test(nearbyLines);
    const validatorMatch = nearbyLines.match(/zValidator\s*\(\s*["'](\w+)["']/);

    routes.push({
      method,
      path: honoParamsToOpenAPI(routePath),
      file: filePath,
      line: lineNum,
      hasValidator: hasZodValidator,
      validatorType: validatorMatch ? validatorMatch[1] : null,
      operationId: pathToOperationId(method, routePath),
      tag: pathToTag(routePath),
    });
  }

  return routes;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    // Skip node_modules and test files
    if (path.includes("node_modules") || path.includes(".test.") || path.includes(".spec.")) continue;
    files.push(path);
  }
  return files;
}

function buildSpec(routes: RouteInfo[]): object {
  const paths: Record<string, Record<string, object>> = {};
  const tags = new Set<string>();

  for (const route of routes) {
    tags.add(route.tag);

    if (!paths[route.path]) paths[route.path] = {};

    const operation: Record<string, unknown> = {
      operationId: route.operationId,
      tags: [route.tag],
      summary: `${route.method.toUpperCase()} ${route.path}`,
      responses: {
        "200": {
          description: "Successful response",
          content: { "application/json": { schema: { type: "object" } } },
        },
      },
    };

    // Add path parameters
    const paramMatches = route.path.matchAll(/\{(\w+)\}/g);
    const parameters: object[] = [];
    for (const m of paramMatches) {
      parameters.push({
        name: m[1],
        in: "path",
        required: true,
        schema: { type: "string" },
      });
    }

    if (parameters.length > 0) {
      operation.parameters = parameters;
    }

    // Add request body for methods that accept one
    if (["post", "put", "patch"].includes(route.method)) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: route.hasValidator
              ? { type: "object", description: "Validated by Zod schema — see source for fields" }
              : { type: "object" },
          },
        },
      };
    }

    if (!route.hasValidator && ["post", "put", "patch"].includes(route.method)) {
      (operation as Record<string, unknown>)["x-missing-validator"] = true;
    }

    paths[route.path][route.method] = operation;
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "API",
      version: "0.1.0",
      description: "Generated from Hono route definitions",
    },
    tags: Array.from(tags)
      .sort()
      .map((t) => ({ name: t })),
    paths,
  };
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required routes directory argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No TypeScript/JavaScript files found at the specified path");
    process.exit(1);
  }

  const allRoutes: RouteInfo[] = [];
  for (const file of files) {
    const routes = await scanFile(file);
    allRoutes.push(...routes);
  }

  if (allRoutes.length === 0) {
    console.error("No Hono route definitions found");
    process.exit(1);
  }

  const spec = buildSpec(allRoutes);

  const output = JSON.stringify(spec, null, 2);

  if (outputFile) {
    await Bun.write(resolve(outputFile), output);
    console.log(`OpenAPI spec written to ${outputFile} (${allRoutes.length} routes)`);
  } else if (jsonOutput) {
    console.log(output);
  } else {
    console.log(`Generated OpenAPI 3.1 spec from ${files.length} files, ${allRoutes.length} routes\n`);
    console.log("Routes found:\n");
    for (const route of allRoutes) {
      const validator = route.hasValidator ? " [validated]" : " [NO VALIDATOR]";
      console.log(`  ${route.method.toUpperCase().padEnd(7)} ${route.path}${validator}`);
      console.log(`    source: ${route.file}:${route.line}`);
    }
    console.log(`\nSpec JSON:\n${output}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
