const args = Bun.argv.slice(2);

const HELP = `
contrib-gen — Scaffold a CONTRIBUTING.md based on repo tooling, test runner, and branch strategy

Usage:
  bun run tools/contrib-gen.ts [repo-dir] [options]

Arguments:
  repo-dir   Path to the repository root (default: current directory)

Options:
  --output <path>  Write to a specific file (default: CONTRIBUTING.md in repo root)
  --json           Output detected config as JSON instead of generating the file
  --help           Show this help message

Examples:
  bun run tools/contrib-gen.ts
  bun run tools/contrib-gen.ts ~/Developer/my-project
  bun run tools/contrib-gen.ts . --json
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

interface RepoConfig {
  packageManager: string;
  runtime: string;
  testRunner: string;
  linter: string;
  formatter: string;
  hasTypeScript: boolean;
  hasCi: boolean;
  ciTool: string | null;
  branchStrategy: string;
  commitConvention: string | null;
  scripts: Record<string, string>;
}

async function fileExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function readJsonSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await Bun.file(path).text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function detectConfig(repoDir: string): Promise<RepoConfig> {
  const config: RepoConfig = {
    packageManager: "npm",
    runtime: "node",
    testRunner: "unknown",
    linter: "none",
    formatter: "none",
    hasTypeScript: false,
    hasCi: false,
    ciTool: null,
    branchStrategy: "feature-branch",
    commitConvention: null,
    scripts: {},
  };

  // Detect package manager
  if (await fileExists(`${repoDir}/bun.lockb`) || await fileExists(`${repoDir}/bun.lock`)) {
    config.packageManager = "bun";
    config.runtime = "bun";
  } else if (await fileExists(`${repoDir}/pnpm-lock.yaml`)) {
    config.packageManager = "pnpm";
  } else if (await fileExists(`${repoDir}/yarn.lock`)) {
    config.packageManager = "yarn";
  }

  // Read package.json
  const pkg = await readJsonSafe(`${repoDir}/package.json`);
  if (pkg) {
    const scripts = (pkg.scripts || {}) as Record<string, string>;
    config.scripts = scripts;

    // Detect test runner
    if (scripts.test?.includes("bun test") || scripts.test?.includes("bun:test")) {
      config.testRunner = "bun test";
    } else if (scripts.test?.includes("vitest")) {
      config.testRunner = "vitest";
    } else if (scripts.test?.includes("jest")) {
      config.testRunner = "jest";
    } else if (scripts.test?.includes("playwright")) {
      config.testRunner = "playwright";
    } else if (scripts.test) {
      config.testRunner = scripts.test;
    }

    // Detect linter/formatter
    const devDeps = { ...(pkg.devDependencies || {}), ...(pkg.dependencies || {}) } as Record<string, string>;
    if (devDeps["@biomejs/biome"] || await fileExists(`${repoDir}/biome.json`) || await fileExists(`${repoDir}/biome.jsonc`)) {
      config.linter = "biome";
      config.formatter = "biome";
    } else {
      if (devDeps.eslint) config.linter = "eslint";
      if (devDeps.prettier) config.formatter = "prettier";
    }
  }

  // TypeScript
  config.hasTypeScript = await fileExists(`${repoDir}/tsconfig.json`);

  // CI
  if (await fileExists(`${repoDir}/.github/workflows`)) {
    config.hasCi = true;
    config.ciTool = "GitHub Actions";
  } else if (await fileExists(`${repoDir}/.gitlab-ci.yml`)) {
    config.hasCi = true;
    config.ciTool = "GitLab CI";
  }

  // Commit convention
  if (await fileExists(`${repoDir}/.commitlintrc.json`) || await fileExists(`${repoDir}/commitlint.config.js`)) {
    config.commitConvention = "conventional-commits";
  } else {
    // Check recent commits for conventional commit pattern
    try {
      const proc = Bun.spawnSync(["git", "log", "--oneline", "-20"], { cwd: repoDir });
      const log = proc.stdout.toString();
      const conventionalPattern = /^[a-f0-9]+ (feat|fix|refactor|test|docs|chore|ci|style|perf|build|revert)(\(.+\))?:/m;
      if (conventionalPattern.test(log)) {
        config.commitConvention = "conventional-commits";
      }
    } catch {
      // Not a git repo or git not available
    }
  }

  return config;
}

function generateContributing(config: RepoConfig, repoDir: string): string {
  const pm = config.packageManager;
  const run = pm === "npm" ? "npm run" : pm;

  const sections: string[] = [];

  sections.push("# Contributing\n");
  sections.push("Thank you for your interest in contributing! This guide will help you get started.\n");

  // Prerequisites
  sections.push("## Prerequisites\n");
  const prereqs: string[] = [];
  if (config.runtime === "bun") {
    prereqs.push("- [Bun](https://bun.sh) (latest version)");
  } else {
    prereqs.push("- [Node.js](https://nodejs.org) (check `.nvmrc` or `package.json` engines for version)");
  }
  prereqs.push("- [Git](https://git-scm.com)");
  sections.push(prereqs.join("\n") + "\n");

  // Setup
  sections.push("## Getting Started\n");
  sections.push("```bash");
  sections.push("# Clone the repository");
  sections.push("git clone <repo-url>");
  sections.push("cd <project-name>\n");
  sections.push("# Install dependencies");
  sections.push(`${pm} install\n`);
  if (config.scripts.dev) {
    sections.push("# Start development server");
    sections.push(`${run} dev`);
  }
  sections.push("```\n");

  // Branching
  sections.push("## Branching Strategy\n");
  sections.push("- Create feature branches from `main`");
  sections.push("- Branch naming: `feat/<description>`, `fix/<description>`, `refactor/<description>`");
  sections.push("- Keep branches focused — one feature or fix per branch\n");

  // Commits
  sections.push("## Commit Conventions\n");
  if (config.commitConvention === "conventional-commits") {
    sections.push("This project uses [Conventional Commits](https://www.conventionalcommits.org/).\n");
    sections.push("Format: `<type>(<scope>): <description>`\n");
    sections.push("Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `perf`\n");
    sections.push("Examples:");
    sections.push("```");
    sections.push("feat(auth): add password reset flow");
    sections.push("fix(api): handle null response from external service");
    sections.push("refactor: extract validation into shared module");
    sections.push("```\n");
  } else {
    sections.push("Write clear, concise commit messages that explain what changed and why.\n");
  }

  // Code style
  if (config.linter !== "none" || config.formatter !== "none") {
    sections.push("## Code Style\n");
    if (config.linter === "biome" && config.formatter === "biome") {
      sections.push("This project uses [Biome](https://biomejs.dev/) for linting and formatting.\n");
      sections.push("```bash");
      sections.push(`${run} check    # lint + format check`);
      sections.push("```\n");
    } else {
      if (config.linter === "eslint") {
        sections.push(`- Linting: ESLint (\`${run} lint\`)`);
      }
      if (config.formatter === "prettier") {
        sections.push(`- Formatting: Prettier (\`${run} format\`)`);
      }
      sections.push("");
    }
  }

  // Testing
  sections.push("## Testing\n");
  sections.push("```bash");
  if (config.scripts.test) {
    sections.push(`${run} test`);
  } else {
    sections.push(`${config.testRunner}`);
  }
  sections.push("```\n");
  sections.push("- Write tests for new features and bug fixes");
  sections.push("- Ensure all existing tests pass before submitting a PR\n");

  // PR process
  sections.push("## Pull Requests\n");
  sections.push("1. Create a feature branch from `main`");
  sections.push("2. Make your changes with clear commits");
  sections.push("3. Ensure tests pass and linting is clean");
  sections.push("4. Open a pull request against `main`");
  sections.push("5. Fill out the PR template — describe what changed and why");
  sections.push("6. Wait for review — address feedback promptly\n");

  return sections.join("\n");
}

async function main() {
  const repoDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const config = await detectConfig(repoDir);

  if (jsonOutput) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  const content = generateContributing(config, repoDir);
  const target = outputPath || `${repoDir}/CONTRIBUTING.md`;

  await Bun.write(target, content);
  console.log(`Generated CONTRIBUTING.md at ${target}`);
  console.log(`\nDetected config:`);
  console.log(`  Package manager: ${config.packageManager}`);
  console.log(`  Runtime: ${config.runtime}`);
  console.log(`  Test runner: ${config.testRunner}`);
  console.log(`  Linter: ${config.linter}`);
  console.log(`  Formatter: ${config.formatter}`);
  console.log(`  TypeScript: ${config.hasTypeScript}`);
  console.log(`  CI: ${config.hasCi ? config.ciTool : "none"}`);
  console.log(`  Commit convention: ${config.commitConvention || "none detected"}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
