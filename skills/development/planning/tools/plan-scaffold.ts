const args = Bun.argv.slice(2);

const HELP = `
plan-scaffold — Generate a structured plan template from a feature description

Usage:
  bun run tools/plan-scaffold.ts "<feature description>" [options]

Options:
  --output <path>   Write plan to file instead of stdout
  --json            Output as JSON instead of plain text
  --help            Show this help message

Generates a structured markdown plan template with sections for data layer,
business logic, API layer, UI layer, and tests.
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

async function main() {
  const outputPath = getFlag("--output");

  const description = args
    .filter(
      (a, i) =>
        !a.startsWith("--") && !(args[i - 1] === "--output")
    )
    .join(" ")
    .trim();

  if (!description) {
    console.error("Error: missing feature description");
    process.exit(1);
  }

  const slug = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const date = new Date().toISOString().split("T")[0];

  const plan = `# Plan: ${description}

Created: ${date}

## Acceptance Criteria

- [ ] _Define what "done" looks like_
- [ ] _Edge case 1_
- [ ] _Edge case 2_

## Risks and Open Questions

- _What could go wrong?_
- _What do we not know yet?_

## 1. Data Layer

### Schema Changes
- _Tables/columns to add or modify_

### Migrations
- _Migration steps needed_

### Files
- \`_path/to/schema.ts_\`

## 2. Business Logic

### Service Layer
- _Core logic to implement_

### Validation
- _Input validation rules_

### Files
- \`_path/to/service.ts_\`

## 3. API Layer

### Endpoints
- \`POST /api/_resource_\` — _description_

### Request/Response Shapes
- _Define the shapes or reference Zod schemas_

### Files
- \`_path/to/routes.ts_\`

## 4. UI Layer

### Components
- _New or modified components_

### Routing
- _New routes or navigation changes_

### State
- _State management changes_

### Files
- \`_path/to/component.tsx_\`

## 5. Tests

### Unit Tests
- [ ] _Test case 1_

### Integration Tests
- [ ] _Test case 1_

### E2E Tests
- [ ] _Test case 1_

## Implementation Order

1. _First step (data layer changes)_
2. _Second step (business logic)_
3. _Third step (API layer)_
4. _Fourth step (UI)_
5. _Fifth step (tests)_

## Notes

_Any additional context or references_
`;

  const sections = [
    "Acceptance Criteria",
    "Risks and Open Questions",
    "Data Layer",
    "Business Logic",
    "API Layer",
    "UI Layer",
    "Tests",
    "Implementation Order",
  ];

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          description,
          slug,
          date,
          sections,
          plan,
          outputPath: outputPath || null,
        },
        null,
        2
      )
    );
  } else if (outputPath) {
    await Bun.write(outputPath, plan);
    console.log(`Plan written to: ${outputPath}`);
    console.log(`Sections: ${sections.join(", ")}`);
    console.log("\nFill in the placeholders (marked with _underscores_) before implementing.");
  } else {
    console.log(plan);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
