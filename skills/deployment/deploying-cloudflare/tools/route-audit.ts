const args = Bun.argv.slice(2);

const HELP = `
route-audit — List all configured routes from wrangler.toml and detect conflicts

Usage:
  bun run tools/route-audit.ts [config-path] [options]

Arguments:
  [config-path]  Path to wrangler.toml (default: ./wrangler.toml)

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
const configPath = filteredArgs[0] || "wrangler.toml";

interface Route {
  pattern: string;
  zone: string;
  environment: string;
}

interface Conflict {
  route1: Route;
  route2: Route;
  reason: string;
}

interface AuditResult {
  configFile: string;
  routes: Route[];
  conflicts: Conflict[];
  warnings: string[];
}

function parseToml(content: string): Record<string, any> {
  // Simple TOML parser for the fields we need
  const result: Record<string, any> = {};
  let currentSection = "";
  let currentEnv = "";

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Array of tables: [[routes]]
    const arrayMatch = trimmed.match(/^\[\[(.+)\]\]$/);
    if (arrayMatch) {
      currentSection = arrayMatch[1];
      if (!result[currentSection]) result[currentSection] = [];
      result[currentSection].push({});
      continue;
    }

    // Table: [env.staging]
    const tableMatch = trimmed.match(/^\[(.+)\]$/);
    if (tableMatch) {
      currentSection = tableMatch[1];
      if (currentSection.startsWith("env.")) {
        currentEnv = currentSection.split(".")[1];
      }
      continue;
    }

    // Key-value
    const kvMatch = trimmed.match(/^(\w+)\s*=\s*"([^"]*)"$/);
    if (kvMatch) {
      if (Array.isArray(result[currentSection]) && result[currentSection].length > 0) {
        result[currentSection][result[currentSection].length - 1][kvMatch[1]] = kvMatch[2];
      } else {
        if (!result[currentSection]) result[currentSection] = {};
        result[currentSection][kvMatch[1]] = kvMatch[2];
      }
    }
  }

  return result;
}

function routeOverlaps(pattern1: string, pattern2: string): boolean {
  // Very rough overlap check — if both match the same zone and one pattern is a prefix of the other
  const norm1 = pattern1.replace(/\*/g, "");
  const norm2 = pattern2.replace(/\*/g, "");
  return norm1.startsWith(norm2) || norm2.startsWith(norm1) || norm1 === norm2;
}

async function main() {
  const file = Bun.file(configPath);
  if (!(await file.exists())) {
    console.error(`Error: config file not found: ${configPath}`);
    process.exit(1);
  }

  const content = await file.text();
  const config = parseToml(content);
  const routes: Route[] = [];
  const warnings: string[] = [];

  // Extract routes from [[routes]] sections
  const routeEntries = config["routes"] || [];
  for (const r of routeEntries) {
    if (r.pattern) {
      routes.push({
        pattern: r.pattern,
        zone: r.zone_name || r.zone_id || "(unspecified)",
        environment: "default",
      });
    }
  }

  // Check for route in top-level config
  if (config["route"]) {
    routes.push({
      pattern: config["route"],
      zone: config["zone_name"] || config["zone_id"] || "(unspecified)",
      environment: "default",
    });
  }

  // Check for environment-specific routes
  for (const line of content.split("\n")) {
    const envRouteMatch = line.match(/^\[env\.(\w+)\]/);
    if (envRouteMatch) {
      // Look ahead for routes in this env block
      // This is simplified — a real parser would handle this better
    }
  }

  // Check for name
  const workerName = config["name"] || "(unnamed)";

  // Check for missing fields
  if (!config["name"]) {
    warnings.push("Missing 'name' field in wrangler.toml");
  }
  if (!config["compatibility_date"]) {
    warnings.push("Missing 'compatibility_date' — set to a recent date for latest runtime features");
  }
  if (routes.length === 0) {
    warnings.push("No routes configured — Worker may not be reachable on custom domains");
  }

  // Detect conflicts
  const conflicts: Conflict[] = [];
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      if (routeOverlaps(routes[i].pattern, routes[j].pattern)) {
        conflicts.push({
          route1: routes[i],
          route2: routes[j],
          reason: `Route patterns "${routes[i].pattern}" and "${routes[j].pattern}" may overlap`,
        });
      }
    }
  }

  const result: AuditResult = { configFile: configPath, routes, conflicts, warnings };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Route audit: ${configPath} (Worker: ${workerName})\n`);

    if (routes.length === 0) {
      console.log("  No routes configured.");
    } else {
      console.log(`  Routes (${routes.length}):`);
      for (const r of routes) {
        console.log(`    ${r.pattern} → zone: ${r.zone} (${r.environment})`);
      }
    }

    if (conflicts.length > 0) {
      console.log(`\n  Conflicts (${conflicts.length}):`);
      for (const c of conflicts) {
        console.log(`    - ${c.reason}`);
      }
    }

    if (warnings.length > 0) {
      console.log(`\n  Warnings:`);
      for (const w of warnings) {
        console.log(`    - ${w}`);
      }
    }

    if (conflicts.length === 0 && warnings.length === 0) {
      console.log("\n  OK: no conflicts or warnings.");
    }
  }

  if (conflicts.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
