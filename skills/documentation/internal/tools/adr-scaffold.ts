const args = Bun.argv.slice(2);

const HELP = `
adr-scaffold — Create a new Architecture Decision Record from a template

Usage:
  bun run tools/adr-scaffold.ts <title> [options]

Arguments:
  title   Title of the decision (e.g. "Use Postgres instead of SQLite")

Options:
  --dir <path>   Directory for ADR files (default: docs/decisions)
  --json         Output the ADR content and path as JSON instead of writing the file
  --help         Show this help message

Examples:
  bun run tools/adr-scaffold.ts "Use Hono for the API layer"
  bun run tools/adr-scaffold.ts "Switch to Biome" --dir architecture/decisions
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dirIdx = args.indexOf("--dir");
const adrDir = dirIdx !== -1 ? args[dirIdx + 1] : "docs/decisions";
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== dirIdx + 1
);

async function getNextNumber(dir: string): Promise<number> {
  const resolvedDir = Bun.resolveSync(dir, process.cwd());
  const glob = new Bun.Glob("*.md");
  let maxNum = 0;

  try {
    for await (const file of glob.scan({ cwd: resolvedDir })) {
      const match = file.match(/^(\d+)-/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    }
  } catch {
    // Directory doesn't exist yet
  }

  return maxNum + 1;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateADR(number: number, title: string): string {
  const date = new Date().toISOString().split("T")[0];
  const paddedNum = String(number).padStart(4, "0");

  return `# ${paddedNum}. ${title}

Date: ${date}

Status: Proposed

## Context

<!-- What situation or problem forced this decision? What constraints exist? -->

## Decision

<!-- What was decided? Be specific about the chosen approach. -->

## Alternatives Considered

<!-- What other approaches were evaluated? Why were they rejected? -->

### Option A

<!-- Description, pros, cons -->

### Option B

<!-- Description, pros, cons -->

## Consequences

### Positive

<!-- What does this decision make easier? -->

### Negative

<!-- What does this decision make harder? What trade-offs were accepted? -->

### Neutral

<!-- What other effects does this have? -->
`;
}

async function main() {
  const title = filteredArgs.join(" ");
  if (!title) {
    console.error('Error: missing required argument <title>');
    process.exit(1);
  }

  const resolvedDir = Bun.resolveSync(adrDir, process.cwd());
  const number = await getNextNumber(adrDir);
  const paddedNum = String(number).padStart(4, "0");
  const slug = slugify(title);
  const filename = `${paddedNum}-${slug}.md`;
  const filepath = `${resolvedDir}/${filename}`;
  const content = generateADR(number, title);

  if (jsonOutput) {
    console.log(JSON.stringify({
      number,
      title,
      filename,
      filepath,
      content,
    }, null, 2));
    return;
  }

  // Ensure directory exists
  Bun.spawnSync(["mkdir", "-p", resolvedDir]);

  await Bun.write(filepath, content);
  console.log(`Created ADR: ${filepath}`);
  console.log(`  Number: ${paddedNum}`);
  console.log(`  Title: ${title}`);
  console.log(`  Status: Proposed`);
  console.log(`\nEdit the file to fill in Context, Decision, Alternatives, and Consequences.`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
