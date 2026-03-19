const args = Bun.argv.slice(2);

const HELP = `
route-map — List all Expo Router screens with path patterns and params

Usage:
  bun run tools/route-map.ts [path] [options]

Arguments:
  path    Path to the Expo app package (default: current directory)

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
  route: string;
  params: string[];
  isLayout: boolean;
  group: string | null;
}

function fileToRoute(filePath: string): { route: string; params: string[]; group: string | null } {
  const params: string[] = [];

  let route = filePath
    .replace(/\.(tsx|ts|jsx|js)$/, "")
    .replace(/\/index$/, "/");

  // Extract groups (they don't appear in URL)
  const groups = route.match(/\(([^)]+)\)/g);
  const group = groups ? groups.map((g) => g.replace(/[()]/g, "")).join("/") : null;
  route = route.replace(/\([^)]+\)\/?/g, "");

  // Extract params
  const paramMatches = route.matchAll(/\[([^\]]+)\]/g);
  for (const m of paramMatches) {
    if (m[1].startsWith("...")) {
      params.push(`*${m[1].slice(3)}`);
      route = route.replace(m[0], `*`);
    } else {
      params.push(m[1]);
      route = route.replace(m[0], `:${m[1]}`);
    }
  }

  if (!route.startsWith("/")) route = "/" + route;
  if (route !== "/" && route.endsWith("/")) route = route.slice(0, -1);

  return { route, params, group };
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const appDir = `${root}/app`;

  const appDirFile = Bun.file(`${appDir}/_layout.tsx`);
  const appDirExists = await appDirFile.exists();

  // Also check for app/_layout.ts
  if (!appDirExists) {
    const altLayout = Bun.file(`${appDir}/_layout.ts`);
    if (!(await altLayout.exists())) {
      // Check if app/ directory exists at all
      const glob = new Bun.Glob("*.{tsx,ts}");
      let hasFiles = false;
      for await (const _ of glob.scan({ cwd: appDir })) {
        hasFiles = true;
        break;
      }
      if (!hasFiles) {
        console.error("Error: no app/ directory with route files found");
        process.exit(1);
      }
    }
  }

  const glob = new Bun.Glob("**/*.{tsx,ts,jsx,js}");
  const routes: RouteInfo[] = [];

  for await (const file of glob.scan({ cwd: appDir })) {
    // Skip non-route files
    const fileName = file.split("/").pop() || "";
    if (fileName.startsWith("_") && fileName !== "_layout.tsx" && fileName !== "_layout.ts") continue;

    const isLayout = fileName.startsWith("_layout");
    const { route, params, group } = fileToRoute(file);

    routes.push({
      file: `app/${file}`,
      route: isLayout ? `${route} (layout)` : route,
      params,
      isLayout,
      group,
    });
  }

  // Sort: layouts first, then by route
  routes.sort((a, b) => {
    if (a.isLayout !== b.isLayout) return a.isLayout ? -1 : 1;
    return a.route.localeCompare(b.route);
  });

  if (jsonOutput) {
    console.log(JSON.stringify(routes, null, 2));
  } else {
    if (routes.length === 0) {
      console.log("No routes found in app/");
      return;
    }

    const layouts = routes.filter((r) => r.isLayout);
    const screens = routes.filter((r) => !r.isLayout);

    if (layouts.length > 0) {
      console.log(`Layouts (${layouts.length}):\n`);
      for (const r of layouts) {
        const groupStr = r.group ? ` [group: ${r.group}]` : "";
        console.log(`  ${r.file}${groupStr}`);
      }
      console.log();
    }

    console.log(`Screens (${screens.length}):\n`);
    const maxRoute = Math.max(...screens.map((r) => r.route.length), 5);

    for (const r of screens) {
      const paramsStr = r.params.length > 0 ? ` (${r.params.join(", ")})` : "";
      const groupStr = r.group ? ` [${r.group}]` : "";
      console.log(
        `  ${r.route.padEnd(maxRoute)}  ${r.file}${paramsStr}${groupStr}`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
