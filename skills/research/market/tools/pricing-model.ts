const args = Bun.argv.slice(2);

const HELP = `
pricing-model — Simulate revenue projections across pricing tiers

Usage:
  bun run tools/pricing-model.ts [options]

Options:
  --tiers <json>        JSON array of tiers: [{"name":"Pro","price":29,"period":"month"}]
  --customers <n>       Total addressable customers (default: 1000)
  --conversion <pct>    Conversion rate from free to paid in % (default: 5)
  --distribution <json> Tier distribution as fractions: [0.6, 0.3, 0.1]
  --churn <pct>         Monthly churn rate in % (default: 5)
  --months <n>          Projection period in months (default: 12)
  --growth <pct>        Monthly customer growth rate in % (default: 10)
  --json                Output as JSON instead of plain text
  --help                Show this help message

Simulates monthly revenue over time based on pricing tiers, conversion
rates, churn, and customer growth. Produces a month-by-month projection.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

interface Tier {
  name: string;
  price: number;
  period: "month" | "year";
}

interface MonthProjection {
  month: number;
  totalCustomers: number;
  paidCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  mrr: number;
  cumulativeRevenue: number;
  byTier: { name: string; customers: number; revenue: number }[];
}

async function main() {
  // Parse inputs
  let tiers: Tier[];
  try {
    tiers = JSON.parse(getArg("--tiers", '[{"name":"Starter","price":9,"period":"month"},{"name":"Pro","price":29,"period":"month"},{"name":"Team","price":79,"period":"month"}]'));
  } catch {
    console.error("Error: --tiers must be valid JSON");
    process.exit(1);
  }

  const totalCustomers = parseInt(getArg("--customers", "1000"), 10);
  const conversionRate = parseFloat(getArg("--conversion", "5")) / 100;
  const churnRate = parseFloat(getArg("--churn", "5")) / 100;
  const months = parseInt(getArg("--months", "12"), 10);
  const growthRate = parseFloat(getArg("--growth", "10")) / 100;

  let distribution: number[];
  try {
    distribution = JSON.parse(getArg("--distribution", "[]"));
    if (distribution.length === 0) {
      // Default: evenly distributed across tiers
      distribution = tiers.map(() => 1 / tiers.length);
    }
  } catch {
    distribution = tiers.map(() => 1 / tiers.length);
  }

  // Normalize distribution
  const distSum = distribution.reduce((a, b) => a + b, 0);
  distribution = distribution.map((d) => d / distSum);

  // Run simulation
  const projections: MonthProjection[] = [];
  let currentCustomers = totalCustomers;
  let cumulativeRevenue = 0;
  let currentPaid = Math.round(currentCustomers * conversionRate);

  for (let month = 1; month <= months; month++) {
    // Growth
    const newCustomers = Math.round(currentCustomers * growthRate);
    currentCustomers += newCustomers;

    // Convert
    const newPaid = Math.round(newCustomers * conversionRate);
    currentPaid += newPaid;

    // Churn
    const churned = Math.round(currentPaid * churnRate);
    currentPaid = Math.max(0, currentPaid - churned);

    // Revenue by tier
    const byTier = tiers.map((tier, i) => {
      const tierCustomers = Math.round(currentPaid * distribution[i]);
      const monthlyPrice =
        tier.period === "year" ? tier.price / 12 : tier.price;
      return {
        name: tier.name,
        customers: tierCustomers,
        revenue: Math.round(tierCustomers * monthlyPrice * 100) / 100,
      };
    });

    const mrr = byTier.reduce((sum, t) => sum + t.revenue, 0);
    cumulativeRevenue += mrr;

    projections.push({
      month,
      totalCustomers: currentCustomers,
      paidCustomers: currentPaid,
      newCustomers,
      churnedCustomers: churned,
      mrr: Math.round(mrr * 100) / 100,
      cumulativeRevenue: Math.round(cumulativeRevenue * 100) / 100,
      byTier,
    });
  }

  const result = {
    inputs: {
      tiers,
      totalCustomers,
      conversionRate,
      churnRate,
      growthRate,
      months,
      distribution,
    },
    projections,
    summary: {
      endMrr: projections[projections.length - 1]?.mrr ?? 0,
      endArr: (projections[projections.length - 1]?.mrr ?? 0) * 12,
      totalRevenue: cumulativeRevenue,
      endPaidCustomers: projections[projections.length - 1]?.paidCustomers ?? 0,
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# Revenue Projection\n");
  console.log("## Inputs\n");
  console.log(`  Starting customers: ${totalCustomers}`);
  console.log(`  Monthly growth: ${(growthRate * 100).toFixed(1)}%`);
  console.log(`  Conversion rate: ${(conversionRate * 100).toFixed(1)}%`);
  console.log(`  Monthly churn: ${(churnRate * 100).toFixed(1)}%`);
  console.log(`  Projection: ${months} months`);
  console.log("\n  Tiers:");
  for (const tier of tiers) {
    console.log(`    ${tier.name}: $${tier.price}/${tier.period}`);
  }

  console.log("\n## Monthly Projection\n");
  console.log(
    "  | Month | Customers | Paid | New | Churned | MRR | Cumulative |"
  );
  console.log(
    "  | --- | --- | --- | --- | --- | --- | --- |"
  );
  for (const p of projections) {
    console.log(
      `  | ${p.month} | ${p.totalCustomers} | ${p.paidCustomers} | +${p.newCustomers} | -${p.churnedCustomers} | $${p.mrr.toLocaleString()} | $${p.cumulativeRevenue.toLocaleString()} |`
    );
  }

  console.log("\n## Summary\n");
  console.log(
    `  End MRR: $${result.summary.endMrr.toLocaleString()}`
  );
  console.log(
    `  End ARR: $${Math.round(result.summary.endArr).toLocaleString()}`
  );
  console.log(
    `  Total revenue (${months}mo): $${Math.round(result.summary.totalRevenue).toLocaleString()}`
  );
  console.log(
    `  End paid customers: ${result.summary.endPaidCustomers}`
  );
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
