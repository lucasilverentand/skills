const args = Bun.argv.slice(2);

const HELP = `
template-preview — Render an email template with sample data and write HTML to stdout

Usage:
  bun run tools/template-preview.ts <template-name> [options]

Arguments:
  template-name    Name of the template file (without extension)

Options:
  --open    Write to a temp file and open in the default browser
  --json    Output as JSON instead of plain text
  --help    Show this help message

Looks for the template in src/templates/<name>.tsx. Renders with sample
props extracted from the props interface defaults.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const openBrowser = args.includes("--open");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

async function main() {
  const templateName = filteredArgs[0];
  if (!templateName) {
    console.error("Error: missing required template-name argument");
    process.exit(1);
  }

  const root = process.cwd();

  // Find the template file
  const candidates = [
    `${root}/src/templates/${templateName}.tsx`,
    `${root}/src/templates/${templateName}.jsx`,
    `${root}/src/templates/${templateName}.ts`,
    `${root}/src/${templateName}.tsx`,
  ];

  let templatePath: string | null = null;
  for (const candidate of candidates) {
    if (await Bun.file(candidate).exists()) {
      templatePath = candidate;
      break;
    }
  }

  if (!templatePath) {
    console.error(`Error: template '${templateName}' not found`);
    console.error(`Searched: ${candidates.join(", ")}`);
    process.exit(1);
  }

  const content = await Bun.file(templatePath).text();

  // Extract props interface for sample data generation
  const propsMatch = content.match(/interface\s+\w+Props\s*\{([^}]+)\}/);
  const sampleProps: Record<string, string> = {};

  if (propsMatch) {
    const propsBlock = propsMatch[1];
    const propMatches = propsBlock.matchAll(/(\w+)(\?)?\s*:\s*(\w+)/g);
    for (const m of propMatches) {
      const name = m[1];
      const type = m[3];
      // Generate sample values based on type
      switch (type) {
        case "string":
          if (name.toLowerCase().includes("url") || name.toLowerCase().includes("link")) {
            sampleProps[name] = "https://example.com";
          } else if (name.toLowerCase().includes("email")) {
            sampleProps[name] = "user@example.com";
          } else if (name.toLowerCase().includes("name")) {
            sampleProps[name] = "Jane Doe";
          } else {
            sampleProps[name] = `Sample ${name}`;
          }
          break;
        case "number":
          sampleProps[name] = "42";
          break;
        case "boolean":
          sampleProps[name] = "true";
          break;
        default:
          sampleProps[name] = `(${type})`;
      }
    }
  }

  // Try to render the template via bun
  try {
    const proc = Bun.spawn(
      [
        "bun",
        "-e",
        `
        import { render } from "@react-email/render";
        const mod = await import("${templatePath}");
        const Component = mod.default || Object.values(mod).find(v => typeof v === "function");
        if (!Component) { console.error("No component found"); process.exit(1); }
        const html = await render(Component(${JSON.stringify(sampleProps)}));
        console.log(html);
        `,
      ],
      {
        cwd: root,
        stdout: "pipe",
        stderr: "pipe",
      }
    );

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    if (exitCode === 0 && stdout.trim()) {
      if (openBrowser) {
        const tmpPath = `/tmp/email-preview-${templateName}.html`;
        await Bun.write(tmpPath, stdout);
        Bun.spawn(["open", tmpPath]);
        console.log(`Preview written to ${tmpPath} and opened in browser.`);
      } else if (jsonOutput) {
        console.log(JSON.stringify({ template: templateName, html: stdout.trim(), sampleProps }, null, 2));
      } else {
        console.log(stdout);
      }
      return;
    }

    // Rendering failed, fall back to showing template info
    if (stderr.trim()) {
      console.error(`Render warning: ${stderr.trim()}`);
    }
  } catch {
    // Rendering not available (missing react-email), show info instead
  }

  // Fallback: show template info without rendering
  if (jsonOutput) {
    console.log(JSON.stringify({ template: templateName, file: templatePath, sampleProps, rendered: false }, null, 2));
  } else {
    console.log(`Template: ${templateName}`);
    console.log(`File: ${templatePath}`);
    console.log(`\nSample props:`);
    for (const [key, value] of Object.entries(sampleProps)) {
      console.log(`  ${key}: ${value}`);
    }
    console.log(`\nCould not render HTML — ensure @react-email/render is installed.`);
    console.log(`To render manually: bun -e 'import ... from "${templatePath}"'`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
