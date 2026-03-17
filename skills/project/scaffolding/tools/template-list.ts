const args = Bun.argv.slice(2);

const HELP = `
template-list — List all email templates with subjects and required variables

Usage:
  bun run tools/template-list.ts [path] [options]

Arguments:
  path    Path to the email package (default: current directory)

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

interface TemplateInfo {
  name: string;
  file: string;
  hasSubject: boolean;
  props: string[];
  exportedAs: string;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const templatesDir = `${root}/src/templates`;
  const templates: TemplateInfo[] = [];

  // Scan templates directory
  const glob = new Bun.Glob("*.{tsx,jsx,ts,js}");

  for await (const file of glob.scan({ cwd: templatesDir })) {
    const content = await Bun.file(`${templatesDir}/${file}`).text();
    const name = file.replace(/\.(tsx|jsx|ts|js)$/, "");

    // Find exported function/component name
    const exportMatch = content.match(
      /export\s+(?:function|const)\s+(\w+)/
    );
    const exportedAs = exportMatch ? exportMatch[1] : name;

    // Find props interface
    const propsMatch = content.match(
      /interface\s+\w+Props\s*\{([^}]+)\}/
    );
    const props: string[] = [];

    if (propsMatch) {
      const propsBlock = propsMatch[1];
      const propMatches = propsBlock.matchAll(
        /(\w+)(\?)?\s*:\s*([^;\n]+)/g
      );
      for (const m of propMatches) {
        const optional = m[2] ? "?" : "";
        props.push(`${m[1]}${optional}: ${m[3].trim()}`);
      }
    }

    // Check for subject export
    const hasSubject =
      content.includes("export const subject") ||
      content.includes("export function subject");

    templates.push({
      name,
      file: `src/templates/${file}`,
      hasSubject,
      props,
      exportedAs,
    });
  }

  // Also scan src/ root for templates not in templates/
  const rootGlob = new Bun.Glob("src/*.{tsx,jsx}");
  for await (const file of rootGlob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    if (
      content.includes("@react-email") ||
      (content.includes("<Html") && content.includes("export"))
    ) {
      const name = file.replace(/^src\//, "").replace(/\.(tsx|jsx)$/, "");
      const exportMatch = content.match(
        /export\s+(?:function|const)\s+(\w+)/
      );

      templates.push({
        name,
        file,
        hasSubject: content.includes("export const subject") || content.includes("export function subject"),
        props: [],
        exportedAs: exportMatch ? exportMatch[1] : name,
      });
    }
  }

  templates.sort((a, b) => a.name.localeCompare(b.name));

  if (jsonOutput) {
    console.log(JSON.stringify(templates, null, 2));
  } else {
    if (templates.length === 0) {
      console.log("No email templates found in src/templates/");
      return;
    }

    console.log(`Email templates (${templates.length}):\n`);

    for (const t of templates) {
      const subjectIcon = t.hasSubject ? "+" : "x";
      console.log(`  ${t.exportedAs} (${t.file})`);
      console.log(`    [${subjectIcon}] subject function`);
      if (t.props.length > 0) {
        console.log("    props:");
        for (const p of t.props) {
          console.log(`      - ${p}`);
        }
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
