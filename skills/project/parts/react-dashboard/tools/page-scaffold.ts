const args = Bun.argv.slice(2);

const HELP = `
page-scaffold — Generate a new dashboard page with loader and auth guard

Usage:
  bun run tools/page-scaffold.ts <route> [options]

Arguments:
  route     Route path (e.g. "users", "settings", "users.$id")

Options:
  --no-auth     Skip auth guard in beforeLoad
  --no-loader   Skip server function loader
  --dir         Dashboard app directory (default: current directory)
  --dry-run     Show generated code without writing files
  --json        Output as JSON instead of plain text
  --help        Show this help message

Examples:
  bun run tools/page-scaffold.ts users
  bun run tools/page-scaffold.ts users.\\$id --no-auth
  bun run tools/page-scaffold.ts settings --dry-run
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dryRun = args.includes("--dry-run");
const noAuth = args.includes("--no-auth");
const noLoader = args.includes("--no-loader");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

const dirIdx = args.indexOf("--dir");
const customDir = dirIdx !== -1 ? args[dirIdx + 1] : null;

function routeToComponentName(route: string): string {
  return route
    .split(".")
    .filter((s) => !s.startsWith("$"))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("") + "Page";
}

function routeToTitle(route: string): string {
  const last = route.split(".").filter((s) => !s.startsWith("$")).pop() || route;
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function routeToPath(route: string): string {
  return "/" + route.replace(/\./g, "/").replace(/\$/g, ":");
}

async function main() {
  const route = filteredArgs[0];
  if (!route) {
    console.error("Error: missing required route argument");
    process.exit(1);
  }

  const root = customDir || process.cwd();
  const fileName = `${route}.tsx`;
  const filePath = `${root}/app/routes/${fileName}`;
  const componentName = routeToComponentName(route);
  const title = routeToTitle(route);
  const urlPath = routeToPath(route);

  const parts: string[] = [];

  parts.push(`import { createFileRoute } from "@tanstack/react-router";`);
  if (!noLoader) {
    parts.push(`import { createServerFn } from "@tanstack/react-start";`);
  }
  if (!noAuth) {
    parts.push(`import { redirect } from "@tanstack/react-router";`);
  }
  parts.push("");

  if (!noLoader) {
    parts.push(`const get${title}Data = createServerFn({ method: "GET" }).handler(async () => {`);
    parts.push(`  // TODO: fetch data from API or database`);
    parts.push(`  return { items: [] };`);
    parts.push(`});\n`);
  }

  parts.push(`export const Route = createFileRoute("${urlPath}")({`);

  if (!noAuth) {
    parts.push(`  beforeLoad: async ({ context }) => {`);
    parts.push(`    if (!context.user) throw redirect({ to: "/login" });`);
    parts.push(`  },`);
  }

  if (!noLoader) {
    parts.push(`  loader: () => get${title}Data(),`);
  }

  parts.push(`  component: ${componentName},`);
  parts.push(`});\n`);

  parts.push(`function ${componentName}() {`);
  if (!noLoader) {
    parts.push(`  const data = Route.useLoaderData();\n`);
  }
  parts.push(`  return (`);
  parts.push(`    <div className="p-6">`);
  parts.push(`      <h1 className="text-2xl font-bold mb-4">${title}</h1>`);
  parts.push(`      {/* TODO: implement ${title.toLowerCase()} page */}`);
  parts.push(`    </div>`);
  parts.push(`  );`);
  parts.push(`}`);
  parts.push("");

  const content = parts.join("\n");

  if (jsonOutput) {
    console.log(JSON.stringify({ route, path: filePath, content }, null, 2));
    return;
  }

  if (dryRun) {
    console.log(`Would create ${filePath}:\n`);
    console.log(content);
    return;
  }

  // Check if file already exists
  if (await Bun.file(filePath).exists()) {
    console.error(`Error: ${filePath} already exists`);
    process.exit(1);
  }

  await Bun.write(filePath, content);
  console.log(`Created ${filePath}`);
  console.log(`  route: ${urlPath}`);
  console.log(`  component: ${componentName}`);
  console.log(`  auth: ${noAuth ? "no" : "yes"}`);
  console.log(`  loader: ${noLoader ? "no" : "yes"}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
