const args = Bun.argv.slice(2);

const HELP = `
component-scaffold — Generate a component file with props interface and test stub

Usage:
  bun run tools/component-scaffold.ts <ComponentName> [options]

Arguments:
  ComponentName    PascalCase component name (e.g. "Button", "DataTable")

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Creates src/components/<ComponentName>.tsx with props interface
and NativeWind/Tailwind styling.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

async function main() {
  const name = filteredArgs[0];
  if (!name) {
    console.error("Error: missing required ComponentName argument");
    process.exit(1);
  }

  if (!/^[A-Z]/.test(name)) {
    console.error("Error: component name must be PascalCase (start with uppercase)");
    process.exit(1);
  }

  const root = process.cwd();
  const componentPath = `${root}/src/components/${name}.tsx`;
  const testPath = `${root}/src/components/${name}.test.tsx`;

  if (await Bun.file(componentPath).exists()) {
    console.error(`Error: component already exists at src/components/${name}.tsx`);
    process.exit(1);
  }

  const componentContent = `interface ${name}Props {
  children: React.ReactNode;
}

export function ${name}({ children }: ${name}Props) {
  return (
    <div>
      {children}
    </div>
  );
}
`;

  const testContent = `import { expect, test } from "bun:test";

test("${name} renders", () => {
  // TODO: add rendering test
  expect(true).toBe(true);
});
`;

  await Bun.write(componentPath, componentContent);
  await Bun.write(testPath, testContent);

  const createdFiles = [
    `src/components/${name}.tsx`,
    `src/components/${name}.test.tsx`,
  ];

  const result = {
    component: name,
    files: createdFiles,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Created component: ${name}`);
    for (const f of createdFiles) {
      console.log(`  ${f}`);
    }
    console.log(`\nAdd to src/index.ts:`);
    console.log(`  export { ${name} } from "./components/${name}";`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
