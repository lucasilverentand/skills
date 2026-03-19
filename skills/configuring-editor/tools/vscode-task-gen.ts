const args = Bun.argv.slice(2);

const HELP = `
vscode-task-gen — Generate tasks.json entries from package.json scripts and Makefiles

Usage:
  bun run tools/vscode-task-gen.ts [repo-dir] [options]

Arguments:
  repo-dir   Path to the project root (default: current directory)

Options:
  --output <path>  Write to a specific file (default: .vscode/tasks.json in repo)
  --merge          Merge with existing tasks.json instead of replacing
  --json           Output tasks config as JSON to stdout instead of writing
  --help           Show this help message

Examples:
  bun run tools/vscode-task-gen.ts
  bun run tools/vscode-task-gen.ts ~/Developer/my-project --merge
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const merge = args.includes("--merge");
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== outputIdx + 1
);

interface VscodeTask {
  label: string;
  type: string;
  command: string;
  group?: { kind: string; isDefault?: boolean };
  problemMatcher?: string[];
  presentation?: { reveal: string; panel: string };
}

interface TasksConfig {
  version: string;
  tasks: VscodeTask[];
}

async function readJsonSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await Bun.file(path).text();
    const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

async function fileExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

function detectPackageManager(repoDir: string): string {
  // Sync check for lock files
  const bunLock = Bun.spawnSync(["test", "-f", `${repoDir}/bun.lockb`]);
  const bunLock2 = Bun.spawnSync(["test", "-f", `${repoDir}/bun.lock`]);
  if (bunLock.exitCode === 0 || bunLock2.exitCode === 0) return "bun";

  const pnpmLock = Bun.spawnSync(["test", "-f", `${repoDir}/pnpm-lock.yaml`]);
  if (pnpmLock.exitCode === 0) return "pnpm";

  const yarnLock = Bun.spawnSync(["test", "-f", `${repoDir}/yarn.lock`]);
  if (yarnLock.exitCode === 0) return "yarn";

  return "npm";
}

function scriptToTask(
  name: string,
  script: string,
  pm: string
): VscodeTask {
  const runCmd = pm === "npm" ? `npm run ${name}` : `${pm} ${name}`;

  const task: VscodeTask = {
    label: name,
    type: "shell",
    command: runCmd,
  };

  // Assign groups based on script name
  if (name === "build" || name === "compile") {
    task.group = { kind: "build", isDefault: name === "build" };
    task.problemMatcher = ["$tsc"];
  } else if (name === "test" || name.startsWith("test:")) {
    task.group = { kind: "test", isDefault: name === "test" };
  } else if (name === "dev" || name === "start" || name === "serve") {
    task.presentation = { reveal: "always", panel: "dedicated" };
  } else if (name === "lint" || name === "check" || name === "format") {
    task.problemMatcher = ["$eslint-stylish"];
  }

  return task;
}

async function getMakefileTargets(repoDir: string): Promise<VscodeTask[]> {
  const makefilePath = `${repoDir}/Makefile`;
  if (!(await fileExists(makefilePath))) return [];

  const content = await Bun.file(makefilePath).text();
  const tasks: VscodeTask[] = [];

  // Match targets: target_name: [dependencies]
  const targetPattern = /^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/gm;
  let match: RegExpExecArray | null;

  while ((match = targetPattern.exec(content)) !== null) {
    const target = match[1];
    // Skip hidden/internal targets (starting with . or _)
    if (target.startsWith(".") || target.startsWith("_")) continue;
    // Skip common non-task targets
    if (["all", "PHONY", "FORCE"].includes(target)) continue;

    tasks.push({
      label: `make: ${target}`,
      type: "shell",
      command: `make ${target}`,
    });
  }

  return tasks;
}

async function main() {
  const repoDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const pm = detectPackageManager(repoDir);
  const tasks: VscodeTask[] = [];

  // Package.json scripts
  const pkg = await readJsonSafe(`${repoDir}/package.json`);
  if (pkg?.scripts) {
    const scripts = pkg.scripts as Record<string, string>;
    for (const [name, script] of Object.entries(scripts)) {
      tasks.push(scriptToTask(name, script, pm));
    }
  }

  // Makefile targets
  const makeTargets = await getMakefileTargets(repoDir);
  tasks.push(...makeTargets);

  if (tasks.length === 0) {
    console.error("No scripts or Makefile targets found");
    process.exit(1);
  }

  const config: TasksConfig = {
    version: "2.0.0",
    tasks,
  };

  // If merging, combine with existing
  if (merge) {
    const existingPath = outputPath || `${repoDir}/.vscode/tasks.json`;
    const existing = await readJsonSafe(existingPath);
    if (existing?.tasks && Array.isArray(existing.tasks)) {
      const existingLabels = new Set(
        (existing.tasks as VscodeTask[]).map((t) => t.label)
      );
      // Add new tasks that don't already exist
      const newTasks = tasks.filter((t) => !existingLabels.has(t.label));
      config.tasks = [...(existing.tasks as VscodeTask[]), ...newTasks];
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  const target = outputPath
    ? Bun.resolveSync(outputPath, process.cwd())
    : `${repoDir}/.vscode/tasks.json`;

  // Ensure .vscode directory exists
  const vscodeDir = target.replace(/\/tasks\.json$/, "");
  Bun.spawnSync(["mkdir", "-p", vscodeDir]);

  await Bun.write(target, JSON.stringify(config, null, 2) + "\n");

  console.log(`Generated tasks.json at ${target}`);
  console.log(`  Package manager: ${pm}`);
  console.log(`  Tasks: ${config.tasks.length}`);
  for (const task of config.tasks) {
    const group = task.group ? ` [${task.group.kind}]` : "";
    console.log(`    - ${task.label}${group}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
