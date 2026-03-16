const args = Bun.argv.slice(2);

const HELP = `
workflow-gen — Scaffold a GitHub Actions workflow from a project template

Usage:
  bun run tools/workflow-gen.ts <project-type> [options]

Project types:
  bun-api      Bun + Hono API (typecheck, lint, test)
  bun-lib      Bun library (typecheck, lint, test, build)
  astro        Astro site (typecheck, lint, build)
  expo         Expo React Native app (typecheck, lint, test, EAS build)
  docker       Docker-based service (build, push)

Options:
  --output <file>   Write workflow to file instead of stdout
  --json            Output as JSON (wraps YAML in JSON)
  --help            Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const outputIdx = args.indexOf("--output");
const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (outputIdx === -1 || i !== outputIdx + 1)
);

const TEMPLATES: Record<string, string> = {
  "bun-api": `name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Typecheck
        run: bun run typecheck

      - name: Lint
        run: bun run lint

      - name: Test
        run: bun test --coverage
`,

  "bun-lib": `name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Typecheck
        run: bun run typecheck

      - name: Lint
        run: bun run lint

      - name: Test
        run: bun test --coverage

      - name: Build
        run: bun run build
`,

  astro: `name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Typecheck
        run: bun run typecheck

      - name: Lint
        run: bun run lint

      - name: Build
        run: bun run build
`,

  expo: `name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Typecheck
        run: bun run typecheck

      - name: Lint
        run: bun run lint

      - name: Test
        run: bun test

  eas-build:
    needs: check
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: \${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: eas build --platform all --non-interactive --no-wait
`,

  docker: `name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to registry
        if: github.ref == 'refs/heads/main'
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: \${{ github.ref == 'refs/heads/main' }}
          tags: ghcr.io/\${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
`,
};

async function main() {
  const projectType = filteredArgs[0];
  if (!projectType) {
    console.error("Error: missing required project type argument");
    console.error(`Available types: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  const template = TEMPLATES[projectType];
  if (!template) {
    console.error(`Error: unknown project type "${projectType}"`);
    console.error(`Available types: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  if (outputFile) {
    const { resolve } = await import("node:path");
    await Bun.write(resolve(outputFile), template);
    console.log(`Workflow written to ${outputFile}`);
  } else if (jsonOutput) {
    console.log(JSON.stringify({ projectType, workflow: template }, null, 2));
  } else {
    console.log(template);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
