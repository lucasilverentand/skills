const args = Bun.argv.slice(2);

const HELP = `
breaking-changes — Diff two OpenAPI specs and report breaking changes

Usage:
  bun run tools/breaking-changes.ts <old-spec.json> <new-spec.json> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Compares two OpenAPI 3.x JSON specs and reports breaking changes:
removed endpoints, removed/renamed fields, type changes, and new required fields.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface Change {
  type: "breaking" | "non-breaking";
  category: string;
  path: string;
  method?: string;
  description: string;
}

function getEndpoints(spec: any): Map<string, Set<string>> {
  const endpoints = new Map<string, Set<string>>();
  if (!spec.paths) return endpoints;

  for (const [path, methods] of Object.entries(spec.paths)) {
    const methodSet = new Set<string>();
    for (const method of Object.keys(methods as Record<string, unknown>)) {
      if (["get", "post", "put", "patch", "delete", "options", "head"].includes(method)) {
        methodSet.add(method);
      }
    }
    endpoints.set(path, methodSet);
  }
  return endpoints;
}

function getRequiredFields(schema: any): Set<string> {
  if (!schema || !schema.required || !Array.isArray(schema.required)) {
    return new Set();
  }
  return new Set(schema.required);
}

function getProperties(schema: any): Map<string, string> {
  const props = new Map<string, string>();
  if (!schema || !schema.properties) return props;

  for (const [name, prop] of Object.entries(schema.properties)) {
    props.set(name, (prop as any)?.type ?? "unknown");
  }
  return props;
}

function compareSchemas(
  oldSchema: any,
  newSchema: any,
  path: string,
  method: string,
  location: string
): Change[] {
  const changes: Change[] = [];
  if (!oldSchema && !newSchema) return changes;
  if (!oldSchema || !newSchema) return changes;

  const oldProps = getProperties(oldSchema);
  const newProps = getProperties(newSchema);
  const oldRequired = getRequiredFields(oldSchema);
  const newRequired = getRequiredFields(newSchema);

  // Removed fields
  for (const [name, type] of oldProps) {
    if (!newProps.has(name)) {
      changes.push({
        type: "breaking",
        category: "removed-field",
        path,
        method,
        description: `Removed ${location} field "${name}" (was ${type})`,
      });
    }
  }

  // Type changes
  for (const [name, oldType] of oldProps) {
    const newType = newProps.get(name);
    if (newType && newType !== oldType) {
      changes.push({
        type: "breaking",
        category: "type-change",
        path,
        method,
        description: `Changed ${location} field "${name}" type from "${oldType}" to "${newType}"`,
      });
    }
  }

  // New required fields (breaking for request schemas)
  for (const name of newRequired) {
    if (!oldRequired.has(name) && !oldProps.has(name)) {
      changes.push({
        type: location === "request" ? "breaking" : "non-breaking",
        category: "new-required-field",
        path,
        method,
        description: `New required ${location} field "${name}"`,
      });
    }
  }

  // Previously optional field now required
  for (const name of newRequired) {
    if (oldProps.has(name) && !oldRequired.has(name)) {
      changes.push({
        type: "breaking",
        category: "field-now-required",
        path,
        method,
        description: `${location} field "${name}" changed from optional to required`,
      });
    }
  }

  // New optional fields (non-breaking)
  for (const [name] of newProps) {
    if (!oldProps.has(name) && !newRequired.has(name)) {
      changes.push({
        type: "non-breaking",
        category: "added-field",
        path,
        method,
        description: `Added optional ${location} field "${name}"`,
      });
    }
  }

  return changes;
}

async function main() {
  if (filteredArgs.length < 2) {
    console.error("Error: two spec files required — old-spec.json and new-spec.json");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const oldPath = resolve(filteredArgs[0]);
  const newPath = resolve(filteredArgs[1]);

  const oldFile = Bun.file(oldPath);
  const newFile = Bun.file(newPath);

  if (!(await oldFile.exists())) {
    console.error(`Error: old spec not found: ${oldPath}`);
    process.exit(1);
  }
  if (!(await newFile.exists())) {
    console.error(`Error: new spec not found: ${newPath}`);
    process.exit(1);
  }

  const oldSpec = JSON.parse(await oldFile.text());
  const newSpec = JSON.parse(await newFile.text());

  const changes: Change[] = [];

  // Compare endpoints
  const oldEndpoints = getEndpoints(oldSpec);
  const newEndpoints = getEndpoints(newSpec);

  // Removed endpoints
  for (const [path, methods] of oldEndpoints) {
    if (!newEndpoints.has(path)) {
      for (const method of methods) {
        changes.push({
          type: "breaking",
          category: "removed-endpoint",
          path,
          method,
          description: `Removed endpoint ${method.toUpperCase()} ${path}`,
        });
      }
    } else {
      const newMethods = newEndpoints.get(path)!;
      for (const method of methods) {
        if (!newMethods.has(method)) {
          changes.push({
            type: "breaking",
            category: "removed-endpoint",
            path,
            method,
            description: `Removed method ${method.toUpperCase()} on ${path}`,
          });
        }
      }
    }
  }

  // New endpoints (non-breaking)
  for (const [path, methods] of newEndpoints) {
    if (!oldEndpoints.has(path)) {
      for (const method of methods) {
        changes.push({
          type: "non-breaking",
          category: "added-endpoint",
          path,
          method,
          description: `Added endpoint ${method.toUpperCase()} ${path}`,
        });
      }
    } else {
      const oldMethods = oldEndpoints.get(path)!;
      for (const method of methods) {
        if (!oldMethods.has(method)) {
          changes.push({
            type: "non-breaking",
            category: "added-endpoint",
            path,
            method,
            description: `Added method ${method.toUpperCase()} on ${path}`,
          });
        }
      }
    }
  }

  // Compare schemas for shared endpoints
  for (const [path, methods] of oldEndpoints) {
    if (!newEndpoints.has(path)) continue;
    const newMethods = newEndpoints.get(path)!;

    for (const method of methods) {
      if (!newMethods.has(method)) continue;

      const oldOp = (oldSpec.paths[path] as any)[method];
      const newOp = (newSpec.paths[path] as any)[method];

      // Compare request body schema
      const oldReqSchema = oldOp?.requestBody?.content?.["application/json"]?.schema;
      const newReqSchema = newOp?.requestBody?.content?.["application/json"]?.schema;
      changes.push(...compareSchemas(oldReqSchema, newReqSchema, path, method, "request"));

      // Compare response schema
      const oldResSchema = oldOp?.responses?.["200"]?.content?.["application/json"]?.schema;
      const newResSchema = newOp?.responses?.["200"]?.content?.["application/json"]?.schema;
      changes.push(...compareSchemas(oldResSchema, newResSchema, path, method, "response"));
    }
  }

  const breaking = changes.filter((c) => c.type === "breaking");
  const nonBreaking = changes.filter((c) => c.type === "non-breaking");

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          breakingCount: breaking.length,
          nonBreakingCount: nonBreaking.length,
          changes,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Breaking Changes Report: ${breaking.length} breaking, ${nonBreaking.length} non-breaking\n`
    );

    if (breaking.length > 0) {
      console.log("BREAKING CHANGES:\n");
      for (const c of breaking) {
        console.log(
          `  [BREAKING] ${c.method?.toUpperCase() ?? ""} ${c.path} — ${c.category}`
        );
        console.log(`    ${c.description}\n`);
      }
    }

    if (nonBreaking.length > 0) {
      console.log("Non-breaking changes:\n");
      for (const c of nonBreaking) {
        console.log(
          `  [ok] ${c.method?.toUpperCase() ?? ""} ${c.path} — ${c.description}`
        );
      }
    }

    if (breaking.length === 0 && nonBreaking.length === 0) {
      console.log("No changes detected between the two specs.");
    }
  }

  if (breaking.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
