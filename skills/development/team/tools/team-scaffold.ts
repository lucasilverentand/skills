const args = Bun.argv.slice(2);

const HELP = `
team-scaffold — Generate agent configuration files from a team definition

Usage:
  bun run tools/team-scaffold.ts <team-name> [options]

Options:
  --agents <n>     Number of agents to create (default: 3)
  --output <dir>   Output directory (default: .agents/)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Generates a team configuration directory with agent definition files,
each configured with focused roles and skill assignments.
`.trim();

if (args.includes("--help") || args.length === 0) {
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
  (a, i) =>
    !a.startsWith("--") &&
    !(args[i - 1] === "--agents") &&
    !(args[i - 1] === "--output")
);

import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

async function main() {
  const teamName = filteredArgs[0];
  if (!teamName) {
    console.error("Error: team name required");
    process.exit(1);
  }

  const agentCount = parseInt(getFlag("--agents") || "3");
  const outputDir = resolve(getFlag("--output") || ".agents");

  await mkdir(outputDir, { recursive: true });

  const roles = [
    {
      name: "lead",
      description: "Team lead — coordinates work, reviews output, resolves blockers",
      skills: ["planning", "team"],
    },
    {
      name: "implementer",
      description: "Implementation specialist — builds features, wires modules",
      skills: ["implementing", "refactoring", "type-safety"],
    },
    {
      name: "tester",
      description: "Quality specialist — writes tests, fixes flaky tests, validates behavior",
      skills: ["testing", "test-fixing", "debugging"],
    },
    {
      name: "reviewer",
      description: "Code review specialist — reviews PRs, checks conventions, performance",
      skills: ["refactoring", "performance", "dead-code"],
    },
    {
      name: "infrastructure",
      description: "Infrastructure specialist — CI/CD, deployments, environment setup",
      skills: ["ci", "environment", "docker"],
    },
  ];

  const selectedRoles = roles.slice(0, agentCount);

  const agents: { name: string; file: string; config: object }[] = [];

  for (const role of selectedRoles) {
    const agentName = `${teamName}-${role.name}`;
    const config = {
      name: agentName,
      role: role.description,
      skills: role.skills,
      model: "claude-sonnet-4-6",
      context: "fork",
    };

    const configPath = join(outputDir, `${agentName}.json`);
    await Bun.write(configPath, JSON.stringify(config, null, 2) + "\n");
    agents.push({ name: agentName, file: configPath, config });
  }

  // Write team manifest
  const manifest = {
    team: teamName,
    agents: agents.map((a) => ({
      name: a.name,
      config: `${a.name}.json`,
    })),
    created: new Date().toISOString(),
  };

  const manifestPath = join(outputDir, "team.json");
  await Bun.write(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  const result = {
    teamName,
    outputDir,
    agents: agents.map((a) => ({
      name: a.name,
      file: a.file,
      skills: (a.config as { skills: string[] }).skills,
    })),
    manifestFile: manifestPath,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Team '${teamName}' scaffolded in ${outputDir}\n`);
    console.log("Agents:");
    for (const agent of agents) {
      const skills = (agent.config as { skills: string[] }).skills;
      console.log(`  ${agent.name}`);
      console.log(`    Skills: ${skills.join(", ")}`);
    }
    console.log(`\nManifest: ${manifestPath}`);
    console.log("\nNext: run skill-map.ts to verify all skills resolve.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
