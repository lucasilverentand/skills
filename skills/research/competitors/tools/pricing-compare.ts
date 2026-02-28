const args = Bun.argv.slice(2);

const HELP = `
pricing-compare — Collect and tabulate pricing tiers from competitor websites

Usage:
  bun run tools/pricing-compare.ts <url1> <url2> [url3...] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Fetches pricing pages and extracts tier names, prices, and feature lists
to build a comparison table. Works best with /pricing URLs.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const urls = args.filter((a) => !a.startsWith("--"));

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
}

interface PricingResult {
  url: string;
  productName: string;
  tiers: PricingTier[];
  rawPricesMentioned: string[];
  pricingModel: string;
  error?: string;
}

function extractPrices(text: string): string[] {
  const prices: string[] = [];
  // Match $X, $X.XX, $X/mo, EUR X, etc.
  const priceRe = /(?:\$|€|£|USD|EUR|GBP)\s*\d[\d,]*(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|year|yr|user|seat))?/gi;
  let m;
  while ((m = priceRe.exec(text)) !== null) {
    prices.push(m[0].trim());
  }
  // Also match "X$/mo" pattern
  const reverseRe = /\d[\d,]*(?:\.\d{2})?\s*(?:\$|€|£)(?:\s*\/\s*(?:mo|month|year|yr|user|seat))?/gi;
  while ((m = reverseRe.exec(text)) !== null) {
    prices.push(m[0].trim());
  }
  return [...new Set(prices)];
}

function guessPricingModel(text: string): string {
  const lower = text.toLowerCase();
  const signals: string[] = [];
  if (lower.includes("per seat") || lower.includes("per user") || lower.includes("/user")) {
    signals.push("per-seat");
  }
  if (lower.includes("usage") || lower.includes("metered") || lower.includes("pay as you go")) {
    signals.push("usage-based");
  }
  if (lower.includes("flat") || lower.includes("unlimited")) {
    signals.push("flat-rate");
  }
  if (lower.includes("free") || lower.includes("freemium")) {
    signals.push("freemium");
  }
  if (lower.includes("enterprise") || lower.includes("contact us") || lower.includes("custom")) {
    signals.push("enterprise-tier");
  }
  return signals.length > 0 ? signals.join(" + ") : "unknown";
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
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim().split(/\s*[|\-–—]/).shift()?.trim() ?? "" : "";
}

async function fetchPricing(url: string): Promise<PricingResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; PricingResearch/1.0)",
      Accept: "text/html",
    },
  });

  if (!res.ok) {
    return {
      url,
      productName: "",
      tiers: [],
      rawPricesMentioned: [],
      pricingModel: "unknown",
      error: `HTTP ${res.status}`,
    };
  }

  const html = await res.text();
  const text = stripTags(html);
  const productName = extractTitle(html);
  const rawPricesMentioned = extractPrices(text);
  const pricingModel = guessPricingModel(text);

  // Extract pricing tiers by looking for common tier name patterns
  const tiers: PricingTier[] = [];
  const tierNames = [
    "free",
    "starter",
    "basic",
    "hobby",
    "personal",
    "pro",
    "professional",
    "team",
    "teams",
    "business",
    "growth",
    "scale",
    "enterprise",
    "custom",
    "premium",
    "plus",
    "standard",
  ];

  // Look for sections that match tier names
  for (const tierName of tierNames) {
    const re = new RegExp(
      `(?:^|\\s)${tierName}(?:\\s|$|<)`,
      "i"
    );
    if (re.test(text)) {
      // Find associated price
      const contextRe = new RegExp(
        `${tierName}[^.]{0,200}`,
        "i"
      );
      const context = contextRe.exec(text)?.[0] ?? "";
      const prices = extractPrices(context);

      tiers.push({
        name: tierName.charAt(0).toUpperCase() + tierName.slice(1),
        price: prices[0] ?? "See website",
        period: context.toLowerCase().includes("/year") || context.toLowerCase().includes("annually")
          ? "annual"
          : "monthly",
        features: [],
      });
    }
  }

  return { url, productName, tiers, rawPricesMentioned, pricingModel };
}

async function main() {
  if (urls.length < 2) {
    console.error("Error: provide at least 2 pricing page URLs to compare");
    process.exit(1);
  }

  const results: PricingResult[] = [];
  for (const url of urls) {
    try {
      results.push(await fetchPricing(url));
    } catch (err: any) {
      results.push({
        url,
        productName: "",
        tiers: [],
        rawPricesMentioned: [],
        pricingModel: "unknown",
        error: err.message,
      });
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Human-readable
  console.log("# Pricing Comparison\n");

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.log("## Errors\n");
    for (const r of errors) console.log(`- ${r.url}: ${r.error}`);
    console.log();
  }

  const valid = results.filter((r) => !r.error);

  for (const r of valid) {
    console.log(`## ${r.productName || r.url}\n`);
    console.log(`  URL: ${r.url}`);
    console.log(`  Pricing model: ${r.pricingModel}`);
    console.log(`  Prices found on page: ${r.rawPricesMentioned.join(", ") || "none extracted"}`);

    if (r.tiers.length > 0) {
      console.log("\n  Tiers detected:");
      for (const t of r.tiers) {
        console.log(`    - ${t.name}: ${t.price} (${t.period})`);
      }
    }
    console.log();
  }

  // Comparison table
  if (valid.length >= 2) {
    console.log("## Side-by-Side\n");
    console.log(
      `| | ${valid.map((r) => r.productName || new URL(r.url).hostname).join(" | ")} |`
    );
    console.log(`| --- | ${valid.map(() => "---").join(" | ")} |`);
    console.log(
      `| Model | ${valid.map((r) => r.pricingModel).join(" | ")} |`
    );
    console.log(
      `| Tiers | ${valid.map((r) => r.tiers.map((t) => t.name).join(", ") || "N/A").join(" | ")} |`
    );
    console.log(
      `| Prices | ${valid.map((r) => r.rawPricesMentioned.slice(0, 4).join(", ") || "N/A").join(" | ")} |`
    );
    console.log(
      "\nNote: Automated pricing extraction may miss dynamically rendered content. Verify against actual pages."
    );
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
