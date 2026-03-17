const args = Bun.argv.slice(2);

const HELP = `
change-analyzer — Analyze uncommitted changes at hunk level and propose conventional commits

Usage:
  bun run tools/change-analyzer.ts [options]

Options:
  --json        Output as JSON instead of plain text
  --staged-only Only analyze staged changes (ignore unstaged/untracked)
  --help        Show this help message

Output:
  Groups hunks into proposed commits by conventional commit type.
  Each group includes files, hunk ranges, suggested type, scope, and message.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const stagedOnly = args.includes("--staged-only");

interface Hunk {
  file: string;
  startLine: number;
  lineCount: number;
  header: string;
  content: string;
  source: "staged" | "unstaged";
}

interface FileChange {
  path: string;
  status: string;
  hunks: Hunk[];
  isNew: boolean;
  isDeleted: boolean;
}

interface CommitProposal {
  type: string;
  scope: string | null;
  message: string;
  files: { path: string; hunks: "all" | number[] }[];
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

function classifyByPath(path: string): string {
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(path) || path.includes("__tests__/") || path.includes("test/") || path.includes("tests/")) {
    return "test";
  }
  if (/\.md$/.test(path) || path.startsWith("docs/") || path === "CHANGELOG.md") return "docs";
  if (path.includes(".github/workflows/") || path.includes("Jenkinsfile") || path.includes(".gitlab-ci")) return "ci";
  if (/^(package\.json|bun\.lockb|Cargo\.lock|yarn\.lock|pnpm-lock\.yaml|tsconfig.*\.json|biome\.json|\.eslintrc|\.prettierrc|Dockerfile|docker-compose|\.dockerignore|\.gitignore|Makefile|justfile)$/.test(path.split("/").pop() || "")) {
    return "chore";
  }
  if (path.endsWith(".yml") || path.endsWith(".yaml") || path.endsWith(".toml")) return "chore";
  return "code"; // needs further classification from content
}

function classifyCodeHunk(hunk: Hunk): string {
  const content = hunk.content.toLowerCase();
  // Bug fix signals
  if (/fix(es|ed)?[\s(:!]|bug|patch|null\s*check|off.by.one|undefined|throw\s+new\s+error|catch\s*\(|\.catch\(|error\s+handling/i.test(content)) {
    return "fix";
  }
  // Performance signals
  if (/perf(ormance)?|memo(ize)?|cache|lazy|debounce|throttle|batch|optimize/i.test(content)) {
    return "perf";
  }
  // Default: could be feat or refactor — check if new exports/functions are added
  const addedLines = content.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
  const removedLines = content.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---"));

  // If mostly additions with new function/class/export, likely feat
  const hasNewExport = addedLines.some((l) => /export\s+(default\s+)?(function|class|const|interface|type)\s/.test(l));
  const hasNewFunction = addedLines.some((l) => /^(\+\s*)(export\s+)?(async\s+)?function\s/.test(l) || /^(\+\s*)(export\s+)?const\s+\w+\s*=\s*(async\s+)?\(/.test(l));

  if (hasNewExport || (hasNewFunction && removedLines.length < addedLines.length * 0.3)) {
    return "feat";
  }

  // If roughly balanced additions/removals, likely refactor
  if (removedLines.length > 0 && addedLines.length > 0) {
    return "refactor";
  }

  // Mostly additions — probably feat
  if (addedLines.length > removedLines.length * 2) return "feat";

  return "refactor";
}

function detectScope(path: string): string | null {
  const parts = path.split("/");
  // Monorepo: packages/<name>/... or apps/<name>/...
  if ((parts[0] === "packages" || parts[0] === "apps") && parts.length > 2) {
    return parts[1];
  }
  // src/<module>/...
  if (parts[0] === "src" && parts.length > 2) {
    return parts[1];
  }
  // skills/<category>/<name>/...
  if (parts[0] === "skills" && parts.length > 3) {
    return parts[2];
  }
  return null;
}

function parseHunks(diffOutput: string, source: "staged" | "unstaged"): Hunk[] {
  const hunks: Hunk[] = [];
  let currentFile = "";
  let currentHunkHeader = "";
  let currentHunkContent = "";
  let currentStart = 0;
  let currentCount = 0;

  for (const line of diffOutput.split("\n")) {
    if (line.startsWith("diff --git")) {
      // Flush previous hunk
      if (currentFile && currentHunkContent) {
        hunks.push({ file: currentFile, startLine: currentStart, lineCount: currentCount, header: currentHunkHeader, content: currentHunkContent, source });
      }
      currentHunkContent = "";
      currentHunkHeader = "";
    } else if (line.startsWith("+++ b/")) {
      currentFile = line.substring(6);
    } else if (line.startsWith("@@ ")) {
      // Flush previous hunk in same file
      if (currentFile && currentHunkContent) {
        hunks.push({ file: currentFile, startLine: currentStart, lineCount: currentCount, header: currentHunkHeader, content: currentHunkContent, source });
      }
      currentHunkHeader = line;
      currentHunkContent = line + "\n";
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      currentStart = match ? parseInt(match[1]) : 0;
      currentCount = match && match[2] ? parseInt(match[2]) : 1;
    } else if (currentHunkHeader) {
      currentHunkContent += line + "\n";
    }
  }

  // Flush last hunk
  if (currentFile && currentHunkContent) {
    hunks.push({ file: currentFile, startLine: currentStart, lineCount: currentCount, header: currentHunkHeader, content: currentHunkContent, source });
  }

  return hunks;
}

function generateMessage(type: string, scope: string | null, files: { path: string }[]): string {
  const scopeStr = scope ? `(${scope})` : "";
  const fileNames = files.map((f) => f.path.split("/").pop()!.replace(/\.[^.]+$/, ""));
  const unique = [...new Set(fileNames)];

  if (type === "test") return `${type}${scopeStr}: add tests for ${unique.slice(0, 3).join(", ")}`;
  if (type === "docs") return `${type}${scopeStr}: update ${unique.slice(0, 3).join(", ")}`;
  if (type === "chore") return `${type}${scopeStr}: update ${unique.slice(0, 3).join(", ")}`;
  if (type === "fix") return `${type}${scopeStr}: fix issue in ${unique.slice(0, 2).join(", ")}`;
  if (type === "perf") return `${type}${scopeStr}: optimize ${unique.slice(0, 2).join(", ")}`;
  if (type === "feat") return `${type}${scopeStr}: add ${unique.slice(0, 2).join(", ")}`;
  return `${type}${scopeStr}: update ${unique.slice(0, 3).join(", ")}`;
}

async function main() {
  // Gather all changes
  const [stagedDiff, unstagedDiff, untrackedRaw] = await Promise.all([
    run(["git", "diff", "--cached", "-U3"]),
    stagedOnly ? Promise.resolve("") : run(["git", "diff", "-U3"]),
    stagedOnly ? Promise.resolve("") : run(["git", "ls-files", "--others", "--exclude-standard"]),
  ]);

  const stagedHunks = parseHunks(stagedDiff, "staged");
  const unstagedHunks = parseHunks(unstagedDiff, "unstaged");
  const allHunks = [...stagedHunks, ...unstagedHunks];

  const untrackedFiles = untrackedRaw ? untrackedRaw.split("\n").filter(Boolean) : [];

  if (allHunks.length === 0 && untrackedFiles.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ proposals: [], message: "No changes to analyze" }));
    } else {
      console.log("No changes to analyze.");
    }
    process.exit(0);
  }

  // Classify each hunk
  const classified: { hunk: Hunk | null; file: string; type: string; scope: string | null; isUntracked: boolean }[] = [];

  for (const hunk of allHunks) {
    const pathType = classifyByPath(hunk.file);
    const type = pathType === "code" ? classifyCodeHunk(hunk) : pathType === "ci" ? "chore" : pathType;
    classified.push({ hunk, file: hunk.file, type, scope: detectScope(hunk.file), isUntracked: false });
  }

  for (const file of untrackedFiles) {
    const pathType = classifyByPath(file);
    const type = pathType === "code" ? "feat" : pathType === "ci" ? "chore" : pathType;
    classified.push({ hunk: null, file, type, scope: detectScope(file), isUntracked: true });
  }

  // Group by (type, scope) into proposals
  const groupKey = (c: { type: string; scope: string | null }) => `${c.type}:${c.scope || ""}`;
  const groups = new Map<string, typeof classified>();

  for (const c of classified) {
    const key = groupKey(c);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }

  // Build proposals
  const typeOrder = ["refactor", "feat", "fix", "perf", "test", "docs", "chore"];
  const proposals: CommitProposal[] = [];

  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const typeA = a.split(":")[0];
    const typeB = b.split(":")[0];
    return typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
  });

  for (const key of sortedKeys) {
    const items = groups.get(key)!;
    const type = items[0].type;
    const scope = items[0].scope;

    // Group hunks by file
    const fileMap = new Map<string, number[]>();
    for (const item of items) {
      if (!fileMap.has(item.file)) fileMap.set(item.file, []);
      if (item.hunk) {
        fileMap.get(item.file)!.push(item.hunk.startLine);
      }
    }

    // Determine if all hunks in a file belong to this group
    const files: { path: string; hunks: "all" | number[] }[] = [];
    for (const [path, hunkStarts] of fileMap) {
      const totalHunksForFile = allHunks.filter((h) => h.file === path).length;
      const isUntracked = items.some((i) => i.file === path && i.isUntracked);
      if (isUntracked || hunkStarts.length >= totalHunksForFile) {
        files.push({ path, hunks: "all" });
      } else {
        files.push({ path, hunks: hunkStarts });
      }
    }

    proposals.push({
      type,
      scope,
      message: generateMessage(type, scope, files),
      files,
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ proposals, totalHunks: allHunks.length, untrackedFiles: untrackedFiles.length }, null, 2));
  } else {
    console.log(`Analyzed: ${allHunks.length} hunks + ${untrackedFiles.length} untracked files\n`);
    console.log(`Proposed commits (${proposals.length}):\n`);
    for (let i = 0; i < proposals.length; i++) {
      const p = proposals[i];
      console.log(`  ${i + 1}. ${p.message}`);
      for (const f of p.files) {
        const hunkInfo = f.hunks === "all" ? "(all)" : `(hunks at lines ${(f.hunks as number[]).join(", ")})`;
        console.log(`     - ${f.path} ${hunkInfo}`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
