const args = Bun.argv.slice(2);

const HELP = `
dep-diff — Compare dependencies between current branch and a base branch

Detects added, removed, and changed dependencies across package.json,
Cargo.toml, pyproject.toml, and go.mod. Outputs a markdown table suitable
for pasting into a PR description.

Usage:
  bun run tools/dep-diff.ts [options]

Options:
  --base <branch>  Base branch to compare against (default: main)
  --json           Output as JSON instead of markdown table
  --help           Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const baseBranch = args.includes("--base")
  ? args[args.indexOf("--base") + 1] || "main"
  : "main";

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

async function getFileAtRef(ref: string, path: string): Promise<string | null> {
  try {
    const result = await run(["git", "show", `${ref}:${path}`]);
    return result || null;
  } catch {
    return null;
  }
}

interface DepChange {
  name: string;
  action: "added" | "removed" | "changed";
  oldVersion?: string;
  newVersion?: string;
  group: string; // e.g. "dependencies", "devDependencies"
  file: string;
}

async function diffPackageJson(base: string): Promise<DepChange[]> {
  const changes: DepChange[] = [];

  // Find all package.json files that changed
  const diffFiles = await run([
    "git",
    "diff",
    "--name-only",
    `origin/${base}...HEAD`,
    "--",
    "**/package.json",
    "package.json",
  ]);

  if (!diffFiles) return changes;

  const files = diffFiles.split("\n").filter(Boolean);

  for (const file of files) {
    const baseContent = await getFileAtRef(`origin/${base}`, file);
    const headContent = await getFileAtRef("HEAD", file);

    const basePkg = baseContent ? JSON.parse(baseContent) : {};
    const headPkg = headContent ? JSON.parse(headContent) : {};

    for (const group of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      const baseDeps: Record<string, string> = basePkg[group] || {};
      const headDeps: Record<string, string> = headPkg[group] || {};

      const allKeys = new Set([...Object.keys(baseDeps), ...Object.keys(headDeps)]);

      for (const name of allKeys) {
        const oldVer = baseDeps[name];
        const newVer = headDeps[name];

        if (!oldVer && newVer) {
          changes.push({ name, action: "added", newVersion: newVer, group, file });
        } else if (oldVer && !newVer) {
          changes.push({ name, action: "removed", oldVersion: oldVer, group, file });
        } else if (oldVer !== newVer) {
          changes.push({ name, action: "changed", oldVersion: oldVer, newVersion: newVer, group, file });
        }
      }
    }
  }

  return changes;
}

async function diffCargoToml(base: string): Promise<DepChange[]> {
  const changes: DepChange[] = [];

  const diffFiles = await run([
    "git",
    "diff",
    "--name-only",
    `origin/${base}...HEAD`,
    "--",
    "**/Cargo.toml",
    "Cargo.toml",
  ]);

  if (!diffFiles) return changes;

  const files = diffFiles.split("\n").filter(Boolean);

  for (const file of files) {
    const baseDiff = await run([
      "git",
      "diff",
      `origin/${base}...HEAD`,
      "--",
      file,
    ]);

    if (!baseDiff) continue;

    // Parse added/removed dependency lines from the diff
    const lines = baseDiff.split("\n");
    let currentSection = "";

    for (const line of lines) {
      const sectionMatch = line.match(/^[+-]\[(.+)\]/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        continue;
      }

      if (!currentSection.includes("dependencies")) continue;

      const depMatch = line.match(/^([+-])\s*(\S+)\s*=\s*"?([^"}\s]+)"?/);
      if (depMatch) {
        const [, prefix, name, version] = depMatch;
        if (prefix === "+") {
          changes.push({
            name,
            action: "added",
            newVersion: version,
            group: currentSection,
            file,
          });
        } else if (prefix === "-") {
          changes.push({
            name,
            action: "removed",
            oldVersion: version,
            group: currentSection,
            file,
          });
        }
      }
    }
  }

  return changes;
}

async function diffGoMod(base: string): Promise<DepChange[]> {
  const changes: DepChange[] = [];

  const diffOutput = await run([
    "git",
    "diff",
    `origin/${base}...HEAD`,
    "--",
    "go.mod",
    "**/go.mod",
  ]);

  if (!diffOutput) return changes;

  const lines = diffOutput.split("\n");
  for (const line of lines) {
    const match = line.match(/^([+-])\t(\S+)\s+(\S+)/);
    if (match) {
      const [, prefix, name, version] = match;
      if (prefix === "+") {
        changes.push({
          name,
          action: "added",
          newVersion: version,
          group: "require",
          file: "go.mod",
        });
      } else if (prefix === "-") {
        changes.push({
          name,
          action: "removed",
          oldVersion: version,
          group: "require",
          file: "go.mod",
        });
      }
    }
  }

  return changes;
}

function formatMarkdownTable(changes: DepChange[]): string {
  if (changes.length === 0) return "No dependency changes detected.";

  const lines = [
    "| Package | Change | Version | Group |",
    "|---------|--------|---------|-------|",
  ];

  // Sort: added first, then changed, then removed
  const order = { added: 0, changed: 1, removed: 2 };
  const sorted = [...changes].sort((a, b) => order[a.action] - order[b.action]);

  for (const dep of sorted) {
    let version: string;
    if (dep.action === "added") {
      version = dep.newVersion || "—";
    } else if (dep.action === "removed") {
      version = `~~${dep.oldVersion}~~`;
    } else {
      version = `${dep.oldVersion} → ${dep.newVersion}`;
    }

    lines.push(
      `| \`${dep.name}\` | ${dep.action} | ${version} | ${dep.group} |`,
    );
  }

  return lines.join("\n");
}

async function main() {
  const allChanges: DepChange[] = [];

  const [pkgChanges, cargoChanges, goChanges] = await Promise.all([
    diffPackageJson(baseBranch),
    diffCargoToml(baseBranch),
    diffGoMod(baseBranch),
  ]);

  allChanges.push(...pkgChanges, ...cargoChanges, ...goChanges);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          total: allChanges.length,
          changes: allChanges,
        },
        null,
        2,
      ),
    );
  } else {
    if (allChanges.length === 0) {
      console.log("No dependency changes detected.");
    } else {
      console.log(formatMarkdownTable(allChanges));
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
