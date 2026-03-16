const args = Bun.argv.slice(2);

const HELP = `
readme-gen — Scaffold a README from package.json, tsconfig, and directory structure

Usage:
  bun run tools/readme-gen.ts [repo-dir] [options]

Arguments:
  repo-dir   Path to the project root (default: current directory)

Options:
  --output <path>  Write to a specific file (default: README.md in repo root)
  --json           Output detected context as JSON instead of generating the file
  --help           Show this help message

Examples:
  bun run tools/readme-gen.ts
  bun run tools/readme-gen.ts ~/Developer/my-lib
  bun run tools/readme-gen.ts . --json
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== outputIdx + 1
);

interface ProjectContext {
  name: string;
  description: string;
  version: string;
  license: string;
  packageManager: string;
  isMonorepo: boolean;
  hasTypeScript: boolean;
  hasCli: boolean;
  scripts: Record<string, string>;
  entryPoints: string[];
  hasTests: boolean;
  hasCi: boolean;
  isPrivate: boolean;
}

async function readJsonSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await Bun.file(path).text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function fileExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function detectContext(repoDir: string): Promise<ProjectContext> {
  const pkg = await readJsonSafe(`${repoDir}/package.json`);

  const context: ProjectContext = {
    name: (pkg?.name as string) || repoDir.split("/").pop() || "project",
    description: (pkg?.description as string) || "",
    version: (pkg?.version as string) || "0.0.0",
    license: (pkg?.license as string) || "",
    packageManager: "npm",
    isMonorepo: false,
    hasTypeScript: false,
    hasCli: false,
    scripts: {},
    entryPoints: [],
    hasTests: false,
    hasCi: false,
    isPrivate: !!(pkg?.private),
  };

  if (pkg) {
    context.scripts = (pkg.scripts || {}) as Record<string, string>;
    context.hasCli = !!(pkg.bin);
    context.hasTests = !!context.scripts.test;
    context.isMonorepo = !!(pkg.workspaces);
  }

  // Package manager
  if (await fileExists(`${repoDir}/bun.lockb`) || await fileExists(`${repoDir}/bun.lock`)) {
    context.packageManager = "bun";
  } else if (await fileExists(`${repoDir}/pnpm-lock.yaml`)) {
    context.packageManager = "pnpm";
  } else if (await fileExists(`${repoDir}/yarn.lock`)) {
    context.packageManager = "yarn";
  }

  // TypeScript
  context.hasTypeScript = await fileExists(`${repoDir}/tsconfig.json`);

  // CI
  context.hasCi = await fileExists(`${repoDir}/.github/workflows`);

  // Entry points
  if (pkg?.main) context.entryPoints.push(pkg.main as string);
  if (pkg?.module) context.entryPoints.push(pkg.module as string);
  if (pkg?.exports) context.entryPoints.push("(exports map)");

  return context;
}

function generateReadme(ctx: ProjectContext): string {
  const sections: string[] = [];
  const pm = ctx.packageManager;
  const installCmd = ctx.isPrivate
    ? `${pm} install`
    : pm === "npm"
      ? `npm install ${ctx.name}`
      : `${pm} add ${ctx.name}`;

  // Title and description
  sections.push(`# ${ctx.name}\n`);
  if (ctx.description) {
    sections.push(`${ctx.description}\n`);
  } else {
    sections.push(`<!-- Add a one-line description of what this project does -->\n`);
  }

  // Install
  if (!ctx.isPrivate) {
    sections.push("## Install\n");
    sections.push("```bash");
    sections.push(installCmd);
    sections.push("```\n");
  }

  // Quick start
  sections.push("## Quick Start\n");
  if (ctx.isPrivate) {
    sections.push("```bash");
    sections.push("# Clone and install");
    sections.push(`git clone <repo-url>`);
    sections.push(`cd ${ctx.name}`);
    sections.push(`${pm} install\n`);
    if (ctx.scripts.dev) {
      sections.push("# Start development");
      sections.push(`${pm === "npm" ? "npm run" : pm} dev`);
    }
    sections.push("```\n");
  } else if (ctx.hasCli) {
    sections.push("```bash");
    sections.push(`npx ${ctx.name} --help`);
    sections.push("```\n");
  } else {
    sections.push("```ts");
    sections.push(`import { /* ... */ } from "${ctx.name}";`);
    sections.push("");
    sections.push("// TODO: Add a working example");
    sections.push("```\n");
  }

  // Usage / scripts
  if (Object.keys(ctx.scripts).length > 0) {
    sections.push("## Development\n");
    sections.push("| Command | Description |");
    sections.push("|---------|-------------|");
    const run = pm === "npm" ? "npm run" : pm;
    for (const [name, script] of Object.entries(ctx.scripts)) {
      // Truncate long scripts
      const desc = script.length > 60 ? script.slice(0, 57) + "..." : script;
      sections.push(`| \`${run} ${name}\` | \`${desc}\` |`);
    }
    sections.push("");
  }

  // Configuration
  sections.push("## Configuration\n");
  sections.push("<!-- Document key configuration options, environment variables, or config files -->\n");

  // Contributing
  sections.push("## Contributing\n");
  if (ctx.isPrivate) {
    sections.push("<!-- Add contribution guidelines or link to CONTRIBUTING.md -->\n");
  } else {
    sections.push("See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.\n");
  }

  // License
  if (ctx.license) {
    sections.push("## License\n");
    sections.push(`${ctx.license}\n`);
  }

  return sections.join("\n");
}

async function main() {
  const repoDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const ctx = await detectContext(repoDir);

  if (jsonOutput) {
    console.log(JSON.stringify(ctx, null, 2));
    return;
  }

  const content = generateReadme(ctx);
  const target = outputPath
    ? Bun.resolveSync(outputPath, process.cwd())
    : `${repoDir}/README.md`;

  await Bun.write(target, content);
  console.log(`Generated README at ${target}`);
  console.log(`\nProject: ${ctx.name}`);
  console.log(`Package manager: ${ctx.packageManager}`);
  console.log(`TypeScript: ${ctx.hasTypeScript}`);
  console.log(`Monorepo: ${ctx.isMonorepo}`);
  console.log(`CLI: ${ctx.hasCli}`);
  console.log(`\nReview the README and fill in the TODO sections.`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
