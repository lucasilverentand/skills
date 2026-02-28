const args = Bun.argv.slice(2);

const HELP = `
adr-stale — Find ADRs that reference changed or deleted code paths

Usage:
  bun run tools/adr-stale.ts [options]

Options:
  --dir <path>    ADR directory (default: docs/decisions)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Reads all ADRs, extracts file paths from "Affected code" sections, and checks
whether those files still exist and when they were last modified. Flags ADRs
whose referenced files have been deleted or significantly changed.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dirIdx = args.indexOf("--dir");
const adrDir = dirIdx !== -1 ? args[dirIdx + 1] : "docs/decisions";

interface AdrInfo {
  file: string;
  id: string;
  title: string;
  status: string;
  referencedPaths: string[];
}

interface StaleReport {
  adr: string;
  id: string;
  title: string;
  status: string;
  issues: Array<{
    path: string;
    issue: "deleted" | "modified-since-adr";
    detail: string;
  }>;
}

async function parseAdr(filePath: string): Promise<AdrInfo | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  const content = await file.text();
  const lines = content.split("\n");

  // Extract title
  const titleMatch = content.match(/^#\s+ADR-(\d+):\s*(.+)/m);
  const id = titleMatch ? titleMatch[1] : "???";
  const title = titleMatch ? titleMatch[2].trim() : "Unknown";

  // Extract status
  const statusMatch = content.match(/^##\s+Status\s*\n+\s*(\w+)/m);
  const status = statusMatch ? statusMatch[1] : "Unknown";

  // Extract referenced paths from "Affected code" section
  const paths: string[] = [];
  let inAffectedCode = false;

  for (const line of lines) {
    if (/^##\s+Affected\s+code/i.test(line)) {
      inAffectedCode = true;
      continue;
    }
    if (inAffectedCode && /^##\s+/.test(line)) {
      inAffectedCode = false;
      continue;
    }
    if (inAffectedCode) {
      // Extract file paths from list items or inline code
      const pathMatch = line.match(/[-*]\s+`?([^\s`]+\.\w+)`?/);
      if (pathMatch) {
        paths.push(pathMatch[1]);
      }
      // Also match bare paths
      const barePath = line.match(/[-*]\s+([\w/.]+\.\w+)/);
      if (barePath && !pathMatch) {
        paths.push(barePath[1]);
      }
    }
  }

  return {
    file: filePath,
    id,
    title,
    status,
    referencedPaths: paths,
  };
}

async function checkStaleness(adr: AdrInfo): Promise<StaleReport | null> {
  const { existsSync, statSync } = await import("node:fs");
  const { resolve } = await import("node:path");

  const issues: StaleReport["issues"] = [];
  const adrStat = statSync(adr.file);
  const adrModified = adrStat.mtime;

  for (const refPath of adr.referencedPaths) {
    const resolvedPath = resolve(refPath);

    if (!existsSync(resolvedPath)) {
      issues.push({
        path: refPath,
        issue: "deleted",
        detail: "Referenced file no longer exists",
      });
    } else {
      const fileStat = statSync(resolvedPath);
      if (fileStat.mtime > adrModified) {
        const daysSinceAdr = Math.floor(
          (fileStat.mtime.getTime() - adrModified.getTime()) / (1000 * 60 * 60 * 24)
        );
        issues.push({
          path: refPath,
          issue: "modified-since-adr",
          detail: `File modified ${daysSinceAdr} days after ADR was last updated`,
        });
      }
    }
  }

  if (issues.length === 0) return null;

  return {
    adr: adr.file,
    id: adr.id,
    title: adr.title,
    status: adr.status,
    issues,
  };
}

async function main() {
  const { resolve } = await import("node:path");
  const { existsSync, readdirSync } = await import("node:fs");

  const resolvedDir = resolve(adrDir);

  if (!existsSync(resolvedDir)) {
    console.error(`ADR directory not found: ${resolvedDir}`);
    console.error("No ADRs to check. Create one with: bun run tools/adr-create.ts");
    process.exit(0);
  }

  const files = readdirSync(resolvedDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => resolve(resolvedDir, f));

  if (files.length === 0) {
    console.log("No ADR files found.");
    process.exit(0);
  }

  const staleReports: StaleReport[] = [];
  let totalAdrs = 0;
  let adrsWithPaths = 0;

  for (const file of files) {
    const adr = await parseAdr(file);
    if (!adr) continue;
    totalAdrs++;

    if (adr.referencedPaths.length > 0) {
      adrsWithPaths++;
      const report = await checkStaleness(adr);
      if (report) staleReports.push(report);
    }
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          totalAdrs,
          adrsWithPaths,
          staleAdrs: staleReports.length,
          reports: staleReports,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `ADR Staleness: ${totalAdrs} ADRs, ${adrsWithPaths} with path references, ${staleReports.length} potentially stale\n`
    );

    if (staleReports.length === 0) {
      console.log("All ADRs are up to date.");
    } else {
      for (const report of staleReports) {
        console.log(
          `ADR-${report.id}: ${report.title} [${report.status}]`
        );
        console.log(`  file: ${report.adr}`);
        for (const issue of report.issues) {
          const icon = issue.issue === "deleted" ? "DELETED" : "MODIFIED";
          console.log(`  [${icon}] ${issue.path} — ${issue.detail}`);
        }
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
