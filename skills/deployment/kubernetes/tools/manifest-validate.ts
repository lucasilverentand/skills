const args = Bun.argv.slice(2);

const HELP = `
manifest-validate — Lint and validate Kubernetes manifests for common issues

Usage:
  bun run tools/manifest-validate.ts <path> [options]

Arguments:
  <path>  Path to a YAML manifest file or directory

Options:
  --strict  Treat warnings as errors
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const strict = args.includes("--strict");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface LintIssue {
  file: string;
  resource: string;
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
}

interface ValidationResult {
  files: number;
  resources: number;
  issues: LintIssue[];
  errors: number;
  warnings: number;
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

function lintResource(doc: string, filePath: string): LintIssue[] {
  const issues: LintIssue[] = [];

  const kindMatch = doc.match(/kind:\s*(\S+)/);
  const nameMatch = doc.match(/metadata:\s*\n\s+name:\s*(\S+)/);
  if (!kindMatch) return issues;

  const kind = kindMatch[1];
  const name = nameMatch ? nameMatch[1] : "(unknown)";
  const resourceId = `${kind}/${name}`;

  // Check namespace
  const hasNamespace = doc.includes("namespace:");
  if (!hasNamespace && !["Namespace", "ClusterRole", "ClusterRoleBinding", "PersistentVolume", "StorageClass", "CustomResourceDefinition"].includes(kind)) {
    issues.push({
      file: filePath,
      resource: resourceId,
      severity: "warning",
      rule: "explicit-namespace",
      message: "No namespace set — will default to 'default'. Set namespace explicitly.",
    });
  }

  // Deployment/Pod-specific checks
  if (kind === "Deployment" || kind === "StatefulSet" || kind === "DaemonSet") {
    // Resource requests and limits
    if (!doc.includes("resources:")) {
      issues.push({
        file: filePath,
        resource: resourceId,
        severity: "error",
        rule: "resource-limits",
        message: "Missing resource requests and limits on containers",
      });
    } else {
      if (!doc.includes("requests:")) {
        issues.push({
          file: filePath,
          resource: resourceId,
          severity: "error",
          rule: "resource-requests",
          message: "Missing resource requests (CPU/memory)",
        });
      }
      if (!doc.includes("limits:")) {
        issues.push({
          file: filePath,
          resource: resourceId,
          severity: "warning",
          rule: "resource-limits-set",
          message: "Missing resource limits — unbounded usage may affect node stability",
        });
      }
    }

    // Probes
    if (!doc.includes("readinessProbe:")) {
      issues.push({
        file: filePath,
        resource: resourceId,
        severity: "warning",
        rule: "readiness-probe",
        message: "Missing readinessProbe — traffic may be sent to unready pods",
      });
    }
    if (!doc.includes("livenessProbe:")) {
      issues.push({
        file: filePath,
        resource: resourceId,
        severity: "info",
        rule: "liveness-probe",
        message: "Missing livenessProbe — crashed pods won't be restarted automatically",
      });
    }

    // Image tag
    const imageMatch = doc.match(/image:\s*(\S+)/);
    if (imageMatch) {
      const image = imageMatch[1].replace(/["']/g, "");
      if (image.endsWith(":latest") || (!image.includes(":") && !image.includes("@"))) {
        issues.push({
          file: filePath,
          resource: resourceId,
          severity: "error",
          rule: "no-latest-tag",
          message: `Image "${image}" uses :latest or no tag — pin to a specific version`,
        });
      }
    }

    // Labels
    if (!doc.includes("app.kubernetes.io/name")) {
      issues.push({
        file: filePath,
        resource: resourceId,
        severity: "info",
        rule: "standard-labels",
        message: "Missing standard label app.kubernetes.io/name",
      });
    }

    // imagePullPolicy
    if (doc.includes("imagePullPolicy: Always") && !doc.includes(":latest")) {
      issues.push({
        file: filePath,
        resource: resourceId,
        severity: "info",
        rule: "pull-policy",
        message: "imagePullPolicy: Always with a pinned tag — consider IfNotPresent for faster restarts",
      });
    }
  }

  // Service checks
  if (kind === "Service") {
    if (!doc.includes("selector:")) {
      issues.push({
        file: filePath,
        resource: resourceId,
        severity: "error",
        rule: "service-selector",
        message: "Service has no selector — it won't route to any pods",
      });
    }
  }

  // Ingress checks
  if (kind === "Ingress") {
    if (!doc.includes("ingressClassName:") && !doc.includes("kubernetes.io/ingress.class")) {
      issues.push({
        file: filePath,
        resource: resourceId,
        severity: "warning",
        rule: "ingress-class",
        message: "Missing ingressClassName — set explicitly to avoid default class ambiguity",
      });
    }
  }

  // Secret checks
  if (kind === "Secret") {
    issues.push({
      file: filePath,
      resource: resourceId,
      severity: "warning",
      rule: "secret-in-git",
      message: "Plain Secret resource in a manifest file — consider SealedSecrets or external secrets",
    });
  }

  return issues;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required <path> argument");
    process.exit(1);
  }

  const files = await findManifests(target);
  const allIssues: LintIssue[] = [];
  let totalResources = 0;

  for (const filePath of files) {
    const file = Bun.file(filePath);
    if (!(await file.exists())) continue;
    const content = await file.text();

    // Skip non-Kubernetes YAML
    if (!content.includes("apiVersion:")) continue;

    const docs = content.split("---").filter((d) => d.trim());
    for (const doc of docs) {
      if (!doc.includes("kind:")) continue;
      totalResources++;
      const issues = lintResource(doc, filePath);
      allIssues.push(...issues);
    }
  }

  allIssues.sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const errorCount = allIssues.filter((i) => i.severity === "error").length;
  const warningCount = allIssues.filter((i) => i.severity === "warning").length;

  const result: ValidationResult = {
    files: files.length,
    resources: totalResources,
    issues: allIssues,
    errors: errorCount,
    warnings: warningCount,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Manifest validation: ${files.length} file(s), ${totalResources} resource(s)\n`);

    if (allIssues.length === 0) {
      console.log("OK: no issues found.");
    } else {
      console.log(`${errorCount} error(s), ${warningCount} warning(s), ${allIssues.length - errorCount - warningCount} info\n`);

      for (const issue of allIssues) {
        const label = issue.severity.toUpperCase().padEnd(7);
        console.log(`  ${label} ${issue.resource} [${issue.rule}]`);
        console.log(`  ${"".padEnd(8)} ${issue.message}`);
        if (issue.file !== target) {
          console.log(`  ${"".padEnd(8)} in ${issue.file}`);
        }
        console.log();
      }
    }
  }

  const hasErrors = strict ? (errorCount + warningCount) > 0 : errorCount > 0;
  if (hasErrors) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
