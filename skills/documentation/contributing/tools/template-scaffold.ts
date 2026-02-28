const args = Bun.argv.slice(2);

const HELP = `
template-scaffold — Generate GitHub issue and PR templates from project conventions

Usage:
  bun run tools/template-scaffold.ts [repo-dir] [options]

Arguments:
  repo-dir   Path to the repository root (default: current directory)

Options:
  --pr-only      Only generate PR template
  --issues-only  Only generate issue templates
  --json         Output template contents as JSON instead of writing files
  --help         Show this help message

Examples:
  bun run tools/template-scaffold.ts
  bun run tools/template-scaffold.ts ~/Developer/my-project --pr-only
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const prOnly = args.includes("--pr-only");
const issuesOnly = args.includes("--issues-only");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface TemplateSet {
  prTemplate: string;
  bugReport: string;
  featureRequest: string;
}

async function readJsonSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await Bun.file(path).text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function detectProjectContext(repoDir: string) {
  const pkg = await readJsonSafe(`${repoDir}/package.json`);
  const hasTests = !!(pkg?.scripts as Record<string, string>)?.test;
  const hasLint = !!(pkg?.scripts as Record<string, string>)?.lint ||
    !!(pkg?.scripts as Record<string, string>)?.check;
  const hasTypeCheck = !!(pkg?.scripts as Record<string, string>)?.typecheck ||
    !!(pkg?.scripts as Record<string, string>)?.["type-check"];
  const hasBiome = await Bun.file(`${repoDir}/biome.json`).exists() ||
    await Bun.file(`${repoDir}/biome.jsonc`).exists();

  return { hasTests, hasLint, hasTypeCheck, hasBiome };
}

function generateTemplates(ctx: Awaited<ReturnType<typeof detectProjectContext>>): TemplateSet {
  // PR Template
  const prChecklist: string[] = [];
  prChecklist.push("- [ ] Description of the change is clear");
  if (ctx.hasTests) prChecklist.push("- [ ] Tests added or updated for the change");
  if (ctx.hasLint || ctx.hasBiome) prChecklist.push("- [ ] Linting passes");
  if (ctx.hasTests) prChecklist.push("- [ ] All tests pass");
  prChecklist.push("- [ ] Documentation updated (if applicable)");
  prChecklist.push("- [ ] No breaking changes (or documented in description)");

  const prTemplate = `## What

<!-- Brief description of what this PR does -->

## Why

<!-- Why is this change needed? Link to issue if applicable -->

## How

<!-- How was this implemented? Any notable technical decisions? -->

## Checklist

${prChecklist.join("\n")}

## Screenshots

<!-- If applicable, add screenshots or screen recordings -->
`;

  // Bug report template
  const bugReport = `---
name: Bug Report
about: Report a bug or unexpected behavior
title: "[Bug] "
labels: bug
assignees: ''
---

## Describe the bug

<!-- A clear description of what the bug is -->

## Steps to reproduce

1.
2.
3.

## Expected behavior

<!-- What you expected to happen -->

## Actual behavior

<!-- What actually happened -->

## Environment

- OS:
- Version:
- Browser (if applicable):

## Additional context

<!-- Any other context, logs, or screenshots -->
`;

  // Feature request template
  const featureRequest = `---
name: Feature Request
about: Suggest a new feature or improvement
title: "[Feature] "
labels: enhancement
assignees: ''
---

## Problem

<!-- What problem does this feature solve? -->

## Proposed solution

<!-- How should this work? -->

## Alternatives considered

<!-- Any alternative approaches you've thought about -->

## Additional context

<!-- Any other context, mockups, or references -->
`;

  return { prTemplate, bugReport, featureRequest };
}

async function main() {
  const repoDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const ctx = await detectProjectContext(repoDir);
  const templates = generateTemplates(ctx);

  if (jsonOutput) {
    const output: Record<string, string> = {};
    if (!issuesOnly) output.prTemplate = templates.prTemplate;
    if (!prOnly) {
      output.bugReport = templates.bugReport;
      output.featureRequest = templates.featureRequest;
    }
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  const githubDir = `${repoDir}/.github`;
  const issueDir = `${githubDir}/ISSUE_TEMPLATE`;
  const written: string[] = [];

  if (!issuesOnly) {
    const prPath = `${githubDir}/PULL_REQUEST_TEMPLATE.md`;
    await Bun.write(prPath, templates.prTemplate);
    written.push(prPath);
  }

  if (!prOnly) {
    // Ensure issue template directory exists
    const proc = Bun.spawnSync(["mkdir", "-p", issueDir]);
    if (proc.exitCode !== 0) {
      console.error(`Error: failed to create ${issueDir}`);
      process.exit(1);
    }

    const bugPath = `${issueDir}/bug_report.md`;
    await Bun.write(bugPath, templates.bugReport);
    written.push(bugPath);

    const featurePath = `${issueDir}/feature_request.md`;
    await Bun.write(featurePath, templates.featureRequest);
    written.push(featurePath);
  }

  console.log("Generated templates:");
  for (const path of written) {
    console.log(`  ${path}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
