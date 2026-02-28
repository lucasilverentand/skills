const args = Bun.argv.slice(2);

const HELP = `
product-list — List Stripe products, prices, and subscription configuration

Usage:
  bun run tools/product-list.ts [path] [options]

Arguments:
  path    Path to the payments package (default: current directory)

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

interface PriceRef {
  priceId: string;
  file: string;
  line: number;
}

interface ProductRef {
  productId: string;
  file: string;
  line: number;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  const priceRefs: PriceRef[] = [];
  const productRefs: ProductRef[] = [];
  let hasStripeImport = false;
  let checkoutMode = "";

  // Scan all source files for Stripe price and product IDs
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");

  for await (const file of glob.scan({ cwd: root, dot: false })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    if (content.includes("from 'stripe'") || content.includes('from "stripe"')) {
      hasStripeImport = true;
    }

    for (let i = 0; i < lines.length; i++) {
      // Match price IDs: price_xxx
      const priceMatches = lines[i].matchAll(/['"]price_(\w+)['"]/g);
      for (const m of priceMatches) {
        priceRefs.push({ priceId: `price_${m[1]}`, file, line: i + 1 });
      }

      // Match product IDs: prod_xxx
      const prodMatches = lines[i].matchAll(/['"]prod_(\w+)['"]/g);
      for (const m of prodMatches) {
        productRefs.push({ productId: `prod_${m[1]}`, file, line: i + 1 });
      }

      // Detect checkout mode
      if (lines[i].includes('mode:')) {
        const modeMatch = lines[i].match(/mode:\s*['"](\w+)['"]/);
        if (modeMatch) checkoutMode = modeMatch[1];
      }
    }
  }

  // Check for pricing configuration files
  let pricingConfig = "";
  const configCandidates = [
    "src/pricing.ts",
    "src/config/pricing.ts",
    "src/plans.ts",
    "src/config/plans.ts",
  ];

  for (const candidate of configCandidates) {
    const file = Bun.file(`${root}/${candidate}`);
    if (await file.exists()) {
      pricingConfig = candidate;
      break;
    }
  }

  const result = {
    hasStripeImport,
    checkoutMode: checkoutMode || null,
    pricingConfig: pricingConfig || null,
    priceRefs,
    productRefs,
    uniquePrices: [...new Set(priceRefs.map((r) => r.priceId))],
    uniqueProducts: [...new Set(productRefs.map((r) => r.productId))],
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Stripe product/price references:\n");

    if (!hasStripeImport) {
      console.log("  ! No Stripe import found. Install with: bun add stripe");
      return;
    }

    if (pricingConfig) {
      console.log(`  Pricing config: ${pricingConfig}`);
    }

    if (checkoutMode) {
      console.log(`  Checkout mode: ${checkoutMode}`);
    }

    if (result.uniquePrices.length > 0) {
      console.log(`\n  Price IDs (${result.uniquePrices.length}):`);
      for (const priceId of result.uniquePrices) {
        const refs = priceRefs.filter((r) => r.priceId === priceId);
        console.log(`    ${priceId}`);
        for (const ref of refs) {
          console.log(`      used in ${ref.file}:${ref.line}`);
        }
      }
    }

    if (result.uniqueProducts.length > 0) {
      console.log(`\n  Product IDs (${result.uniqueProducts.length}):`);
      for (const productId of result.uniqueProducts) {
        const refs = productRefs.filter((r) => r.productId === productId);
        console.log(`    ${productId}`);
        for (const ref of refs) {
          console.log(`      used in ${ref.file}:${ref.line}`);
        }
      }
    }

    if (result.uniquePrices.length === 0 && result.uniqueProducts.length === 0) {
      console.log("  No price or product IDs found in source files.");
      console.log("  Create products in the Stripe Dashboard and reference their IDs.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
