const args = Bun.argv.slice(2);

const HELP = `
skill-map — Match available skills to agent roles and detect coverage gaps

Usage:
  bun run tools/skill-map.ts [skills-dir] [options]

Options:
  --agents <dir>   Path to agent configs directory (default: .agents/)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Scans the skills directory for all available skills, then checks which
are assigned to agents and which have no coverage.
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

interface Skill {
  name: string;
  category: string;
  path: string;
  description: string;
}

interface Agent {
  name: string;
  skills: string[];
  file: string;
}

async function findSkills(dir: string): Promise<Skill[]> {
  const skills: Skill[] = [];
  const categories = await readdir(dir, { withFileTypes: true });

  for (const cat of categories) {
    if (!cat.isDirectory()) continue;
    const catPath = join(dir, cat.name);
    const skillDirs = await readdir(catPath, { withFileTypes: true });

    for (const skillDir of skillDirs) {
      if (!skillDir.isDirectory()) continue;
      const skillPath = join(catPath, skillDir.name);
      const skillFile = join(skillPath, "SKILL.md");

      try {
        await stat(skillFile);
        const content = await Bun.file(skillFile).text();
        const descMatch = content.match(/description:\s*(.+)/);

        skills.push({
          name: skillDir.name,
          category: cat.name,
          path: skillPath,
          description: descMatch?.[1]?.trim() || "",
        });
      } catch {
        // No SKILL.md, skip
      }
    }
  }

  return skills;
}

async function loadAgents(dir: string): Promise<Agent[]> {
  const agents: Agent[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.endsWith(".json") || entry.name === "team.json") continue;
      const filePath = join(dir, entry.name);
      const config = await Bun.file(filePath).json();
      agents.push({
        name: config.name || entry.name.replace(".json", ""),
        skills: config.skills || [],
        file: filePath,
      });
    }
  } catch {
    // No agents directory
  }

  return agents;
}

async function main() {
  const skillsDir = resolve(filteredArgs[0] || "skills");
  const agentsDir = resolve(getFlag("--agents") || ".agents");

  let skillsDirExists = false;
  try {
    await stat(skillsDir);
    skillsDirExists = true;
  } catch {
    // Try relative to common paths
  }

  if (!skillsDirExists) {
    console.error(`Error: skills directory not found: ${skillsDir}`);
    process.exit(1);
  }

  const skills = await findSkills(skillsDir);
  const agents = await loadAgents(agentsDir);

  // Build assignment map
  const assignedSkills = new Set<string>();
  const agentSkillMap = new Map<string, string[]>();
  for (const agent of agents) {
    for (const skill of agent.skills) {
      assignedSkills.add(skill);
    }
    agentSkillMap.set(agent.name, agent.skills);
  }

  const availableSkillNames = new Set(skills.map((s) => s.name));

  // Find coverage gaps
  const unassigned = skills.filter((s) => !assignedSkills.has(s.name));
  const invalidRefs = agents.flatMap((a) =>
    a.skills
      .filter((s) => !availableSkillNames.has(s))
      .map((s) => ({ agent: a.name, skill: s }))
  );

  const result = {
    totalSkills: skills.length,
    totalAgents: agents.length,
    assigned: assignedSkills.size,
    unassigned: unassigned.map((s) => ({
      name: s.name,
      category: s.category,
    })),
    invalidReferences: invalidRefs,
    agents: agents.map((a) => ({
      name: a.name,
      skills: a.skills,
      validSkills: a.skills.filter((s) => availableSkillNames.has(s)).length,
    })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Skill Map: ${skills.length} skills, ${agents.length} agents`);
    console.log(`  Assigned: ${assignedSkills.size}`);
    console.log(`  Unassigned: ${unassigned.length}\n`);

    if (agents.length > 0) {
      console.log("Agent coverage:");
      for (const agent of agents) {
        const valid = agent.skills.filter((s) => availableSkillNames.has(s));
        console.log(`  ${agent.name}: ${valid.length}/${agent.skills.length} skills`);
        for (const skill of agent.skills) {
          const exists = availableSkillNames.has(skill);
          console.log(`    ${exists ? "v" : "x"} ${skill}`);
        }
      }
      console.log();
    }

    if (unassigned.length > 0) {
      console.log("Unassigned skills:");
      for (const skill of unassigned) {
        console.log(`  ${skill.category}/${skill.name}`);
      }
      console.log();
    }

    if (invalidRefs.length > 0) {
      console.log("Invalid skill references:");
      for (const ref of invalidRefs) {
        console.log(`  ${ref.agent} references '${ref.skill}' which doesn't exist`);
      }
    }

    if (unassigned.length === 0 && invalidRefs.length === 0) {
      console.log("Full coverage — all skills are assigned and all references are valid.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
