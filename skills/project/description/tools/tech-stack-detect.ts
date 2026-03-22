const args = Bun.argv.slice(2);

const HELP = `
tech-stack-detect — Detect project technology stack from config files

Usage:
  bun run tools/tech-stack-detect.ts [path] [options]

Arguments:
  path    Path to project root (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Detects:
  - Runtime (bun, node, deno)
  - Language (typescript, javascript, rust, go, python)
  - Package manager (bun, npm, pnpm, yarn)
  - Frameworks (hono, react, next, astro, expo, express, etc.)
  - Testing tools (vitest, jest, bun test, pytest, etc.)
  - Linting/formatting (biome, eslint, prettier)
  - Deployment targets (cloudflare, vercel, fly, docker)
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface TechStack {
  runtime: string[];
  language: string[];
  packageManager: string | null;
  frameworks: string[];
  testing: string[];
  linting: string[];
  deployment: string[];
}

async function exists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function readJsonSafe(path: string): Promise<Record<string, any> | null> {
  try {
    if (!(await exists(path))) return null;
    return await Bun.file(path).json();
  } catch {
    return null;
  }
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const stack: TechStack = {
    runtime: [],
    language: [],
    packageManager: null,
    frameworks: [],
    testing: [],
    linting: [],
    deployment: [],
  };

  // Detect package manager from lock files
  if (await exists(`${root}/bun.lockb`)) stack.packageManager = "bun";
  else if (await exists(`${root}/bun.lock`)) stack.packageManager = "bun";
  else if (await exists(`${root}/pnpm-lock.yaml`)) stack.packageManager = "pnpm";
  else if (await exists(`${root}/yarn.lock`)) stack.packageManager = "yarn";
  else if (await exists(`${root}/package-lock.json`)) stack.packageManager = "npm";

  // Detect runtime
  if (stack.packageManager === "bun") stack.runtime.push("bun");
  if (await exists(`${root}/deno.json`)) stack.runtime.push("deno");
  if (await exists(`${root}/deno.jsonc`)) stack.runtime.push("deno");
  if (stack.runtime.length === 0 && (await exists(`${root}/package.json`))) {
    stack.runtime.push("node");
  }

  // Detect language
  if (await exists(`${root}/tsconfig.json`)) stack.language.push("typescript");
  else if (await exists(`${root}/jsconfig.json`)) stack.language.push("javascript");
  if (await exists(`${root}/Cargo.toml`)) stack.language.push("rust");
  if (await exists(`${root}/go.mod`)) stack.language.push("go");
  if (await exists(`${root}/pyproject.toml`)) stack.language.push("python");
  if (await exists(`${root}/requirements.txt`)) {
    if (!stack.language.includes("python")) stack.language.push("python");
  }
  if (await exists(`${root}/Package.swift`)) stack.language.push("swift");

  // Detect frameworks, testing, linting from package.json
  const pkg = await readJsonSafe(`${root}/package.json`);
  if (pkg) {
    const allDeps = {
      ...((pkg.dependencies as Record<string, string>) || {}),
      ...((pkg.devDependencies as Record<string, string>) || {}),
    };

    const frameworkMap: Record<string, string> = {
      hono: "hono",
      express: "express",
      fastify: "fastify",
      koa: "koa",
      next: "next",
      react: "react",
      "react-dom": "react",
      vue: "vue",
      svelte: "svelte",
      astro: "astro",
      expo: "expo",
      "react-native": "react-native",
      "@angular/core": "angular",
      "drizzle-orm": "drizzle",
      prisma: "prisma",
      "@tanstack/react-query": "tanstack-query",
      tailwindcss: "tailwindcss",
      "@tailwindcss/vite": "tailwindcss",
      "better-auth": "better-auth",
      "lucia-auth": "lucia",
    };

    const testMap: Record<string, string> = {
      vitest: "vitest",
      jest: "jest",
      "@jest/core": "jest",
      mocha: "mocha",
      playwright: "playwright",
      "@playwright/test": "playwright",
      cypress: "cypress",
    };

    const lintMap: Record<string, string> = {
      "@biomejs/biome": "biome",
      eslint: "eslint",
      prettier: "prettier",
      oxlint: "oxlint",
    };

    for (const [dep, name] of Object.entries(frameworkMap)) {
      if (dep in allDeps && !stack.frameworks.includes(name)) {
        stack.frameworks.push(name);
      }
    }

    for (const [dep, name] of Object.entries(testMap)) {
      if (dep in allDeps && !stack.testing.includes(name)) {
        stack.testing.push(name);
      }
    }

    for (const [dep, name] of Object.entries(lintMap)) {
      if (dep in allDeps && !stack.linting.includes(name)) {
        stack.linting.push(name);
      }
    }
  }

  // Detect linting from config files (if not already found via deps)
  if (await exists(`${root}/biome.json`)) {
    if (!stack.linting.includes("biome")) stack.linting.push("biome");
  }
  if (await exists(`${root}/biome.jsonc`)) {
    if (!stack.linting.includes("biome")) stack.linting.push("biome");
  }

  // Detect testing from config files
  const vitestGlob = new Bun.Glob("vitest.config.*");
  for await (const _ of vitestGlob.scan({ cwd: root })) {
    if (!stack.testing.includes("vitest")) stack.testing.push("vitest");
    break;
  }
  const jestGlob = new Bun.Glob("jest.config.*");
  for await (const _ of jestGlob.scan({ cwd: root })) {
    if (!stack.testing.includes("jest")) stack.testing.push("jest");
    break;
  }
  if (await exists(`${root}/pytest.ini`)) {
    if (!stack.testing.includes("pytest")) stack.testing.push("pytest");
  }
  if (await exists(`${root}/pyproject.toml`)) {
    try {
      const content = await Bun.file(`${root}/pyproject.toml`).text();
      if (content.includes("[tool.pytest")) {
        if (!stack.testing.includes("pytest")) stack.testing.push("pytest");
      }
    } catch {}
  }

  // Detect deployment targets
  if (await exists(`${root}/wrangler.toml`)) stack.deployment.push("cloudflare-workers");
  if (await exists(`${root}/wrangler.jsonc`)) stack.deployment.push("cloudflare-workers");
  if (await exists(`${root}/vercel.json`)) stack.deployment.push("vercel");
  if (await exists(`${root}/fly.toml`)) stack.deployment.push("fly");
  if (await exists(`${root}/railway.json`)) stack.deployment.push("railway");
  if (await exists(`${root}/Dockerfile`)) stack.deployment.push("docker");
  if (await exists(`${root}/docker-compose.yml`)) {
    if (!stack.deployment.includes("docker")) stack.deployment.push("docker");
  }
  if (await exists(`${root}/docker-compose.yaml`)) {
    if (!stack.deployment.includes("docker")) stack.deployment.push("docker");
  }
  if (await exists(`${root}/netlify.toml`)) stack.deployment.push("netlify");
  if (await exists(`${root}/render.yaml`)) stack.deployment.push("render");

  if (jsonOutput) {
    console.log(JSON.stringify(stack, null, 2));
  } else {
    console.log("Tech Stack Detection");
    console.log("====================\n");

    const sections: [string, string[] | string | null][] = [
      ["Runtime", stack.runtime],
      ["Language", stack.language],
      ["Package Manager", stack.packageManager ? [stack.packageManager] : []],
      ["Frameworks", stack.frameworks],
      ["Testing", stack.testing],
      ["Linting", stack.linting],
      ["Deployment", stack.deployment],
    ];

    for (const [label, values] of sections) {
      const items = Array.isArray(values) ? values : values ? [values] : [];
      if (items.length > 0) {
        console.log(`${label}: ${items.join(", ")}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
