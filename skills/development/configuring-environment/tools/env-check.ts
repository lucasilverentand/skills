const args = Bun.argv.slice(2);

const HELP = `
env-check — Verify all required tools and versions are installed

Usage:
  bun run tools/env-check.ts [project-dir] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Reads the project root for toolchain signals (package.json, .tool-versions,
.nvmrc, docker-compose.yml) and checks whether the required tools are installed
at the correct versions.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));
const projectDir = filteredArgs[0] || ".";

interface ToolCheck {
  tool: string;
  required: string;
  installed: string | null;
  pass: boolean;
  message: string;
}

async function runCommand(cmd: string[]): Promise<{ exitCode: number; stdout: string }> {
  try {
    const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;
    return { exitCode, stdout: stdout.trim() };
  } catch {
    return { exitCode: 1, stdout: "" };
  }
}

async function getVersion(cmd: string, flag = "--version"): Promise<string | null> {
  const result = await runCommand([cmd, flag]);
  if (result.exitCode !== 0) return null;

  // Extract version number from output
  const match = result.stdout.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : result.stdout.split("\n")[0];
}

function satisfiesVersion(installed: string, required: string): boolean {
  if (!required || required === "*") return true;

  // Handle semver ranges: >=1.0.0, ^1.0.0, ~1.0.0
  const cleanRequired = required.replace(/[>=^~]/g, "");
  const reqParts = cleanRequired.split(".").map(Number);
  const instParts = installed.split(".").map(Number);

  if (required.startsWith(">=")) {
    for (let i = 0; i < 3; i++) {
      if ((instParts[i] || 0) > (reqParts[i] || 0)) return true;
      if ((instParts[i] || 0) < (reqParts[i] || 0)) return false;
    }
    return true;
  }

  if (required.startsWith("^")) {
    return instParts[0] === reqParts[0] && (instParts[1] || 0) >= (reqParts[1] || 0);
  }

  // Exact or prefix match
  return installed.startsWith(cleanRequired);
}

async function main() {
  const { resolve, join } = await import("node:path");
  const { existsSync } = await import("node:fs");

  const dir = resolve(projectDir);
  const checks: ToolCheck[] = [];

  // Check for package.json
  const pkgPath = join(dir, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await Bun.file(pkgPath).text());

    // Detect package manager
    const hasBunLock = existsSync(join(dir, "bun.lockb")) || existsSync(join(dir, "bun.lock"));
    const hasYarnLock = existsSync(join(dir, "yarn.lock"));
    const hasNpmLock = existsSync(join(dir, "package-lock.json"));
    const hasPnpmLock = existsSync(join(dir, "pnpm-lock.yaml"));

    if (hasBunLock) {
      const version = await getVersion("bun");
      const required = pkg.engines?.bun || "*";
      checks.push({
        tool: "bun",
        required,
        installed: version,
        pass: version !== null && satisfiesVersion(version, required),
        message: version ? `bun ${version} installed` : "bun not found — install from https://bun.sh",
      });
    } else if (hasNpmLock || hasYarnLock || hasPnpmLock) {
      const version = await getVersion("node");
      const required = pkg.engines?.node || "*";
      checks.push({
        tool: "node",
        required,
        installed: version,
        pass: version !== null && satisfiesVersion(version, required),
        message: version ? `node ${version} installed` : "node not found",
      });
    }

    // Check for TypeScript
    const hasTS = pkg.devDependencies?.typescript || pkg.dependencies?.typescript;
    if (hasTS) {
      const version = await getVersion("tsc");
      checks.push({
        tool: "typescript",
        required: hasTS,
        installed: version,
        pass: version !== null,
        message: version ? `tsc ${version} installed` : "TypeScript compiler not found in PATH",
      });
    }
  }

  // Check .tool-versions (asdf/mise)
  const toolVersionsPath = join(dir, ".tool-versions");
  if (existsSync(toolVersionsPath)) {
    const content = await Bun.file(toolVersionsPath).text();
    for (const line of content.split("\n")) {
      const match = line.match(/^(\S+)\s+(\S+)/);
      if (match) {
        const [, tool, required] = match;
        const version = await getVersion(tool);
        checks.push({
          tool,
          required,
          installed: version,
          pass: version !== null && satisfiesVersion(version, required),
          message: version
            ? `${tool} ${version} installed (required: ${required})`
            : `${tool} not found — install version ${required}`,
        });
      }
    }
  }

  // Check .nvmrc
  const nvmrcPath = join(dir, ".nvmrc");
  if (existsSync(nvmrcPath)) {
    const required = (await Bun.file(nvmrcPath).text()).trim();
    const version = await getVersion("node");
    const alreadyChecked = checks.some((c) => c.tool === "node");
    if (!alreadyChecked) {
      checks.push({
        tool: "node",
        required,
        installed: version,
        pass: version !== null && version.startsWith(required.replace("v", "")),
        message: version
          ? `node ${version} installed (required: ${required})`
          : `node not found — install version ${required}`,
      });
    }
  }

  // Check for Docker
  const hasCompose =
    existsSync(join(dir, "docker-compose.yml")) ||
    existsSync(join(dir, "docker-compose.yaml")) ||
    existsSync(join(dir, "compose.yaml")) ||
    existsSync(join(dir, "compose.yml"));

  if (hasCompose || existsSync(join(dir, "Dockerfile"))) {
    const version = await getVersion("docker");
    checks.push({
      tool: "docker",
      required: "*",
      installed: version,
      pass: version !== null,
      message: version ? `docker ${version} installed` : "docker not found — required for container services",
    });
  }

  // Check git
  const gitVersion = await getVersion("git");
  checks.push({
    tool: "git",
    required: "*",
    installed: gitVersion,
    pass: gitVersion !== null,
    message: gitVersion ? `git ${gitVersion} installed` : "git not found",
  });

  const passing = checks.filter((c) => c.pass);
  const failing = checks.filter((c) => !c.pass);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          projectDir: dir,
          total: checks.length,
          passing: passing.length,
          failing: failing.length,
          checks,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Environment Check: ${passing.length}/${checks.length} passing\n`);

    for (const check of checks) {
      const icon = check.pass ? "PASS" : "FAIL";
      console.log(`  [${icon}] ${check.tool} — ${check.message}`);
    }

    if (failing.length > 0) {
      console.log(`\n${failing.length} tool(s) need attention.`);
    } else {
      console.log("\nAll tools are installed and meet version requirements.");
    }
  }

  if (failing.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
