const args = Bun.argv.slice(2);

const HELP = `
lockfile-resolve — Auto-resolve lockfile conflicts by regenerating with the appropriate package manager

Usage:
  bun run tools/lockfile-resolve.ts [options]

Detects conflicting lockfiles (bun.lockb, package-lock.json, yarn.lock),
accepts the current version, and regenerates them.

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

interface Resolution {
  file: string;
  action: string;
  success: boolean;
  error?: string;
}

const LOCKFILES: Record<string, { installCmd: string[]; manager: string }> = {
  "bun.lockb": { installCmd: ["bun", "install"], manager: "bun" },
  "package-lock.json": { installCmd: ["npm", "install"], manager: "npm" },
  "yarn.lock": { installCmd: ["yarn", "install"], manager: "yarn" },
  "pnpm-lock.yaml": { installCmd: ["pnpm", "install"], manager: "pnpm" },
};

async function run(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

async function main() {
  // Get conflicting files
  const { stdout: conflictsRaw } = await run(["git", "diff", "--name-only", "--diff-filter=U"]);
  if (!conflictsRaw) {
    if (jsonOutput) {
      console.log(JSON.stringify({ resolutions: [], message: "No conflicting files" }));
    } else {
      console.log("No conflicting files found.");
    }
    process.exit(0);
  }

  const conflictingFiles = conflictsRaw.split("\n").filter(Boolean);
  const lockfileConflicts = conflictingFiles.filter((f) => f in LOCKFILES);

  if (lockfileConflicts.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ resolutions: [], message: "No lockfile conflicts" }));
    } else {
      console.log("No lockfile conflicts found among conflicting files.");
      console.log(`Conflicting files: ${conflictingFiles.join(", ")}`);
    }
    process.exit(0);
  }

  const resolutions: Resolution[] = [];

  for (const file of lockfileConflicts) {
    const config = LOCKFILES[file];

    // Accept ours (current branch) version first
    const checkout = await run(["git", "checkout", "--ours", file]);
    if (checkout.exitCode !== 0) {
      resolutions.push({
        file,
        action: "checkout --ours",
        success: false,
        error: checkout.stderr,
      });
      continue;
    }

    // Stage the accepted version
    const add = await run(["git", "add", file]);
    if (add.exitCode !== 0) {
      resolutions.push({
        file,
        action: "git add",
        success: false,
        error: add.stderr,
      });
      continue;
    }

    // Regenerate by running install
    const install = await run(config.installCmd);
    if (install.exitCode !== 0) {
      resolutions.push({
        file,
        action: `${config.manager} install`,
        success: false,
        error: install.stderr.slice(0, 500),
      });
      continue;
    }

    // Stage the regenerated lockfile
    const addRegen = await run(["git", "add", file]);
    resolutions.push({
      file,
      action: `Regenerated with ${config.manager} install`,
      success: addRegen.exitCode === 0,
      error: addRegen.exitCode !== 0 ? addRegen.stderr : undefined,
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ resolutions }, null, 2));
  } else {
    console.log("Lockfile conflict resolution:\n");
    for (const r of resolutions) {
      const status = r.success ? "OK" : "FAIL";
      console.log(`  [${status}] ${r.file} — ${r.action}`);
      if (r.error) console.log(`         Error: ${r.error}`);
    }

    const remaining = conflictingFiles.filter((f) => !(f in LOCKFILES));
    if (remaining.length > 0) {
      console.log(`\nRemaining non-lockfile conflicts (${remaining.length}):`);
      for (const f of remaining) {
        console.log(`  ${f}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
