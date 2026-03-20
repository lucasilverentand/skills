const args = Bun.argv.slice(2);

const HELP = `
sdk-size-audit — Check npm package size, dependencies, and maintenance health

Usage:
  bun run tools/sdk-size-audit.ts <package-name> [package-name2...] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Queries the npm registry for package metadata including size estimates,
dependency counts, last publish date, and TypeScript support.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const packages = args.filter((a) => !a.startsWith("--"));

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  license: string;
  lastPublish: string;
  daysSincePublish: number;
  directDeps: number;
  dependencyNames: string[];
  unpackedSize: string;
  hasTypes: boolean;
  typesSource: string;
  weeklyDownloads: number | null;
  maintainerCount: number;
  repository: string;
  error?: string;
}

async function getPackageInfo(name: string): Promise<PackageInfo> {
  // Fetch package metadata from npm registry
  const regRes = await fetch(`https://registry.npmjs.org/${name}`);
  if (!regRes.ok) {
    throw new Error(`Package "${name}" not found on npm (${regRes.status})`);
  }
  const data = await regRes.json();
  const latest = data["dist-tags"]?.latest;
  if (!latest) throw new Error(`No latest version for ${name}`);

  const versionData = data.versions?.[latest];
  if (!versionData) throw new Error(`No version data for ${name}@${latest}`);

  // Dependencies
  const deps = versionData.dependencies ?? {};
  const depNames = Object.keys(deps);

  // Size
  const unpackedSize = versionData.dist?.unpackedSize;
  const sizeStr = unpackedSize ? formatBytes(unpackedSize) : "unknown";

  // Last publish
  const publishTime = data.time?.[latest] ?? "";
  const publishDate = publishTime ? new Date(publishTime) : null;
  const daysSince = publishDate
    ? Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24))
    : -1;

  // TypeScript types
  let hasTypes = false;
  let typesSource = "none";
  if (versionData.types || versionData.typings) {
    hasTypes = true;
    typesSource = "bundled";
  } else {
    // Check for @types package
    const typesRes = await fetch(
      `https://registry.npmjs.org/@types/${name.replace("@", "").replace("/", "__")}`
    );
    if (typesRes.ok) {
      hasTypes = true;
      typesSource = "@types (DefinitelyTyped)";
    }
  }

  // Weekly downloads
  let weeklyDownloads: number | null = null;
  try {
    const dlRes = await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${name}`
    );
    if (dlRes.ok) {
      const dlData = await dlRes.json();
      weeklyDownloads = dlData.downloads ?? null;
    }
  } catch {
    // Downloads API may fail; non-critical
  }

  // Maintainers
  const maintainerCount = (data.maintainers ?? []).length;

  // Repository
  const repo = data.repository?.url ?? "";
  const cleanRepo = repo.replace(/^git\+/, "").replace(/\.git$/, "");

  return {
    name,
    version: latest,
    description: versionData.description ?? "",
    license: versionData.license ?? "unknown",
    lastPublish: publishDate?.toISOString().split("T")[0] ?? "unknown",
    daysSincePublish: daysSince,
    directDeps: depNames.length,
    dependencyNames: depNames,
    unpackedSize: sizeStr,
    hasTypes,
    typesSource,
    weeklyDownloads,
    maintainerCount,
    repository: cleanRepo,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDownloads(n: number | null): string {
  if (n === null) return "unknown";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

async function main() {
  if (packages.length === 0) {
    console.error("Error: provide at least one package name");
    process.exit(1);
  }

  const results: PackageInfo[] = [];
  for (const pkg of packages) {
    try {
      const info = await getPackageInfo(pkg);
      results.push(info);
    } catch (err: any) {
      results.push({
        name: pkg,
        error: err.message,
      } as PackageInfo);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Human-readable output
  console.log("# SDK Size Audit\n");

  for (const pkg of results) {
    if (pkg.error) {
      console.log(`## ${pkg.name}\n`);
      console.log(`  Error: ${pkg.error}\n`);
      continue;
    }

    console.log(`## ${pkg.name}@${pkg.version}\n`);
    console.log(`  ${pkg.description}\n`);
    console.log(`  | Property | Value |`);
    console.log(`  | --- | --- |`);
    console.log(`  | Unpacked size | ${pkg.unpackedSize} |`);
    console.log(`  | Direct dependencies | ${pkg.directDeps} |`);
    console.log(`  | License | ${pkg.license} |`);
    console.log(`  | TypeScript | ${pkg.hasTypes ? `Yes (${pkg.typesSource})` : "No"} |`);
    console.log(`  | Last published | ${pkg.lastPublish} (${pkg.daysSincePublish}d ago) |`);
    console.log(`  | Weekly downloads | ${formatDownloads(pkg.weeklyDownloads)} |`);
    console.log(`  | Maintainers | ${pkg.maintainerCount} |`);
    if (pkg.repository) {
      console.log(`  | Repository | ${pkg.repository} |`);
    }

    if (pkg.dependencyNames.length > 0) {
      console.log(`\n  Dependencies: ${pkg.dependencyNames.join(", ")}`);
    }

    // Health signals
    const warnings: string[] = [];
    if (pkg.daysSincePublish > 365) {
      warnings.push(`Last publish was ${pkg.daysSincePublish} days ago (>1 year)`);
    }
    if (pkg.maintainerCount <= 1) {
      warnings.push("Single maintainer — bus factor risk");
    }
    if (pkg.directDeps > 20) {
      warnings.push(`High dependency count (${pkg.directDeps})`);
    }
    if (!pkg.hasTypes) {
      warnings.push("No TypeScript types available");
    }

    if (warnings.length > 0) {
      console.log(`\n  Warnings:`);
      for (const w of warnings) {
        console.log(`  - ${w}`);
      }
    }
    console.log();
  }

  // Comparison table if multiple packages
  if (results.filter((r) => !r.error).length > 1) {
    const valid = results.filter((r) => !r.error);
    console.log("## Comparison\n");
    console.log(
      `| | ${valid.map((p) => p.name).join(" | ")} |`
    );
    console.log(
      `| --- | ${valid.map(() => "---").join(" | ")} |`
    );
    console.log(
      `| Size | ${valid.map((p) => p.unpackedSize).join(" | ")} |`
    );
    console.log(
      `| Deps | ${valid.map((p) => p.directDeps).join(" | ")} |`
    );
    console.log(
      `| Types | ${valid.map((p) => (p.hasTypes ? "Yes" : "No")).join(" | ")} |`
    );
    console.log(
      `| Downloads/wk | ${valid.map((p) => formatDownloads(p.weeklyDownloads)).join(" | ")} |`
    );
    console.log(
      `| Maintainers | ${valid.map((p) => p.maintainerCount).join(" | ")} |`
    );
    console.log(
      `| Last publish | ${valid.map((p) => p.lastPublish).join(" | ")} |`
    );
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
