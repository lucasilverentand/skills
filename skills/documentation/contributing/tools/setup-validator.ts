const args = Bun.argv.slice(2);

const HELP = `
setup-validator — Verify that documented setup steps actually work

Usage:
  bun run tools/setup-validator.ts [contributing-md] [options]

Arguments:
  contributing-md   Path to CONTRIBUTING.md (default: ./CONTRIBUTING.md)

Options:
  --dry-run   Show commands that would be run without executing them
  --json      Output results as JSON instead of plain text
  --help      Show this help message

Examples:
  bun run tools/setup-validator.ts
  bun run tools/setup-validator.ts docs/CONTRIBUTING.md --dry-run
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dryRun = args.includes("--dry-run");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface CommandResult {
  command: string;
  success: boolean;
  output: string;
  exitCode: number;
  durationMs: number;
}

interface ValidationResult {
  file: string;
  commandsFound: number;
  commandsRun: number;
  passed: number;
  failed: number;
  skipped: number;
  results: CommandResult[];
}

function extractCodeBlocks(content: string): string[][] {
  const blocks: string[][] = [];
  const codeBlockPattern = /```(?:bash|sh|shell|zsh)?\n([\s\S]*?)```/g;

  let match: RegExpExecArray | null;
  while ((match = codeBlockPattern.exec(content)) !== null) {
    const block = match[1].trim();
    const commands = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        // Skip comments and empty lines
        if (!line || line.startsWith("#")) return false;
        // Skip lines that are just output examples
        if (line.startsWith(">") || line.startsWith("$")) return false;
        return true;
      })
      .map((line) => {
        // Remove leading $ or > prompt characters
        return line.replace(/^\$\s*/, "").replace(/^>\s*/, "");
      });

    if (commands.length > 0) {
      blocks.push(commands);
    }
  }

  return blocks;
}

function isUnsafeCommand(cmd: string): boolean {
  const unsafePatterns = [
    /\brm\s+-rf/,
    /\bsudo\b/,
    /\bdocker\b/,
    /\bkubectl\b/,
    /\bgit\s+push/,
    /\bgit\s+clone/,
    /\bnpm\s+publish/,
    /\bbun\s+publish/,
    /\bdeploy/,
    /\bcurl\b.*\|.*\bsh\b/,
  ];
  return unsafePatterns.some((p) => p.test(cmd));
}

function isInstallCommand(cmd: string): boolean {
  return /\b(npm|yarn|pnpm|bun)\s+install\b/.test(cmd) ||
    /\b(brew)\s+install\b/.test(cmd);
}

async function runCommand(cmd: string, cwd: string): Promise<CommandResult> {
  const start = performance.now();

  if (isUnsafeCommand(cmd)) {
    return {
      command: cmd,
      success: false,
      output: "Skipped: potentially unsafe command",
      exitCode: -1,
      durationMs: 0,
    };
  }

  try {
    const proc = Bun.spawnSync(["sh", "-c", cmd], {
      cwd,
      timeout: 30_000,
      env: { ...process.env, CI: "true" },
    });

    const durationMs = Math.round(performance.now() - start);
    const stdout = proc.stdout.toString().slice(0, 2000);
    const stderr = proc.stderr.toString().slice(0, 2000);
    const output = stdout + (stderr ? `\nSTDERR: ${stderr}` : "");

    return {
      command: cmd,
      success: proc.exitCode === 0,
      output: output.trim(),
      exitCode: proc.exitCode ?? 1,
      durationMs,
    };
  } catch (err) {
    return {
      command: cmd,
      success: false,
      output: `Error: ${(err as Error).message}`,
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
    };
  }
}

async function main() {
  const contributingPath = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : `${process.cwd()}/CONTRIBUTING.md`;

  const exists = await Bun.file(contributingPath).exists();
  if (!exists) {
    console.error(`Error: file not found: ${contributingPath}`);
    process.exit(1);
  }

  const content = await Bun.file(contributingPath).text();
  const codeBlocks = extractCodeBlocks(content);
  const allCommands = codeBlocks.flat();

  if (allCommands.length === 0) {
    console.error("No shell commands found in code blocks");
    process.exit(1);
  }

  const result: ValidationResult = {
    file: contributingPath,
    commandsFound: allCommands.length,
    commandsRun: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    results: [],
  };

  const cwd = process.cwd();

  for (const cmd of allCommands) {
    if (dryRun) {
      const skip = isUnsafeCommand(cmd) ? " [UNSAFE - would skip]" : "";
      result.results.push({
        command: cmd,
        success: true,
        output: `Would run${skip}`,
        exitCode: 0,
        durationMs: 0,
      });
      result.commandsRun++;
      continue;
    }

    if (isUnsafeCommand(cmd)) {
      result.results.push({
        command: cmd,
        success: false,
        output: "Skipped: potentially unsafe command",
        exitCode: -1,
        durationMs: 0,
      });
      result.skipped++;
      continue;
    }

    // Skip install commands in validation — they modify the environment
    if (isInstallCommand(cmd)) {
      result.results.push({
        command: cmd,
        success: true,
        output: "Skipped: install command (would modify environment)",
        exitCode: 0,
        durationMs: 0,
      });
      result.skipped++;
      continue;
    }

    const cmdResult = await runCommand(cmd, cwd);
    result.results.push(cmdResult);
    result.commandsRun++;

    if (cmdResult.success) {
      result.passed++;
    } else {
      result.failed++;
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Validating: ${contributingPath}`);
    console.log(`Commands found: ${result.commandsFound}`);
    console.log(`Commands run: ${result.commandsRun}`);
    console.log(`Passed: ${result.passed}  Failed: ${result.failed}  Skipped: ${result.skipped}\n`);

    for (const r of result.results) {
      const icon = r.exitCode === -1 ? "SKIP" : r.success ? "PASS" : "FAIL";
      console.log(`[${icon}] ${r.command}`);
      if (!r.success && r.exitCode !== -1) {
        console.log(`       ${r.output.split("\n")[0]}`);
      }
    }

    if (result.failed > 0) {
      console.log(`\n${result.failed} command(s) failed — fix the documented steps.`);
    } else {
      console.log("\nAll commands validated successfully.");
    }
  }

  if (result.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
