const args = Bun.argv.slice(2);

const HELP = `
analytics-check — Verify PostHog analytics configuration across platforms

Usage:
  bun run tools/analytics-check.ts [path] [options]

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

async function main() {
  const root = filteredArgs[0] || process.cwd();

  const checks = {
    posthogJs: false,
    posthogNode: false,
    posthogReactNative: false,
    initialization: false,
    userIdentification: false,
    resetOnSignOut: false,
    featureFlags: false,
    eventConstants: false,
    serverTracking: false,
  };

  const issues: string[] = [];
  const files: { file: string; role: string }[] = [];
  let platforms: string[] = [];

  const pkgCandidates = [
    `${root}/package.json`,
    `${root}/packages/analytics/package.json`,
  ];

  for (const candidate of pkgCandidates) {
    const file = Bun.file(candidate);
    if (await file.exists()) {
      const pkg = await file.json();
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps["posthog-js"]) { checks.posthogJs = true; platforms.push("web"); }
      if (allDeps["posthog-node"]) { checks.posthogNode = true; platforms.push("server"); }
      if (allDeps["posthog-react-native"]) { checks.posthogReactNative = true; platforms.push("native"); }
    }
  }

  const hasKey = !!(
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    process.env.EXPO_PUBLIC_POSTHOG_KEY ||
    process.env.POSTHOG_KEY
  );

  if (!hasKey) {
    issues.push("No PostHog API key found in environment");
  }

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");

  for await (const file of glob.scan({ cwd: root, dot: false })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();

    if (content.includes("posthog.init") || content.includes("new PostHog")) {
      checks.initialization = true;
      files.push({ file, role: "PostHog initialization" });
    }

    if (content.includes("posthog.identify") || content.includes("identifyUser")) {
      checks.userIdentification = true;
      files.push({ file, role: "User identification" });
    }

    if (content.includes("posthog.reset") || content.includes("resetAnalytics")) {
      checks.resetOnSignOut = true;
    }

    if (content.includes("isFeatureEnabled") || content.includes("getFeatureFlag")) {
      checks.featureFlags = true;
      files.push({ file, role: "Feature flags" });
    }

    if (content.includes("EVENTS") && content.includes("as const")) {
      checks.eventConstants = true;
      files.push({ file, role: "Event constants" });
    }

    if (content.includes("posthog-node") || content.includes("PostHog(")) {
      if (content.includes("capture") && !content.includes("posthog-js")) {
        checks.serverTracking = true;
      }
    }
  }

  if (!checks.posthogJs && !checks.posthogReactNative) {
    issues.push("No client-side PostHog SDK installed");
  }
  if (!checks.initialization) issues.push("PostHog not initialized anywhere");
  if (!checks.userIdentification) issues.push("No user identification found — events will be anonymous");
  if (!checks.resetOnSignOut) issues.push("No analytics reset on sign-out — user data may bleed across sessions");
  if (!checks.eventConstants) issues.push("No typed event constants — consider creating an events.ts file");

  const result = { checks, issues, files, platforms };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("PostHog analytics status:\n");
    console.log(`  Platforms: ${platforms.length > 0 ? platforms.join(", ") : "none detected"}\n`);

    const checkEntries = Object.entries(checks) as [string, boolean][];
    for (const [name, ok] of checkEntries) {
      const icon = ok ? "+" : "x";
      const label = name.replace(/([A-Z])/g, " $1").toLowerCase().trim();
      console.log(`  [${icon}] ${label}`);
    }

    if (files.length > 0) {
      console.log("\n  Key files:");
      for (const f of files) {
        console.log(`    ${f.file} — ${f.role}`);
      }
    }

    if (issues.length > 0) {
      console.log(`\n  Issues (${issues.length}):`);
      for (const issue of issues) {
        console.log(`    ! ${issue}`);
      }
    }

    if (!hasKey) {
      console.log("\n  Set POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_KEY in your environment.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
