const args = Bun.argv.slice(2);

const HELP = `
endpoint-scaffold — Generate a new Hono route file with validation boilerplate

Usage:
  bun run tools/endpoint-scaffold.ts <resource> [options]

Arguments:
  resource    Resource name in kebab-case (e.g. "users", "blog-posts")

Options:
  --crud      Generate full CRUD routes (GET, POST, PUT, DELETE)
  --json      Output as JSON instead of plain text
  --help      Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const crudMode = args.includes("--crud");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

async function main() {
  const resource = filteredArgs[0];
  if (!resource) {
    console.error("Error: missing required resource argument");
    process.exit(1);
  }

  const root = process.cwd();
  const filePath = `${root}/src/routes/${resource}.ts`;

  if (await Bun.file(filePath).exists()) {
    console.error(`Error: route file already exists at src/routes/${resource}.ts`);
    process.exit(1);
  }

  const pascal = toPascalCase(resource);
  const camel = toCamelCase(resource);

  let content: string;

  if (crudMode) {
    content = `import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const Create${pascal}Schema = z.object({
  // define fields here
});

const Update${pascal}Schema = Create${pascal}Schema.partial();

export const ${camel}Route = new Hono()
  .get("/", async (c) => {
    // List all ${resource}
    return c.json({ ok: true, data: [] });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    // Get single ${resource}
    return c.json({ ok: true, data: { id } });
  })
  .post("/", zValidator("json", Create${pascal}Schema), async (c) => {
    const body = c.req.valid("json");
    // Create ${resource}
    return c.json({ ok: true, data: body }, 201);
  })
  .put("/:id", zValidator("json", Update${pascal}Schema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    // Update ${resource}
    return c.json({ ok: true, data: { id, ...body } });
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    // Delete ${resource}
    return c.json({ ok: true, data: { id } });
  });
`;
  } else {
    content = `import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const Create${pascal}Schema = z.object({
  // define fields here
});

export const ${camel}Route = new Hono()
  .get("/", async (c) => {
    // List ${resource}
    return c.json({ ok: true, data: [] });
  })
  .post("/", zValidator("json", Create${pascal}Schema), async (c) => {
    const body = c.req.valid("json");
    // Create ${resource}
    return c.json({ ok: true, data: body }, 201);
  });
`;
  }

  await Bun.write(filePath, content);

  const result = {
    file: `src/routes/${resource}.ts`,
    resource,
    exportName: `${camel}Route`,
    crud: crudMode,
    mountInstruction: `app.route("/${resource}", ${camel}Route)`,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Created route: src/routes/${resource}.ts`);
    console.log(`  export: ${result.exportName}`);
    console.log(`  mode: ${crudMode ? "full CRUD" : "list + create"}`);
    console.log(`\nMount in src/app.ts:`);
    console.log(`  import { ${camel}Route } from "./routes/${resource}";`);
    console.log(`  ${result.mountInstruction};`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
