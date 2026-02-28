const args = Bun.argv.slice(2);

const HELP = `
scaffold-project — Generate a new monorepo or standalone project with boilerplate

Usage:
  bun run tools/scaffold-project.ts <name> [options]

Arguments:
  name    Project name (used for directory and package name)

Options:
  --type <monorepo|standalone>    Project type (default: monorepo)
  --scope <scope>                 Package scope without @ (default: project name)
  --json                          Output as JSON instead of plain text
  --help                          Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

async function writeFile(path: string, content: string): Promise<void> {
  await Bun.write(path, content);
}

async function main() {
  const name = filteredArgs[0];
  if (!name) {
    console.error("Error: missing required project name");
    process.exit(1);
  }

  const type = getFlag("--type") || "monorepo";
  const scope = getFlag("--scope") || name;

  if (type !== "monorepo" && type !== "standalone") {
    console.error(`Error: --type must be 'monorepo' or 'standalone', got '${type}'`);
    process.exit(1);
  }

  const root = `${process.cwd()}/${name}`;

  const existsCheck = Bun.file(`${root}/package.json`);
  if (await existsCheck.exists()) {
    console.error(`Error: directory ${name} already contains a package.json`);
    process.exit(1);
  }

  const createdFiles: string[] = [];

  // Root package.json
  const rootPkg: Record<string, unknown> = {
    name: type === "monorepo" ? name : `@${scope}/${name}`,
    private: true,
    type: "module",
    scripts: {
      lint: "biome check .",
      "lint:fix": "biome check --write .",
      typecheck: "tsc --noEmit",
    },
  };

  if (type === "monorepo") {
    rootPkg.workspaces = ["packages/*"];
  }

  await writeFile(`${root}/package.json`, JSON.stringify(rootPkg, null, 2) + "\n");
  createdFiles.push("package.json");

  // biome.json
  const biomeConfig = {
    $schema: "https://biomejs.dev/schemas/1.9.0/schema.json",
    organizeImports: { enabled: true },
    linter: {
      enabled: true,
      rules: { recommended: true },
    },
    formatter: {
      enabled: true,
      indentStyle: "space",
      indentWidth: 2,
      lineWidth: 100,
    },
  };
  await writeFile(`${root}/biome.json`, JSON.stringify(biomeConfig, null, 2) + "\n");
  createdFiles.push("biome.json");

  // tsconfig.json
  const tsconfig: Record<string, unknown> = {
    compilerOptions: {
      strict: true,
      module: "ESNext",
      moduleResolution: "bundler",
      target: "ESNext",
      isolatedModules: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    },
  };

  if (type === "monorepo") {
    tsconfig.references = [];
  } else {
    (tsconfig.compilerOptions as Record<string, unknown>).outDir = "./dist";
    (tsconfig.compilerOptions as Record<string, unknown>).rootDir = "./src";
    tsconfig.include = ["src"];
  }

  await writeFile(`${root}/tsconfig.json`, JSON.stringify(tsconfig, null, 2) + "\n");
  createdFiles.push("tsconfig.json");

  // .gitignore
  const gitignore = [
    "node_modules/",
    "dist/",
    ".env",
    ".env.*",
    "!.env.example",
    ".wrangler/",
    ".turbo/",
    "*.tsbuildinfo",
  ].join("\n") + "\n";
  await writeFile(`${root}/.gitignore`, gitignore);
  createdFiles.push(".gitignore");

  // CI workflow
  const ciWorkflow = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run lint
      - run: bun run typecheck
      - run: bun test
`;
  await writeFile(`${root}/.github/workflows/ci.yml`, ciWorkflow);
  createdFiles.push(".github/workflows/ci.yml");

  // Create packages/ for monorepo
  if (type === "monorepo") {
    await writeFile(`${root}/packages/.gitkeep`, "");
    createdFiles.push("packages/.gitkeep");
  } else {
    await writeFile(`${root}/src/index.ts`, 'export {};\n');
    createdFiles.push("src/index.ts");
  }

  const result = {
    name,
    type,
    scope,
    path: root,
    files: createdFiles,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Scaffolded ${type} project: ${name}\n`);
    console.log("Created files:");
    for (const f of createdFiles) {
      console.log(`  ${f}`);
    }
    console.log(`\nNext steps:`);
    console.log(`  cd ${name}`);
    console.log(`  bun install`);
    console.log(`  git init && git add -A && git commit -m "feat: initial scaffold"`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
