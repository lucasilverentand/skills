const args = Bun.argv.slice(2);

const HELP = `
feature-matrix — Generate a feature comparison matrix from competitor websites

Usage:
  bun run tools/feature-matrix.ts <url1> <url2> [url3...] [options]

Options:
  --criteria "c1,c2,c3"  Comma-separated evaluation criteria
  --json                 Output as JSON instead of plain text
  --help                 Show this help message

Fetches competitor pages and extracts feature information to build
a side-by-side comparison matrix. Best used with marketing/features pages.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

// Parse criteria
let criteria: string[] = [];
const criteriaIdx = args.indexOf("--criteria");
if (criteriaIdx !== -1 && args[criteriaIdx + 1]) {
  criteria = args[criteriaIdx + 1].split(",").map((c) => c.trim());
}

const urls = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (criteriaIdx === -1 || (i !== criteriaIdx && i !== criteriaIdx + 1))
);

interface PageInfo {
  url: string;
  title: string;
  description: string;
  headings: string[];
  features: string[];
  error?: string;
}

function extractTextContent(html: string): string {
  // Strip script and style tags completely
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  // Replace tags with spaces
  text = text.replace(/<[^>]+>/g, " ");
  // Decode basic entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractDescription(html: string): string {
  const match = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  );
  return match ? match[1].trim() : "";
}

function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const re = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 2 && text.length < 200) {
      headings.push(text);
    }
  }
  return headings;
}

function extractListItems(html: string): string[] {
  const items: string[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 3 && text.length < 200) {
      items.push(text);
    }
  }
  return [...new Set(items)];
}

async function fetchPage(url: string): Promise<PageInfo> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FeatureResearch/1.0)",
      Accept: "text/html",
    },
  });

  if (!res.ok) {
    return {
      url,
      title: "",
      description: "",
      headings: [],
      features: [],
      error: `HTTP ${res.status} ${res.statusText}`,
    };
  }

  const html = await res.text();
  const title = extractTitle(html);
  const description = extractDescription(html);
  const headings = extractHeadings(html);
  const features = extractListItems(html);

  return { url, title, description, headings, features };
}

async function main() {
  if (urls.length < 2) {
    console.error("Error: provide at least 2 competitor URLs to compare");
    process.exit(1);
  }

  const pages: PageInfo[] = [];
  for (const url of urls) {
    try {
      const page = await fetchPage(url);
      pages.push(page);
    } catch (err: any) {
      pages.push({
        url,
        title: "",
        description: "",
        headings: [],
        features: [],
        error: err.message,
      });
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ criteria, pages }, null, 2));
    return;
  }

  // Human-readable output
  console.log("# Feature Matrix\n");

  // Errors
  const errors = pages.filter((p) => p.error);
  if (errors.length > 0) {
    console.log("## Fetch Errors\n");
    for (const p of errors) {
      console.log(`- ${p.url}: ${p.error}`);
    }
    console.log();
  }

  const valid = pages.filter((p) => !p.error);

  // Overview
  console.log("## Competitors\n");
  for (const p of valid) {
    console.log(`### ${p.title || p.url}\n`);
    if (p.description) console.log(`  ${p.description}\n`);
    console.log(`  URL: ${p.url}`);
    console.log(`  Key headings: ${p.headings.slice(0, 8).join(", ")}`);
    console.log();
  }

  // If criteria were provided, build a matrix template
  if (criteria.length > 0) {
    console.log("## Feature Matrix\n");
    const header = `| Criterion | ${valid.map((p) => p.title || new URL(p.url).hostname).join(" | ")} |`;
    const separator = `| --- | ${valid.map(() => "---").join(" | ")} |`;
    console.log(header);
    console.log(separator);
    for (const c of criteria) {
      // Check if any extracted features match this criterion
      const cells = valid.map((p) => {
        const found = p.features.find((f) =>
          f.toLowerCase().includes(c.toLowerCase())
        );
        return found ? "Yes" : "Verify";
      });
      console.log(`| ${c} | ${cells.join(" | ")} |`);
    }
    console.log(
      "\nNote: 'Verify' means the criterion was not found automatically. Check the actual page content."
    );
  }

  // Feature lists from each competitor
  console.log("\n## Extracted Feature Lists\n");
  for (const p of valid) {
    const name = p.title || new URL(p.url).hostname;
    console.log(`### ${name}\n`);
    if (p.features.length === 0) {
      console.log("  No list items extracted. Review the page manually.\n");
    } else {
      for (const f of p.features.slice(0, 30)) {
        console.log(`  - ${f}`);
      }
      if (p.features.length > 30) {
        console.log(`  ... and ${p.features.length - 30} more items`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
