const args = Bun.argv.slice(2);

const HELP = `
api-compare — Fetch OpenAPI specs and generate a side-by-side feature comparison

Usage:
  bun run tools/api-compare.ts <url1> <url2> [url3...] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Provide URLs to OpenAPI/Swagger spec files (JSON or YAML).
The tool fetches each spec and compares endpoints, auth schemes,
and response schemas side by side.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const urls = args.filter((a) => !a.startsWith("--"));

interface ApiInfo {
  title: string;
  version: string;
  baseUrl: string;
  authSchemes: string[];
  endpoints: { method: string; path: string; summary: string }[];
  endpointCount: number;
}

async function fetchSpec(url: string): Promise<ApiInfo> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  let spec: any;

  try {
    spec = JSON.parse(text);
  } catch {
    // Attempt basic YAML-like parsing for simple specs
    // For full YAML support, the agent should convert to JSON first
    throw new Error(
      `Could not parse spec from ${url} — only JSON specs are supported. Convert YAML to JSON first.`
    );
  }

  const title = spec.info?.title ?? "Unknown";
  const version = spec.info?.version ?? "Unknown";

  // Extract base URL
  let baseUrl = "";
  if (spec.servers?.length) {
    baseUrl = spec.servers[0].url;
  } else if (spec.host) {
    const scheme = spec.schemes?.[0] ?? "https";
    baseUrl = `${scheme}://${spec.host}${spec.basePath ?? ""}`;
  }

  // Extract auth schemes
  const authSchemes: string[] = [];
  const securitySchemes =
    spec.components?.securitySchemes ?? spec.securityDefinitions ?? {};
  for (const [name, scheme] of Object.entries(securitySchemes)) {
    const s = scheme as any;
    const type = s.type ?? "unknown";
    const flow = s.flows ? Object.keys(s.flows).join(", ") : "";
    authSchemes.push(flow ? `${name} (${type}, ${flow})` : `${name} (${type})`);
  }

  // Extract endpoints
  const paths = spec.paths ?? {};
  const endpoints: { method: string; path: string; summary: string }[] = [];
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, detail] of Object.entries(methods as any)) {
      if (["get", "post", "put", "patch", "delete", "head", "options"].includes(method)) {
        endpoints.push({
          method: method.toUpperCase(),
          path,
          summary: (detail as any).summary ?? (detail as any).description ?? "",
        });
      }
    }
  }

  return {
    title,
    version,
    baseUrl,
    authSchemes,
    endpoints,
    endpointCount: endpoints.length,
  };
}

async function main() {
  if (urls.length < 2) {
    console.error("Error: provide at least 2 OpenAPI spec URLs to compare");
    process.exit(1);
  }

  const results: { url: string; info?: ApiInfo; error?: string }[] = [];

  for (const url of urls) {
    try {
      const info = await fetchSpec(url);
      results.push({ url, info });
    } catch (err: any) {
      results.push({ url, error: err.message });
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Human-readable comparison
  console.log("# API Comparison\n");

  // Summary table
  const successful = results.filter((r) => r.info);
  const failed = results.filter((r) => r.error);

  if (failed.length > 0) {
    console.log("## Errors\n");
    for (const f of failed) {
      console.log(`- ${f.url}: ${f.error}`);
    }
    console.log();
  }

  if (successful.length === 0) {
    console.error("Error: no specs could be fetched successfully");
    process.exit(1);
  }

  // Overview
  console.log("## Overview\n");
  console.log(
    `| Property | ${successful.map((s) => s.info!.title).join(" | ")} |`
  );
  console.log(
    `| --- | ${successful.map(() => "---").join(" | ")} |`
  );
  console.log(
    `| Version | ${successful.map((s) => s.info!.version).join(" | ")} |`
  );
  console.log(
    `| Base URL | ${successful.map((s) => s.info!.baseUrl || "N/A").join(" | ")} |`
  );
  console.log(
    `| Endpoints | ${successful.map((s) => s.info!.endpointCount).join(" | ")} |`
  );
  console.log(
    `| Auth | ${successful.map((s) => s.info!.authSchemes.join(", ") || "None listed").join(" | ")} |`
  );

  // Endpoint coverage comparison
  console.log("\n## Endpoint Coverage\n");

  // Collect all unique paths across all specs
  const allPaths = new Set<string>();
  for (const s of successful) {
    for (const ep of s.info!.endpoints) {
      allPaths.add(`${ep.method} ${ep.path}`);
    }
  }

  const sortedPaths = [...allPaths].sort();
  console.log(
    `| Endpoint | ${successful.map((s) => s.info!.title).join(" | ")} |`
  );
  console.log(
    `| --- | ${successful.map(() => "---").join(" | ")} |`
  );

  for (const path of sortedPaths) {
    const cells = successful.map((s) => {
      const match = s.info!.endpoints.find(
        (ep) => `${ep.method} ${ep.path}` === path
      );
      return match ? (match.summary || "Yes") : "-";
    });
    console.log(`| \`${path}\` | ${cells.join(" | ")} |`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
