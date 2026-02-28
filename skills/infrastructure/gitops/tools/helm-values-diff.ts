const args = Bun.argv.slice(2);

const HELP = `
helm-values-diff — Diff HelmRelease values across environments

Usage:
  bun run tools/helm-values-diff.ts <release-name> [options]

Arguments:
  <release-name>  Name of the HelmRelease resource

Options:
  --envs <list>   Comma-separated environment directories to compare (default: staging,production)
  --base <path>   Base path for environment directories (default: apps)
  --json          Output as JSON instead of plain text
  --help          Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const envsIdx = args.indexOf("--envs");
const envs = (envsIdx !== -1 && args[envsIdx + 1] ? args[envsIdx + 1] : "staging,production").split(",");
const baseIdx = args.indexOf("--base");
const basePath = baseIdx !== -1 && args[baseIdx + 1] ? args[baseIdx + 1] : "apps";
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(envsIdx !== -1 && args[envsIdx + 1] === a) && !(baseIdx !== -1 && args[baseIdx + 1] === a));

interface ValuesDiff {
  key: string;
  values: Record<string, string>;
  differs: boolean;
}

async function findHelmRelease(dir: string, releaseName: string): Promise<string | null> {
  // Search for YAML files containing the HelmRelease
  const proc = Bun.spawn(["find", dir, "-name", "*.yaml", "-o", "-name", "*.yml"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  for (const filePath of stdout.trim().split("\n").filter(Boolean)) {
    const file = Bun.file(filePath);
    if (!(await file.exists())) continue;
    const content = await file.text();
    if (content.includes("kind: HelmRelease") && content.includes(`name: ${releaseName}`)) {
      return filePath;
    }
  }
  return null;
}

function extractValues(yamlContent: string): Record<string, string> {
  const values: Record<string, string> = {};
  const valuesMatch = yamlContent.match(/values:\n([\s\S]*?)(?=\n\S|\n---|\Z)/);
  if (!valuesMatch) return values;

  const valuesBlock = valuesMatch[1];
  const lines = valuesBlock.split("\n");

  const path: string[] = [];
  let prevIndent = 0;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const indent = line.search(/\S/);
    if (indent === -1) continue;

    // Adjust path based on indent level
    while (path.length > 0 && indent <= prevIndent) {
      path.pop();
      prevIndent -= 2;
    }

    const kvMatch = line.trim().match(/^(\S+):\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value && !value.endsWith(":")) {
        const fullKey = [...path, key].join(".");
        values[fullKey] = value;
      } else if (!value) {
        path.push(key);
        prevIndent = indent;
      }
    }

    const parentMatch = line.trim().match(/^(\S+):$/);
    if (parentMatch) {
      path.push(parentMatch[1]);
      prevIndent = indent;
    }
  }

  return values;
}

async function main() {
  const releaseName = filteredArgs[0];
  if (!releaseName) {
    console.error("Error: missing required <release-name> argument");
    process.exit(1);
  }

  const envValues: Record<string, Record<string, string>> = {};
  const foundFiles: Record<string, string> = {};

  for (const env of envs) {
    const envDir = `${basePath}/${env}`;
    const filePath = await findHelmRelease(envDir, releaseName);
    if (!filePath) {
      console.error(`Warning: HelmRelease "${releaseName}" not found in ${envDir}`);
      continue;
    }

    foundFiles[env] = filePath;
    const content = await Bun.file(filePath).text();
    envValues[env] = extractValues(content);
  }

  if (Object.keys(envValues).length < 2) {
    console.error("Error: need at least 2 environments to compare");
    process.exit(1);
  }

  // Collect all unique keys
  const allKeys = new Set<string>();
  for (const values of Object.values(envValues)) {
    for (const key of Object.keys(values)) {
      allKeys.add(key);
    }
  }

  // Compare values
  const diffs: ValuesDiff[] = [];
  for (const key of [...allKeys].sort()) {
    const valueMap: Record<string, string> = {};
    for (const env of envs) {
      valueMap[env] = envValues[env]?.[key] || "(not set)";
    }

    const uniqueValues = new Set(Object.values(valueMap));
    diffs.push({
      key,
      values: valueMap,
      differs: uniqueValues.size > 1,
    });
  }

  const differing = diffs.filter((d) => d.differs);
  const same = diffs.filter((d) => !d.differs);

  if (jsonOutput) {
    console.log(JSON.stringify({
      release: releaseName,
      environments: envs,
      files: foundFiles,
      totalKeys: diffs.length,
      differingKeys: differing.length,
      diffs: differing,
    }, null, 2));
  } else {
    console.log(`HelmRelease values diff: ${releaseName}\n`);
    console.log(`Environments: ${envs.join(", ")}`);
    console.log(`Total keys: ${diffs.length} | Differing: ${differing.length}\n`);

    if (differing.length === 0) {
      console.log("All values are identical across environments.");
    } else {
      console.log("Differing values:\n");
      for (const d of differing) {
        console.log(`  ${d.key}:`);
        for (const [env, val] of Object.entries(d.values)) {
          console.log(`    ${env.padEnd(12)} → ${val}`);
        }
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
