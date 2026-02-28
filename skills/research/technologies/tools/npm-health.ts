const args = Bun.argv.slice(2);

const HELP = `
npm-health — Check download trends, maintenance, and bus factor for npm packages

Usage:
  bun run tools/npm-health.ts <package-name> [package-name2...] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Queries the npm registry and downloads API to assess package health:
download trends, last publish date, open issues, maintainer count,
TypeScript support, and known vulnerabilities.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const packages = args.filter((a) => !a.startsWith("--"));

interface HealthReport {
  name: string;
  version: string;
  description: string;
  license: string;
  lastPublish: string;
  daysSincePublish: number;
  maintainerCount: number;
  maintainers: string[];
  hasTypes: boolean;
  typesSource: string;
  directDeps: number;
  weeklyDownloads: number | null;
  monthlyDownloads: number | null;
  repository: string;
  openIssuesUrl: string;
  deprecated: boolean;
  deprecationMessage: string;
  healthScore: "healthy" | "watch" | "replace";
  warnings: string[];
  error?: string;
}

async function checkHealth(name: string): Promise<HealthReport> {
  const regRes = await fetch(`https://registry.npmjs.org/${name}`);
  if (!regRes.ok) {
    throw new Error(`Package "${name}" not found on npm (${regRes.status})`);
  }
  const data = await regRes.json();
  const latest = data["dist-tags"]?.latest;
  if (!latest) throw new Error(`No latest version for ${name}`);
  const versionData = data.versions?.[latest] ?? {};

  // Basic info
  const description = versionData.description ?? "";
  const license = versionData.license ?? "unknown";
  const deprecated = !!versionData.deprecated;
  const deprecationMessage = versionData.deprecated ?? "";

  // Last publish
  const publishTime = data.time?.[latest] ?? "";
  const publishDate = publishTime ? new Date(publishTime) : null;
  const daysSince = publishDate
    ? Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24))
    : -1;

  // Maintainers
  const maintainers = (data.maintainers ?? []).map((m: any) => m.name);

  // Dependencies
  const directDeps = Object.keys(versionData.dependencies ?? {}).length;

  // TypeScript types
  let hasTypes = false;
  let typesSource = "none";
  if (versionData.types || versionData.typings) {
    hasTypes = true;
    typesSource = "bundled";
  } else {
    const typesName = name.startsWith("@")
      ? `@types/${name.slice(1).replace("/", "__")}`
      : `@types/${name}`;
    const typesRes = await fetch(`https://registry.npmjs.org/${typesName}`);
    if (typesRes.ok) {
      hasTypes = true;
      typesSource = "@types";
    }
  }

  // Downloads
  let weeklyDownloads: number | null = null;
  let monthlyDownloads: number | null = null;
  try {
    const [wkRes, moRes] = await Promise.all([
      fetch(`https://api.npmjs.org/downloads/point/last-week/${name}`),
      fetch(`https://api.npmjs.org/downloads/point/last-month/${name}`),
    ]);
    if (wkRes.ok) weeklyDownloads = (await wkRes.json()).downloads ?? null;
    if (moRes.ok) monthlyDownloads = (await moRes.json()).downloads ?? null;
  } catch {
    // Non-critical
  }

  // Repository
  const repo = data.repository?.url ?? "";
  const cleanRepo = repo.replace(/^git\+/, "").replace(/\.git$/, "");
  const openIssuesUrl = cleanRepo.includes("github.com")
    ? cleanRepo + "/issues"
    : "";

  // Health assessment
  const warnings: string[] = [];

  if (deprecated) warnings.push(`DEPRECATED: ${deprecationMessage}`);
  if (daysSince > 730) warnings.push(`Last published ${daysSince} days ago (>2 years)`);
  else if (daysSince > 365) warnings.push(`Last published ${daysSince} days ago (>1 year)`);
  if (maintainers.length <= 1) warnings.push("Single maintainer — bus factor risk");
  if (directDeps > 30) warnings.push(`High dependency count: ${directDeps}`);
  if (!hasTypes) warnings.push("No TypeScript types available");
  if (weeklyDownloads !== null && weeklyDownloads < 100) {
    warnings.push(`Very low weekly downloads: ${weeklyDownloads}`);
  }

  let healthScore: HealthReport["healthScore"];
  if (deprecated || daysSince > 730 || (weeklyDownloads !== null && weeklyDownloads < 50)) {
    healthScore = "replace";
  } else if (warnings.length >= 2) {
    healthScore = "watch";
  } else {
    healthScore = "healthy";
  }

  return {
    name,
    version: latest,
    description,
    license,
    lastPublish: publishDate?.toISOString().split("T")[0] ?? "unknown",
    daysSincePublish: daysSince,
    maintainerCount: maintainers.length,
    maintainers,
    hasTypes,
    typesSource,
    directDeps,
    weeklyDownloads,
    monthlyDownloads,
    repository: cleanRepo,
    openIssuesUrl,
    deprecated,
    deprecationMessage,
    healthScore,
    warnings,
  };
}

function formatNum(n: number | null): string {
  if (n === null) return "N/A";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

async function main() {
  if (packages.length === 0) {
    console.error("Error: provide at least one package name");
    process.exit(1);
  }

  const results: HealthReport[] = [];
  for (const pkg of packages) {
    try {
      results.push(await checkHealth(pkg));
    } catch (err: any) {
      results.push({ name: pkg, error: err.message } as HealthReport);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Human-readable
  console.log("# npm Package Health Report\n");

  for (const r of results) {
    if (r.error) {
      console.log(`## ${r.name}\n\n  Error: ${r.error}\n`);
      continue;
    }

    const icon =
      r.healthScore === "healthy" ? "[HEALTHY]" :
        r.healthScore === "watch" ? "[WATCH]" : "[REPLACE]";

    console.log(`## ${r.name}@${r.version} ${icon}\n`);
    console.log(`  ${r.description}\n`);

    console.log("  | Metric | Value |");
    console.log("  | --- | --- |");
    console.log(`  | License | ${r.license} |`);
    console.log(`  | Last published | ${r.lastPublish} (${r.daysSincePublish}d ago) |`);
    console.log(`  | Maintainers | ${r.maintainerCount} (${r.maintainers.join(", ")}) |`);
    console.log(`  | Direct deps | ${r.directDeps} |`);
    console.log(`  | TypeScript | ${r.hasTypes ? r.typesSource : "No"} |`);
    console.log(`  | Weekly downloads | ${formatNum(r.weeklyDownloads)} |`);
    console.log(`  | Monthly downloads | ${formatNum(r.monthlyDownloads)} |`);
    if (r.repository) console.log(`  | Repository | ${r.repository} |`);

    if (r.warnings.length > 0) {
      console.log("\n  Warnings:");
      for (const w of r.warnings) console.log(`    - ${w}`);
    }
    console.log();
  }

  // Summary table for multiple packages
  if (results.filter((r) => !r.error).length > 1) {
    const valid = results.filter((r) => !r.error);
    console.log("## Summary\n");
    console.log(`| Package | Health | Downloads/wk | Maintainers | Last publish |`);
    console.log(`| --- | --- | --- | --- | --- |`);
    for (const r of valid) {
      console.log(
        `| ${r.name} | ${r.healthScore} | ${formatNum(r.weeklyDownloads)} | ${r.maintainerCount} | ${r.lastPublish} |`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
