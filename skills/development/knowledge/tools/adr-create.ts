const args = Bun.argv.slice(2);

const HELP = `
adr-create — Scaffold a new ADR with auto-incrementing ID

Usage:
  bun run tools/adr-create.ts "<title>" [options]

Options:
  --dir <path>    ADR directory (default: docs/decisions)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Creates a new Architecture Decision Record from a template with the next
available sequential ID. The ADR is created in the specified directory
with a standardized filename and template.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dirIdx = args.indexOf("--dir");
const adrDir = dirIdx !== -1 ? args[dirIdx + 1] : "docs/decisions";
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (dirIdx === -1 || i !== dirIdx + 1)
);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateTemplate(id: number, title: string, date: string): string {
  return `# ADR-${String(id).padStart(3, "0")}: ${title}

## Status

Proposed

## Date

${date}

## Context

<!-- What situation or problem made this decision necessary? -->
<!-- Include relevant constraints, requirements, and background. -->

## Decision

<!-- State the decision clearly as a positive statement: "We will..." -->

## Consequences

### Positive

<!-- What becomes easier, faster, or more reliable? -->

### Negative

<!-- What becomes harder, slower, or more complex? -->
<!-- What trade-offs are we accepting? -->

## Affected code

<!-- List file paths or modules that implement or are affected by this decision. -->
<!-- These paths are used by adr-stale.ts to detect when an ADR may need updating. -->

-

## References

<!-- Links to relevant issues, RFCs, documentation, or prior ADRs. -->
`;
}

async function findNextId(dir: string): Promise<number> {
  const { existsSync, readdirSync } = await import("node:fs");

  if (!existsSync(dir)) return 1;

  const files = readdirSync(dir);
  let maxId = 0;

  for (const file of files) {
    const match = file.match(/^(\d+)-/);
    if (match) {
      const id = parseInt(match[1]);
      if (id > maxId) maxId = id;
    }
  }

  return maxId + 1;
}

async function main() {
  const title = filteredArgs[0];
  if (!title) {
    console.error("Error: missing required title argument");
    process.exit(1);
  }

  const { resolve, join } = await import("node:path");
  const { mkdirSync, existsSync } = await import("node:fs");

  const resolvedDir = resolve(adrDir);

  // Create directory if it doesn't exist
  if (!existsSync(resolvedDir)) {
    mkdirSync(resolvedDir, { recursive: true });
  }

  const id = await findNextId(resolvedDir);
  const slug = slugify(title);
  const filename = `${String(id).padStart(3, "0")}-${slug}.md`;
  const filepath = join(resolvedDir, filename);
  const date = new Date().toISOString().split("T")[0];

  const content = generateTemplate(id, title, date);

  await Bun.write(filepath, content);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          id,
          title,
          filename,
          filepath,
          date,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Created ADR-${String(id).padStart(3, "0")}: ${title}`);
    console.log(`  File: ${filepath}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Fill in Context, Decision, and Consequences`);
    console.log(`  2. Add affected file paths`);
    console.log(`  3. Link from source code: // See ADR-${String(id).padStart(3, "0")}: ${title}`);
    console.log(`  4. Commit the ADR with the implementing code change`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
