const args = Bun.argv.slice(2);

const HELP = `
service-graph — Map internal service dependencies and exposed ports from railway.json and project config

Usage:
  bun run tools/service-graph.ts [path] [options]

Arguments:
  [path]  Path to project root (default: current directory)

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
const projectPath = filteredArgs[0] || ".";

interface ServiceNode {
  name: string;
  type: "web" | "worker" | "cron" | "database" | "unknown";
  port?: number;
  startCommand?: string;
  dependsOn: string[];
  envReferences: string[];
}

interface ServiceGraph {
  services: ServiceNode[];
  edges: { from: string; to: string; via: string }[];
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function main() {
  const services: ServiceNode[] = [];
  const edges: { from: string; to: string; via: string }[] = [];

  // Read railway.json or railway.toml
  const railwayJsonFile = Bun.file(`${projectPath}/railway.json`);
  const railwayTomlFile = Bun.file(`${projectPath}/railway.toml`);

  let railwayConfig: any = {};
  if (await railwayJsonFile.exists()) {
    try {
      railwayConfig = JSON.parse(await railwayJsonFile.text());
    } catch { /* ignore parse errors */ }
  }

  // Detect service type from config
  const startCommand = railwayConfig.build?.startCommand || railwayConfig.deploy?.startCommand || "";
  const healthcheckPath = railwayConfig.deploy?.healthcheckPath;

  // Read package.json for script references
  const pkgJsonFile = Bun.file(`${projectPath}/package.json`);
  let pkgJson: any = {};
  if (await pkgJsonFile.exists()) {
    try {
      pkgJson = JSON.parse(await pkgJsonFile.text());
    } catch { /* ignore */ }
  }

  // Scan source files for DATABASE_URL and other service references
  const envReferences = new Set<string>();
  const servicePatterns: Record<string, string> = {
    DATABASE_URL: "database",
    REDIS_URL: "redis",
    REDIS_PRIVATE_URL: "redis",
    PGHOST: "database",
    MONGO_URL: "mongodb",
    MONGODB_URL: "mongodb",
  };

  // Scan .env.example or source code for environment variable references
  const envExampleFile = Bun.file(`${projectPath}/.env.example`);
  if (await envExampleFile.exists()) {
    const content = await envExampleFile.text();
    for (const line of content.split("\n")) {
      const [key] = line.split("=");
      if (key && key.trim() in servicePatterns) {
        envReferences.add(key.trim());
      }
    }
  }

  // Also scan common entry points
  for (const entry of ["src/index.ts", "src/server.ts", "src/app.ts", "index.ts", "server.ts"]) {
    const file = Bun.file(`${projectPath}/${entry}`);
    if (await file.exists()) {
      const content = await file.text();
      for (const [envKey] of Object.entries(servicePatterns)) {
        if (content.includes(envKey)) {
          envReferences.add(envKey);
        }
      }
    }
  }

  // Determine main service
  const mainServiceType = healthcheckPath ? "web" : (startCommand.includes("worker") ? "worker" : "web");
  const mainService: ServiceNode = {
    name: pkgJson.name || "main",
    type: mainServiceType,
    port: mainServiceType === "web" ? 3000 : undefined,
    startCommand: startCommand || pkgJson.scripts?.start || "bun run start",
    dependsOn: [],
    envReferences: [...envReferences],
  };
  services.push(mainService);

  // Add detected dependency services
  for (const envKey of envReferences) {
    const depType = servicePatterns[envKey];
    if (depType && !services.find((s) => s.type === depType)) {
      const depService: ServiceNode = {
        name: depType === "database" ? "postgres" : depType,
        type: "database",
        dependsOn: [],
        envReferences: [],
      };
      services.push(depService);
      edges.push({ from: mainService.name, to: depService.name, via: envKey });
      mainService.dependsOn.push(depService.name);
    }
  }

  // Check for worker scripts in package.json
  if (pkgJson.scripts) {
    for (const [name, cmd] of Object.entries(pkgJson.scripts)) {
      if ((name.includes("worker") || name.includes("queue") || name.includes("cron")) && name !== "start") {
        const workerService: ServiceNode = {
          name,
          type: name.includes("cron") ? "cron" : "worker",
          startCommand: cmd as string,
          dependsOn: [mainService.name],
          envReferences: [],
        };
        services.push(workerService);
        edges.push({ from: name, to: mainService.name, via: "shared environment" });
      }
    }
  }

  const graph: ServiceGraph = { services, edges };

  if (jsonOutput) {
    console.log(JSON.stringify(graph, null, 2));
  } else {
    console.log(`Service graph for ${projectPath}:\n`);

    for (const svc of services) {
      const typeLabel = svc.type.toUpperCase().padEnd(8);
      console.log(`  [${typeLabel}] ${svc.name}`);
      if (svc.port) console.log(`    Port: ${svc.port}`);
      if (svc.startCommand) console.log(`    Start: ${svc.startCommand}`);
      if (svc.dependsOn.length > 0) console.log(`    Depends on: ${svc.dependsOn.join(", ")}`);
      if (svc.envReferences.length > 0) console.log(`    Env refs: ${svc.envReferences.join(", ")}`);
      console.log();
    }

    if (edges.length > 0) {
      console.log("  Connections:");
      for (const e of edges) {
        console.log(`    ${e.from} → ${e.to} (via ${e.via})`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
