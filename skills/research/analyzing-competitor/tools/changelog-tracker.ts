const args = Bun.argv.slice(2);

const HELP = `
changelog-tracker — Scrape and summarize recent changelog entries

Usage:
  bun run tools/changelog-tracker.ts <url1> [url2...] [options]

Options:
  --limit <n>   Max entries per source (default: 20)
  --json        Output as JSON instead of plain text
  --help        Show this help message

Fetches changelog or release pages and extracts dated entries.
Works with common changelog formats: GitHub releases, dedicated
changelog pages, and blog-style update posts.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

let limit = 20;
const limitIdx = args.indexOf("--limit");
if (limitIdx !== -1 && args[limitIdx + 1]) {
  limit = parseInt(args[limitIdx + 1], 10);
}

const urls = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (limitIdx === -1 || (i !== limitIdx && i !== limitIdx + 1))
);

interface ChangelogEntry {
  date: string;
  title: string;
  content: string;
  type: "feature" | "fix" | "improvement" | "breaking" | "other";
}

interface ChangelogResult {
  url: string;
  source: string;
  entries: ChangelogEntry[];
  error?: string;
}

function classifyEntry(text: string): ChangelogEntry["type"] {
  const lower = text.toLowerCase();
  if (lower.includes("breaking") || lower.includes("removed") || lower.includes("deprecated")) {
    return "breaking";
  }
  if (lower.includes("new") || lower.includes("added") || lower.includes("feature") || lower.includes("launch")) {
    return "feature";
  }
  if (lower.includes("fix") || lower.includes("bug") || lower.includes("patch") || lower.includes("resolve")) {
    return "fix";
  }
  if (lower.includes("improve") || lower.includes("update") || lower.includes("enhance") || lower.includes("performance")) {
    return "improvement";
  }
  return "other";
}

function extractDates(text: string): string[] {
  const dates: string[] = [];
  // ISO dates
  const isoRe = /\d{4}-\d{2}-\d{2}/g;
  let m;
  while ((m = isoRe.exec(text)) !== null) dates.push(m[0]);
  // Month day, year
  const longRe = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi;
  while ((m = longRe.exec(text)) !== null) {
    const d = new Date(m[0]);
    if (!isNaN(d.getTime())) dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchChangelog(url: string): Promise<ChangelogResult> {
  // Check if it's a GitHub releases URL
  const ghMatch = url.match(
    /github\.com\/([^/]+)\/([^/]+)(?:\/releases)?/
  );
  if (ghMatch) {
    return fetchGitHubReleases(ghMatch[1], ghMatch[2], url);
  }

  // Generic changelog page
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ChangelogTracker/1.0)",
      Accept: "text/html",
    },
  });

  if (!res.ok) {
    return { url, source: "web", entries: [], error: `HTTP ${res.status}` };
  }

  const html = await res.text();
  const entries: ChangelogEntry[] = [];

  // Extract h2/h3 sections as changelog entries
  const sectionRe = /<h[23][^>]*>([\s\S]*?)<\/h[23]>([\s\S]*?)(?=<h[23][^>]*>|$)/gi;
  let match;
  while ((match = sectionRe.exec(html)) !== null && entries.length < limit) {
    const heading = stripTags(match[1]);
    const body = stripTags(match[2]).slice(0, 500);
    const dates = extractDates(heading + " " + body);
    const date = dates[0] ?? "";

    if (heading.length > 2) {
      entries.push({
        date,
        title: heading,
        content: body.slice(0, 300),
        type: classifyEntry(heading + " " + body),
      });
    }
  }

  return { url, source: "web", entries };
}

async function fetchGitHubReleases(
  owner: string,
  repo: string,
  originalUrl: string
): Promise<ChangelogResult> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${limit}`;
  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ChangelogTracker/1.0",
    },
  });

  if (!res.ok) {
    return {
      url: originalUrl,
      source: "github",
      entries: [],
      error: `GitHub API ${res.status}`,
    };
  }

  const releases = (await res.json()) as any[];
  const entries: ChangelogEntry[] = releases.map((r) => ({
    date: r.published_at?.split("T")[0] ?? "",
    title: r.name || r.tag_name || "",
    content: (r.body || "").slice(0, 300),
    type: classifyEntry((r.name || "") + " " + (r.body || "")),
  }));

  return { url: originalUrl, source: "github", entries };
}

async function main() {
  if (urls.length === 0) {
    console.error("Error: provide at least one changelog URL");
    process.exit(1);
  }

  const results: ChangelogResult[] = [];
  for (const url of urls) {
    try {
      results.push(await fetchChangelog(url));
    } catch (err: any) {
      results.push({ url, source: "unknown", entries: [], error: err.message });
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Human-readable
  console.log("# Changelog Tracking\n");

  for (const r of results) {
    console.log(`## ${r.url}\n`);
    if (r.error) {
      console.log(`  Error: ${r.error}\n`);
      continue;
    }

    if (r.entries.length === 0) {
      console.log("  No changelog entries extracted.\n");
      continue;
    }

    console.log(`  Source: ${r.source}`);
    console.log(`  Entries found: ${r.entries.length}\n`);

    // Summary by type
    const byType: Record<string, number> = {};
    for (const e of r.entries) {
      byType[e.type] = (byType[e.type] ?? 0) + 1;
    }
    console.log("  ### Summary\n");
    for (const [type, count] of Object.entries(byType)) {
      console.log(`    ${type}: ${count}`);
    }

    // Release cadence
    const datesWithValues = r.entries
      .filter((e) => e.date)
      .map((e) => new Date(e.date).getTime())
      .sort((a, b) => b - a);
    if (datesWithValues.length >= 2) {
      const gaps: number[] = [];
      for (let i = 0; i < datesWithValues.length - 1; i++) {
        gaps.push(
          (datesWithValues[i] - datesWithValues[i + 1]) / (1000 * 60 * 60 * 24)
        );
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      console.log(
        `\n  Release cadence: ~${Math.round(avgGap)} days between releases`
      );
    }

    // Recent entries
    console.log("\n  ### Recent Entries\n");
    for (const e of r.entries.slice(0, 10)) {
      const dateStr = e.date ? `(${e.date})` : "";
      const tag = e.type !== "other" ? `[${e.type}]` : "";
      console.log(`    ${tag} ${e.title} ${dateStr}`);
      if (e.content) {
        console.log(`      ${e.content.slice(0, 150)}`);
      }
    }
    console.log();
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
