const args = Bun.argv.slice(2);

const HELP = `
dockerfile-lint — Check Dockerfiles for common anti-patterns and best practices

Usage:
  bun run tools/dockerfile-lint.ts [path] [options]

Arguments:
  [path]  Path to Dockerfile (default: ./Dockerfile)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));
const dockerfilePath = filteredArgs[0] || "Dockerfile";

interface LintIssue {
  line: number;
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
}

async function main() {
  const file = Bun.file(dockerfilePath);
  if (!(await file.exists())) {
    console.error(`Error: file not found: ${dockerfilePath}`);
    process.exit(1);
  }

  const content = await file.text();
  const lines = content.split("\n");
  const issues: LintIssue[] = [];

  let hasUser = false;
  let hasHealthcheck = false;
  let lastFromTag = "";
  let fromCount = 0;
  let hasDockerignore = false;

  // Check for .dockerignore
  const ignoreFile = Bun.file(dockerfilePath.replace(/Dockerfile[^/]*$/, ".dockerignore"));
  hasDockerignore = await ignoreFile.exists();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Skip comments and empty lines
    if (!line || line.startsWith("#")) continue;

    // Check FROM
    if (line.startsWith("FROM ")) {
      fromCount++;
      const parts = line.split(/\s+/);
      const image = parts[1] || "";

      if (image.endsWith(":latest")) {
        issues.push({
          line: lineNum,
          severity: "error",
          rule: "no-latest-tag",
          message: "Do not use :latest tag — pin to a specific version",
        });
      } else if (!image.includes(":") && !image.includes("@")) {
        issues.push({
          line: lineNum,
          severity: "warning",
          rule: "pin-image-version",
          message: "Image has no tag or digest — pin to a specific version",
        });
      }

      lastFromTag = image;
    }

    // Check for USER
    if (line.startsWith("USER ")) {
      hasUser = true;
    }

    // Check for HEALTHCHECK
    if (line.startsWith("HEALTHCHECK ")) {
      hasHealthcheck = true;
    }

    // Check for ADD when COPY would work
    if (line.startsWith("ADD ") && !line.includes("http://") && !line.includes("https://") && !line.includes(".tar") && !line.includes(".gz")) {
      issues.push({
        line: lineNum,
        severity: "warning",
        rule: "prefer-copy",
        message: "Use COPY instead of ADD for local files — ADD has unexpected behaviors with archives and URLs",
      });
    }

    // Check for secrets in ENV or ARG
    const secretPatterns = ["PASSWORD", "SECRET", "TOKEN", "API_KEY", "PRIVATE_KEY"];
    if ((line.startsWith("ENV ") || line.startsWith("ARG ")) && line.includes("=")) {
      for (const pattern of secretPatterns) {
        if (line.toUpperCase().includes(pattern) && !line.endsWith("=")) {
          issues.push({
            line: lineNum,
            severity: "error",
            rule: "no-secrets-in-image",
            message: `Possible secret in ${line.startsWith("ENV") ? "ENV" : "ARG"} — inject secrets at runtime, not build time`,
          });
        }
      }
    }

    // Check for COPY .env
    if (line.match(/^COPY\s+.*\.env/)) {
      issues.push({
        line: lineNum,
        severity: "error",
        rule: "no-env-copy",
        message: "Do not COPY .env files into the image — inject secrets at runtime",
      });
    }

    // Check for running as root (apt-get without USER switch after)
    if (line.match(/^RUN\s+.*apt-get\s+install/) && !line.includes("--no-install-recommends")) {
      issues.push({
        line: lineNum,
        severity: "info",
        rule: "apt-no-recommends",
        message: "Add --no-install-recommends to apt-get install to reduce image size",
      });
    }

    // Check for missing cleanup after apt-get
    if (line.match(/^RUN\s+.*apt-get\s+install/) && !line.includes("rm -rf /var/lib/apt/lists")) {
      issues.push({
        line: lineNum,
        severity: "info",
        rule: "apt-clean-lists",
        message: "Add && rm -rf /var/lib/apt/lists/* after apt-get install to reduce layer size",
      });
    }

    // Check for WORKDIR with relative path
    if (line.startsWith("WORKDIR ") && !line.split(/\s+/)[1]?.startsWith("/")) {
      issues.push({
        line: lineNum,
        severity: "warning",
        rule: "absolute-workdir",
        message: "Use an absolute path for WORKDIR",
      });
    }

    // Check for multiple CMD/ENTRYPOINT
    if (line.startsWith("CMD ") || line.startsWith("ENTRYPOINT ")) {
      // This is fine in multi-stage, but warn if same stage
    }
  }

  // Post-analysis checks
  if (!hasUser) {
    issues.push({
      line: lines.length,
      severity: "warning",
      rule: "non-root-user",
      message: "No USER instruction — container will run as root. Add USER in the final stage",
    });
  }

  if (!hasHealthcheck && fromCount > 0) {
    issues.push({
      line: lines.length,
      severity: "info",
      rule: "add-healthcheck",
      message: "No HEALTHCHECK instruction — consider adding one for production images",
    });
  }

  if (!hasDockerignore) {
    issues.push({
      line: 0,
      severity: "warning",
      rule: "add-dockerignore",
      message: "No .dockerignore file found — create one to exclude node_modules, .git, tests, etc.",
    });
  }

  if (fromCount === 1 && content.includes("npm install") || content.includes("bun install") || content.includes("yarn install")) {
    if (!content.includes("--production") && !content.includes("--frozen-lockfile")) {
      issues.push({
        line: 0,
        severity: "info",
        rule: "multi-stage-build",
        message: "Consider a multi-stage build to separate build dependencies from the runtime image",
      });
    }
  }

  // Sort by severity then line
  const severityOrder = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.line - b.line);

  if (jsonOutput) {
    console.log(JSON.stringify({
      file: dockerfilePath,
      issues,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    }, null, 2));
  } else {
    if (issues.length === 0) {
      console.log(`OK: ${dockerfilePath} — no issues found`);
    } else {
      const errors = issues.filter((i) => i.severity === "error").length;
      const warnings = issues.filter((i) => i.severity === "warning").length;

      console.log(`${dockerfilePath}: ${errors} error(s), ${warnings} warning(s), ${issues.length - errors - warnings} info\n`);
      for (const issue of issues) {
        const label = issue.severity.toUpperCase().padEnd(7);
        const loc = issue.line > 0 ? `L${issue.line}` : "    ";
        console.log(`  ${label} ${loc.padEnd(5)} [${issue.rule}] ${issue.message}`);
      }
    }
  }

  const hasErrors = issues.some((i) => i.severity === "error");
  if (hasErrors) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
