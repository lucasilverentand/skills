const args = Bun.argv.slice(2);

const HELP = `
permission-matrix — Generate a route/role permission matrix

Usage:
  bun run tools/permission-matrix.ts <directory> [options]

Options:
  --framework <name>   Framework hint: hono, express, fastify (default: auto-detect)
  --json               Output as JSON instead of plain text
  --help               Show this help message

Scans API route files and generates a matrix of routes vs. required
authentication/authorization. Flags routes that appear unprotected.
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

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

interface RouteInfo {
  method: string;
  path: string;
  file: string;
  line: number;
  authRequired: boolean;
  authType: string;
  roles: string[];
  issues: string[];
}

// Auth detection patterns
const AUTH_PATTERNS = [
  { pattern: /requireAuth|isAuthenticated|authMiddleware|auth\(\)/i, type: "middleware" },
  { pattern: /session\.user|ctx\.user|c\.get\(['"]user['"]\)|req\.user/i, type: "session-check" },
  { pattern: /bearer|authorization\s*header|getToken/i, type: "token" },
  { pattern: /verifySession|validateToken|checkAuth/i, type: "verify" },
  { pattern: /betterAuth|lucia|clerk|nextAuth|auth\.api/i, type: "auth-library" },
];

const ROLE_PATTERNS = [
  /role\s*===?\s*['"](\w+)['"]/gi,
  /hasRole\s*\(\s*['"](\w+)['"]\s*\)/gi,
  /requireRole\s*\(\s*['"](\w+)['"]\s*\)/gi,
  /isAdmin|is_admin/gi,
];

// Route definition patterns
const ROUTE_PATTERNS = [
  // Hono: app.get('/path', handler)  or  .get('/path', handler)
  /\.(get|post|put|patch|delete|all|options|head)\s*\(\s*['"]([^'"]+)['"]/gi,
  // Express/Fastify: router.get('/path', ...)
  /(?:router|app)\.(get|post|put|patch|delete|all|options|head)\s*\(\s*['"]([^'"]+)['"]/gi,
  // tRPC-style: .query() / .mutation() with path in the procedure name
  /\.(?:query|mutation)\s*\(\s*['"]([^'"]+)['"]/gi,
  // Decorator-based (NestJS): @Get('/path'), @Post('/path'), etc.
  /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"]([^'"]+)['"]\s*\)/gi,
];

// Sensitive route patterns that should always be protected
const SENSITIVE_PATTERNS = [
  /admin/i,
  /user(?:s)?\/(?!login|register|signup|forgot|verify|confirm|reset)/i,
  /settings/i,
  /profile/i,
  /billing/i,
  /payment/i,
  /subscription/i,
  /api\/(?!public|health|status|docs|openapi|swagger|webhook)/i,
  /account/i,
  /dashboard/i,
  /organization/i,
  /team(?:s)?\/(?!invite)/i,
  /upload/i,
  /export/i,
  /import/i,
  /token/i,
  /session/i,
  /invitation/i,
  /member/i,
  /role/i,
  /permission/i,
];

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (CODE_EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

// Check if file-level auth middleware is applied (e.g., .use(auth) at top of file)
function hasFileWideAuth(content: string): { found: boolean; type: string } {
  // Check for middleware applied at the top of the file or route group
  const topContent = content.slice(0, Math.min(content.length, 2000));
  const fileWidePatterns = [
    { pattern: /\.use\s*\([^)]*(?:auth|requireAuth|isAuthenticated|verifySession|checkAuth)/i, type: "middleware" },
    { pattern: /\.use\s*\([^)]*(?:betterAuth|lucia|clerk)/i, type: "auth-library" },
    { pattern: /middleware\s*[:=]\s*\[.*(?:auth|requireAuth)/i, type: "middleware-array" },
    { pattern: /beforeHandle\s*[:=].*(?:auth|requireAuth)/i, type: "hook" },
  ];
  for (const fp of fileWidePatterns) {
    if (fp.pattern.test(topContent)) {
      return { found: true, type: fp.type };
    }
  }
  return { found: false, type: "none" };
}

// Extract file-based routes from file path (Astro, SvelteKit, Remix, Tanstack patterns)
function inferFileBasedRoute(file: string, root: string): { method: string; path: string } | null {
  const rel = relative(root, file);

  // Astro: src/pages/api/users.ts → /api/users
  const astroMatch = rel.match(/src\/pages\/(.*?)(?:\/index)?\.(?:ts|js|astro)$/);
  if (astroMatch) {
    let path = "/" + astroMatch[1].replace(/\[([^\]]+)\]/g, ":$1").replace(/\.\.\./, "*");
    return { method: "FILE-BASED", path };
  }

  // SvelteKit: src/routes/api/users/+server.ts
  const sveltekitMatch = rel.match(/src\/routes\/(.*?)\/\+server\.(?:ts|js)$/);
  if (sveltekitMatch) {
    let path = "/" + sveltekitMatch[1].replace(/\[([^\]]+)\]/g, ":$1");
    return { method: "FILE-BASED", path };
  }

  // Remix/React Router: app/routes/api.users.tsx or app/routes/api/users.tsx
  const remixMatch = rel.match(/app\/routes\/(.*?)\.(?:ts|tsx|js|jsx)$/);
  if (remixMatch) {
    let path = "/" + remixMatch[1].replace(/\./g, "/").replace(/\$(\w+)/g, ":$1").replace(/\[([^\]]+)\]/g, ":$1");
    return { method: "FILE-BASED", path };
  }

  return null;
}

function extractRoutes(content: string, file: string, root: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const rel = relative(root, file);
  const lines = content.split("\n");
  const fileAuth = hasFileWideAuth(content);

  // Check for file-based routing
  const fileRoute = inferFileBasedRoute(file, root);
  if (fileRoute) {
    // Extract exported HTTP methods for file-based routing
    const methodExports = [
      { pattern: /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/gi, type: "named-export" },
      { pattern: /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*=/gi, type: "const-export" },
      // Astro API route pattern
      { pattern: /export\s+(?:async\s+)?function\s+(?:handler|default)/gi, type: "default-handler" },
    ];

    for (const mp of methodExports) {
      mp.pattern.lastIndex = 0;
      let match;
      while ((match = mp.pattern.exec(content)) !== null) {
        const method = mp.type === "default-handler" ? "ALL" : match[1].toUpperCase();
        const lineNum = content.slice(0, match.index).split("\n").length;

        const contextStart = Math.max(0, lineNum - 2);
        const contextEnd = Math.min(lines.length, lineNum + 30);
        const context = lines.slice(contextStart, contextEnd).join("\n");

        let authRequired = fileAuth.found;
        let authType = fileAuth.type;
        if (!authRequired) {
          for (const ap of AUTH_PATTERNS) {
            if (ap.pattern.test(context)) {
              authRequired = true;
              authType = ap.type;
              break;
            }
          }
        }

        const roles: string[] = [];
        for (const rp of ROLE_PATTERNS) {
          rp.lastIndex = 0;
          let roleMatch;
          while ((roleMatch = rp.exec(context)) !== null) {
            if (roleMatch[1]) roles.push(roleMatch[1]);
            else if (/isAdmin|is_admin/.test(roleMatch[0])) roles.push("admin");
          }
        }

        const issues: string[] = [];
        const isSensitive = SENSITIVE_PATTERNS.some((p) => p.test(fileRoute.path));
        if (isSensitive && !authRequired) issues.push("Sensitive route appears unprotected");
        if (method !== "GET" && method !== "ALL" && method !== "HEAD" && method !== "OPTIONS" && !authRequired) {
          issues.push("Non-GET route without apparent auth check");
        }

        routes.push({
          method,
          path: fileRoute.path,
          file: rel,
          line: lineNum,
          authRequired,
          authType,
          roles: [...new Set(roles)],
          issues,
        });
      }
    }
  }

  // Standard route pattern extraction
  for (const routePattern of ROUTE_PATTERNS) {
    routePattern.lastIndex = 0;
    let match;
    while ((match = routePattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const lineNum = content.slice(0, match.index).split("\n").length;

      // Get surrounding context (the handler block)
      const contextStart = Math.max(0, lineNum - 2);
      const contextEnd = Math.min(lines.length, lineNum + 30);
      const context = lines.slice(contextStart, contextEnd).join("\n");

      // Check for auth — file-wide middleware applies to all routes in the file
      let authRequired = fileAuth.found;
      let authType = fileAuth.type;
      if (!authRequired) {
        for (const ap of AUTH_PATTERNS) {
          if (ap.pattern.test(context)) {
            authRequired = true;
            authType = ap.type;
            break;
          }
        }
      }

      // Check for role requirements
      const roles: string[] = [];
      for (const rp of ROLE_PATTERNS) {
        rp.lastIndex = 0;
        let roleMatch;
        while ((roleMatch = rp.exec(context)) !== null) {
          if (roleMatch[1]) roles.push(roleMatch[1]);
          else if (/isAdmin|is_admin/.test(roleMatch[0])) roles.push("admin");
        }
      }

      // Check for issues
      const issues: string[] = [];
      const isSensitive = SENSITIVE_PATTERNS.some((p) => p.test(path));
      if (isSensitive && !authRequired) {
        issues.push("Sensitive route appears unprotected");
      }
      if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && !authRequired) {
        issues.push("Non-GET route without apparent auth check");
      }

      routes.push({
        method,
        path,
        file: rel,
        line: lineNum,
        authRequired,
        authType,
        roles: [...new Set(roles)],
        issues,
      });
    }
  }

  return routes;
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const files = await collectFiles(target);
  const allRoutes: RouteInfo[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    allRoutes.push(...extractRoutes(content, file, target));
  }

  // Deduplicate routes that match on same method+path
  const seen = new Set<string>();
  const routes = allRoutes.filter((r) => {
    const key = `${r.method} ${r.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const unprotected = routes.filter((r) => !r.authRequired);
  const withIssues = routes.filter((r) => r.issues.length > 0);

  const result = {
    root: relative(process.cwd(), target),
    totalRoutes: routes.length,
    protectedRoutes: routes.filter((r) => r.authRequired).length,
    unprotectedRoutes: unprotected.length,
    routesWithIssues: withIssues.length,
    routes,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# Permission Matrix\n");
  console.log(`Total routes: ${routes.length}`);
  console.log(`Protected: ${result.protectedRoutes}`);
  console.log(`Unprotected: ${result.unprotectedRoutes}`);
  console.log(`Routes with issues: ${result.routesWithIssues}\n`);

  if (routes.length === 0) {
    console.log("No routes detected. Supported: Hono, Express, Fastify, NestJS, Astro, SvelteKit, Remix file-based routing.");
    return;
  }

  // Matrix table
  console.log("## Route Matrix\n");
  console.log("  | Method | Path | Auth | Type | Roles | File |");
  console.log("  | --- | --- | --- | --- | --- | --- |");
  for (const r of routes) {
    const auth = r.authRequired ? "Yes" : "NO";
    const roles = r.roles.length > 0 ? r.roles.join(", ") : "-";
    console.log(
      `  | ${r.method} | ${r.path} | ${auth} | ${r.authType} | ${roles} | ${r.file}:${r.line} |`
    );
  }

  // Issues
  if (withIssues.length > 0) {
    console.log("\n## Issues\n");
    for (const r of withIssues) {
      console.log(`  ${r.method} ${r.path} (${r.file}:${r.line})`);
      for (const issue of r.issues) {
        console.log(`    - ${issue}`);
      }
    }
  }

  // Unprotected routes
  if (unprotected.length > 0) {
    console.log("\n## Unprotected Routes\n");
    console.log("  Verify these routes should be publicly accessible:\n");
    for (const r of unprotected) {
      console.log(`  ${r.method} ${r.path} (${r.file}:${r.line})`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
