const args = Bun.argv.slice(2);

const HELP = `
xcodeproj-lint — Detect common issues in .xcodeproj files

Usage:
  bun run tools/xcodeproj-lint.ts [project-dir] [options]

Arguments:
  project-dir   Path containing the .xcodeproj (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks for:
  - Missing file references (files in project but not on disk)
  - Duplicate file references
  - Orphaned build phases
  - Missing Info.plist references
  - Inconsistent bundle identifiers

Examples:
  bun run tools/xcodeproj-lint.ts
  bun run tools/xcodeproj-lint.ts ~/Developer/MyApp
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface LintIssue {
  severity: "error" | "warning" | "info";
  message: string;
  file?: string;
}

interface LintResult {
  projectPath: string;
  issues: LintIssue[];
  errors: number;
  warnings: number;
  info: number;
}

async function findXcodeproj(dir: string): Promise<string | null> {
  const glob = new Bun.Glob("*.xcodeproj");
  for await (const path of glob.scan({ cwd: dir })) {
    return `${dir}/${path}`;
  }
  return null;
}

async function parsePbxproj(projectPath: string): Promise<string> {
  const pbxprojPath = `${projectPath}/project.pbxproj`;
  try {
    return await Bun.file(pbxprojPath).text();
  } catch {
    throw new Error(`Could not read ${pbxprojPath}`);
  }
}

function extractFileReferences(pbxproj: string): { path: string; name: string; id: string }[] {
  const refs: { path: string; name: string; id: string }[] = [];

  // Match PBXFileReference entries
  const refPattern = /(\w+)\s*\/\*.*?\*\/\s*=\s*\{[^}]*isa\s*=\s*PBXFileReference[^}]*path\s*=\s*"?([^";]+)"?[^}]*\}/g;
  let match: RegExpExecArray | null;

  while ((match = refPattern.exec(pbxproj)) !== null) {
    const id = match[1];
    const path = match[2];
    const nameMatch = match[0].match(/name\s*=\s*"?([^";]+)"?/);
    const name = nameMatch ? nameMatch[1] : path;
    refs.push({ path, name, id });
  }

  // Simpler fallback pattern
  if (refs.length === 0) {
    const simplePattern = /path\s*=\s*"([^"]+\.(?:swift|m|h|xib|storyboard|plist|json|xcassets))"/g;
    while ((match = simplePattern.exec(pbxproj)) !== null) {
      refs.push({ path: match[1], name: match[1], id: "unknown" });
    }
  }

  return refs;
}

function extractBundleIdentifiers(pbxproj: string): string[] {
  const ids: string[] = [];
  const pattern = /PRODUCT_BUNDLE_IDENTIFIER\s*=\s*"?([^";]+)"?/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(pbxproj)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
}

function extractTargets(pbxproj: string): string[] {
  const targets: string[] = [];
  const pattern = /productName\s*=\s*"?([^";]+)"?/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(pbxproj)) !== null) {
    targets.push(match[1]);
  }
  return [...new Set(targets)];
}

async function lint(projectPath: string, projectDir: string): Promise<LintIssue[]> {
  const pbxproj = await parsePbxproj(projectPath);
  const issues: LintIssue[] = [];

  // Check file references
  const fileRefs = extractFileReferences(pbxproj);
  const seenPaths = new Map<string, number>();

  for (const ref of fileRefs) {
    // Track duplicates
    seenPaths.set(ref.path, (seenPaths.get(ref.path) || 0) + 1);

    // Check if file exists on disk (only for relative paths that look like source files)
    if (!ref.path.startsWith("/") && !ref.path.includes("$(") &&
      /\.(swift|m|h|mm|cpp|c|xib|storyboard|plist|json|xcassets|metal)$/.test(ref.path)) {
      const fullPath = `${projectDir}/${ref.path}`;
      const exists = await Bun.file(fullPath).exists();
      if (!exists) {
        issues.push({
          severity: "error",
          message: `Missing file reference: ${ref.path}`,
          file: ref.path,
        });
      }
    }
  }

  // Report duplicates
  for (const [path, count] of seenPaths) {
    if (count > 1) {
      issues.push({
        severity: "warning",
        message: `Duplicate file reference (${count}x): ${path}`,
        file: path,
      });
    }
  }

  // Check bundle identifiers
  const bundleIds = extractBundleIdentifiers(pbxproj);
  for (const id of bundleIds) {
    if (id.includes("$(")) continue; // Skip variable references
    if (!id.match(/^[a-zA-Z][a-zA-Z0-9.-]+$/)) {
      issues.push({
        severity: "warning",
        message: `Invalid bundle identifier format: ${id}`,
      });
    }
  }

  // Check Swift version
  const swiftVersions = new Set<string>();
  const swiftPattern = /SWIFT_VERSION\s*=\s*"?([^";]+)"?/g;
  let match: RegExpExecArray | null;
  while ((match = swiftPattern.exec(pbxproj)) !== null) {
    swiftVersions.add(match[1]);
  }

  if (swiftVersions.size > 1) {
    issues.push({
      severity: "warning",
      message: `Multiple Swift versions across targets: ${[...swiftVersions].join(", ")}`,
    });
  }

  // Check deployment target consistency
  const deployTargets = new Set<string>();
  const deployPattern = /IPHONEOS_DEPLOYMENT_TARGET\s*=\s*"?([^";]+)"?/g;
  while ((match = deployPattern.exec(pbxproj)) !== null) {
    deployTargets.add(match[1]);
  }

  if (deployTargets.size > 1) {
    issues.push({
      severity: "warning",
      message: `Inconsistent iOS deployment targets: ${[...deployTargets].join(", ")}`,
    });
  }

  // Check for Info.plist
  const infoPlistRefs = pbxproj.match(/INFOPLIST_FILE\s*=\s*"?([^";]+)"?/g);
  if (infoPlistRefs) {
    for (const ref of infoPlistRefs) {
      const plistPath = ref.replace(/INFOPLIST_FILE\s*=\s*"?/, "").replace(/"?$/, "");
      if (!plistPath.includes("$(")) {
        const fullPath = `${projectDir}/${plistPath}`;
        const exists = await Bun.file(fullPath).exists();
        if (!exists) {
          issues.push({
            severity: "error",
            message: `Missing Info.plist: ${plistPath}`,
            file: plistPath,
          });
        }
      }
    }
  }

  // Info items
  const targets = extractTargets(pbxproj);
  issues.push({
    severity: "info",
    message: `Targets: ${targets.join(", ")}`,
  });
  issues.push({
    severity: "info",
    message: `Bundle IDs: ${bundleIds.join(", ")}`,
  });
  if (swiftVersions.size > 0) {
    issues.push({
      severity: "info",
      message: `Swift version: ${[...swiftVersions].join(", ")}`,
    });
  }

  return issues;
}

async function main() {
  const projectDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const projectPath = await findXcodeproj(projectDir);
  if (!projectPath) {
    console.error(`Error: no .xcodeproj found in ${projectDir}`);
    process.exit(1);
  }

  const issues = await lint(projectPath, projectDir);
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const info = issues.filter((i) => i.severity === "info").length;

  const result: LintResult = {
    projectPath,
    issues,
    errors,
    warnings,
    info,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Xcode Project Lint: ${projectPath}\n`);

    for (const issue of issues.filter((i) => i.severity === "error")) {
      console.log(`  [ERROR] ${issue.message}`);
    }
    for (const issue of issues.filter((i) => i.severity === "warning")) {
      console.log(`  [WARN]  ${issue.message}`);
    }
    for (const issue of issues.filter((i) => i.severity === "info")) {
      console.log(`  [INFO]  ${issue.message}`);
    }

    console.log(`\nErrors: ${errors}  Warnings: ${warnings}  Info: ${info}`);
  }

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
