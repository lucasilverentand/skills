const args = Bun.argv.slice(2);

const HELP = `
team-status — Aggregate task progress across all agents and report completion

Usage:
  bun run tools/team-status.ts [tasks-file] [options]

Options:
  --agents <dir>   Path to agent configs directory (default: .agents/)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Reads task assignments and reports overall progress, blocked agents,
idle agents, and completion percentage per agent.
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

import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
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

  const content = await file.text();
  const tasks: Task[] = [];
  const taskPattern = /^-\s*\[([ x!])\]\s*(?:@(\w[\w-]*)\s+)?(.+)/gm;
  let match;
  let id = 1;

  while ((match = taskPattern.exec(content)) !== null) {
    const status =
      match[1] === "x"
        ? "completed"
        : match[1] === "!"
          ? "blocked"
          : "pending";
    tasks.push({
      id: String(id++),
      title: match[3].trim(),
      assignee: match[2] || "unassigned",
      status: status as Task["status"],
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

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Per-agent status
  const agentStatus = agents.map((agent) => {
    const agentTasks = tasks.filter((t) => t.assignee === agent.name);
    const agentCompleted = agentTasks.filter((t) => t.status === "completed").length;
    const agentBlocked = agentTasks.filter((t) => t.status === "blocked").length;
    const agentPending = agentTasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;

    return {
      name: agent.name,
      total: agentTasks.length,
      completed: agentCompleted,
      blocked: agentBlocked,
      pending: agentPending,
      idle: agentPending === 0 && agentBlocked === 0,
      progress: agentTasks.length > 0
        ? Math.round((agentCompleted / agentTasks.length) * 100)
        : 100,
    };
  });

  const idleAgents = agentStatus.filter((a) => a.idle && a.total > 0);
  const blockedAgents = agentStatus.filter((a) => a.blocked > 0);
  const unassigned = tasks.filter((t) => t.assignee === "unassigned");

  const result = {
    overall: { total, completed, inProgress, blocked, pending, progress },
    agents: agentStatus,
    idleAgents: idleAgents.map((a) => a.name),
    blockedAgents: blockedAgents.map((a) => ({
      name: a.name,
      blockedTasks: a.blocked,
    })),
    unassignedTasks: unassigned.length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const bar = "=".repeat(Math.round(progress / 5));
    const empty = "-".repeat(20 - Math.round(progress / 5));
    console.log(`Team Status: [${bar}${empty}] ${progress}%`);
    console.log(`  ${completed}/${total} completed | ${inProgress} in progress | ${blocked} blocked | ${pending} pending\n`);

    if (agentStatus.length > 0) {
      console.log("Per-agent:");
      for (const agent of agentStatus) {
        const agentBar = "=".repeat(Math.round(agent.progress / 10));
        const agentEmpty = "-".repeat(10 - Math.round(agent.progress / 10));
        const status = agent.blocked > 0
          ? "BLOCKED"
          : agent.idle
            ? "IDLE"
            : "ACTIVE";
        console.log(
          `  ${agent.name.padEnd(20)} [${agentBar}${agentEmpty}] ${agent.progress}% (${status})`
        );
      }
      console.log();
    }

    if (blockedAgents.length > 0) {
      console.log("Blocked:");
      for (const agent of blockedAgents) {
        console.log(`  ${agent.name}: ${agent.blockedTasks} blocked task(s)`);
      }
      console.log();
    }

    if (idleAgents.length > 0) {
      console.log(`Idle agents: ${idleAgents.map((a) => a.name).join(", ")}`);
    }

    if (unassigned.length > 0) {
      console.log(`Unassigned tasks: ${unassigned.length}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
