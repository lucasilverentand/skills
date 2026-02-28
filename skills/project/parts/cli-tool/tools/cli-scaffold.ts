const args = Bun.argv.slice(2);

const HELP = `
cli-scaffold — Generate a new Bun CLI project with argument parsing boilerplate

Usage:
  bun run tools/cli-scaffold.ts <name> [options]

Arguments:
  name       Name of the CLI tool (used for package name and binary)

Options:
  --dir      Output directory (default: current directory/<name>)
  --scope    Package scope (default: none, e.g. @myproject)
  --dry-run  Show what would be created without writing files
  --json     Output as JSON instead of plain text
  --help     Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dryRun = args.includes("--dry-run");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

const scopeIdx = args.indexOf("--scope");
const scope = scopeIdx !== -1 ? args[scopeIdx + 1] : null;

const dirIdx = args.indexOf("--dir");
const customDir = dirIdx !== -1 ? args[dirIdx + 1] : null;

interface GeneratedFile {
  path: string;
  content: string;
}

async function main() {
  const name = filteredArgs[0];
  if (!name) {
    console.error("Error: missing required name argument");
    process.exit(1);
  }

  const outDir = customDir || `${process.cwd()}/${name}`;
  const pkgName = scope ? `${scope}/${name}` : name;

  const files: GeneratedFile[] = [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: pkgName,
          version: "0.0.1",
          type: "module",
          bin: { [name]: "src/index.ts" },
          scripts: {
            dev: "bun run src/index.ts",
            build: `bun build src/index.ts --compile --outfile dist/${name}`,
          },
        },
        null,
        2
      ) + "\n",
    },
    {
      path: "src/index.ts",
      content: `const args = Bun.argv.slice(2);

const HELP = \`
${name} — TODO: add description

Usage:
  ${name} <command> [options]

Commands:
  hello    Say hello

Options:
  --json    Output as JSON
  --help    Show this help message
\`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const command = args[0];
const jsonOutput = args.includes("--json");

switch (command) {
  case "hello": {
    const name = args[1] || "world";
    if (jsonOutput) {
      console.log(JSON.stringify({ greeting: \`Hello, \${name}!\` }));
    } else {
      console.log(\`Hello, \${name}!\`);
    }
    break;
  }
  default:
    console.error(\`Unknown command: \${command}\`);
    console.error("Run with --help for usage information.");
    process.exit(1);
}
`,
    },
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ESNext",
            module: "ESNext",
            moduleResolution: "bundler",
            strict: true,
            skipLibCheck: true,
            types: ["bun-types"],
          },
          include: ["src"],
        },
        null,
        2
      ) + "\n",
    },
  ];

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        { outDir, files: files.map((f) => ({ path: f.path })) },
        null,
        2
      )
    );
    return;
  }

  if (dryRun) {
    console.log(`Would create ${name} CLI at ${outDir}:\n`);
    for (const file of files) {
      console.log(`  ${outDir}/${file.path}`);
    }
    return;
  }

  for (const file of files) {
    const fullPath = `${outDir}/${file.path}`;
    const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));
    await Bun.write(fullPath, file.content);
  }

  console.log(`Created ${name} CLI at ${outDir}\n`);
  console.log("Next steps:");
  console.log(`  cd ${outDir}`);
  console.log("  bun install");
  console.log(`  bun run dev -- hello`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
