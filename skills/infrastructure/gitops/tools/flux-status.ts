const args = Bun.argv.slice(2);

const HELP = `
flux-status — Summarize reconciliation status for all Flux resources

Usage:
  bun run tools/flux-status.ts [options]

Options:
  --namespace <ns>  Filter by namespace (default: all namespaces)
  --failing         Only show failing or stalled resources
  --json            Output as JSON instead of plain text
  --help            Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const failingOnly = args.includes("--failing");
const nsIdx = args.indexOf("--namespace");
const namespace = nsIdx !== -1 && args[nsIdx + 1] ? args[nsIdx + 1] : "";

interface FluxResource {
  kind: string;
  name: string;
  namespace: string;
  ready: boolean;
  status: string;
  message: string;
  revision: string;
  lastReconciled: string;
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

async function getFluxResources(kind: string): Promise<FluxResource[]> {
  const fluxArgs = ["flux", "get", kind];
  if (namespace) fluxArgs.push("-n", namespace);
  else fluxArgs.push("-A");

  const result = await run(fluxArgs);
  if (result.exitCode !== 0) return [];

  const lines = result.stdout.split("\n").filter(Boolean);
  if (lines.length <= 1) return [];

  // Parse the table output
  const resources: FluxResource[] = [];
  for (const line of lines.slice(1)) {
    // Skip the header
    const cols = line.split("\t").map((c) => c.trim());
    if (cols.length < 4) continue;

    // Flux output format depends on the resource type but generally:
    // NAMESPACE NAME REVISION SUSPENDED READY MESSAGE
    const ns = namespace || cols[0] || "";
    const name = namespace ? cols[0] : cols[1] || "";
    const ready = line.toLowerCase().includes("true") && !line.toLowerCase().includes("false");
    const message = cols[cols.length - 1] || "";

    resources.push({
      kind,
      name,
      namespace: ns,
      ready,
      status: ready ? "Ready" : "Not Ready",
      message,
      revision: "",
      lastReconciled: "",
    });
  }

  return resources;
}

async function main() {
  // Check if flux is available
  const fluxCheck = await run(["which", "flux"]);
  if (fluxCheck.exitCode !== 0) {
    console.error("Error: flux CLI not found. Install with: brew install fluxcd/tap/flux");
    process.exit(1);
  }

  const resourceTypes = ["kustomizations", "helmreleases", "sources git", "sources helm"];
  const allResources: FluxResource[] = [];

  for (const type of resourceTypes) {
    const typeParts = type.split(" ");
    const resources = await getFluxResources(typeParts.join(" "));
    for (const r of resources) {
      r.kind = type.replace("sources ", "").replace("s", "");
    }
    allResources.push(...resources);
  }

  const filtered = failingOnly ? allResources.filter((r) => !r.ready) : allResources;

  const summary = {
    total: allResources.length,
    ready: allResources.filter((r) => r.ready).length,
    failing: allResources.filter((r) => !r.ready).length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify({ summary, resources: filtered }, null, 2));
  } else {
    console.log(`Flux status: ${summary.ready}/${summary.total} ready, ${summary.failing} failing\n`);

    if (filtered.length === 0) {
      if (failingOnly) {
        console.log("All resources are healthy.");
      } else {
        console.log("No Flux resources found.");
      }
      process.exit(0);
    }

    // Group by kind
    const byKind: Record<string, FluxResource[]> = {};
    for (const r of filtered) {
      if (!byKind[r.kind]) byKind[r.kind] = [];
      byKind[r.kind].push(r);
    }

    for (const [kind, resources] of Object.entries(byKind)) {
      console.log(`${kind}:`);
      for (const r of resources) {
        const icon = r.ready ? "OK" : "FAIL";
        console.log(`  [${icon}] ${r.namespace}/${r.name}`);
        if (!r.ready && r.message) {
          console.log(`        ${r.message}`);
        }
      }
      console.log();
    }
  }

  if (summary.failing > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
