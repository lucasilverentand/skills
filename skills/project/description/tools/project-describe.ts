const args = Bun.argv.slice(2);

const HELP = `
project-describe — Generate a comprehensive project description

Usage:
  bun run tools/project-describe.ts [path] [options]

Arguments:
  path    Path to project root (default: current directory)

Options:
  --json           Output as JSON instead of plain text
  --section <name> Only output a specific section
                   (name, stack, architecture, structure, deps, setup, ci, config)
  --help           Show this help message

Scans the project root and assembles a full profile covering:
  name, purpose, tech stack, architecture, directory structure,
  dependencies, dev setup, CI/CD, and configuration.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const sectionIdx = args.indexOf("--section");
const sectionFilter = sectionIdx !== -1 ? args[sectionIdx + 1] || null : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (sectionIdx === -1 || i !== sectionIdx + 1)
);

async function exists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function readTextSafe(path: string): Promise<string | null> {
  try {
    if (!(await exists(path))) return null;
    return await Bun.file(path).text();
  } catch {
    return null;
  }
}

async function readJsonSafe(path: string): Promise<Record<string, any> | null> {
  try {
    if (!(await exists(path))) return null;
    return await Bun.file(path).json();
  } catch {
    return null;
  }
}

function extractFirstParagraph(text: string): string {
  const lines = text.split("\n");
  const paragraphLines: string[] = [];
  let started = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip headings, badges, and empty lines at the start
    if (!started) {
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("[!") || trimmed.startsWith("![") || trimmed.startsWith("<!--")) {
        continue;
      }
      started = true;
    }
    if (started) {
      if (!trimmed) break;
      paragraphLines.push(trimmed);
    }
  }

  return paragraphLines.join(" ").slice(0, 500);
}

interface ProjectDescription {
  name: string;
  description: string;
  purpose: string;
  type: "monorepo" | "standalone";
  techStack: {
    runtime: string[];
    language: string[];
    packageManager: string | null;
    frameworks: string[];
    testing: string[];
    linting: string[];
    deployment: string[];
  };
  architecture: {
    type: string;
    workspaceCount: number;
    workspaces: string[];
    entryPoints: string[];
  };
  directories: Array<{ name: string; description: string }>;
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
    internal: string[];
  };
  scripts: Record<string, string>;
  ci: Array<{ file: string; name: string }>;
  config: {
    envFiles: string[];
    configFiles: string[];
  };
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const pkg = await readJsonSafe(`${root}/package.json`);
  const readme = await readTextSafe(`${root}/README.md`);
  const tsconfig = await readJsonSafe(`${root}/tsconfig.json`);

  const result: ProjectDescription = {
    name: pkg?.name || root.split("/").pop() || "unknown",
    description: pkg?.description || "",
    purpose: readme ? extractFirstParagraph(readme) : "",
    type: "standalone",
    techStack: {
      runtime: [],
      language: [],
      packageManager: null,
      frameworks: [],
      testing: [],
      linting: [],
      deployment: [],
    },
    architecture: {
      type: "standalone",
      workspaceCount: 0,
      workspaces: [],
      entryPoints: [],
    },
    directories: [],
    dependencies: {
      production: {},
      development: {},
      internal: [],
    },
    scripts: {},
    ci: [],
    config: {
      envFiles: [],
      configFiles: [],
    },
  };

  // Detect package manager
  if (await exists(`${root}/bun.lockb`)) result.techStack.packageManager = "bun";
  else if (await exists(`${root}/bun.lock`)) result.techStack.packageManager = "bun";
  else if (await exists(`${root}/pnpm-lock.yaml`)) result.techStack.packageManager = "pnpm";
  else if (await exists(`${root}/yarn.lock`)) result.techStack.packageManager = "yarn";
  else if (await exists(`${root}/package-lock.json`)) result.techStack.packageManager = "npm";

  // Detect runtime
  if (result.techStack.packageManager === "bun") result.techStack.runtime.push("bun");
  if (await exists(`${root}/deno.json`)) result.techStack.runtime.push("deno");
  if (result.techStack.runtime.length === 0 && pkg) result.techStack.runtime.push("node");

  // Detect language
  if (await exists(`${root}/tsconfig.json`)) result.techStack.language.push("typescript");
  else if (await exists(`${root}/jsconfig.json`)) result.techStack.language.push("javascript");
  if (await exists(`${root}/Cargo.toml`)) result.techStack.language.push("rust");
  if (await exists(`${root}/go.mod`)) result.techStack.language.push("go");
  if (await exists(`${root}/pyproject.toml`)) result.techStack.language.push("python");
  if (await exists(`${root}/Package.swift`)) result.techStack.language.push("swift");

  // Detect frameworks and tools from package.json
  if (pkg) {
    const allDeps: Record<string, string> = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    result.dependencies.production = pkg.dependencies || {};
    result.dependencies.development = pkg.devDependencies || {};
    result.scripts = pkg.scripts || {};

    const frameworkMap: Record<string, string> = {
      hono: "hono", express: "express", fastify: "fastify", next: "next",
      react: "react", vue: "vue", svelte: "svelte", astro: "astro",
      expo: "expo", "react-native": "react-native", "@angular/core": "angular",
      "drizzle-orm": "drizzle", prisma: "prisma", tailwindcss: "tailwindcss",
      "@tailwindcss/vite": "tailwindcss", "better-auth": "better-auth",
    };
    const testMap: Record<string, string> = {
      vitest: "vitest", jest: "jest", mocha: "mocha",
      playwright: "playwright", "@playwright/test": "playwright", cypress: "cypress",
    };
    const lintMap: Record<string, string> = {
      "@biomejs/biome": "biome", eslint: "eslint", prettier: "prettier",
    };

    for (const [dep, name] of Object.entries(frameworkMap)) {
      if (dep in allDeps && !result.techStack.frameworks.includes(name)) {
        result.techStack.frameworks.push(name);
      }
    }
    for (const [dep, name] of Object.entries(testMap)) {
      if (dep in allDeps && !result.techStack.testing.includes(name)) {
        result.techStack.testing.push(name);
      }
    }
    for (const [dep, name] of Object.entries(lintMap)) {
      if (dep in allDeps && !result.techStack.linting.includes(name)) {
        result.techStack.linting.push(name);
      }
    }

    // Detect monorepo
    if (pkg.workspaces) {
      result.type = "monorepo";
      result.architecture.type = "monorepo";

      const patterns: string[] = Array.isArray(pkg.workspaces)
        ? pkg.workspaces
        : pkg.workspaces.packages || [];

      for (const pattern of patterns) {
        const glob = new Bun.Glob(`${pattern}/package.json`);
        for await (const match of glob.scan({ cwd: root })) {
          const wsDir = match.replace("/package.json", "");
          result.architecture.workspaces.push(wsDir);
          try {
            const wsPkg = await Bun.file(`${root}/${match}`).json();
            if (wsPkg.name) result.dependencies.internal.push(wsPkg.name);
          } catch {}
        }
      }
      result.architecture.workspaceCount = result.architecture.workspaces.length;
    }
  }

  // Detect linting from config files
  if (await exists(`${root}/biome.json`)) {
    if (!result.techStack.linting.includes("biome")) result.techStack.linting.push("biome");
  }

  // Detect deployment targets
  if (await exists(`${root}/wrangler.toml`)) result.techStack.deployment.push("cloudflare-workers");
  if (await exists(`${root}/vercel.json`)) result.techStack.deployment.push("vercel");
  if (await exists(`${root}/fly.toml`)) result.techStack.deployment.push("fly");
  if (await exists(`${root}/Dockerfile`)) result.techStack.deployment.push("docker");
  if (await exists(`${root}/netlify.toml`)) result.techStack.deployment.push("netlify");
  if (await exists(`${root}/railway.json`)) result.techStack.deployment.push("railway");

  // Detect entry points
  const entryGlobs = [
    "src/index.ts", "src/main.ts", "src/app.ts", "src/server.ts",
    "index.ts", "main.ts", "app.ts", "server.ts",
    "src/index.js", "index.js",
  ];
  for (const entry of entryGlobs) {
    if (await exists(`${root}/${entry}`)) {
      result.architecture.entryPoints.push(entry);
    }
  }

  // Scan top-level directories
  const knownDirs: Record<string, string> = {
    src: "Source code", lib: "Library code", packages: "Workspace packages",
    apps: "Application packages", app: "Application entry", api: "API server",
    web: "Web application", test: "Tests", tests: "Tests", docs: "Documentation",
    scripts: "Build/dev scripts", tools: "Development tooling", public: "Static assets",
    migrations: "Database migrations", config: "Configuration", ".github": "GitHub config",
  };

  try {
    const proc = Bun.spawnSync(["ls", "-1", root]);
    const items = proc.stdout.toString().trim().split("\n").filter(Boolean);
    for (const item of items) {
      if (item === "node_modules" || item === ".git" || item === "dist") continue;
      const testProc = Bun.spawnSync(["test", "-d", `${root}/${item}`]);
      if (testProc.exitCode === 0) {
        result.directories.push({
          name: item,
          description: knownDirs[item] || "",
        });
      }
    }
  } catch {}

  // Scan CI files
  const ciDir = `${root}/.github/workflows`;
  if (await exists(ciDir)) {
    try {
      const proc = Bun.spawnSync(["ls", "-1", ciDir]);
      const files = proc.stdout.toString().trim().split("\n").filter(Boolean);
      for (const file of files) {
        if (file.endsWith(".yml") || file.endsWith(".yaml")) {
          let name = file.replace(/\.(yml|yaml)$/, "");
          try {
            const content = await Bun.file(`${ciDir}/${file}`).text();
            const nameMatch = content.match(/^name:\s*(.+)$/m);
            if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
          } catch {}
          result.ci.push({ file: `.github/workflows/${file}`, name });
        }
      }
    } catch {}
  }
  if (await exists(`${root}/.gitlab-ci.yml`)) {
    result.ci.push({ file: ".gitlab-ci.yml", name: "GitLab CI" });
  }
  if (await exists(`${root}/Jenkinsfile`)) {
    result.ci.push({ file: "Jenkinsfile", name: "Jenkins" });
  }

  // Scan config files
  const configFiles = [
    "tsconfig.json", "biome.json", "biome.jsonc", ".editorconfig",
    "wrangler.toml", "wrangler.jsonc", ".prettierrc", ".eslintrc.json",
  ];
  for (const file of configFiles) {
    if (await exists(`${root}/${file}`)) result.config.configFiles.push(file);
  }

  const envGlob = new Bun.Glob(".env*");
  for await (const match of envGlob.scan({ cwd: root })) {
    if (match.includes("node_modules")) continue;
    result.config.envFiles.push(match);
  }

  // Output
  if (jsonOutput) {
    if (sectionFilter) {
      const sectionMap: Record<string, any> = {
        name: { name: result.name, description: result.description, purpose: result.purpose },
        stack: result.techStack,
        architecture: result.architecture,
        structure: result.directories,
        deps: result.dependencies,
        setup: result.scripts,
        ci: result.ci,
        config: result.config,
      };
      const data = sectionMap[sectionFilter];
      if (!data) {
        console.error(`Unknown section: ${sectionFilter}. Options: ${Object.keys(sectionMap).join(", ")}`);
        process.exit(1);
      }
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    const sections: [string, string, () => string[]][] = [
      ["name", "Name and Purpose", () => {
        const lines = [`  Name: ${result.name}`];
        if (result.description) lines.push(`  Description: ${result.description}`);
        if (result.purpose) lines.push(`  Purpose: ${result.purpose}`);
        return lines;
      }],
      ["stack", "Tech Stack", () => {
        const lines: string[] = [];
        if (result.techStack.runtime.length) lines.push(`  Runtime: ${result.techStack.runtime.join(", ")}`);
        if (result.techStack.language.length) lines.push(`  Language: ${result.techStack.language.join(", ")}`);
        if (result.techStack.packageManager) lines.push(`  Package Manager: ${result.techStack.packageManager}`);
        if (result.techStack.frameworks.length) lines.push(`  Frameworks: ${result.techStack.frameworks.join(", ")}`);
        if (result.techStack.testing.length) lines.push(`  Testing: ${result.techStack.testing.join(", ")}`);
        if (result.techStack.linting.length) lines.push(`  Linting: ${result.techStack.linting.join(", ")}`);
        if (result.techStack.deployment.length) lines.push(`  Deployment: ${result.techStack.deployment.join(", ")}`);
        return lines;
      }],
      ["architecture", "Architecture", () => {
        const lines = [`  Type: ${result.architecture.type}`];
        if (result.architecture.workspaceCount > 0) {
          lines.push(`  Workspaces: ${result.architecture.workspaceCount}`);
          for (const ws of result.architecture.workspaces) {
            lines.push(`    - ${ws}`);
          }
        }
        if (result.architecture.entryPoints.length) {
          lines.push(`  Entry points:`);
          for (const ep of result.architecture.entryPoints) {
            lines.push(`    - ${ep}`);
          }
        }
        return lines;
      }],
      ["structure", "Directory Structure", () => {
        return result.directories.map((d) =>
          d.description ? `  ${d.name}/  (${d.description})` : `  ${d.name}/`
        );
      }],
      ["deps", "Dependencies", () => {
        const lines: string[] = [];
        const prodCount = Object.keys(result.dependencies.production).length;
        const devCount = Object.keys(result.dependencies.development).length;
        lines.push(`  Production: ${prodCount} packages`);
        lines.push(`  Development: ${devCount} packages`);
        if (result.dependencies.internal.length) {
          lines.push(`  Internal workspace packages:`);
          for (const pkg of result.dependencies.internal) {
            lines.push(`    - ${pkg}`);
          }
        }
        const topDeps = Object.keys(result.dependencies.production).slice(0, 10);
        if (topDeps.length) {
          lines.push(`  Key production deps: ${topDeps.join(", ")}`);
        }
        return lines;
      }],
      ["setup", "Dev Setup (scripts)", () => {
        return Object.entries(result.scripts).map(([k, v]) => `  ${k}: ${v}`);
      }],
      ["ci", "CI/CD", () => {
        if (result.ci.length === 0) return ["  No CI/CD configuration detected"];
        return result.ci.map((c) => `  ${c.name} (${c.file})`);
      }],
      ["config", "Configuration", () => {
        const lines: string[] = [];
        if (result.config.configFiles.length) {
          lines.push(`  Config files: ${result.config.configFiles.join(", ")}`);
        }
        if (result.config.envFiles.length) {
          lines.push(`  Env files: ${result.config.envFiles.join(", ")}`);
        }
        return lines;
      }],
    ];

    console.log("Project Description");
    console.log("====================\n");

    for (const [key, title, render] of sections) {
      if (sectionFilter && sectionFilter !== key) continue;
      const lines = render();
      if (lines.length > 0) {
        console.log(`${title}:`);
        for (const line of lines) console.log(line);
        console.log();
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
