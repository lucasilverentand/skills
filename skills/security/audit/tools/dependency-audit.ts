const args = Bun.argv.slice(2);

const HELP = `
dependency-audit — Check dependencies for known CVEs

Usage:
  bun run tools/dependency-audit.ts [directory] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Reads package.json and checks each dependency against the OSV
(Open Source Vulnerabilities) database for known security advisories.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

interface Advisory {
  id: string;
  summary: string;
  severity: string;
  affectedVersions: string;
  fixedVersion: string;
  url: string;
}

interface DependencyResult {
  name: string;
  version: string;
  isDev: boolean;
  advisories: Advisory[];
}

async function checkOSV(
  packageName: string,
  version: string
): Promise<Advisory[]> {
  try {
    const res = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: { name: packageName, ecosystem: "npm" },
        version,
      }),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as any;
    const vulns = data.vulns ?? [];

    return vulns.map((v: any) => {
      const severity =
        v.database_specific?.severity ??
        v.severity?.[0]?.type ??
        "UNKNOWN";

      const affected = v.affected?.[0];
      const ranges = affected?.ranges?.[0];
      const fixedEvent = ranges?.events?.find((e: any) => e.fixed);

      return {
        id: v.id ?? "",
        summary: v.summary ?? "",
        severity: typeof severity === "string" ? severity : severity.toString(),
        affectedVersions:
          affected?.versions?.slice(0, 5).join(", ") ?? "see advisory",
        fixedVersion: fixedEvent?.fixed ?? "no fix available",
        url: `https://osv.dev/vulnerability/${v.id}`,
      };
    });
  } catch {
    return [];
  }
}

function cleanVersion(version: string): string {
  // Remove semver prefixes like ^ ~
  return version.replace(/^[^0-9]*/, "");
}

async function main() {
  const dir = resolve(filteredArgs[0] ?? ".");
  let pkgJson: any;

  try {
    pkgJson = JSON.parse(await readFile(join(dir, "package.json"), "utf-8"));
  } catch {
    console.error("Error: could not read package.json");
    process.exit(1);
  }

  const deps = Object.entries(pkgJson.dependencies ?? {}) as [string, string][];
  const devDeps = Object.entries(pkgJson.devDependencies ?? {}) as [string, string][];

  const results: DependencyResult[] = [];
  const allDeps = [
    ...deps.map(([name, version]) => ({ name, version: cleanVersion(version), isDev: false })),
    ...devDeps.map(([name, version]) => ({ name, version: cleanVersion(version), isDev: true })),
  ];

  // Check in batches to avoid overwhelming the API
  const BATCH_SIZE = 5;
  for (let i = 0; i < allDeps.length; i += BATCH_SIZE) {
    const batch = allDeps.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (dep) => {
        const advisories = await checkOSV(dep.name, dep.version);
        return { ...dep, advisories };
      })
    );
    results.push(...batchResults);
  }

  const vulnerable = results.filter((r) => r.advisories.length > 0);
  const totalAdvisories = vulnerable.reduce(
    (sum, r) => sum + r.advisories.length,
    0
  );

  // Categorize by severity
  const allAdvisories = vulnerable.flatMap((r) =>
    r.advisories.map((a) => ({ ...a, package: r.name }))
  );
  const critical = allAdvisories.filter((a) =>
    a.severity.toLowerCase().includes("critical")
  );
  const high = allAdvisories.filter((a) =>
    a.severity.toLowerCase().includes("high")
  );
  const medium = allAdvisories.filter((a) =>
    a.severity.toLowerCase().includes("moderate") ||
    a.severity.toLowerCase().includes("medium")
  );

  const result = {
    root: dir,
    totalDependencies: allDeps.length,
    vulnerableDependencies: vulnerable.length,
    totalAdvisories,
    summary: {
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      other: totalAdvisories - critical.length - high.length - medium.length,
    },
    vulnerable,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# Dependency Audit Report\n");
  console.log(`Dependencies checked: ${allDeps.length}`);
  console.log(`Vulnerable: ${vulnerable.length}`);
  console.log(`Total advisories: ${totalAdvisories}\n`);

  if (vulnerable.length === 0) {
    console.log("No known vulnerabilities found in dependencies.");
    return;
  }

  console.log("## Summary\n");
  console.log(`  Critical: ${result.summary.critical}`);
  console.log(`  High: ${result.summary.high}`);
  console.log(`  Medium: ${result.summary.medium}`);
  console.log(`  Other: ${result.summary.other}\n`);

  console.log("## Vulnerable Dependencies\n");
  for (const dep of vulnerable) {
    const tag = dep.isDev ? "(dev)" : "(prod)";
    console.log(`### ${dep.name}@${dep.version} ${tag}\n`);
    for (const adv of dep.advisories) {
      console.log(`  - ${adv.id} [${adv.severity}]`);
      console.log(`    ${adv.summary}`);
      console.log(`    Fixed in: ${adv.fixedVersion}`);
      console.log(`    ${adv.url}`);
      console.log();
    }
  }

  console.log("## Recommendations\n");
  if (critical.length > 0 || high.length > 0) {
    console.log("  URGENT: Update critical and high severity dependencies before shipping.");
  }
  console.log("  Run `bun update` to update to latest compatible versions.");
  console.log("  For major version updates, check changelogs for breaking changes.");
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
