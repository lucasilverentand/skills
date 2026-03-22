const args = Bun.argv.slice(2);

const HELP = `
structure-map — Generate annotated directory structure map

Usage:
  bun run tools/structure-map.ts [path] [options]

Arguments:
  path    Path to project root (default: current directory)

Options:
  --depth <n>    Max directory depth (default: 3)
  --json         Output as JSON instead of plain text
  --help         Show this help message

Generates a tree view of the project directory with:
  - Descriptions for known directory types
  - File counts per directory
  - Skips node_modules, .git, dist, and other build artifacts
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const depthIdx = args.indexOf("--depth");
const maxDepth = depthIdx !== -1 && args[depthIdx + 1] ? parseInt(args[depthIdx + 1], 10) : 3;
const filteredArgs = args.filter((a, i) => !a.startsWith("--") && (depthIdx === -1 || i !== depthIdx + 1));

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".wrangler",
  ".turbo",
  ".vercel",
  ".output",
  ".cache",
  ".parcel-cache",
  "coverage",
  "__pycache__",
  ".mypy_cache",
  ".pytest_cache",
  "target",
  ".expo",
  ".svelte-kit",
  "vendor",
]);

const DIR_DESCRIPTIONS: Record<string, string> = {
  src: "Source code",
  lib: "Library code",
  packages: "Workspace packages",
  apps: "Application packages",
  app: "Application entry point",
  api: "API routes or server",
  web: "Web application",
  test: "Test files",
  tests: "Test files",
  __tests__: "Test files",
  spec: "Test specifications",
  docs: "Documentation",
  doc: "Documentation",
  scripts: "Build and dev scripts",
  tools: "Development tooling",
  config: "Configuration",
  configs: "Configuration files",
  public: "Static assets",
  static: "Static assets",
  assets: "Asset files",
  migrations: "Database migrations",
  schema: "Database schema",
  types: "Type definitions",
  utils: "Utility functions",
  helpers: "Helper functions",
  hooks: "React hooks or git hooks",
  components: "UI components",
  ui: "UI component library",
  pages: "Page components or routes",
  routes: "Route handlers",
  views: "View templates",
  layouts: "Layout components",
  middleware: "Middleware handlers",
  services: "Service layer",
  models: "Data models",
  controllers: "Request controllers",
  auth: "Authentication",
  email: "Email templates and sending",
  workers: "Background workers",
  cron: "Scheduled tasks",
  i18n: "Internationalization",
  locales: "Translation files",
  ".github": "GitHub configuration",
  ".github/workflows": "CI/CD pipelines",
  ".vscode": "VS Code settings",
  fixtures: "Test fixtures",
  mocks: "Test mocks",
  stubs: "Test stubs",
  bin: "CLI entry points",
  cmd: "CLI commands",
  internal: "Internal packages (Go)",
  pkg: "Public packages (Go)",
  references: "Reference documentation",
  agents: "Agent definitions",
  evals: "Evaluation test cases",
};

interface DirEntry {
  name: string;
  path: string;
  description: string;
  fileCount: number;
  children: DirEntry[];
}

async function scanDir(dirPath: string, relPath: string, depth: number): Promise<DirEntry[]> {
  if (depth > maxDepth) return [];

  const entries: DirEntry[] = [];
  const items: string[] = [];

  try {
    const proc = Bun.spawnSync(["ls", "-1", dirPath]);
    const output = proc.stdout.toString().trim();
    if (output) items.push(...output.split("\n"));
  } catch {
    return [];
  }

  for (const item of items) {
    if (SKIP_DIRS.has(item)) continue;
    if (item.startsWith(".") && !DIR_DESCRIPTIONS[item]) continue;

    const fullPath = `${dirPath}/${item}`;
    const itemRelPath = relPath ? `${relPath}/${item}` : item;

    try {
      const proc = Bun.spawnSync(["test", "-d", fullPath]);
      if (proc.exitCode !== 0) continue;
    } catch {
      continue;
    }

    // Count files directly in this directory
    let fileCount = 0;
    try {
      const countProc = Bun.spawnSync(["sh", "-c", `ls -1 "${fullPath}" 2>/dev/null | wc -l`]);
      fileCount = parseInt(countProc.stdout.toString().trim(), 10) || 0;
    } catch {}

    const description = DIR_DESCRIPTIONS[itemRelPath] || DIR_DESCRIPTIONS[item] || "";
    const children = await scanDir(fullPath, itemRelPath, depth + 1);

    entries.push({
      name: item,
      path: itemRelPath,
      description,
      fileCount,
      children,
    });
  }

  return entries;
}

function renderTree(entries: DirEntry[], prefix: string = ""): string {
  const lines: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";

    let line = `${prefix}${connector}${entry.name}/`;
    if (entry.description) {
      line += `  (${entry.description})`;
    }

    lines.push(line);

    if (entry.children.length > 0) {
      lines.push(renderTree(entry.children, `${prefix}${childPrefix}`));
    }
  }

  return lines.join("\n");
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const rootName = root.split("/").pop() || root;

  const entries = await scanDir(root, "", 0);

  if (jsonOutput) {
    console.log(JSON.stringify({ root: rootName, directories: entries }, null, 2));
  } else {
    console.log(`${rootName}/`);
    console.log(renderTree(entries));
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
