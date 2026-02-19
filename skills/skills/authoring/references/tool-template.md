# Tool Template

Use this as a starting point for new tool scripts:

```ts
const args = Bun.argv.slice(2);

const HELP = `
<tool-name> — <one-line description>

Usage:
  bun run tools/<tool-name>.ts <required-arg> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required argument");
    process.exit(1);
  }

  // --- tool logic here ---

  const result = {}; // replace with actual result

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // human-readable output
    console.log(result);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
```
