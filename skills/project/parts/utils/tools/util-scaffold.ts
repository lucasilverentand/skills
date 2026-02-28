const args = Bun.argv.slice(2);

const HELP = `
util-scaffold — Generate a utility module file with function stub and test file

Usage:
  bun run tools/util-scaffold.ts <module-name> [options]

Arguments:
  module-name    Module name in kebab-case (e.g. "date-format", "string-utils")

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Creates src/<module-name>.ts and src/<module-name>.test.ts.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

async function main() {
  const moduleName = filteredArgs[0];
  if (!moduleName) {
    console.error("Error: missing required module-name argument");
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(moduleName)) {
    console.error("Error: module name must be kebab-case");
    process.exit(1);
  }

  const root = process.cwd();
  const srcPath = `${root}/src/${moduleName}.ts`;
  const testPath = `${root}/src/${moduleName}.test.ts`;

  if (await Bun.file(srcPath).exists()) {
    console.error(`Error: module already exists at src/${moduleName}.ts`);
    process.exit(1);
  }

  const exampleName = toCamelCase(moduleName);

  const srcContent = `/**
 * ${moduleName} utilities
 */

export function ${exampleName}Example(input: string): string {
  // TODO: implement
  return input;
}
`;

  const testContent = `import { expect, test } from "bun:test";
import { ${exampleName}Example } from "./${moduleName}";

test("${exampleName}Example works", () => {
  const result = ${exampleName}Example("test");
  expect(result).toBe("test");
});
`;

  await Bun.write(srcPath, srcContent);
  await Bun.write(testPath, testContent);

  const createdFiles = [
    `src/${moduleName}.ts`,
    `src/${moduleName}.test.ts`,
  ];

  const result = {
    module: moduleName,
    files: createdFiles,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Created utility module: ${moduleName}`);
    for (const f of createdFiles) {
      console.log(`  ${f}`);
    }
    console.log(`\nAdd to src/index.ts:`);
    console.log(`  export * from "./${moduleName}";`);
    console.log(`\nRun tests:`);
    console.log(`  bun test src/${moduleName}.test.ts`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
