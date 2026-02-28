const args = Bun.argv.slice(2);

const HELP = `
event-list — Scan source code for tracked analytics events

Usage:
  bun run tools/event-list.ts [path] [options]

Arguments:
  path    Path to the project root to scan (default: current directory)

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
  event: string;
  files: string[];
  isConstant: boolean;
}

interface EventReport {
  events: EventUsage[];
  constants: { name: string; value: string; file: string }[];
  inlineStrings: { value: string; file: string }[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const report: EventReport = {
    events: [],
    constants: [],
    inlineStrings: [],
  };

  const eventMap = new Map<string, Set<string>>();
  const constantMap = new Map<string, string>();

  // Patterns to match
  const trackPattern = /(?:track|capture|posthog\.capture)\s*\(\s*(?:EVENTS\.(\w+)|["']([^"']+)["'])/g;
  const constantPattern = /(\w+)\s*[:=]\s*["']([a-z_]+)["']/g;

  const glob = new Bun.Glob("**/*.{ts,tsx}");
  const ignorePatterns = ["node_modules", "dist", ".expo", ".next"];

  for await (const file of glob.scan({ cwd: root })) {
    if (ignorePatterns.some((p) => file.includes(p))) continue;

    const content = await Bun.file(`${root}/${file}`).text();

    // Look for event constant definitions
    if (file.includes("events.ts") || file.includes("events/")) {
      constantPattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = constantPattern.exec(content)) !== null) {
        const name = match[1];
        const value = match[2];
        if (name === name.toUpperCase() && value.includes("_")) {
          constantMap.set(name, value);
          report.constants.push({ name, value, file });
        }
      }
    }

    // Look for track/capture calls
    trackPattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = trackPattern.exec(content)) !== null) {
      const constantName = match[1];
      const inlineString = match[2];
      const eventName = constantName
        ? constantMap.get(constantName) || `EVENTS.${constantName}`
        : inlineString;

      if (eventName) {
        if (!eventMap.has(eventName)) {
          eventMap.set(eventName, new Set());
        }
        eventMap.get(eventName)!.add(file);

        if (inlineString) {
          report.inlineStrings.push({ value: inlineString, file });
        }
      }
    }
  }

  // Build event usage list
  for (const [event, files] of eventMap) {
    report.events.push({
      event,
      files: Array.from(files),
      isConstant: !event.includes(".") || event.startsWith("EVENTS."),
    });
  }

  report.events.sort((a, b) => a.event.localeCompare(b.event));

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("Analytics event scan:\n");

    // Event constants
    if (report.constants.length > 0) {
      console.log(`  Defined constants (${report.constants.length}):`);
      for (const c of report.constants) {
        console.log(`    ${c.name}: "${c.value}"`);
      }
      console.log();
    }

    // All tracked events
    if (report.events.length > 0) {
      console.log(`  Tracked events (${report.events.length}):`);
      for (const event of report.events) {
        const icon = event.isConstant ? "+" : "!";
        console.log(`    [${icon}] ${event.event}`);
        for (const file of event.files) {
          console.log(`        ${file}`);
        }
      }
    } else {
      console.log("  No tracked events found.");
    }

    // Inline strings warning
    const uniqueInline = new Set(report.inlineStrings.map((s) => s.value));
    if (uniqueInline.size > 0) {
      console.log(`\n  Inline string events (${uniqueInline.size}) — consider using constants:`);
      for (const value of uniqueInline) {
        console.log(`    [!] "${value}"`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
