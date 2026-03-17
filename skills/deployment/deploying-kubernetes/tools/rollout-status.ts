const args = Bun.argv.slice(2);

const HELP = `
rollout-status — Check deployment rollout progress and surface stuck rollouts

Usage:
  bun run tools/rollout-status.ts [options]

Options:
  --namespace <ns>  Filter by namespace (default: all namespaces)
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

interface RolloutInfo {
  name: string;
  namespace: string;
  desired: number;
  ready: number;
  upToDate: number;
  available: number;
  age: string;
  status: "complete" | "in-progress" | "stuck" | "degraded";
  message: string;
  conditions: string[];
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

async function main() {
  // Get all deployments as JSON
  const getArgs = ["kubectl", "get", "deployments", "-o", "json"];
  if (namespace) getArgs.push("-n", namespace);
  else getArgs.push("-A");

  const result = await run(getArgs);
  if (result.exitCode !== 0) {
    console.error(`Error: ${result.stderr}`);
    process.exit(1);
  }

  let data: any;
  try {
    data = JSON.parse(result.stdout);
  } catch {
    console.error("Error: could not parse deployment JSON");
    process.exit(1);
  }

  const rollouts: RolloutInfo[] = [];

  for (const deploy of data.items || []) {
    const name = deploy.metadata?.name || "";
    const ns = deploy.metadata?.namespace || "";
    const spec = deploy.spec || {};
    const status = deploy.status || {};

    const desired = spec.replicas || 0;
    const ready = status.readyReplicas || 0;
    const upToDate = status.updatedReplicas || 0;
    const available = status.availableReplicas || 0;

    // Determine rollout status
    let rolloutStatus: RolloutInfo["status"] = "complete";
    let message = "";

    const conditions = (status.conditions || []).map((c: any) => `${c.type}: ${c.status} (${c.reason || ""})`);

    if (upToDate < desired) {
      rolloutStatus = "in-progress";
      message = `${upToDate}/${desired} pods updated`;
    } else if (ready < desired) {
      rolloutStatus = "in-progress";
      message = `${ready}/${desired} pods ready`;
    } else if (available < desired) {
      rolloutStatus = "degraded";
      message = `${available}/${desired} pods available`;
    }

    // Check for stuck conditions
    const progressCondition = (status.conditions || []).find((c: any) => c.type === "Progressing");
    if (progressCondition && progressCondition.reason === "ProgressDeadlineExceeded") {
      rolloutStatus = "stuck";
      message = "Progress deadline exceeded — rollout is stuck";
    }

    // Check age of in-progress rollout
    const creationTimestamp = deploy.metadata?.creationTimestamp;
    const age = creationTimestamp ? timeSince(new Date(creationTimestamp)) : "unknown";

    rollouts.push({
      name,
      namespace: ns,
      desired,
      ready,
      upToDate,
      available,
      age,
      status: rolloutStatus,
      message,
      conditions,
    });
  }

  // Sort: stuck first, then in-progress, then degraded, then complete
  const statusOrder = { stuck: 0, "in-progress": 1, degraded: 2, complete: 3 };
  rollouts.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const summary = {
    total: rollouts.length,
    complete: rollouts.filter((r) => r.status === "complete").length,
    inProgress: rollouts.filter((r) => r.status === "in-progress").length,
    stuck: rollouts.filter((r) => r.status === "stuck").length,
    degraded: rollouts.filter((r) => r.status === "degraded").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify({ summary, rollouts }, null, 2));
  } else {
    console.log(`Rollout status: ${summary.complete}/${summary.total} complete\n`);

    if (summary.stuck > 0) console.log(`  STUCK: ${summary.stuck}`);
    if (summary.inProgress > 0) console.log(`  IN PROGRESS: ${summary.inProgress}`);
    if (summary.degraded > 0) console.log(`  DEGRADED: ${summary.degraded}`);
    console.log();

    for (const r of rollouts) {
      if (r.status === "complete") continue;

      const label = r.status.toUpperCase().padEnd(12);
      console.log(`  [${label}] ${r.namespace}/${r.name}`);
      console.log(`    Replicas: ${r.ready}/${r.desired} ready, ${r.upToDate}/${r.desired} up-to-date`);
      if (r.message) console.log(`    ${r.message}`);
      console.log();
    }

    if (summary.stuck === 0 && summary.inProgress === 0 && summary.degraded === 0) {
      console.log("All deployments are fully rolled out.");
    }
  }

  if (summary.stuck > 0) process.exit(1);
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
