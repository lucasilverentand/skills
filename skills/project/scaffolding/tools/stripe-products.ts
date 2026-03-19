const args = Bun.argv.slice(2);

const HELP = `
stripe-products — List Stripe products and prices from the connected account

Usage:
  bun run tools/stripe-products.ts [options]

Options:
  --check-mode    Show whether test or live keys are configured
  --json          Output as JSON instead of plain text
  --help          Show this help message

Environment:
  STRIPE_SECRET_KEY    Required — Stripe API secret key
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const checkMode = args.includes("--check-mode");

interface ProductInfo {
  id: string;
  name: string;
  active: boolean;
  prices: PriceInfo[];
}

interface PriceInfo {
  id: string;
  active: boolean;
  unitAmount: number | null;
  currency: string;
  type: string;
  interval: string | null;
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.error("Error: STRIPE_SECRET_KEY environment variable is not set");
    process.exit(1);
  }

  const isTestMode = secretKey.startsWith("sk_test_");

  if (checkMode) {
    if (jsonOutput) {
      console.log(JSON.stringify({ mode: isTestMode ? "test" : "live" }, null, 2));
    } else {
      console.log(`Stripe mode: ${isTestMode ? "TEST" : "LIVE"}`);
      if (!isTestMode) {
        console.log("\n  WARNING: You are using LIVE keys. Be careful with mutations.");
      }
    }
    return;
  }

  // Fetch products
  const productsRes = await fetch("https://api.stripe.com/v1/products?active=true&limit=100", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!productsRes.ok) {
    const error = await productsRes.text();
    console.error(`Stripe API error: ${productsRes.status} ${error}`);
    process.exit(1);
  }

  const productsData = await productsRes.json() as { data: Array<{ id: string; name: string; active: boolean }> };

  // Fetch prices
  const pricesRes = await fetch("https://api.stripe.com/v1/prices?active=true&limit=100&expand[]=data.product", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!pricesRes.ok) {
    const error = await pricesRes.text();
    console.error(`Stripe API error: ${pricesRes.status} ${error}`);
    process.exit(1);
  }

  const pricesData = await pricesRes.json() as {
    data: Array<{
      id: string;
      active: boolean;
      unit_amount: number | null;
      currency: string;
      type: string;
      recurring: { interval: string } | null;
      product: string | { id: string };
    }>;
  };

  // Group prices by product
  const productMap = new Map<string, ProductInfo>();

  for (const product of productsData.data) {
    productMap.set(product.id, {
      id: product.id,
      name: product.name,
      active: product.active,
      prices: [],
    });
  }

  for (const price of pricesData.data) {
    const productId = typeof price.product === "string" ? price.product : price.product.id;
    const product = productMap.get(productId);
    if (product) {
      product.prices.push({
        id: price.id,
        active: price.active,
        unitAmount: price.unit_amount,
        currency: price.currency,
        type: price.type,
        interval: price.recurring?.interval ?? null,
      });
    }
  }

  const products = Array.from(productMap.values());

  if (jsonOutput) {
    console.log(JSON.stringify({ mode: isTestMode ? "test" : "live", products }, null, 2));
  } else {
    console.log(`Stripe products (${isTestMode ? "TEST" : "LIVE"} mode):\n`);

    if (products.length === 0) {
      console.log("  No active products found.");
      return;
    }

    for (const product of products) {
      console.log(`  ${product.name} (${product.id})`);
      if (product.prices.length === 0) {
        console.log("    No active prices");
      } else {
        for (const price of product.prices) {
          const amount = price.unitAmount !== null ? `${(price.unitAmount / 100).toFixed(2)} ${price.currency.toUpperCase()}` : "custom";
          const interval = price.interval ? `/${price.interval}` : " one-time";
          console.log(`    ${price.id}: ${amount}${interval}`);
        }
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
