const args = Bun.argv.slice(2);

const HELP = `
page-list — List all Astro pages with their routes and layout assignments

Usage:
  bun run tools/page-list.ts [path] [options]

Arguments:
  path    Path to the Astro site package (default: current directory)

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

interface PageInfo {
  file: string;
  route: string;
  layout: string | null;
  hasContent: boolean;
}

function fileToRoute(filePath: string): string {
  let route = filePath
    .replace(/^src\/pages/, "")
    .replace(/\.(astro|md|mdx|ts|js)$/, "")
    .replace(/\/index$/, "/")
    .replace(/\[\.\.\.(.+)\]/, "*")
    .replace(/\[(.+)\]/, ":$1");

  if (!route.startsWith("/")) route = "/" + route;
  if (route !== "/" && route.endsWith("/")) route = route.slice(0, -1);
  return route;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const pagesDir = `${root}/src/pages`;

  const pagesCheck = Bun.file(`${pagesDir}/.`);
  const glob = new Bun.Glob("**/*.{astro,md,mdx,ts,js}");
  const pages: PageInfo[] = [];

  for await (const file of glob.scan({ cwd: pagesDir })) {
    // Skip files starting with _ (layouts, components)
    const fileName = file.split("/").pop() || "";
    if (fileName.startsWith("_")) continue;

    const route = fileToRoute(`src/pages/${file}`);
    const fullPath = `${pagesDir}/${file}`;
    const content = await Bun.file(fullPath).text();

    // Detect layout usage
    let layout: string | null = null;

    // Check frontmatter layout field (for .md/.mdx)
    const frontmatterMatch = content.match(/^---\s*\n[\s\S]*?layout:\s*['"]?([^\s'"]+)['"]?\s*\n[\s\S]*?---/);
    if (frontmatterMatch) {
      layout = frontmatterMatch[1];
    }

    // Check Astro component imports for Layout
    const layoutImportMatch = content.match(/import\s+(\w*Layout\w*)\s+from\s+['"]([^'"]+)['"]/);
    if (layoutImportMatch) {
      layout = layoutImportMatch[2];
    }

    const hasContent = file.endsWith(".md") || file.endsWith(".mdx");

    pages.push({ file: `src/pages/${file}`, route, layout, hasContent });
  }

  pages.sort((a, b) => a.route.localeCompare(b.route));

  if (jsonOutput) {
    console.log(JSON.stringify(pages, null, 2));
  } else {
    if (pages.length === 0) {
      console.log("No pages found in src/pages/");
      return;
    }

    console.log(`Found ${pages.length} page(s):\n`);

    const maxRoute = Math.max(...pages.map((p) => p.route.length), 5);
    const maxFile = Math.max(...pages.map((p) => p.file.length), 4);

    console.log(
      `  ${"Route".padEnd(maxRoute)}  ${"File".padEnd(maxFile)}  Layout`
    );
    console.log(
      `  ${"-".repeat(maxRoute)}  ${"-".repeat(maxFile)}  ------`
    );

    for (const page of pages) {
      const layoutStr = page.layout || "-";
      console.log(
        `  ${page.route.padEnd(maxRoute)}  ${page.file.padEnd(maxFile)}  ${layoutStr}`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
