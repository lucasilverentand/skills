const args = Bun.argv.slice(2);

const HELP = `
route-list — List all registered Hono routes with methods and paths

Usage:
  bun run tools/route-list.ts [path] [options]

Arguments:
  path    Path to the API package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans source files for Hono route definitions (.get, .post, .put, .delete, .patch).
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface RouteInfo {
  method: string;
  path: string;
  file: string;
  line: number;
  hasValidation: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const routes: RouteInfo[] = [];

  const glob = new Bun.Glob("src/**/*.{ts,tsx,js}");

  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match Hono route patterns: .get("/path", ...), .post("/path", ...)
      const routeMatch = line.match(
        /\.(get|post|put|delete|patch|options|head|all)\s*\(\s*['"]([^'"]+)['"]/
      );

      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        const path = routeMatch[2];
        const hasValidation =
          line.includes("zValidator") ||
          line.includes("validator(") ||
          lines.slice(i, Math.min(i + 5, lines.length)).join("\n").includes("zValidator");

        routes.push({
          method,
          path,
          file,
          line: i + 1,
          hasValidation,
        });
      }

      // Match route() mount pattern: app.route("/prefix", router)
      const mountMatch = line.match(
        /\.route\s*\(\s*['"]([^'"]+)['"],\s*(\w+)/
      );
      if (mountMatch) {
        routes.push({
          method: "MOUNT",
          path: mountMatch[1],
          file,
          line: i + 1,
          hasValidation: false,
        });
      }
    }
  }

  routes.sort((a, b) => {
    const pathCmp = a.path.localeCompare(b.path);
    if (pathCmp !== 0) return pathCmp;
    return a.method.localeCompare(b.method);
  });

  if (jsonOutput) {
    console.log(JSON.stringify(routes, null, 2));
  } else {
    if (routes.length === 0) {
      console.log("No routes found in src/");
      return;
    }

    const mounts = routes.filter((r) => r.method === "MOUNT");
    const endpoints = routes.filter((r) => r.method !== "MOUNT");

    if (mounts.length > 0) {
      console.log(`Route mounts (${mounts.length}):\n`);
      for (const m of mounts) {
        console.log(`  ${m.path} -> ${m.file}:${m.line}`);
      }
      console.log();
    }

    console.log(`Endpoints (${endpoints.length}):\n`);

    const maxMethod = Math.max(...endpoints.map((r) => r.method.length), 6);
    const maxPath = Math.max(...endpoints.map((r) => r.path.length), 4);

    for (const r of endpoints) {
      const validIcon = r.hasValidation ? " [v]" : "";
      console.log(
        `  ${r.method.padEnd(maxMethod)}  ${r.path.padEnd(maxPath)}  ${r.file}:${r.line}${validIcon}`
      );
    }

    const unvalidated = endpoints.filter((r) => !r.hasValidation);
    if (unvalidated.length > 0) {
      console.log(
        `\n${unvalidated.length} endpoint(s) without request validation.`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
