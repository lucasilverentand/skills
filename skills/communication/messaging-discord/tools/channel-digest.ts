const args = Bun.argv.slice(2);

const HELP = `
channel-digest — Fetch and summarize recent Discord channel messages

Usage:
  bun run tools/channel-digest.ts --channel <id> [options]

Options:
  --channel <id>   Discord channel ID
  --token <token>  Bot token (or set DISCORD_BOT_TOKEN env var)
  --limit <n>      Number of messages to fetch (default: 50, max: 100)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Fetches recent messages from a Discord channel using a bot token
and produces a summary of the conversation context.

Requires a Discord bot token with message read permissions.
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

interface Message {
  author: string;
  content: string;
  timestamp: string;
  hasEmbed: boolean;
  hasAttachment: boolean;
}

async function main() {
  const channelId = getArg("--channel");
  const token = getArg("--token") ?? process.env.DISCORD_BOT_TOKEN;
  const limit = Math.min(100, parseInt(getArg("--limit") ?? "50", 10));

  if (!channelId) {
    console.error("Error: provide --channel <id>");
    process.exit(1);
  }

  if (!token) {
    console.error("Error: provide --token <bot-token> or set DISCORD_BOT_TOKEN env var");
    process.exit(1);
  }

  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
    {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`Error: Discord API returned ${res.status}`);
    console.error(body);
    process.exit(1);
  }

  const rawMessages = (await res.json()) as any[];

  const messages: Message[] = rawMessages.map((m) => ({
    author: m.author?.username ?? "unknown",
    content: m.content ?? "",
    timestamp: m.timestamp ?? "",
    hasEmbed: (m.embeds?.length ?? 0) > 0,
    hasAttachment: (m.attachments?.length ?? 0) > 0,
  }));

  // Reverse to chronological order
  messages.reverse();

  // Generate summary
  const uniqueAuthors = [...new Set(messages.map((m) => m.author))];
  const messageCount = messages.length;

  // Find potential questions (messages ending with ?)
  const questions = messages.filter((m) => m.content.trim().endsWith("?"));

  // Find potential action items (messages with keywords)
  const actionItems = messages.filter((m) =>
    /todo|action|follow.?up|need to|should|must|will do|assign/i.test(m.content)
  );

  // Time range
  const firstTime = messages[0]?.timestamp ?? "";
  const lastTime = messages[messages.length - 1]?.timestamp ?? "";

  const result = {
    channelId,
    messageCount,
    uniqueAuthors,
    timeRange: { from: firstTime, to: lastTime },
    questions: questions.map((m) => ({
      author: m.author,
      content: m.content.slice(0, 200),
    })),
    actionItems: actionItems.map((m) => ({
      author: m.author,
      content: m.content.slice(0, 200),
    })),
    messages,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Channel Digest: ${channelId}\n`);
  console.log(`Messages: ${messageCount}`);
  console.log(`Participants: ${uniqueAuthors.join(", ")}`);
  if (firstTime && lastTime) {
    console.log(`Time range: ${firstTime.split("T")[0]} to ${lastTime.split("T")[0]}`);
  }

  if (questions.length > 0) {
    console.log(`\n## Open Questions (${questions.length})\n`);
    for (const q of questions.slice(0, 10)) {
      console.log(`  ${q.author}: ${q.content.slice(0, 150)}`);
    }
  }

  if (actionItems.length > 0) {
    console.log(`\n## Potential Action Items (${actionItems.length})\n`);
    for (const a of actionItems.slice(0, 10)) {
      console.log(`  ${a.author}: ${a.content.slice(0, 150)}`);
    }
  }

  console.log("\n## Recent Messages\n");
  for (const m of messages.slice(-20)) {
    const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : "";
    const extras: string[] = [];
    if (m.hasEmbed) extras.push("[embed]");
    if (m.hasAttachment) extras.push("[attachment]");
    const extrasStr = extras.length > 0 ? ` ${extras.join(" ")}` : "";
    console.log(`  [${time}] ${m.author}: ${m.content.slice(0, 200)}${extrasStr}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
