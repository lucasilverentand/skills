const args = Bun.argv.slice(2);

const HELP = `
route-list — List all dashboard routes with loaders and auth requirements

Usage:
  bun run tools/route-list.ts [path] [options]

Arguments:
  path    Path to the dashboard app (default: current directory)

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

interface RouteInfo {
  file: string;
  path: string;
  hasLoader: boolean;
  hasServerFn: boolean;
  hasBeforeLoad: boolean;
  hasAuthCheck: boolean;
  component: string | null;
}

function fileToRoutePath(file: string): string {
  return (
    "/" +
    file
      .replace(/^app\/routes\//, "")
      .replace(/\.tsx?$/, "")
      .replace(/__root$/, "")
      .replace(/\bindex$/, "")
      .replace(/\$(\w+)/g, ":$1")
      .replace(/\./g, "/")
      .replace(/\/+$/, "") || "/"
  );
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Find route files
  const routeDir = `${root}/app/routes`;
  const routeDirFile = Bun.file(routeDir);

  const glob = new Bun.Glob("**/*.tsx");
  const routes: RouteInfo[] = [];

  try {
    for await (const file of glob.scan({ cwd: routeDir })) {
      const fullPath = `${routeDir}/${file}`;
      const content = await Bun.file(fullPath).text();

      const hasLoader = content.includes("loader:");
      const hasServerFn = content.includes("createServerFn");
      const hasBeforeLoad = content.includes("beforeLoad:");
      const hasAuthCheck =
        content.includes("getSession") ||
        content.includes("redirect") && content.includes("login");

      // Extract component name
      const componentMatch = content.match(/component:\s*(\w+)/);
      const component = componentMatch?.[1] || null;

      routes.push({
        file: `app/routes/${file}`,
        path: fileToRoutePath(`app/routes/${file}`),
        hasLoader,
        hasServerFn,
        hasBeforeLoad,
        hasAuthCheck,
        component,
      });
    }
  } catch {
    console.error(`Error: could not scan ${routeDir}`);
    console.error("Make sure you're in a TanStack Start project.");
    process.exit(1);
  }

  routes.sort((a, b) => a.path.localeCompare(b.path));

  if (jsonOutput) {
    console.log(JSON.stringify(routes, null, 2));
  } else {
    if (routes.length === 0) {
      console.log("No routes found in app/routes/.");
      return;
    }

    console.log("Dashboard routes:\n");

    for (const route of routes) {
      const flags = [
        route.hasLoader ? "loader" : null,
        route.hasServerFn ? "serverFn" : null,
        route.hasBeforeLoad ? "beforeLoad" : null,
        route.hasAuthCheck ? "auth" : null,
      ]
        .filter(Boolean)
        .join(", ");

      console.log(`  ${route.path}`);
      console.log(`    file: ${route.file}`);
      if (route.component) console.log(`    component: ${route.component}`);
      if (flags) console.log(`    features: ${flags}`);
    }

    const withAuth = routes.filter((r) => r.hasAuthCheck).length;
    const withLoader = routes.filter((r) => r.hasLoader).length;
    console.log(
      `\n${routes.length} route(s), ${withLoader} with loaders, ${withAuth} with auth.`
    );
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
