const args = Bun.argv.slice(2);

const HELP = `
split-staged — Analyze staged changes and suggest how to split them into atomic commits

Usage:
  bun run tools/split-staged.ts [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

interface StagedFile {
  status: string;
  path: string;
  directory: string;
  extension: string;
}

interface CommitGroup {
  reason: string;
  suggestedType: string;
  files: string[];
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

function categorizeFile(path: string): string {
  if (path.endsWith(".test.ts") || path.endsWith(".test.js") || path.endsWith(".spec.ts") || path.endsWith(".spec.js") || path.includes("__tests__/")) {
    return "test";
  }
  if (path.endsWith(".md") || path.startsWith("docs/")) return "docs";
  if (path.includes(".github/") || path.includes("Dockerfile") || path.includes("docker-compose") || path === ".gitignore" || path.endsWith(".toml") || path.endsWith(".yml") || path.endsWith(".yaml")) {
    if (path.includes(".github/workflows/") || path.includes("ci")) return "ci";
    return "chore";
  }
  if (path === "package.json" || path === "bun.lockb" || path === "tsconfig.json" || path === "biome.json") {
    return "chore";
  }
  return "code";
}

async function main() {
  const stagedRaw = await run(["git", "diff", "--cached", "--name-status"]);
  if (!stagedRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify({ files: [], groups: [], message: "No staged changes" }));
    } else {
      console.log("No staged changes.");
    }
    process.exit(0);
  }

  const files: StagedFile[] = [];
  for (const line of stagedRaw.split("\n")) {
    if (!line.trim()) continue;
    const [status, ...pathParts] = line.split("\t");
    const path = pathParts.join("\t").trim();
    const parts = path.split("/");
    files.push({
      status: status.trim(),
      path,
      directory: parts.length > 1 ? parts.slice(0, -1).join("/") : ".",
      extension: path.includes(".") ? path.split(".").pop()! : "",
    });
  }

  // Group files into suggested commits
  const groups: CommitGroup[] = [];
  const assigned = new Set<string>();

  // Group 1: Test files
  const testFiles = files.filter((f) => categorizeFile(f.path) === "test");
  if (testFiles.length > 0) {
    groups.push({
      reason: "Test files should be committed separately or alongside their implementation",
      suggestedType: "test",
      files: testFiles.map((f) => f.path),
    });
    testFiles.forEach((f) => assigned.add(f.path));
  }

  // Group 2: Documentation
  const docFiles = files.filter((f) => !assigned.has(f.path) && categorizeFile(f.path) === "docs");
  if (docFiles.length > 0) {
    groups.push({
      reason: "Documentation changes",
      suggestedType: "docs",
      files: docFiles.map((f) => f.path),
    });
    docFiles.forEach((f) => assigned.add(f.path));
  }

  // Group 3: CI/Config
  const ciFiles = files.filter((f) => !assigned.has(f.path) && (categorizeFile(f.path) === "ci" || categorizeFile(f.path) === "chore"));
  if (ciFiles.length > 0) {
    groups.push({
      reason: "Configuration and tooling changes",
      suggestedType: "chore",
      files: ciFiles.map((f) => f.path),
    });
    ciFiles.forEach((f) => assigned.add(f.path));
  }

  // Group 4+: Remaining code files, grouped by top-level directory
  const codeFiles = files.filter((f) => !assigned.has(f.path));
  const byTopDir: Record<string, string[]> = {};
  for (const f of codeFiles) {
    const topDir = f.path.includes("/") ? f.path.split("/")[0] : ".";
    if (!byTopDir[topDir]) byTopDir[topDir] = [];
    byTopDir[topDir].push(f.path);
  }

  for (const [dir, paths] of Object.entries(byTopDir)) {
    groups.push({
      reason: `Source changes in ${dir}/`,
      suggestedType: "feat",
      files: paths,
    });
  }

  const result = {
    totalFiles: files.length,
    suggestedCommits: groups.length,
    groups,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Staged changes: ${files.length} file(s)\n`);
    if (groups.length <= 1) {
      console.log("All staged changes can reasonably be a single commit.");
      if (groups.length === 1) {
        console.log(`Suggested type: ${groups[0].suggestedType}`);
      }
    } else {
      console.log(`Suggestion: split into ${groups.length} atomic commits:\n`);
      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        console.log(`  Commit ${i + 1}: ${g.suggestedType}: ... (${g.reason})`);
        for (const f of g.files) {
          console.log(`    ${f}`);
        }
        console.log();
      }
      console.log("To split, unstage all with `git reset HEAD`, then stage and commit each group separately.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
