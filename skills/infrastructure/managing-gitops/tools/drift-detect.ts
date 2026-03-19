const args = Bun.argv.slice(2);

const HELP = `
drift-detect — Compare rendered manifests against live cluster state

Usage:
  bun run tools/drift-detect.ts <path> [options]

Arguments:
  <path>  Path to a kustomization directory or YAML manifest

Options:
  --namespace <ns>  Override namespace for comparison
  --json            Output as JSON instead of plain text
  --help            Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const nsIdx = args.indexOf("--namespace");
const namespace = nsIdx !== -1 && args[nsIdx + 1] ? args[nsIdx + 1] : "";
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(nsIdx !== -1 && args[nsIdx + 1] === a));

interface DriftEntry {
  kind: string;
  name: string;
  namespace: string;
  status: "in-sync" | "drifted" | "missing-live" | "missing-desired";
  diff?: string;
}

async function run(cmd: string[], stdin?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
    stdin: stdin ? "pipe" : undefined,
  });
  if (stdin && proc.stdin) {
    proc.stdin.write(stdin);
    proc.stdin.end();
  }
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required <path> argument");
    process.exit(1);
  }

  // Render the desired state
  let renderedYaml: string;

  // Check if target is a directory (kustomization) or file
  const dirCheck = Bun.spawn(["test", "-d", target], { stdout: "pipe", stderr: "pipe" });
  const isDir = (await dirCheck.exited) === 0;

  if (isDir) {
    // Try kustomize build
    let result = await run(["kustomize", "build", target]);
    if (result.exitCode !== 0) {
      result = await run(["kubectl", "kustomize", target]);
    }
    if (result.exitCode !== 0) {
      console.error(`Error: could not build kustomization at ${target}: ${result.stderr}`);
      process.exit(1);
    }
    renderedYaml = result.stdout;
  } else {
    const file = Bun.file(target);
    if (!(await file.exists())) {
      console.error(`Error: file not found: ${target}`);
      process.exit(1);
    }
    renderedYaml = await file.text();
  }

  // Parse desired resources
  const docs = renderedYaml.split("---").filter((d) => d.trim());
  const entries: DriftEntry[] = [];

  for (const doc of docs) {
    const kindMatch = doc.match(/kind:\s*(\S+)/);
    const nameMatch = doc.match(/metadata:\s*\n\s+name:\s*(\S+)/);
    const nsMatch = doc.match(/namespace:\s*(\S+)/);

    if (!kindMatch || !nameMatch) continue;

    const kind = kindMatch[1];
    const name = nameMatch[1];
    const ns = namespace || (nsMatch ? nsMatch[1] : "default");

    // Get live state using kubectl diff
    const diffResult = await run(
      ["kubectl", "diff", "-f", "-"],
      doc
    );

    if (diffResult.exitCode === 0) {
      // No diff — in sync
      entries.push({ kind, name, namespace: ns, status: "in-sync" });
    } else if (diffResult.exitCode === 1 && diffResult.stdout) {
      // Has differences
      entries.push({
        kind,
        name,
        namespace: ns,
        status: "drifted",
        diff: diffResult.stdout.slice(0, 500),
      });
    } else {
      // Resource doesn't exist in cluster
      entries.push({ kind, name, namespace: ns, status: "missing-live" });
    }
  }

  const summary = {
    total: entries.length,
    inSync: entries.filter((e) => e.status === "in-sync").length,
    drifted: entries.filter((e) => e.status === "drifted").length,
    missingLive: entries.filter((e) => e.status === "missing-live").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify({ path: target, summary, entries }, null, 2));
  } else {
    console.log(`Drift detection: ${target}\n`);
    console.log(`  In sync: ${summary.inSync}/${summary.total}`);
    console.log(`  Drifted: ${summary.drifted}`);
    console.log(`  Missing from cluster: ${summary.missingLive}\n`);

    for (const e of entries) {
      if (e.status === "in-sync") continue;

      const label = e.status === "drifted" ? "DRIFT" : "MISSING";
      console.log(`  [${label}] ${e.kind}/${e.name} (${e.namespace})`);
      if (e.diff) {
        for (const line of e.diff.split("\n").slice(0, 10)) {
          console.log(`    ${line}`);
        }
        console.log();
      }
    }

    if (summary.drifted === 0 && summary.missingLive === 0) {
      console.log("All resources are in sync with the cluster.");
    }
  }

  if (summary.drifted > 0 || summary.missingLive > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
