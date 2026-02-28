const args = Bun.argv.slice(2);

const HELP = `
component-list — List all exported UI components with prop types and file paths

Usage:
  bun run tools/component-list.ts [path] [options]

Arguments:
  path    Path to the UI package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface ComponentInfo {
  name: string;
  file: string;
  props: string[];
  hasDefaultExport: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const components: ComponentInfo[] = [];

  const glob = new Bun.Glob("src/**/*.{tsx,jsx}");

  for await (const file of glob.scan({ cwd: root })) {
    // Skip test files and non-component files
    if (file.includes(".test.") || file.includes(".spec.")) continue;
    if (file.includes("__tests__")) continue;

    const content = await Bun.file(`${root}/${file}`).text();

    // Find exported function components
    const namedExports = content.matchAll(
      /export\s+function\s+([A-Z]\w+)/g
    );

    for (const m of namedExports) {
      const name = m[1];

      // Extract props
      const propsPattern = new RegExp(
        `interface\\s+${name}Props\\s*\\{([^}]*)\\}`,
        "s"
      );
      const propsMatch = content.match(propsPattern);
      const props: string[] = [];

      if (propsMatch) {
        const propsBlock = propsMatch[1];
        const propLines = propsBlock.matchAll(
          /(\w+)(\?)?\s*:\s*([^;\n]+)/g
        );
        for (const p of propLines) {
          const optional = p[2] ? "?" : "";
          props.push(`${p[1]}${optional}: ${p[3].trim()}`);
        }
      }

      components.push({
        name,
        file,
        props,
        hasDefaultExport: false,
      });
    }

    // Check for export const components (arrow functions)
    const constExports = content.matchAll(
      /export\s+const\s+([A-Z]\w+)\s*(?::\s*\w+\s*)?=\s*(?:\([^)]*\)|[^=])/g
    );

    for (const m of constExports) {
      const name = m[1];
      if (components.some((c) => c.name === name && c.file === file)) continue;

      components.push({
        name,
        file,
        props: [],
        hasDefaultExport: false,
      });
    }

    // Check for default exports
    if (content.includes("export default")) {
      const defaultMatch = content.match(
        /export\s+default\s+(?:function\s+)?([A-Z]\w+)/
      );
      if (defaultMatch) {
        const existing = components.find(
          (c) => c.name === defaultMatch[1] && c.file === file
        );
        if (existing) {
          existing.hasDefaultExport = true;
        }
      }
    }
  }

  components.sort((a, b) => a.name.localeCompare(b.name));

  if (jsonOutput) {
    console.log(JSON.stringify(components, null, 2));
  } else {
    if (components.length === 0) {
      console.log("No exported components found in src/");
      return;
    }

    console.log(`UI Components (${components.length}):\n`);

    for (const c of components) {
      console.log(`  ${c.name} (${c.file})`);
      if (c.props.length > 0) {
        console.log("    props:");
        for (const p of c.props) {
          console.log(`      - ${p}`);
        }
      } else {
        console.log("    props: (none detected)");
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
