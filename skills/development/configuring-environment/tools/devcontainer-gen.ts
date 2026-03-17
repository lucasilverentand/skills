const args = Bun.argv.slice(2);

const HELP = `
devcontainer-gen — Generate devcontainer.json from project dependencies

Usage:
  bun run tools/devcontainer-gen.ts [project-dir] [options]

Options:
  --output <file>   Write to file instead of stdout (default: .devcontainer/devcontainer.json)
  --json            Output as JSON instead of plain text description
  --help            Show this help message

Reads project configuration files to generate a .devcontainer/devcontainer.json
with the correct base image, features, port forwarding, and extensions.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const outputIdx = args.indexOf("--output");
const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (outputIdx === -1 || i !== outputIdx + 1)
);
const projectDir = filteredArgs[0] || ".";

interface DevcontainerConfig {
  name: string;
  image?: string;
  features: Record<string, unknown>;
  forwardPorts: number[];
  customizations: {
    vscode: {
      extensions: string[];
      settings: Record<string, unknown>;
    };
  };
  postCreateCommand?: string;
}

async function main() {
  const { resolve, join } = await import("node:path");
  const { existsSync, mkdirSync } = await import("node:fs");

  const dir = resolve(projectDir);

  // Detect project characteristics
  const hasPkgJson = existsSync(join(dir, "package.json"));
  const hasBunLock = existsSync(join(dir, "bun.lockb")) || existsSync(join(dir, "bun.lock"));
  const hasDockerCompose =
    existsSync(join(dir, "docker-compose.yml")) ||
    existsSync(join(dir, "docker-compose.yaml")) ||
    existsSync(join(dir, "compose.yaml")) ||
    existsSync(join(dir, "compose.yml"));

  let pkg: Record<string, any> = {};
  if (hasPkgJson) {
    pkg = JSON.parse(await Bun.file(join(dir, "package.json")).text());
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const config: DevcontainerConfig = {
    name: pkg.name || "Dev Container",
    image: "mcr.microsoft.com/devcontainers/typescript-node:22",
    features: {},
    forwardPorts: [],
    customizations: {
      vscode: {
        extensions: [],
        settings: {},
      },
    },
  };

  // Add Bun feature if Bun project
  if (hasBunLock) {
    config.features["ghcr.io/shyim/devcontainers-features/bun:0"] = {};
    config.postCreateCommand = "bun install";
  } else if (hasPkgJson) {
    config.postCreateCommand = "npm ci";
  }

  // Detect ports from compose or common patterns
  if (hasDockerCompose) {
    const composePath = ["docker-compose.yml", "docker-compose.yaml", "compose.yaml", "compose.yml"]
      .map((f) => join(dir, f))
      .find((f) => existsSync(f));

    if (composePath) {
      const composeContent = await Bun.file(composePath).text();
      const portMatches = composeContent.matchAll(/(\d+):(\d+)/g);
      for (const match of portMatches) {
        const hostPort = parseInt(match[1]);
        if (!config.forwardPorts.includes(hostPort)) {
          config.forwardPorts.push(hostPort);
        }
      }
    }
  }

  // Common ports based on detected frameworks
  if (deps.hono || deps.express || deps.fastify || deps.koa) {
    if (!config.forwardPorts.includes(3000)) config.forwardPorts.push(3000);
  }
  if (deps.astro) {
    if (!config.forwardPorts.includes(4321)) config.forwardPorts.push(4321);
  }
  if (deps.vite) {
    if (!config.forwardPorts.includes(5173)) config.forwardPorts.push(5173);
  }

  // Extensions based on tooling
  if (deps["@biomejs/biome"]) {
    config.customizations.vscode.extensions.push("biomejs.biome");
    config.customizations.vscode.settings["editor.defaultFormatter"] = "biomejs.biome";
    config.customizations.vscode.settings["editor.formatOnSave"] = true;
  }
  if (deps.eslint) {
    config.customizations.vscode.extensions.push("dbaeumer.vscode-eslint");
  }
  if (deps.prettier) {
    config.customizations.vscode.extensions.push("esbenp.prettier-vscode");
  }
  if (deps.tailwindcss) {
    config.customizations.vscode.extensions.push("bradlc.vscode-tailwindcss");
  }
  if (deps.prisma) {
    config.customizations.vscode.extensions.push("Prisma.prisma");
  }

  // Always add TypeScript extension
  config.customizations.vscode.extensions.push("ms-vscode.vscode-typescript-next");

  // Docker features if compose present
  if (hasDockerCompose) {
    config.features["ghcr.io/devcontainers/features/docker-in-docker:2"] = {};
  }

  // Build the devcontainer.json
  const devcontainerJson = JSON.stringify(config, null, 2);

  const writeTarget = outputFile || join(dir, ".devcontainer", "devcontainer.json");

  if (jsonOutput) {
    console.log(devcontainerJson);
  } else {
    const { dirname } = await import("node:path");
    const targetDir = dirname(resolve(writeTarget));
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    await Bun.write(resolve(writeTarget), devcontainerJson);
    console.log(`Generated devcontainer.json at ${writeTarget}\n`);
    console.log(`Configuration:`);
    console.log(`  Image: ${config.image}`);
    console.log(`  Features: ${Object.keys(config.features).length}`);
    console.log(`  Ports: ${config.forwardPorts.join(", ") || "none"}`);
    console.log(`  Extensions: ${config.customizations.vscode.extensions.length}`);
    if (config.postCreateCommand) {
      console.log(`  Post-create: ${config.postCreateCommand}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
