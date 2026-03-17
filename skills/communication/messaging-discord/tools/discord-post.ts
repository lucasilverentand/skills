const args = Bun.argv.slice(2);

const HELP = `
discord-post — Send a message or embed to a Discord channel via webhook

Usage:
  bun run tools/discord-post.ts --channel <name> --message "<text>" [options]
  bun run tools/discord-post.ts --channel <name> --embed '<json>' [options]
  bun run tools/discord-post.ts --webhook <url> --message "<text>" [options]

Options:
  --channel <name>   Channel name — looks up DISCORD_WEBHOOK_<NAME> env var
  --webhook <url>    Direct webhook URL (overrides --channel)
  --message <text>   Plain text message to send
  --embed <json>     JSON embed payload (title, description, color, fields, url)
  --username <name>  Override webhook display name
  --json             Output as JSON instead of plain text
  --help             Show this help message

Sends a message to a Discord channel via webhook. Supports both plain
text messages and rich embeds. The webhook URL is looked up from the
environment variable DISCORD_WEBHOOK_<CHANNEL> (uppercase).
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
  const channel = getArg("--channel");
  const directWebhook = getArg("--webhook");
  const message = getArg("--message");
  const embedJson = getArg("--embed");
  const username = getArg("--username");

  // Resolve webhook URL
  let webhookUrl = directWebhook;
  if (!webhookUrl && channel) {
    const envKey = `DISCORD_WEBHOOK_${channel.toUpperCase().replace(/-/g, "_")}`;
    webhookUrl = process.env[envKey] ?? null;
    if (!webhookUrl) {
      console.error(`Error: environment variable ${envKey} not set`);
      console.error(`Set it with: export ${envKey}="https://discord.com/api/webhooks/..."`);
      process.exit(1);
    }
  }

  if (!webhookUrl) {
    console.error("Error: provide --channel <name> or --webhook <url>");
    process.exit(1);
  }

  if (!message && !embedJson) {
    console.error("Error: provide --message or --embed");
    process.exit(1);
  }

  // Build payload
  const payload: Record<string, any> = {};

  if (username) {
    payload.username = username;
  }

  if (message) {
    payload.content = message;
  }

  if (embedJson) {
    try {
      const embed = JSON.parse(embedJson);
      // Normalize color names to hex
      if (typeof embed.color === "string") {
        const colorMap: Record<string, number> = {
          green: 0x22c55e,
          red: 0xef4444,
          yellow: 0xeab308,
          blue: 0x3b82f6,
          orange: 0xf97316,
          purple: 0xa855f7,
          gray: 0x6b7280,
        };
        embed.color = colorMap[embed.color.toLowerCase()] ?? 0x6b7280;
      }
      payload.embeds = [embed];
    } catch (err: any) {
      console.error(`Error: invalid embed JSON — ${err.message}`);
      process.exit(1);
    }
  }

  // Send to Discord
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Error: Discord API returned ${res.status}`);
    console.error(body);
    process.exit(1);
  }

  const result = {
    success: true,
    channel: channel ?? "direct-webhook",
    messageType: embedJson ? "embed" : "text",
    statusCode: res.status,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Message sent to ${result.channel} (${res.status})`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
