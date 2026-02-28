const args = Bun.argv.slice(2);

const HELP = `
workload-balance — Analyze task assignments and suggest redistribution

Usage:
  bun run tools/workload-balance.ts [tasks-file] [options]

Options:
  --agents <dir>   Path to agent configs directory (default: .agents/)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Analyzes task distribution across agents and suggests redistribution
when workloads are uneven. Reads tasks from a markdown task file or
.tasks.json.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] === "--agents")
);

import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: "pending" | "in_progress" | "completed";
}

interface Agent {
  name: string;
  skills: string[];
}

async function loadTasks(filePath: string): Promise<Task[]> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return [];

  if (filePath.endsWith(".json")) {
    return await file.json();
  }

  // Parse markdown task list
  const content = await file.text();
  const tasks: Task[] = [];
  const taskPattern = /^-\s*\[([ x])\]\s*(?:@(\w[\w-]*)\s+)?(.+)/gm;
  let match;
  let id = 1;

  while ((match = taskPattern.exec(content)) !== null) {
    tasks.push({
      id: String(id++),
      title: match[3].trim(),
      assignee: match[2] || "unassigned",
      status: match[1] === "x" ? "completed" : "pending",
    });
  }

  return tasks;
}

async function loadAgents(dir: string): Promise<Agent[]> {
  const agents: Agent[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.endsWith(".json") || entry.name === "team.json") continue;
      const config = await Bun.file(join(dir, entry.name)).json();
      agents.push({
        name: config.name || entry.name.replace(".json", ""),
        skills: config.skills || [],
      });
    }
  } catch {
    // No agents dir
  }
  return agents;
}

async function main() {
  const tasksFile = filteredArgs[0] || ".tasks.md";
  const agentsDir = resolve(getFlag("--agents") || ".agents");

  const tasks = await loadTasks(tasksFile);
  const agents = await loadAgents(agentsDir);

  if (tasks.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ tasks: 0, message: "No tasks found" }, null, 2));
    } else {
      console.log("No tasks found. Provide a tasks file or create .tasks.md");
    }
    return;
  }

  // Analyze distribution
  const byAssignee = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = byAssignee.get(task.assignee) || [];
    list.push(task);
    byAssignee.set(task.assignee, list);
  }

  const agentNames = new Set(agents.map((a) => a.name));
  const totalPending = tasks.filter((t) => t.status !== "completed").length;
  const avgLoad = agents.length > 0 ? totalPending / agents.length : totalPending;

  // Find overloaded and underloaded agents
  const suggestions: string[] = [];
  const overloaded: { name: string; count: number }[] = [];
  const underloaded: { name: string; count: number }[] = [];

  for (const agent of agents) {
    const assigned = (byAssignee.get(agent.name) || []).filter(
      (t) => t.status !== "completed"
    ).length;
    if (assigned > avgLoad * 1.5) {
      overloaded.push({ name: agent.name, count: assigned });
    } else if (assigned < avgLoad * 0.5) {
      underloaded.push({ name: agent.name, count: assigned });
    }
  }

  // Generate redistribution suggestions
  for (const over of overloaded) {
    for (const under of underloaded) {
      const diff = over.count - Math.round(avgLoad);
      if (diff > 0) {
        suggestions.push(
          `Move ${Math.min(diff, 2)} task(s) from ${over.name} to ${under.name}`
        );
      }
    }
  }

  const unassigned = byAssignee.get("unassigned") || [];
  if (unassigned.length > 0 && underloaded.length > 0) {
    suggestions.push(
      `Assign ${unassigned.length} unassigned task(s) to: ${underloaded.map((u) => u.name).join(", ")}`
    );
  }

  const result = {
    totalTasks: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    unassigned: unassigned.length,
    averageLoad: parseFloat(avgLoad.toFixed(1)),
    distribution: Object.fromEntries(
      [...byAssignee.entries()].map(([name, taskList]) => [
        name,
        {
          total: taskList.length,
          pending: taskList.filter((t) => t.status !== "completed").length,
        },
      ])
    ),
    overloaded,
    underloaded,
    suggestions,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Workload Analysis: ${tasks.length} tasks\n`);
    console.log(`  Pending: ${result.pending}`);
    console.log(`  In progress: ${result.inProgress}`);
    console.log(`  Completed: ${result.completed}`);
    console.log(`  Average load: ${avgLoad.toFixed(1)} tasks/agent\n`);

    console.log("Distribution:");
    for (const [name, info] of Object.entries(result.distribution)) {
      const bar = "=".repeat(Math.min((info as { pending: number }).pending * 3, 30));
      console.log(`  ${name.padEnd(20)} ${bar} ${(info as { pending: number }).pending} pending`);
    }

    if (suggestions.length > 0) {
      console.log("\nSuggestions:");
      for (const s of suggestions) {
        console.log(`  - ${s}`);
      }
    } else {
      console.log("\nWorkload is balanced.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
