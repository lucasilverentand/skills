const args = Bun.argv.slice(2);

const HELP = `
event-audit — Find all tracked analytics events and their usage across the codebase

Usage:
  bun run tools/event-audit.ts [path] [options]

Arguments:
  path    Path to the project root (default: current directory)

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

interface EventUsage {
  name: string;
  locations: { file: string; line: number }[];
  properties: string[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  const events = new Map<string, EventUsage>();

  // Patterns that indicate event tracking
  const trackPatterns = [
    /(?:trackEvent|capture|track|posthog\.capture)\s*\(\s*['"]([^'"]+)['"]/,
    /(?:EVENTS\.(\w+))/,
  ];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");

  // First pass: find event constant definitions
  const eventConstants = new Map<string, string>();
  for await (const file of glob.scan({ cwd: root, dot: false })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();

    // Match EVENTS object definitions
    const constMatches = content.matchAll(/(\w+)\s*:\s*['"]([a-z_]+)['"]/g);
    for (const m of constMatches) {
      if (m[1] === m[1].toUpperCase()) {
        eventConstants.set(m[1], m[2]);
      }
    }
  }

  // Second pass: find event tracking calls
  for await (const file of glob.scan({ cwd: root, dot: false })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      for (const pattern of trackPatterns) {
        const match = lines[i].match(pattern);
        if (!match) continue;

        let eventName = match[1];
        // Resolve constant references
        if (eventConstants.has(eventName)) {
          eventName = eventConstants.get(eventName)!;
        }

        if (!events.has(eventName)) {
          events.set(eventName, { name: eventName, locations: [], properties: [] });
        }

        const event = events.get(eventName)!;
        event.locations.push({ file, line: i + 1 });

        // Extract properties from the same or next line
        const context = lines.slice(i, i + 5).join(" ");
        const propMatches = context.matchAll(/(\w+)\s*:/g);
        for (const pm of propMatches) {
          const prop = pm[1];
          if (!["trackEvent", "capture", "track", "posthog", "EVENTS"].includes(prop)) {
            if (!event.properties.includes(prop)) {
              event.properties.push(prop);
            }
          }
        }
      }
    }
  }

  const sortedEvents = [...events.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (jsonOutput) {
    console.log(JSON.stringify({ events: sortedEvents, total: sortedEvents.length }, null, 2));
  } else {
    if (sortedEvents.length === 0) {
      console.log("No tracked events found.");
      console.log("Tip: use trackEvent() or posthog.capture() to track events.");
      return;
    }

    console.log(`Analytics events (${sortedEvents.length}):\n`);

    for (const event of sortedEvents) {
      console.log(`  ${event.name}`);
      for (const loc of event.locations) {
        console.log(`    ${loc.file}:${loc.line}`);
      }
      if (event.properties.length > 0) {
        console.log(`    properties: ${event.properties.join(", ")}`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
