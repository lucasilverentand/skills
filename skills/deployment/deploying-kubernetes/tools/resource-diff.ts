const args = Bun.argv.slice(2);

const HELP = `
resource-diff — Diff local manifests against live cluster state

Usage:
  bun run tools/resource-diff.ts <path> [options]

Arguments:
  <path>  Path to a YAML manifest file or directory

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

interface DiffEntry {
  kind: string;
  name: string;
  namespace: string;
  status: "unchanged" | "modified" | "new" | "error";
  diff?: string;
  error?: string;
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

async function findManifests(path: string): Promise<string[]> {
  const dirCheck = Bun.spawn(["test", "-d", path], { stdout: "pipe", stderr: "pipe" });
  if ((await dirCheck.exited) === 0) {
    const proc = Bun.spawn(["find", path, "-name", "*.yaml", "-o", "-name", "*.yml"], {
      stdout: "pipe", stderr: "pipe",
    });
    const stdout = (await new Response(proc.stdout).text()).trim();
    await proc.exited;
    return stdout.split("\n").filter(Boolean);
  }
  return [path];
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required <path> argument");
    process.exit(1);
  }

  const files = await findManifests(target);
  const entries: DiffEntry[] = [];

  for (const filePath of files) {
    const file = Bun.file(filePath);
    if (!(await file.exists())) continue;
    const content = await file.text();

    if (!content.includes("apiVersion:")) continue;

    const docs = content.split("---").filter((d) => d.trim());

    for (const doc of docs) {
      if (!doc.includes("kind:")) continue;

      const kindMatch = doc.match(/kind:\s*(\S+)/);
      const nameMatch = doc.match(/metadata:\s*\n\s+name:\s*(\S+)/);
      const nsMatch = doc.match(/namespace:\s*(\S+)/);

      const kind = kindMatch?.[1] || "Unknown";
      const name = nameMatch?.[1] || "unknown";
      const ns = namespace || nsMatch?.[1] || "default";

      // Use kubectl diff to compare
      const diffResult = await run(["kubectl", "diff", "-f", "-", ...(namespace ? ["-n", namespace] : [])], doc);

      if (diffResult.exitCode === 0) {
        entries.push({ kind, name, namespace: ns, status: "unchanged" });
      } else if (diffResult.exitCode === 1 && diffResult.stdout) {
        entries.push({
          kind,
          name,
          namespace: ns,
          status: "modified",
          diff: diffResult.stdout.slice(0, 1000),
        });
      } else if (diffResult.stderr.includes("not found")) {
        entries.push({ kind, name, namespace: ns, status: "new" });
      } else {
        entries.push({
          kind,
          name,
          namespace: ns,
          status: "error",
          error: diffResult.stderr.slice(0, 200),
        });
      }
    }
  }

  const summary = {
    total: entries.length,
    unchanged: entries.filter((e) => e.status === "unchanged").length,
    modified: entries.filter((e) => e.status === "modified").length,
    new: entries.filter((e) => e.status === "new").length,
    errors: entries.filter((e) => e.status === "error").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify({ path: target, summary, entries }, null, 2));
  } else {
    console.log(`Resource diff: ${target}\n`);
    console.log(`  Unchanged: ${summary.unchanged} | Modified: ${summary.modified} | New: ${summary.new} | Errors: ${summary.errors}\n`);

    for (const e of entries) {
      if (e.status === "unchanged") continue;

      const label = e.status === "modified" ? "MODIFIED" : e.status === "new" ? "NEW     " : "ERROR   ";
      console.log(`  [${label}] ${e.kind}/${e.name} (${e.namespace})`);

      if (e.diff) {
        const lines = e.diff.split("\n").slice(0, 15);
        for (const line of lines) {
          console.log(`    ${line}`);
        }
        if (e.diff.split("\n").length > 15) {
          console.log("    ...");
        }
      }
      if (e.error) {
        console.log(`    Error: ${e.error}`);
      }
      console.log();
    }

    if (summary.modified === 0 && summary.new === 0 && summary.errors === 0) {
      console.log("All resources match the cluster state.");
    }
  }

  if (summary.modified > 0 || summary.new > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
