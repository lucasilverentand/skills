const args = Bun.argv.slice(2);

const HELP = `
env-sync — Diff local environment against the repo baseline and report drift

Usage:
  bun run tools/env-sync.ts [project-dir] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Compares locally installed tool versions against versions pinned in the repo
(.tool-versions, .nvmrc, package.json engines). Reports mismatches and
provides update instructions.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));
const projectDir = filteredArgs[0] || ".";

interface DriftItem {
  tool: string;
  expected: string;
  actual: string | null;
  status: "match" | "mismatch" | "missing" | "extra";
  updateCommand: string;
}

async function getVersion(cmd: string): Promise<string | null> {
  try {
    const proc = Bun.spawn([cmd, "--version"], { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;
    if (exitCode !== 0) return null;
    const match = stdout.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : stdout.trim().split("\n")[0];
  } catch {
    return null;
  }
}

async function main() {
  const { resolve, join } = await import("node:path");
  const { existsSync } = await import("node:fs");

  const dir = resolve(projectDir);
  const drift: DriftItem[] = [];

  // Check .tool-versions
  const toolVersionsPath = join(dir, ".tool-versions");
  if (existsSync(toolVersionsPath)) {
    const content = await Bun.file(toolVersionsPath).text();
    for (const line of content.split("\n")) {
      const match = line.match(/^(\S+)\s+(\S+)/);
      if (!match) continue;
      const [, tool, expected] = match;
      const actual = await getVersion(tool);

      let status: DriftItem["status"];
      if (!actual) status = "missing";
      else if (actual === expected || actual.startsWith(expected)) status = "match";
      else status = "mismatch";

      let updateCommand = "";
      if (status === "missing") {
        updateCommand = `mise install ${tool}@${expected}  # or: asdf install ${tool} ${expected}`;
      } else if (status === "mismatch") {
        updateCommand = `mise install ${tool}@${expected} && mise use ${tool}@${expected}`;
      }

      drift.push({ tool, expected, actual, status, updateCommand });
    }
  }

  // Check .nvmrc
  const nvmrcPath = join(dir, ".nvmrc");
  if (existsSync(nvmrcPath)) {
    const expected = (await Bun.file(nvmrcPath).text()).trim().replace("v", "");
    const actual = await getVersion("node");
    const alreadyChecked = drift.some((d) => d.tool === "node" || d.tool === "nodejs");

    if (!alreadyChecked) {
      let status: DriftItem["status"];
      if (!actual) status = "missing";
      else if (actual.startsWith(expected)) status = "match";
      else status = "mismatch";

      drift.push({
        tool: "node",
        expected,
        actual,
        status,
        updateCommand: status !== "match" ? `nvm install ${expected} && nvm use ${expected}` : "",
      });
    }
  }

  // Check package.json engines
  const pkgPath = join(dir, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await Bun.file(pkgPath).text());
    const engines = pkg.engines || {};

    for (const [tool, constraint] of Object.entries(engines)) {
      const alreadyChecked = drift.some((d) => d.tool === tool);
      if (alreadyChecked) continue;

      const actual = await getVersion(tool);
      const expected = constraint as string;

      let status: DriftItem["status"];
      if (!actual) status = "missing";
      else status = "match"; // Simplified — full semver range check would go here

      let updateCommand = "";
      if (status === "missing") {
        if (tool === "bun") updateCommand = "curl -fsSL https://bun.sh/install | bash";
        else if (tool === "node") updateCommand = `nvm install ${expected.replace(/[>=^~]/g, "")}`;
        else updateCommand = `Install ${tool} version ${expected}`;
      }

      drift.push({ tool, expected, actual, status, updateCommand });
    }
  }

  // Check for common tools that might be expected
  const hasBunLock = existsSync(join(dir, "bun.lockb")) || existsSync(join(dir, "bun.lock"));
  if (hasBunLock && !drift.some((d) => d.tool === "bun")) {
    const actual = await getVersion("bun");
    drift.push({
      tool: "bun",
      expected: "*",
      actual,
      status: actual ? "match" : "missing",
      updateCommand: actual ? "" : "curl -fsSL https://bun.sh/install | bash",
    });
  }

  const matches = drift.filter((d) => d.status === "match");
  const mismatches = drift.filter((d) => d.status === "mismatch");
  const missing = drift.filter((d) => d.status === "missing");

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          projectDir: dir,
          total: drift.length,
          matches: matches.length,
          mismatches: mismatches.length,
          missing: missing.length,
          drift,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Environment Sync: ${matches.length} match, ${mismatches.length} mismatch, ${missing.length} missing\n`
    );

    for (const item of drift) {
      const icon = item.status === "match" ? "OK" : item.status === "missing" ? "MISSING" : "DRIFT";
      console.log(
        `  [${icon}] ${item.tool}: expected ${item.expected}, got ${item.actual || "not installed"}`
      );
      if (item.updateCommand) {
        console.log(`    fix: ${item.updateCommand}`);
      }
    }

    if (mismatches.length === 0 && missing.length === 0) {
      console.log("\nEnvironment matches the repo baseline.");
    } else {
      console.log(`\n${mismatches.length + missing.length} tool(s) need attention.`);
    }
  }

  if (mismatches.length > 0 || missing.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
