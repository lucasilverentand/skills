const args = Bun.argv.slice(2);

const HELP = `
sealed-secret-validate — Check that SealedSecret resources are well-formed and can decrypt against the cluster key

Usage:
  bun run tools/sealed-secret-validate.ts [path] [options]

Arguments:
  [path]  Path to a SealedSecret YAML file or directory containing them (default: current directory)

Options:
  --cluster   Also verify decryption against the live cluster (requires kubeseal and cluster access)
  --json      Output as JSON instead of plain text
  --help      Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const checkCluster = args.includes("--cluster");
const filteredArgs = args.filter((a) => !a.startsWith("--"));
const scanPath = filteredArgs[0] || ".";

interface ValidationResult {
  file: string;
  name: string;
  namespace: string;
  valid: boolean;
  issues: string[];
  encryptedKeys: string[];
  clusterVerified?: boolean;
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

async function findSealedSecrets(path: string): Promise<string[]> {
  const dirCheck = Bun.spawn(["test", "-d", path], { stdout: "pipe", stderr: "pipe" });
  const isDir = (await dirCheck.exited) === 0;

  if (!isDir) return [path];

  const { stdout } = await run(["find", path, "-name", "*.yaml", "-o", "-name", "*.yml"]);
  const files: string[] = [];

  for (const filePath of stdout.split("\n").filter(Boolean)) {
    const file = Bun.file(filePath);
    if (!(await file.exists())) continue;
    const content = await file.text();
    if (content.includes("kind: SealedSecret")) {
      files.push(filePath);
    }
  }

  return files;
}

function validateSealedSecretYaml(content: string, filePath: string): ValidationResult {
  const issues: string[] = [];
  const encryptedKeys: string[] = [];

  // Check apiVersion
  const apiVersionMatch = content.match(/apiVersion:\s*(\S+)/);
  if (!apiVersionMatch) {
    issues.push("Missing apiVersion");
  } else if (!apiVersionMatch[1].includes("bitnami.com")) {
    issues.push(`Unexpected apiVersion: ${apiVersionMatch[1]} — expected bitnami.com/v1alpha1`);
  }

  // Check kind
  const kindMatch = content.match(/kind:\s*(\S+)/);
  if (!kindMatch || kindMatch[1] !== "SealedSecret") {
    issues.push("Not a SealedSecret resource");
  }

  // Check metadata
  const nameMatch = content.match(/metadata:\s*\n\s+name:\s*(\S+)/);
  const nsMatch = content.match(/namespace:\s*(\S+)/);
  const name = nameMatch ? nameMatch[1] : "(unknown)";
  const namespace = nsMatch ? nsMatch[1] : "default";

  if (!nameMatch) {
    issues.push("Missing metadata.name");
  }

  if (!nsMatch) {
    issues.push("Missing namespace — SealedSecrets are namespace-scoped by default");
  }

  // Check spec.encryptedData
  const hasEncryptedData = content.includes("encryptedData:");
  if (!hasEncryptedData) {
    issues.push("Missing spec.encryptedData — no encrypted values found");
  } else {
    // Extract encrypted key names
    const encryptedSection = content.split("encryptedData:")[1];
    if (encryptedSection) {
      const keyMatches = encryptedSection.matchAll(/^\s{4,}(\S+):\s/gm);
      for (const m of keyMatches) {
        if (m[1] && !m[1].startsWith("#") && m[1] !== "template:" && m[1] !== "metadata:") {
          encryptedKeys.push(m[1]);
        }
      }
    }
  }

  // Check for plain Secret YAML accidentally included
  if (content.includes("kind: Secret") && content.includes("data:")) {
    issues.push("WARNING: File also contains a plain Secret resource — never commit plain Secrets");
  }

  return { file: filePath, name, namespace, valid: issues.length === 0, issues, encryptedKeys };
}

async function main() {
  const files = await findSealedSecrets(scanPath);

  if (files.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ path: scanPath, results: [], message: "No SealedSecret files found" }));
    } else {
      console.log(`No SealedSecret files found in ${scanPath}.`);
    }
    process.exit(0);
  }

  const results: ValidationResult[] = [];

  for (const filePath of files) {
    const file = Bun.file(filePath);
    if (!(await file.exists())) continue;
    const content = await file.text();

    const result = validateSealedSecretYaml(content, filePath);

    // Optionally verify against the cluster
    if (checkCluster && result.valid) {
      const verifyResult = await run(["kubeseal", "--validate", "--re-encrypt"], content);
      result.clusterVerified = verifyResult.exitCode === 0;
      if (!result.clusterVerified) {
        result.issues.push(`Cluster verification failed: ${verifyResult.stderr.slice(0, 200)}`);
        result.valid = false;
      }
    }

    results.push(result);
  }

  const validCount = results.filter((r) => r.valid).length;
  const invalidCount = results.filter((r) => !r.valid).length;

  if (jsonOutput) {
    console.log(JSON.stringify({ path: scanPath, total: results.length, valid: validCount, invalid: invalidCount, results }, null, 2));
  } else {
    console.log(`SealedSecret validation: ${validCount}/${results.length} valid\n`);

    for (const r of results) {
      const status = r.valid ? "OK" : "FAIL";
      console.log(`  [${status}] ${r.file}`);
      console.log(`    Name: ${r.name} | Namespace: ${r.namespace}`);
      if (r.encryptedKeys.length > 0) {
        console.log(`    Encrypted keys: ${r.encryptedKeys.join(", ")}`);
      }
      if (r.clusterVerified !== undefined) {
        console.log(`    Cluster verification: ${r.clusterVerified ? "passed" : "failed"}`);
      }
      for (const issue of r.issues) {
        console.log(`    - ${issue}`);
      }
      console.log();
    }
  }

  if (invalidCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
