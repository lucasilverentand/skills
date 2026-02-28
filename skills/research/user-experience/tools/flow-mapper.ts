const args = Bun.argv.slice(2);

const HELP = `
flow-mapper — Parse route definitions and generate a user flow diagram

Usage:
  bun run tools/flow-mapper.ts <directory> [options]

Options:
  --framework <name>   Framework hint: react-router, expo-router, astro, hono, next (default: auto-detect)
  --json               Output as JSON instead of plain text
  --help               Show this help message

Scans route definitions in the project and generates a Mermaid flow
diagram showing navigation structure, route guards, and dead ends.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

let framework = "auto";
const fwIdx = args.indexOf("--framework");
if (fwIdx !== -1 && args[fwIdx + 1]) {
  framework = args[fwIdx + 1];
}

const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (fwIdx === -1 || (i !== fwIdx && i !== fwIdx + 1))
);

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve, extname, basename } from "node:path";

interface Route {
  path: string;
  file: string;
  hasLayout: boolean;
  hasGuard: boolean;
  hasRedirect: boolean;
  children: Route[];
}

const PAGE_EXTENSIONS = new Set([".tsx", ".jsx", ".ts", ".js", ".astro"]);

async function detectFramework(dir: string): Promise<string> {
  try {
    const pkgJson = JSON.parse(await readFile(join(dir, "package.json"), "utf-8"));
    const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

    if (allDeps["expo-router"]) return "expo-router";
    if (allDeps["react-router"] || allDeps["react-router-dom"]) return "react-router";
    if (allDeps["@tanstack/react-router"]) return "tanstack-router";
    if (allDeps["astro"]) return "astro";
    if (allDeps["hono"]) return "hono";
    if (allDeps["next"]) return "next";
  } catch {
    // No package.json
  }

  // Check for file-based routing directories
  const s1 = await stat(join(dir, "app")).catch(() => null);
  if (s1?.isDirectory()) return "file-based";
  const s2 = await stat(join(dir, "src", "pages")).catch(() => null);
  if (s2?.isDirectory()) return "astro";
  const s3 = await stat(join(dir, "src", "routes")).catch(() => null);
  if (s3?.isDirectory()) return "file-based";

  return "unknown";
}

async function scanFileBasedRoutes(
  dir: string,
  basePath: string = ""
): Promise<Route[]> {
  const routes: Route[] = [];
  let entries: any[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return routes;
  }

  // Sort: directories first, then files
  entries.sort((a: any, b: any) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name.startsWith(".") || entry.name === "components") {
        continue;
      }

      let segment = entry.name;
      // Dynamic route segments
      if (segment.startsWith("[") && segment.endsWith("]")) {
        segment = `:${segment.slice(1, -1)}`;
      }
      // Route groups (parentheses)
      if (segment.startsWith("(") && segment.endsWith(")")) {
        // Group doesn't add to path
        const children = await scanFileBasedRoutes(full, basePath);
        routes.push(...children);
        continue;
      }

      const childPath = `${basePath}/${segment}`;
      const children = await scanFileBasedRoutes(full, childPath);

      // Check if this directory has a layout
      const layoutFile = entries.find(
        (e: any) => e.name.startsWith("layout") || e.name.startsWith("_layout")
      );

      routes.push({
        path: childPath,
        file: relative(process.cwd(), full),
        hasLayout: !!layoutFile,
        hasGuard: false,
        hasRedirect: false,
        children,
      });
    } else if (PAGE_EXTENSIONS.has(extname(entry.name))) {
      const name = basename(entry.name, extname(entry.name));

      // Skip layout and special files
      if (name === "layout" || name === "_layout" || name === "loading" || name === "error" || name === "not-found") {
        continue;
      }

      let routePath: string;
      if (name === "index" || name === "page") {
        routePath = basePath || "/";
      } else if (name.startsWith("[") && name.endsWith("]")) {
        routePath = `${basePath}/:${name.slice(1, -1)}`;
      } else {
        routePath = `${basePath}/${name}`;
      }

      // Quick content scan for guards and redirects
      let hasGuard = false;
      let hasRedirect = false;
      try {
        const content = await readFile(full, "utf-8");
        hasGuard = /(?:auth|protect|guard|session|requireAuth|useAuth)/i.test(content);
        hasRedirect = /(?:redirect|navigate|router\.push|router\.replace)/i.test(content);
      } catch {
        // Couldn't read file
      }

      routes.push({
        path: routePath,
        file: relative(process.cwd(), full),
        hasLayout: false,
        hasGuard,
        hasRedirect,
        children: [],
      });
    }
  }

  return routes;
}

function flattenRoutes(routes: Route[]): Route[] {
  const flat: Route[] = [];
  for (const route of routes) {
    if (route.children.length === 0 || route.path !== "") {
      flat.push(route);
    }
    flat.push(...flattenRoutes(route.children));
  }
  return flat;
}

function generateMermaid(routes: Route[]): string {
  const lines: string[] = ["```mermaid", "graph TD"];
  const flat = flattenRoutes(routes);

  // Create node IDs
  const nodeId = (path: string) =>
    path.replace(/[/:.\-\[\]()]/g, "_").replace(/^_/, "root") || "root";

  for (const route of flat) {
    const id = nodeId(route.path);
    let label = route.path || "/";
    if (route.hasGuard) label += " [auth]";
    if (route.hasRedirect) label += " [redirect]";

    lines.push(`  ${id}["${label}"]`);

    // Connect to parent
    const segments = route.path.split("/").filter(Boolean);
    if (segments.length > 1) {
      const parentPath = "/" + segments.slice(0, -1).join("/");
      const parentId = nodeId(parentPath);
      lines.push(`  ${parentId} --> ${id}`);
    } else if (route.path !== "/" && route.path !== "") {
      lines.push(`  root["/"] --> ${id}`);
    }

    // Style guarded routes
    if (route.hasGuard) {
      lines.push(`  style ${id} stroke:#f59e0b,stroke-width:2px`);
    }
  }

  lines.push("```");
  return lines.join("\n");
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const s = await stat(target).catch(() => null);
  if (!s?.isDirectory()) {
    console.error(`Error: "${filteredArgs[0]}" is not a directory`);
    process.exit(1);
  }

  const detected = framework === "auto" ? await detectFramework(target) : framework;

  // Find the routes directory
  let routeDir = target;
  const candidates = [
    join(target, "app"),
    join(target, "src", "app"),
    join(target, "src", "pages"),
    join(target, "src", "routes"),
    join(target, "pages"),
    join(target, "routes"),
  ];

  for (const candidate of candidates) {
    const cs = await stat(candidate).catch(() => null);
    if (cs?.isDirectory()) {
      routeDir = candidate;
      break;
    }
  }

  const routes = await scanFileBasedRoutes(routeDir);
  const flat = flattenRoutes(routes);

  // Find issues
  const issues: string[] = [];
  const guardedRoutes = flat.filter((r) => r.hasGuard);
  const redirectRoutes = flat.filter((r) => r.hasRedirect);
  const leafRoutes = flat.filter((r) => r.children.length === 0);

  // Check for potential dead ends (leaf routes with no redirect and no obvious back navigation)
  if (leafRoutes.length > 0 && !flat.some((r) => r.path === "/")) {
    issues.push("No root route (/) found — users may not have a clear entry point");
  }

  const result = {
    framework: detected,
    routeDirectory: relative(process.cwd(), routeDir),
    totalRoutes: flat.length,
    guardedRoutes: guardedRoutes.length,
    redirectRoutes: redirectRoutes.length,
    routes: flat.map((r) => ({
      path: r.path,
      file: r.file,
      hasGuard: r.hasGuard,
      hasRedirect: r.hasRedirect,
    })),
    issues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Flow Map: ${relative(process.cwd(), target)}\n`);
  console.log(`Framework: ${detected}`);
  console.log(`Route directory: ${result.routeDirectory}`);
  console.log(`Total routes: ${flat.length}`);
  console.log(`Guarded routes: ${guardedRoutes.length}`);
  console.log(`Routes with redirects: ${redirectRoutes.length}\n`);

  // Route list
  console.log("## Routes\n");
  for (const r of flat) {
    const flags: string[] = [];
    if (r.hasGuard) flags.push("auth");
    if (r.hasRedirect) flags.push("redirect");
    if (r.hasLayout) flags.push("layout");
    const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
    console.log(`  ${r.path || "/"}${flagStr}`);
    console.log(`    -> ${r.file}`);
  }

  // Issues
  if (issues.length > 0) {
    console.log("\n## Issues\n");
    for (const issue of issues) console.log(`  - ${issue}`);
  }

  // Mermaid diagram
  console.log("\n## Flow Diagram\n");
  console.log(generateMermaid(routes));
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
