const args = Bun.argv.slice(2);

const HELP = `
webhook-setup — Create and configure Discord webhooks

Usage:
  bun run tools/webhook-setup.ts --channel <id> [options]

Options:
  --channel <id>    Discord channel ID to create webhook for
  --name <name>     Webhook display name (default: "Bot Notifications")
  --token <token>   Bot token (or set DISCORD_BOT_TOKEN env var)
  --json            Output as JSON instead of plain text
  --help            Show this help message

Creates a webhook for the specified channel using a bot token.
Outputs the webhook URL for storage in environment variables.

Requires a Discord bot token with manage_webhooks permission.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getArg(name: string): string | null {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

async function main() {
  const channelId = getArg("--channel");
  const name = getArg("--name") ?? "Bot Notifications";
  const token = getArg("--token") ?? process.env.DISCORD_BOT_TOKEN;

  if (!channelId) {
    console.error("Error: provide --channel <id>");
    process.exit(1);
  }

  if (!token) {
    console.error("Error: provide --token <bot-token> or set DISCORD_BOT_TOKEN env var");
    process.exit(1);
  }

  // Check existing webhooks first
  const listRes = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/webhooks`,
    {
      headers: { Authorization: `Bot ${token}` },
    }
  );

  if (!listRes.ok) {
    const body = await listRes.text();
    console.error(`Error: failed to list webhooks (${listRes.status})`);
    console.error(body);
    process.exit(1);
  }

  const existing = (await listRes.json()) as any[];
  const match = existing.find((w) => w.name === name);

  if (match) {
    const webhookUrl = `https://discord.com/api/webhooks/${match.id}/${match.token}`;
    const result = {
      action: "existing",
      webhookId: match.id,
      webhookUrl,
      name: match.name,
      channelId,
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Webhook "${name}" already exists for channel ${channelId}`);
      console.log(`\nWebhook URL: ${webhookUrl}`);
      console.log(`\nAdd to your .env:`);
      console.log(`  DISCORD_WEBHOOK_${channelId}="${webhookUrl}"`);
    }
    return;
  }

  // Create new webhook
  const createRes = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/webhooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    }
  );

  if (!createRes.ok) {
    const body = await createRes.text();
    console.error(`Error: failed to create webhook (${createRes.status})`);
    console.error(body);
    process.exit(1);
  }

  const webhook = (await createRes.json()) as any;
  const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;

  const result = {
    action: "created",
    webhookId: webhook.id,
    webhookUrl,
    name: webhook.name,
    channelId,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Webhook "${name}" created for channel ${channelId}`);
    console.log(`\nWebhook URL: ${webhookUrl}`);
    console.log(`\nAdd to your .env:`);
    console.log(`  DISCORD_WEBHOOK_${channelId}="${webhookUrl}"`);
    console.log("\nIMPORTANT: Store this URL securely — never commit it to source control.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
