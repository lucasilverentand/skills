const args = Bun.argv.slice(2);

const HELP = `
trend-digest — Aggregate and summarize industry trend data from curated sources

Usage:
  bun run tools/trend-digest.ts <topic> [options]

Options:
  --sources <urls>   Comma-separated URLs to include as sources
  --json             Output as JSON instead of plain text
  --help             Show this help message

Searches for recent industry publications about a given topic and
produces a structured digest of trends, categorized as tailwinds,
headwinds, or neutral signals.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

let extraSources: string[] = [];
const srcIdx = args.indexOf("--sources");
if (srcIdx !== -1 && args[srcIdx + 1]) {
  extraSources = args[srcIdx + 1].split(",").map((s) => s.trim());
}

const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (srcIdx === -1 || (i !== srcIdx && i !== srcIdx + 1))
);

interface TrendSource {
  url: string;
  title: string;
  snippet: string;
  error?: string;
}

interface TrendSignal {
  signal: string;
  impact: "tailwind" | "headwind" | "neutral";
  evidence: string;
  source: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : "";
}

function classifySignal(text: string): TrendSignal["impact"] {
  const lower = text.toLowerCase();
  const tailwindKeywords = [
    "growth", "increase", "adoption", "rising", "expanding",
    "opportunity", "accelerat", "demand", "invest",
  ];
  const headwindKeywords = [
    "decline", "decrease", "risk", "threat", "challenge",
    "regulation", "restriction", "competition", "saturat",
  ];

  const tailwindScore = tailwindKeywords.filter((k) => lower.includes(k)).length;
  const headwindScore = headwindKeywords.filter((k) => lower.includes(k)).length;

  if (tailwindScore > headwindScore) return "tailwind";
  if (headwindScore > tailwindScore) return "headwind";
  return "neutral";
}

function extractKeyPhrases(text: string): string[] {
  // Extract sentences that contain trend-related keywords
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20 && s.length < 300);
  const trendKeywords = [
    "trend", "growth", "market", "adoption", "shift", "change",
    "increase", "decrease", "forecast", "expect", "predict",
    "emerging", "rising", "declining", "opportunity", "challenge",
  ];

  return sentences
    .filter((s) => trendKeywords.some((k) => s.toLowerCase().includes(k)))
    .slice(0, 10);
}

async function fetchSource(url: string): Promise<TrendSource> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TrendResearch/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      return { url, title: "", snippet: "", error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const title = extractTitle(html);
    const text = stripTags(html);
    const snippet = text.slice(0, 500);

    return { url, title, snippet };
  } catch (err: any) {
    return { url, title: "", snippet: "", error: err.message };
  }
}

async function main() {
  const topic = filteredArgs.join(" ");
  if (!topic) {
    console.error("Error: provide a topic to research");
    process.exit(1);
  }

  // Fetch provided sources
  const sources: TrendSource[] = [];
  for (const url of extraSources) {
    sources.push(await fetchSource(url));
  }

  // Extract signals from fetched content
  const signals: TrendSignal[] = [];
  for (const source of sources.filter((s) => !s.error)) {
    const phrases = extractKeyPhrases(source.snippet);
    for (const phrase of phrases) {
      signals.push({
        signal: phrase,
        impact: classifySignal(phrase),
        evidence: phrase.slice(0, 150),
        source: source.url,
      });
    }
  }

  const result = {
    topic,
    sourcesProvided: extraSources.length,
    sourcesAnalyzed: sources.filter((s) => !s.error).length,
    sources,
    signals,
    summary: {
      tailwinds: signals.filter((s) => s.impact === "tailwind").length,
      headwinds: signals.filter((s) => s.impact === "headwind").length,
      neutral: signals.filter((s) => s.impact === "neutral").length,
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Trend Digest: ${topic}\n`);

  if (extraSources.length === 0) {
    console.log("No source URLs provided. Use --sources to provide URLs to analyze.");
    console.log("This tool works best when paired with WebSearch to find relevant URLs first.\n");
    console.log("Example workflow:");
    console.log("  1. Use WebSearch to find industry reports about the topic");
    console.log("  2. Pass resulting URLs: bun run tools/trend-digest.ts <topic> --sources url1,url2");
    return;
  }

  console.log(`Sources analyzed: ${result.sourcesAnalyzed} of ${result.sourcesProvided}\n`);

  // Errors
  const errors = sources.filter((s) => s.error);
  if (errors.length > 0) {
    console.log("## Source Errors\n");
    for (const s of errors) console.log(`  - ${s.url}: ${s.error}`);
    console.log();
  }

  // Sources
  console.log("## Sources\n");
  for (const s of sources.filter((s) => !s.error)) {
    console.log(`  - ${s.title || s.url}`);
    console.log(`    ${s.snippet.slice(0, 200)}...`);
    console.log();
  }

  if (signals.length > 0) {
    console.log("## Signals\n");
    console.log(`  Tailwinds: ${result.summary.tailwinds}`);
    console.log(`  Headwinds: ${result.summary.headwinds}`);
    console.log(`  Neutral: ${result.summary.neutral}\n`);

    const tailwinds = signals.filter((s) => s.impact === "tailwind");
    if (tailwinds.length > 0) {
      console.log("  ### Tailwinds\n");
      for (const s of tailwinds) console.log(`    + ${s.signal}`);
    }

    const headwinds = signals.filter((s) => s.impact === "headwind");
    if (headwinds.length > 0) {
      console.log("\n  ### Headwinds\n");
      for (const s of headwinds) console.log(`    - ${s.signal}`);
    }

    const neutral = signals.filter((s) => s.impact === "neutral");
    if (neutral.length > 0) {
      console.log("\n  ### Neutral / Monitor\n");
      for (const s of neutral) console.log(`    ~ ${s.signal}`);
    }
  } else {
    console.log("## Signals\n\n  No trend signals extracted from sources.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
