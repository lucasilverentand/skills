const args = Bun.argv.slice(2);

const HELP = `
kv-usage — Report KV namespace sizes and key counts per binding

Usage:
  bun run tools/kv-usage.ts [config-path] [options]

Arguments:
  [config-path]  Path to wrangler.toml (default: ./wrangler.toml)

Options:
  --env <env>   Wrangler environment to check
  --json        Output as JSON instead of plain text
  --help        Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const envIdx = args.indexOf("--env");
const env = envIdx !== -1 && args[envIdx + 1] ? args[envIdx + 1] : "";
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(envIdx !== -1 && args[envIdx + 1] === a));
const configPath = filteredArgs[0] || "wrangler.toml";

interface KvNamespace {
  binding: string;
  id: string;
  keyCount: number;
  title: string;
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
  const file = Bun.file(configPath);
  if (!(await file.exists())) {
    console.error(`Error: config file not found: ${configPath}`);
    process.exit(1);
  }

  const content = await file.text();

  // Parse KV namespace bindings from wrangler.toml
  const namespaces: KvNamespace[] = [];
  const lines = content.split("\n");

  let inKvSection = false;
  let currentBinding = "";
  let currentId = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "[[kv_namespaces]]") {
      inKvSection = true;
      currentBinding = "";
      currentId = "";
      continue;
    }

    if (inKvSection) {
      const bindingMatch = trimmed.match(/^binding\s*=\s*"([^"]+)"/);
      if (bindingMatch) currentBinding = bindingMatch[1];

      const idMatch = trimmed.match(/^id\s*=\s*"([^"]+)"/);
      if (idMatch) currentId = idMatch[1];

      // End of this entry (blank line or new section)
      if (trimmed === "" || trimmed.startsWith("[")) {
        if (currentBinding && currentId) {
          namespaces.push({ binding: currentBinding, id: currentId, keyCount: 0, title: currentBinding });
        }
        inKvSection = trimmed === "[[kv_namespaces]]";
        currentBinding = "";
        currentId = "";
      }
    }
  }

  // Don't forget the last entry
  if (inKvSection && currentBinding && currentId) {
    namespaces.push({ binding: currentBinding, id: currentId, keyCount: 0, title: currentBinding });
  }

  if (namespaces.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ configFile: configPath, namespaces: [], message: "No KV namespaces found" }));
    } else {
      console.log(`No KV namespaces found in ${configPath}.`);
    }
    process.exit(0);
  }

  // Get key counts for each namespace using wrangler
  for (const ns of namespaces) {
    const listArgs = ["bunx", "wrangler", "kv:key", "list", "--namespace-id", ns.id];
    if (env) listArgs.push("--env", env);

    const result = await run(listArgs);
    if (result.exitCode === 0) {
      try {
        const keys = JSON.parse(result.stdout);
        ns.keyCount = Array.isArray(keys) ? keys.length : 0;
      } catch {
        // Try counting lines if JSON parse fails
        ns.keyCount = result.stdout.split("\n").filter((l) => l.includes('"name"')).length;
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ configFile: configPath, namespaces }, null, 2));
  } else {
    console.log(`KV namespaces in ${configPath}:\n`);
    for (const ns of namespaces) {
      console.log(`  ${ns.binding}`);
      console.log(`    ID: ${ns.id}`);
      console.log(`    Keys: ${ns.keyCount}`);
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
