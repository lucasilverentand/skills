const args = Bun.argv.slice(2);

const HELP = `
query-explain — Run EXPLAIN on SQL queries and flag slow patterns

Usage:
  bun run tools/query-explain.ts <query-or-file> [options]

Options:
  --db <path>       Path to SQLite database file (default: local.db)
  --connection-string <url>  Postgres connection string
  --json            Output as JSON instead of plain text
  --help            Show this help message

Accepts either a raw SQL query string or a .sql file path.
Runs EXPLAIN QUERY PLAN (SQLite) or EXPLAIN ANALYZE (Postgres) and flags:
- Sequential scans on large tables
- Missing index usage
- Temporary B-tree sorts
- Full table scans
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const dbPath = getFlag("--db") ?? "local.db";
const connectionString = getFlag("--connection-string");
const filteredArgs = args.filter((a) => !a.startsWith("--") && a !== getFlag("--db") && a !== getFlag("--connection-string"));

interface ExplainWarning {
  severity: "error" | "warning";
  rule: string;
  message: string;
  detail: string;
}

function analyzeSqlitePlan(planOutput: string): ExplainWarning[] {
  const warnings: ExplainWarning[] = [];
  const lines = planOutput.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Sequential scan
    if (/SCAN\s+\w+/i.test(line) && !/USING\s+(INDEX|COVERING\s+INDEX)/i.test(line)) {
      warnings.push({
        severity: "warning",
        rule: "sequential-scan",
        message: "Sequential scan detected — consider adding an index",
        detail: line,
      });
    }

    // Temporary B-tree (sort without index)
    if (/USE TEMP B-TREE/i.test(line)) {
      warnings.push({
        severity: "warning",
        rule: "temp-btree-sort",
        message: "Temporary B-tree for sorting — consider an index matching the ORDER BY",
        detail: line,
      });
    }

    // Automatic index (SQLite creating a temp index)
    if (/AUTOMATIC\s+(COVERING\s+)?INDEX/i.test(line)) {
      warnings.push({
        severity: "warning",
        rule: "automatic-index",
        message: "SQLite is auto-creating a temporary index — add a permanent one",
        detail: line,
      });
    }
  }

  return warnings;
}

function analyzePostgresPlan(planOutput: string): ExplainWarning[] {
  const warnings: ExplainWarning[] = [];
  const lines = planOutput.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Sequential scan
    if (/Seq Scan/i.test(line)) {
      const costMatch = line.match(/cost=[\d.]+\.\.([\d.]+)/);
      const cost = costMatch ? parseFloat(costMatch[1]) : 0;
      if (cost > 100) {
        warnings.push({
          severity: "warning",
          rule: "sequential-scan",
          message: `Sequential scan with high cost (${cost}) — consider adding an index`,
          detail: line,
        });
      }
    }

    // Sort in memory
    if (/Sort\s+Method:\s+external/i.test(line)) {
      warnings.push({
        severity: "warning",
        rule: "external-sort",
        message: "External sort detected (disk-based) — query may need an index or more work_mem",
        detail: line,
      });
    }

    // Nested loop with high rows
    if (/Nested Loop/i.test(line)) {
      const rowsMatch = line.match(/rows=(\d+)/);
      const rows = rowsMatch ? parseInt(rowsMatch[1]) : 0;
      if (rows > 10000) {
        warnings.push({
          severity: "warning",
          rule: "expensive-nested-loop",
          message: `Nested loop touching ${rows} rows — consider restructuring the query`,
          detail: line,
        });
      }
    }
  }

  return warnings;
}

async function getQuery(input: string): Promise<string> {
  if (input.endsWith(".sql")) {
    const file = Bun.file(input);
    if (!(await file.exists())) {
      console.error(`Error: file not found: ${input}`);
      process.exit(1);
    }
    return (await file.text()).trim();
  }
  return input;
}

async function explainSqlite(query: string): Promise<{ plan: string; warnings: ExplainWarning[] }> {
  const { Database } = await import("bun:sqlite");
  const db = new Database(dbPath, { readonly: true });

  try {
    const rows = db.prepare(`EXPLAIN QUERY PLAN ${query}`).all() as Array<Record<string, unknown>>;
    const plan = rows.map((r) => `${r.id}|${r.parent}|${r.notused}|${r.detail}`).join("\n");
    const warnings = analyzeSqlitePlan(plan);
    return { plan, warnings };
  } finally {
    db.close();
  }
}

async function explainPostgres(query: string): Promise<{ plan: string; warnings: ExplainWarning[] }> {
  // Use the pg module or bun:sql if available
  const proc = Bun.spawn(
    ["psql", connectionString!, "-c", `EXPLAIN ANALYZE ${query}`, "--no-psqlrc", "-t"],
    { stdout: "pipe", stderr: "pipe" }
  );

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error(`psql error: ${stderr}`);
    process.exit(1);
  }

  const warnings = analyzePostgresPlan(stdout);
  return { plan: stdout.trim(), warnings };
}

async function main() {
  const input = filteredArgs[0];
  if (!input) {
    console.error("Error: provide a SQL query or .sql file path");
    process.exit(1);
  }

  const query = await getQuery(input);
  const isPostgres = !!connectionString;
  const { plan, warnings } = isPostgres
    ? await explainPostgres(query)
    : await explainSqlite(query);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          engine: isPostgres ? "postgres" : "sqlite",
          query,
          plan,
          warnings,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Engine: ${isPostgres ? "Postgres" : "SQLite"}\n`);
    console.log("Query:");
    console.log(`  ${query}\n`);
    console.log("Plan:");
    for (const line of plan.split("\n")) {
      console.log(`  ${line}`);
    }
    console.log();

    if (warnings.length === 0) {
      console.log("No performance issues detected.");
    } else {
      console.log(`${warnings.length} issue(s) found:\n`);
      for (const w of warnings) {
        const icon = w.severity === "error" ? "ERROR" : "WARN";
        console.log(`[${icon}] ${w.rule}`);
        console.log(`  ${w.message}`);
        console.log(`  ${w.detail}\n`);
      }
    }
  }

  if (warnings.some((w) => w.severity === "error")) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
