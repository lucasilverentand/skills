const args = Bun.argv.slice(2);

const HELP = `
middleware-audit — Show middleware stack for each route group in a Hono API

Usage:
  bun run tools/middleware-audit.ts [path] [options]

Arguments:
  path    Path to the API package (default: current directory)

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

interface MiddlewareInfo {
  name: string;
  file: string;
  line: number;
  scope: "global" | "route-group" | "route";
  path: string | null;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const middlewares: MiddlewareInfo[] = [];

  const glob = new Bun.Glob("src/**/*.{ts,tsx,js}");

  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match .use() middleware registration
      const useMatch = line.match(/\.use\s*\(\s*(?:['"]([^'"]*)['"]\s*,\s*)?(\w+)/);
      if (useMatch) {
        const path = useMatch[1] || null;
        const name = useMatch[2];

        // Determine scope
        let scope: MiddlewareInfo["scope"] = "global";
        if (path && path !== "/" && path !== "*") {
          scope = "route-group";
        }

        // Check if it's a commonly known middleware
        middlewares.push({
          name,
          file,
          line: i + 1,
          scope,
          path,
        });
      }

      // Match middleware from hono built-ins: cors(), logger(), etc.
      const builtinMatch = line.match(
        /\.use\s*\(\s*(cors|logger|compress|etag|secureHeaders|timing|bodyLimit)\s*\(/
      );
      if (builtinMatch) {
        middlewares.push({
          name: builtinMatch[1],
          file,
          line: i + 1,
          scope: "global",
          path: null,
        });
      }

      // Match middleware imports for context
      const importMatch = line.match(
        /import\s+\{[^}]*(?:cors|logger|compress|secureHeaders|rateLimiter|zValidator|bearerAuth|jwt)[^}]*\}\s+from/
      );
      if (importMatch) {
        // Track imported middleware (already captured via .use())
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = middlewares.filter((m) => {
    const key = `${m.file}:${m.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (jsonOutput) {
    console.log(JSON.stringify(unique, null, 2));
  } else {
    if (unique.length === 0) {
      console.log("No middleware registrations found in src/");
      return;
    }

    console.log(`Middleware audit (${unique.length} registration(s)):\n`);

    const globals = unique.filter((m) => m.scope === "global");
    const scoped = unique.filter((m) => m.scope !== "global");

    if (globals.length > 0) {
      console.log("  Global middleware:");
      for (const m of globals) {
        console.log(`    ${m.name} (${m.file}:${m.line})`);
      }
    }

    if (scoped.length > 0) {
      console.log("\n  Scoped middleware:");
      for (const m of scoped) {
        const pathStr = m.path ? ` on ${m.path}` : "";
        console.log(`    ${m.name}${pathStr} (${m.file}:${m.line})`);
      }
    }

    // Check for common missing middleware
    const names = unique.map((m) => m.name);
    const suggestions: string[] = [];

    if (!names.some((n) => n.includes("cors") || n === "cors")) {
      suggestions.push("CORS middleware not detected — add cors() if API is accessed cross-origin");
    }
    if (!names.some((n) => n.includes("auth") || n.includes("session") || n.includes("bearer"))) {
      suggestions.push("No auth middleware detected — add auth middleware for protected routes");
    }

    if (suggestions.length > 0) {
      console.log("\n  Suggestions:");
      for (const s of suggestions) {
        console.log(`    ! ${s}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
