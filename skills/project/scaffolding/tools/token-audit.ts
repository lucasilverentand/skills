const args = Bun.argv.slice(2);

const HELP = `
token-audit — Check for hardcoded style values that should use design tokens

Usage:
  bun run tools/token-audit.ts [path] [options]

Arguments:
  path    Path to the UI package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans component files for hardcoded hex colors, pixel values, and
other style values that should use design tokens or Tailwind classes.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface Violation {
  file: string;
  line: number;
  kind: "hex-color" | "pixel-value" | "inline-style" | "rgb-color";
  value: string;
  context: string;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const violations: Violation[] = [];

  const glob = new Bun.Glob("src/**/*.{tsx,jsx,ts,css}");

  for await (const file of glob.scan({ cwd: root })) {
    if (file.includes(".test.") || file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;

      // Check for hardcoded hex colors (but not in CSS variable definitions or Tailwind config)
      if (!file.includes("tokens") && !file.includes("tailwind.config")) {
        const hexMatches = line.matchAll(/#(?:[0-9a-fA-F]{3}){1,2}\b/g);
        for (const m of hexMatches) {
          // Skip if it's in a comment or CSS variable definition
          if (line.includes("--") && line.indexOf("--") < line.indexOf(m[0])) continue;

          violations.push({
            file,
            line: i + 1,
            kind: "hex-color",
            value: m[0],
            context: line.trim().substring(0, 100),
          });
        }

        // Check for rgb/rgba
        const rgbMatches = line.matchAll(/rgba?\s*\(\s*\d+/g);
        for (const m of rgbMatches) {
          violations.push({
            file,
            line: i + 1,
            kind: "rgb-color",
            value: m[0],
            context: line.trim().substring(0, 100),
          });
        }
      }

      // Check for inline styles in JSX
      if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
        if (line.includes("style={{") || line.includes("style={")) {
          violations.push({
            file,
            line: i + 1,
            kind: "inline-style",
            value: "style={{...}}",
            context: line.trim().substring(0, 100),
          });
        }
      }

      // Check for hardcoded pixel values outside Tailwind config
      if (!file.includes("tailwind.config") && !file.includes("tokens")) {
        const pxMatches = line.matchAll(/:\s*(\d+)px\b/g);
        for (const m of pxMatches) {
          violations.push({
            file,
            line: i + 1,
            kind: "pixel-value",
            value: `${m[1]}px`,
            context: line.trim().substring(0, 100),
          });
        }
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ violations, clean: violations.length === 0 }, null, 2));
  } else {
    if (violations.length === 0) {
      console.log("No hardcoded style values found. Design tokens look good.");
      return;
    }

    console.log(`Found ${violations.length} hardcoded style value(s):\n`);

    const grouped = new Map<string, Violation[]>();
    for (const v of violations) {
      const list = grouped.get(v.kind) || [];
      list.push(v);
      grouped.set(v.kind, list);
    }

    for (const [kind, items] of grouped) {
      console.log(`  ${kind} (${items.length}):`);
      for (const v of items) {
        console.log(`    ${v.file}:${v.line} — ${v.value}`);
        console.log(`      ${v.context}`);
      }
      console.log();
    }

    console.log("Replace hardcoded values with design tokens or Tailwind utilities.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
