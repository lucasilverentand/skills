const args = Bun.argv.slice(2);

const HELP = `
pod-resource-report — Summarize CPU and memory requests vs actual usage across pods

Usage:
  bun run tools/pod-resource-report.ts [options]

Options:
  --namespace <ns>  Filter by namespace (default: all namespaces)
  --sort <field>    Sort by: cpu-usage, mem-usage, cpu-ratio, mem-ratio (default: mem-usage)
  --json            Output as JSON instead of plain text
  --help            Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const nsIdx = args.indexOf("--namespace");
const namespace = nsIdx !== -1 && args[nsIdx + 1] ? args[nsIdx + 1] : "";
const sortIdx = args.indexOf("--sort");
const sortField = sortIdx !== -1 && args[sortIdx + 1] ? args[sortIdx + 1] : "mem-usage";

interface PodResources {
  name: string;
  namespace: string;
  cpuRequest: string;
  cpuLimit: string;
  cpuUsage: string;
  memRequest: string;
  memLimit: string;
  memUsage: string;
  cpuUsageMillis: number;
  memUsageBytes: number;
  cpuRatio: number;
  memRatio: number;
  status: "healthy" | "over-provisioned" | "under-provisioned" | "no-limits";
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

function parseResource(val: string): number {
  if (!val || val === "<none>") return 0;
  // CPU: "100m" = 100 millicores, "1" = 1000 millicores
  if (val.endsWith("m")) return parseInt(val, 10);
  if (val.endsWith("n")) return parseInt(val, 10) / 1_000_000;
  // Memory: "128Mi", "1Gi", "256M"
  if (val.endsWith("Ki")) return parseInt(val, 10) * 1024;
  if (val.endsWith("Mi")) return parseInt(val, 10) * 1024 * 1024;
  if (val.endsWith("Gi")) return parseInt(val, 10) * 1024 * 1024 * 1024;
  if (val.endsWith("K")) return parseInt(val, 10) * 1000;
  if (val.endsWith("M")) return parseInt(val, 10) * 1000 * 1000;
  if (val.endsWith("G")) return parseInt(val, 10) * 1000 * 1000 * 1000;
  return parseFloat(val) * 1000; // Assume cores for CPU
}

function humanMem(bytes: number): string {
  if (bytes === 0) return "0";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}Ki`;
  if (bytes < 1024 * 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}Mi`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}Gi`;
}

async function main() {
  // Get pod resource requests/limits
  const topArgs = ["kubectl", "top", "pods", "--containers"];
  if (namespace) topArgs.push("-n", namespace);
  else topArgs.push("-A");

  const topResult = await run(topArgs);
  if (topResult.exitCode !== 0) {
    console.error(`Error: kubectl top failed — ${topResult.stderr}`);
    console.error("Ensure metrics-server is installed in the cluster.");
    process.exit(1);
  }

  // Get resource specs
  const specArgs = ["kubectl", "get", "pods", "-o", "json"];
  if (namespace) specArgs.push("-n", namespace);
  else specArgs.push("-A");

  const specResult = await run(specArgs);
  if (specResult.exitCode !== 0) {
    console.error(`Error: kubectl get pods failed — ${specResult.stderr}`);
    process.exit(1);
  }

  // Parse spec data
  let podSpecs: any;
  try {
    podSpecs = JSON.parse(specResult.stdout);
  } catch {
    console.error("Error: could not parse pod spec JSON");
    process.exit(1);
  }

  const specMap: Record<string, { cpuRequest: string; cpuLimit: string; memRequest: string; memLimit: string }> = {};

  for (const pod of podSpecs.items || []) {
    const ns = pod.metadata?.namespace || "";
    const name = pod.metadata?.name || "";
    const key = `${ns}/${name}`;
    let cpuReq = "0", cpuLim = "0", memReq = "0", memLim = "0";

    for (const container of pod.spec?.containers || []) {
      const res = container.resources || {};
      cpuReq = res.requests?.cpu || cpuReq;
      cpuLim = res.limits?.cpu || cpuLim;
      memReq = res.requests?.memory || memReq;
      memLim = res.limits?.memory || memLim;
    }

    specMap[key] = { cpuRequest: cpuReq, cpuLimit: cpuLim, memRequest: memReq, memLimit: memLim };
  }

  // Parse top output
  const topLines = topResult.stdout.split("\n").filter(Boolean);
  const pods: PodResources[] = [];

  for (const line of topLines.slice(1)) {
    const cols = line.split(/\s+/).filter(Boolean);
    if (cols.length < 3) continue;

    // With -A: NAMESPACE POD CONTAINER CPU MEM
    // Without -A: POD CONTAINER CPU MEM
    let ns: string, podName: string, cpu: string, mem: string;
    if (!namespace) {
      [ns, podName, , cpu, mem] = cols;
    } else {
      [podName, , cpu, mem] = cols;
      ns = namespace;
    }

    const key = `${ns}/${podName}`;
    const spec = specMap[key] || { cpuRequest: "0", cpuLimit: "0", memRequest: "0", memLimit: "0" };

    const cpuMillis = parseResource(cpu);
    const memBytes = parseResource(mem);
    const cpuReqMillis = parseResource(spec.cpuRequest);
    const memReqBytes = parseResource(spec.memRequest);

    const cpuRatio = cpuReqMillis > 0 ? cpuMillis / cpuReqMillis : 0;
    const memRatio = memReqBytes > 0 ? memBytes / memReqBytes : 0;

    let status: PodResources["status"] = "healthy";
    if (spec.cpuLimit === "0" && spec.memLimit === "0") status = "no-limits";
    else if (cpuRatio < 0.2 && memRatio < 0.2) status = "over-provisioned";
    else if (cpuRatio > 0.9 || memRatio > 0.9) status = "under-provisioned";

    pods.push({
      name: podName,
      namespace: ns,
      cpuRequest: spec.cpuRequest,
      cpuLimit: spec.cpuLimit,
      cpuUsage: cpu,
      memRequest: spec.memRequest,
      memLimit: spec.memLimit,
      memUsage: mem,
      cpuUsageMillis: cpuMillis,
      memUsageBytes: memBytes,
      cpuRatio: Math.round(cpuRatio * 100) / 100,
      memRatio: Math.round(memRatio * 100) / 100,
      status,
    });
  }

  // Deduplicate by pod name (kubectl top --containers gives per-container)
  const podMap = new Map<string, PodResources>();
  for (const p of pods) {
    const key = `${p.namespace}/${p.name}`;
    if (!podMap.has(key)) {
      podMap.set(key, p);
    }
  }
  const uniquePods = [...podMap.values()];

  // Sort
  const sortFns: Record<string, (a: PodResources, b: PodResources) => number> = {
    "cpu-usage": (a, b) => b.cpuUsageMillis - a.cpuUsageMillis,
    "mem-usage": (a, b) => b.memUsageBytes - a.memUsageBytes,
    "cpu-ratio": (a, b) => b.cpuRatio - a.cpuRatio,
    "mem-ratio": (a, b) => b.memRatio - a.memRatio,
  };
  uniquePods.sort(sortFns[sortField] || sortFns["mem-usage"]);

  if (jsonOutput) {
    console.log(JSON.stringify({
      namespace: namespace || "all",
      pods: uniquePods,
      summary: {
        total: uniquePods.length,
        healthy: uniquePods.filter((p) => p.status === "healthy").length,
        overProvisioned: uniquePods.filter((p) => p.status === "over-provisioned").length,
        underProvisioned: uniquePods.filter((p) => p.status === "under-provisioned").length,
        noLimits: uniquePods.filter((p) => p.status === "no-limits").length,
      },
    }, null, 2));
  } else {
    console.log(`Pod resource report (${uniquePods.length} pods):\n`);
    console.log("  POD".padEnd(45) + "CPU (used/req)".padEnd(20) + "MEM (used/req)".padEnd(20) + "STATUS");
    console.log("  " + "-".repeat(100));

    for (const p of uniquePods) {
      const name = `${p.namespace}/${p.name}`.slice(0, 43);
      const cpu = `${p.cpuUsage}/${p.cpuRequest}`.padEnd(18);
      const mem = `${p.memUsage}/${p.memRequest}`.padEnd(18);
      const statusLabel = p.status === "over-provisioned" ? "OVER" : p.status === "under-provisioned" ? "UNDER" : p.status === "no-limits" ? "NO-LIMITS" : "OK";
      console.log(`  ${name.padEnd(43)} ${cpu} ${mem} ${statusLabel}`);
    }

    const over = uniquePods.filter((p) => p.status === "over-provisioned");
    const under = uniquePods.filter((p) => p.status === "under-provisioned");

    if (over.length > 0) {
      console.log(`\n  ${over.length} pod(s) are over-provisioned — consider reducing requests to save cluster resources.`);
    }
    if (under.length > 0) {
      console.log(`\n  ${under.length} pod(s) are under-provisioned — increase limits to prevent OOMKill or throttling.`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
