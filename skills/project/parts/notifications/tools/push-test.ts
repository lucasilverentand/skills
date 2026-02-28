const args = Bun.argv.slice(2);

const HELP = `
push-test — Send a test push notification to a device token

Usage:
  bun run tools/push-test.ts <token> [options]

Arguments:
  token    Expo push token (ExponentPushToken[xxx]) or device token

Options:
  --title <text>    Notification title (default: "Test Notification")
  --body <text>     Notification body (default: "This is a test push notification")
  --data <json>     JSON data payload (default: {})
  --json            Output response as JSON
  --help            Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

const token = args.find((a) => !a.startsWith("--") && args.indexOf(a) === 0);
const title = getArg("--title") ?? "Test Notification";
const body = getArg("--body") ?? "This is a test push notification";
const dataStr = getArg("--data");

async function main() {
  if (!token) {
    console.error("Error: push token is required");
    console.error("Usage: bun run tools/push-test.ts <token>");
    process.exit(1);
  }

  let data: Record<string, unknown> = {};
  if (dataStr) {
    try {
      data = JSON.parse(dataStr);
    } catch {
      console.error("Error: --data must be valid JSON");
      process.exit(1);
    }
  }

  const message = {
    to: token,
    title,
    body,
    sound: "default" as const,
    data,
  };

  if (!jsonOutput) {
    console.log("Sending test notification...\n");
    console.log(`  To: ${token}`);
    console.log(`  Title: ${title}`);
    console.log(`  Body: ${body}`);
    if (dataStr) console.log(`  Data: ${dataStr}`);
    console.log();
  }

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (response.ok) {
      const ticketData = result.data ?? result;
      if (ticketData.status === "ok") {
        console.log("  [+] Notification sent successfully");
        if (ticketData.id) console.log(`  Ticket ID: ${ticketData.id}`);
      } else if (ticketData.status === "error") {
        console.log(`  [x] Send failed: ${ticketData.message}`);
        if (ticketData.details?.error === "DeviceNotRegistered") {
          console.log("  The device token is no longer valid. Remove it from your database.");
        }
      }
    } else {
      console.log(`  [x] HTTP ${response.status}: ${response.statusText}`);
      console.log(`  Response: ${JSON.stringify(result)}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
