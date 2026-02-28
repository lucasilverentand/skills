const args = Bun.argv.slice(2);

const HELP = `
snapshot-update — Detect outdated snapshots and regenerate from current output

Usage:
  bun run tools/snapshot-update.ts [options]

Options:
  --check          Check for stale snapshots without updating (exit 1 if stale)
  --command <cmd>  Custom test command (default: bun test)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Runs snapshot tests, detects mismatches, and optionally regenerates them.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const checkOnly = args.includes("--check");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

async function findSnapshotFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist"].includes(entry.name)) continue;
      if (entry.name === "__snapshots__") {
        const snapEntries = await readdir(full);
        for (const snap of snapEntries) {
          if (snap.endsWith(".snap")) {
            files.push(join(full, snap));
          }
        }
      } else {
        files.push(...(await findSnapshotFiles(full)));
      }
    }
  }

  return files;
}

async function main() {
  const testCmd = getFlag("--command") || "bun test";

  // First, find existing snapshot files
  const snapshotFiles = await findSnapshotFiles(resolve("."));

  // Run tests to detect snapshot mismatches
  console.error(`Running: ${testCmd}`);
  const parts = testCmd.split(" ");
  const proc = Bun.spawn(parts, { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  const output = stdout + "\n" + stderr;
  const snapshotMismatches = (output.match(/snapshot/gi) || []).length > 0;
  const staleCount = (output.match(/obsolete|stale|outdated/gi) || []).length;

  // Check if there are snapshot failures
  const snapshotFailures = output.includes("Snapshot") && exitCode !== 0;

  if (checkOnly) {
    const result = {
      snapshotFiles: snapshotFiles.length,
      stale: snapshotFailures,
      staleCount,
      testsPassed: exitCode === 0,
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Snapshot Check: ${snapshotFiles.length} snapshot file(s)`);
      console.log(`  Status: ${snapshotFailures ? "STALE — snapshots need updating" : "UP TO DATE"}`);
    }

    if (snapshotFailures) process.exit(1);
    return;
  }

  // Update snapshots
  if (snapshotFailures) {
    console.error("Stale snapshots detected. Updating...");

    const updateCmd = testCmd.includes("vitest")
      ? [...parts, "--update"]
      : [...parts, "--update-snapshots"];

    const updateProc = Bun.spawn(updateCmd, {
      stdout: "pipe",
      stderr: "pipe",
    });
    const updateStdout = await new Response(updateProc.stdout).text();
    const updateStderr = await new Response(updateProc.stderr).text();
    const updateExit = await updateProc.exited;

    const result = {
      snapshotFiles: snapshotFiles.length,
      updated: updateExit === 0,
      output: (updateStdout + updateStderr).trim().slice(0, 500),
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (updateExit === 0) {
        console.log("Snapshots updated successfully.");
        console.log("Review the diff carefully before committing.");
      } else {
        console.log("Failed to update snapshots:");
        console.log((updateStdout + updateStderr).trim().slice(0, 500));
      }
    }
  } else {
    const result = {
      snapshotFiles: snapshotFiles.length,
      stale: false,
      message: "All snapshots are up to date",
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`${snapshotFiles.length} snapshot file(s) — all up to date.`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
