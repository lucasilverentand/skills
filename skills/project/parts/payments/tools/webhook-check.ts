const args = Bun.argv.slice(2);

const HELP = `
webhook-check — Verify Stripe webhook configuration and event handling

Usage:
  bun run tools/webhook-check.ts [path] [options]

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

const CRITICAL_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
];

async function main() {
  const root = filteredArgs[0] || process.cwd();

  const glob = new Bun.Glob("src/**/*.{ts,tsx}");
  const handledEvents: { event: string; file: string; line: number }[] = [];
  let hasSignatureVerification = false;
  let hasRawBody = false;
  let webhookFile = "";

  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    if (content.includes("constructEvent") || content.includes("webhooks")) {
      webhookFile = file;
      hasSignatureVerification = content.includes("constructEvent");
      hasRawBody = content.includes(".text()") || content.includes("rawBody");
    }

    for (let i = 0; i < lines.length; i++) {
      for (const event of CRITICAL_EVENTS) {
        if (lines[i].includes(`"${event}"`) || lines[i].includes(`'${event}'`)) {
          handledEvents.push({ event, file, line: i + 1 });
        }
      }
    }
  }

  const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  const hasPublishableKey = !!process.env.STRIPE_PUBLISHABLE_KEY;

  const unhandledEvents = CRITICAL_EVENTS.filter(
    (e) => !handledEvents.some((h) => h.event === e)
  );

  const result = {
    webhookFile: webhookFile || null,
    hasSignatureVerification,
    hasRawBody,
    handledEvents,
    unhandledEvents,
    env: {
      STRIPE_SECRET_KEY: hasSecretKey,
      STRIPE_WEBHOOK_SECRET: hasWebhookSecret,
      STRIPE_PUBLISHABLE_KEY: hasPublishableKey,
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Stripe webhook status:\n");

    if (!webhookFile) {
      console.log("  ! No webhook handler found.");
      console.log("    Create src/webhook.ts with stripe.webhooks.constructEvent()");
      return;
    }

    console.log(`  Webhook handler: ${webhookFile}`);
    console.log(`  Signature verification: ${hasSignatureVerification ? "yes" : "MISSING"}`);
    console.log(`  Raw body parsing: ${hasRawBody ? "yes" : "MISSING"}`);

    console.log("\n  Environment:");
    console.log(`    [${hasSecretKey ? "+" : "x"}] STRIPE_SECRET_KEY`);
    console.log(`    [${hasWebhookSecret ? "+" : "x"}] STRIPE_WEBHOOK_SECRET`);
    console.log(`    [${hasPublishableKey ? "+" : "x"}] STRIPE_PUBLISHABLE_KEY`);

    if (handledEvents.length > 0) {
      console.log(`\n  Handled events (${handledEvents.length}):`);
      for (const h of handledEvents) {
        console.log(`    [+] ${h.event} (${h.file}:${h.line})`);
      }
    }

    if (unhandledEvents.length > 0) {
      console.log(`\n  Unhandled critical events (${unhandledEvents.length}):`);
      for (const e of unhandledEvents) {
        console.log(`    [ ] ${e}`);
      }
    }

    if (!hasSignatureVerification) {
      console.log("\n  ! Webhook signature verification is missing.");
      console.log("    Use stripe.webhooks.constructEvent() to verify signatures.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
