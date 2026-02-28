const args = Bun.argv.slice(2);

const HELP = `
dep-order — Analyze task dependencies and produce a valid execution order

Usage:
  bun run tools/dep-order.ts <plan-file> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Reads a plan file, extracts numbered steps and their dependency references,
and produces a topological ordering. Detects circular dependencies.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface Step {
  id: number;
  text: string;
  dependsOn: number[];
}

function topologicalSort(steps: Step[]): { order: number[]; cycle: number[] | null } {
  const graph = new Map<number, number[]>();
  const inDegree = new Map<number, number>();

  for (const step of steps) {
    graph.set(step.id, step.dependsOn);
    if (!inDegree.has(step.id)) inDegree.set(step.id, 0);
    for (const dep of step.dependsOn) {
      inDegree.set(step.id, (inDegree.get(step.id) || 0) + 1);
      if (!inDegree.has(dep)) inDegree.set(dep, 0);
    }
  }

  const queue: number[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const order: number[] = [];
  while (queue.length > 0) {
    queue.sort((a, b) => a - b);
    const current = queue.shift()!;
    order.push(current);

    // Find steps that depend on current
    for (const step of steps) {
      if (step.dependsOn.includes(current)) {
        inDegree.set(step.id, (inDegree.get(step.id) || 0) - 1);
        if (inDegree.get(step.id) === 0) {
          queue.push(step.id);
        }
      }
    }
  }

  if (order.length < steps.length) {
    const cycle = steps
      .filter((s) => !order.includes(s.id))
      .map((s) => s.id);
    return { order, cycle };
  }

  return { order, cycle: null };
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

  // Extract numbered steps
  const stepPattern = /^\s*(\d+)\.\s+(.+)/;
  const depPattern = /(?:after|depends on|requires|step)\s*#?(\d+)/gi;
  const implicitDepPattern = /(?:from|using|with)\s+(?:step\s*)?#?(\d+)/gi;

  const steps: Step[] = [];
  for (const line of lines) {
    const match = line.match(stepPattern);
    if (match) {
      const id = parseInt(match[1]);
      const text = match[2].trim();
      const dependsOn: number[] = [];

      // Look for explicit dependencies
      let depMatch;
      depPattern.lastIndex = 0;
      while ((depMatch = depPattern.exec(text)) !== null) {
        const depId = parseInt(depMatch[1]);
        if (depId !== id) dependsOn.push(depId);
      }

      implicitDepPattern.lastIndex = 0;
      while ((depMatch = implicitDepPattern.exec(text)) !== null) {
        const depId = parseInt(depMatch[1]);
        if (depId !== id && !dependsOn.includes(depId)) dependsOn.push(depId);
      }

      // If no explicit deps found, assume sequential dependency on previous step
      if (dependsOn.length === 0 && id > 1) {
        dependsOn.push(id - 1);
      }

      steps.push({ id, text, dependsOn });
    }
  }

  if (steps.length === 0) {
    console.error("Error: no numbered steps found in plan file");
    process.exit(1);
  }

  const { order, cycle } = topologicalSort(steps);
  const stepMap = new Map(steps.map((s) => [s.id, s]));

  const result = {
    planFile,
    totalSteps: steps.length,
    executionOrder: order.map((id) => ({
      step: id,
      text: stepMap.get(id)?.text || "",
      dependsOn: stepMap.get(id)?.dependsOn || [],
    })),
    hasCycle: cycle !== null,
    cycle: cycle || [],
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Plan: ${planFile} (${steps.length} steps)\n`);

    if (cycle) {
      console.log("CIRCULAR DEPENDENCY DETECTED:");
      console.log(`  Steps involved: ${cycle.join(", ")}`);
      console.log("  Resolve the cycle before proceeding.\n");
    }

    console.log("Execution Order:");
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const step = stepMap.get(id);
      if (step) {
        const deps =
          step.dependsOn.length > 0
            ? ` (after: ${step.dependsOn.join(", ")})`
            : "";
        console.log(`  ${i + 1}. [Step ${id}] ${step.text}${deps}`);
      }
    }

    if (cycle && cycle.length > 0) {
      console.log("\nUnresolvable steps:");
      for (const id of cycle) {
        const step = stepMap.get(id);
        if (step) {
          console.log(`  [Step ${id}] ${step.text}`);
        }
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
