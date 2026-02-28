const args = Bun.argv.slice(2);

const HELP = `
kustomize-build — Render Kustomize overlays and validate the output YAML

Usage:
  bun run tools/kustomize-build.ts <overlay-path> [options]

Arguments:
  <overlay-path>  Path to the kustomization directory

Options:
  --output <file>  Write rendered YAML to a file instead of stdout
  --validate       Validate the output against Kubernetes schemas (requires kubectl)
  --json           Output as JSON instead of plain text
  --help           Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const doValidate = args.includes("--validate");
const outputIdx = args.indexOf("--output");
const outputFile = outputIdx !== -1 && args[outputIdx + 1] ? args[outputIdx + 1] : "";
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(outputIdx !== -1 && args[outputIdx + 1] === a));

interface BuildResult {
  path: string;
  success: boolean;
  resourceCount: number;
  resources: { kind: string; name: string; namespace: string }[];
  validationErrors: string[];
  output?: string;
  error?: string;
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
  const overlayPath = filteredArgs[0];
  if (!overlayPath) {
    console.error("Error: missing required <overlay-path> argument");
    process.exit(1);
  }

  // Try kustomize first, then kubectl kustomize
  let buildResult = await run(["kustomize", "build", overlayPath]);
  if (buildResult.exitCode !== 0) {
    buildResult = await run(["kubectl", "kustomize", overlayPath]);
  }

  if (buildResult.exitCode !== 0) {
    const result: BuildResult = {
      path: overlayPath,
      success: false,
      resourceCount: 0,
      resources: [],
      validationErrors: [],
      error: buildResult.stderr,
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(`Error building kustomization at ${overlayPath}:`);
      console.error(buildResult.stderr);
    }
    process.exit(1);
  }

  const rendered = buildResult.stdout;

  // Parse resources from the YAML
  const resources: { kind: string; name: string; namespace: string }[] = [];
  const docs = rendered.split("---").filter((d) => d.trim());

  for (const doc of docs) {
    const kindMatch = doc.match(/kind:\s*(\S+)/);
    const nameMatch = doc.match(/name:\s*(\S+)/);
    const nsMatch = doc.match(/namespace:\s*(\S+)/);

    if (kindMatch) {
      resources.push({
        kind: kindMatch[1],
        name: nameMatch ? nameMatch[1] : "(unknown)",
        namespace: nsMatch ? nsMatch[1] : "default",
      });
    }
  }

  // Validate if requested
  const validationErrors: string[] = [];
  if (doValidate) {
    const validateResult = await run(["kubectl", "apply", "--dry-run=client", "-f", "-"]);
    // We need to pipe the rendered YAML to kubectl
    const proc = Bun.spawn(["kubectl", "apply", "--dry-run=client", "-f", "-"], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    proc.stdin.write(rendered);
    proc.stdin.end();
    const [_, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    await proc.exited;
    if (stderr.trim()) {
      validationErrors.push(...stderr.trim().split("\n"));
    }
  }

  // Write to file if requested
  if (outputFile) {
    await Bun.write(outputFile, rendered);
  }

  const result: BuildResult = {
    path: overlayPath,
    success: true,
    resourceCount: resources.length,
    resources,
    validationErrors,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Kustomize build: ${overlayPath}\n`);
    console.log(`Resources rendered: ${resources.length}\n`);

    // Group by kind
    const byKind: Record<string, string[]> = {};
    for (const r of resources) {
      if (!byKind[r.kind]) byKind[r.kind] = [];
      byKind[r.kind].push(`${r.namespace}/${r.name}`);
    }

    for (const [kind, names] of Object.entries(byKind)) {
      console.log(`  ${kind} (${names.length}):`);
      for (const n of names) {
        console.log(`    ${n}`);
      }
    }

    if (validationErrors.length > 0) {
      console.log(`\nValidation errors (${validationErrors.length}):`);
      for (const e of validationErrors) {
        console.log(`  ${e}`);
      }
    }

    if (outputFile) {
      console.log(`\nRendered YAML written to: ${outputFile}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
