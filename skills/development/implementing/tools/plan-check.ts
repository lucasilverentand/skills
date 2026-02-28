const args = Bun.argv.slice(2);

const HELP = `
plan-check — Parse a plan file and verify all steps have corresponding code changes

Usage:
  bun run tools/plan-check.ts <plan-file> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Reads a markdown plan file, extracts numbered steps and file references,
then checks the git diff to verify each planned step has corresponding changes.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface PlanStep {
  number: number;
  text: string;
  files: string[];
  hasChanges: boolean;
}

async function main() {
  const planFile = filteredArgs[0];
  if (!planFile) {
    console.error("Error: missing plan file path");
    process.exit(1);
  }

  const file = Bun.file(planFile);
  if (!(await file.exists())) {
    console.error(`Error: plan file not found: ${planFile}`);
    process.exit(1);
  }

  const content = await file.text();
  const lines = content.split("\n");

  // Extract numbered steps (e.g., "1. Do something" or "- [ ] Do something")
  const stepPattern = /^\s*(?:(\d+)\.|[-*]\s*\[[ x]\])\s+(.+)/;
  const filePattern =
    /`([^`]+\.[a-zA-Z]{1,10})`|(?:^|\s)((?:src|lib|app|packages?)\/[^\s,)]+)/g;

  const steps: PlanStep[] = [];
  for (const line of lines) {
    const match = line.match(stepPattern);
    if (match) {
      const stepNum = match[1] ? parseInt(match[1]) : steps.length + 1;
      const text = match[2].trim();
      const files: string[] = [];

      let fileMatch;
      filePattern.lastIndex = 0;
      while ((fileMatch = filePattern.exec(text)) !== null) {
        files.push(fileMatch[1] || fileMatch[2]);
      }

      steps.push({ number: stepNum, text, files, hasChanges: false });
    }
  }

  // Get current git diff to check for changes
  const diffProc = Bun.spawn(["git", "diff", "--name-only", "HEAD"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const diffOutput = await new Response(diffProc.stdout).text();
  await diffProc.exited;

  const stagedProc = Bun.spawn(
    ["git", "diff", "--name-only", "--cached", "HEAD"],
    {
      stdout: "pipe",
      stderr: "pipe",
    }
  );
  const stagedOutput = await new Response(stagedProc.stdout).text();
  await stagedProc.exited;

  const changedFiles = new Set(
    [...diffOutput.split("\n"), ...stagedOutput.split("\n")]
      .map((f) => f.trim())
      .filter(Boolean)
  );

  // Match plan steps to changes
  for (const step of steps) {
    if (step.files.length === 0) {
      // Steps without file refs can't be checked automatically
      step.hasChanges = false;
    } else {
      step.hasChanges = step.files.some((f) => {
        for (const changed of changedFiles) {
          if (changed.endsWith(f) || changed.includes(f) || f.includes(changed)) {
            return true;
          }
        }
        return false;
      });
    }
  }

  const totalSteps = steps.length;
  const stepsWithChanges = steps.filter((s) => s.hasChanges).length;
  const stepsWithoutFiles = steps.filter((s) => s.files.length === 0).length;
  const missingChanges = steps.filter(
    (s) => s.files.length > 0 && !s.hasChanges
  );

  const result = {
    planFile,
    totalSteps,
    stepsWithChanges,
    stepsWithoutFileRefs: stepsWithoutFiles,
    missingChanges: missingChanges.map((s) => ({
      step: s.number,
      text: s.text,
      expectedFiles: s.files,
    })),
    changedFiles: [...changedFiles],
    steps,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Plan: ${planFile}`);
    console.log(`Steps: ${totalSteps} total, ${stepsWithChanges} with changes`);
    if (stepsWithoutFiles > 0) {
      console.log(`  ${stepsWithoutFiles} steps have no file references (cannot auto-check)`);
    }
    console.log();

    if (missingChanges.length > 0) {
      console.log("Missing changes:");
      for (const s of missingChanges) {
        console.log(`  Step ${s.number}: ${s.text}`);
        console.log(`    Expected files: ${s.files.join(", ")}`);
      }
    } else if (stepsWithChanges > 0) {
      console.log("All file-referenced steps have corresponding changes.");
    }

    if (changedFiles.size > 0) {
      console.log(`\nChanged files (${changedFiles.size}):`);
      for (const f of changedFiles) {
        console.log(`  ${f}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
