const args = Bun.argv.slice(2);

const HELP = `
db-connection-check — Verify database connectivity and report connection pool usage

Usage:
  bun run tools/db-connection-check.ts [database-url] [options]

Arguments:
  [database-url]  Database URL to test. If not provided, reads DATABASE_URL from environment.

Options:
  --timeout <ms>  Connection timeout in milliseconds (default: 5000)
  --json          Output as JSON instead of plain text
  --help          Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const timeoutIdx = args.indexOf("--timeout");
const timeout = timeoutIdx !== -1 && args[timeoutIdx + 1] ? parseInt(args[timeoutIdx + 1], 10) : 5000;
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(timeoutIdx !== -1 && args[timeoutIdx + 1] === a));

interface ConnectionResult {
  url: string;
  reachable: boolean;
  latencyMs: number;
  dbType: string;
  version?: string;
  poolStats?: {
    maxConnections: number;
    activeConnections: number;
    idleConnections: number;
  };
  error?: string;
}

async function run(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return url.replace(/:([^@]+)@/, ":***@");
  }
}

function parseDbType(url: string): string {
  if (url.startsWith("postgres")) return "postgresql";
  if (url.startsWith("mysql")) return "mysql";
  if (url.startsWith("mongodb")) return "mongodb";
  if (url.startsWith("redis")) return "redis";
  return "unknown";
}

async function checkPostgres(url: string): Promise<ConnectionResult> {
  const start = Date.now();
  const redacted = redactUrl(url);

  // Try connecting with psql
  const result = await run(["psql", url, "-c", "SELECT version(); SELECT count(*) as active FROM pg_stat_activity WHERE state = 'active'; SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections';", "--no-psqlrc", "-t", "-A"]);

  const latency = Date.now() - start;

  if (result.exitCode !== 0) {
    return { url: redacted, reachable: false, latencyMs: latency, dbType: "postgresql", error: result.stderr.slice(0, 200) };
  }

  const lines = result.stdout.split("\n").filter(Boolean);
  const version = lines[0] || "";
  const active = parseInt(lines[1], 10) || 0;
  const maxConn = parseInt(lines[2], 10) || 0;

  return {
    url: redacted,
    reachable: true,
    latencyMs: latency,
    dbType: "postgresql",
    version: version.split(",")[0],
    poolStats: maxConn > 0 ? {
      maxConnections: maxConn,
      activeConnections: active,
      idleConnections: maxConn - active,
    } : undefined,
  };
}

async function checkRedis(url: string): Promise<ConnectionResult> {
  const start = Date.now();
  const redacted = redactUrl(url);

  const result = await run(["redis-cli", "-u", url, "PING"]);
  const latency = Date.now() - start;

  if (result.exitCode !== 0 || !result.stdout.includes("PONG")) {
    return { url: redacted, reachable: false, latencyMs: latency, dbType: "redis", error: result.stderr || "No PONG response" };
  }

  // Get info
  const infoResult = await run(["redis-cli", "-u", url, "INFO", "clients"]);
  let active = 0, maxClients = 0;
  if (infoResult.exitCode === 0) {
    const connMatch = infoResult.stdout.match(/connected_clients:(\d+)/);
    const maxMatch = infoResult.stdout.match(/maxclients:(\d+)/);
    active = connMatch ? parseInt(connMatch[1], 10) : 0;
    maxClients = maxMatch ? parseInt(maxMatch[1], 10) : 0;
  }

  return {
    url: redacted,
    reachable: true,
    latencyMs: latency,
    dbType: "redis",
    poolStats: maxClients > 0 ? {
      maxConnections: maxClients,
      activeConnections: active,
      idleConnections: maxClients - active,
    } : undefined,
  };
}

async function checkGeneric(url: string): Promise<ConnectionResult> {
  const redacted = redactUrl(url);
  const dbType = parseDbType(url);

  // Try a TCP connection to the host/port
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = parseInt(parsed.port, 10) || (dbType === "postgresql" ? 5432 : dbType === "mysql" ? 3306 : dbType === "mongodb" ? 27017 : 6379);

    const start = Date.now();
    const result = await run(["nc", "-z", "-w", String(Math.ceil(timeout / 1000)), host, String(port)]);
    const latency = Date.now() - start;

    return {
      url: redacted,
      reachable: result.exitCode === 0,
      latencyMs: latency,
      dbType,
      error: result.exitCode !== 0 ? `TCP connection to ${host}:${port} failed` : undefined,
    };
  } catch (e: any) {
    return { url: redacted, reachable: false, latencyMs: 0, dbType, error: e.message };
  }
}

async function main() {
  const dbUrl = filteredArgs[0] || process.env.DATABASE_URL || "";
  if (!dbUrl) {
    console.error("Error: no database URL provided and DATABASE_URL not set");
    console.error("Usage: bun run tools/db-connection-check.ts <database-url>");
    process.exit(1);
  }

  const dbType = parseDbType(dbUrl);
  let result: ConnectionResult;

  if (dbType === "postgresql") {
    result = await checkPostgres(dbUrl);
  } else if (dbType === "redis") {
    result = await checkRedis(dbUrl);
  } else {
    result = await checkGeneric(dbUrl);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const status = result.reachable ? "OK" : "FAIL";
    console.log(`Database connection check: [${status}]\n`);
    console.log(`  URL: ${result.url}`);
    console.log(`  Type: ${result.dbType}`);
    console.log(`  Latency: ${result.latencyMs}ms`);

    if (result.version) {
      console.log(`  Version: ${result.version}`);
    }

    if (result.poolStats) {
      console.log(`\n  Connection pool:`);
      console.log(`    Max: ${result.poolStats.maxConnections}`);
      console.log(`    Active: ${result.poolStats.activeConnections}`);
      console.log(`    Idle: ${result.poolStats.idleConnections}`);

      const usage = result.poolStats.activeConnections / result.poolStats.maxConnections;
      if (usage > 0.8) {
        console.log(`\n  WARNING: Connection pool is ${Math.round(usage * 100)}% utilized.`);
      }
    }

    if (result.error) {
      console.log(`\n  Error: ${result.error}`);
    }
  }

  if (!result.reachable) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
