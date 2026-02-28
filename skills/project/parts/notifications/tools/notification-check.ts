const args = Bun.argv.slice(2);

const HELP = `
notification-check — Verify push notification configuration across platforms

Usage:
  bun run tools/notification-check.ts [path] [options]

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
    expoNotifications: false,
    expoDevice: false,
    permissionHandling: false,
    tokenRegistration: false,
    notificationHandler: false,
    deepLinking: false,
    androidChannel: false,
    appJsonConfig: false,
    serverSending: false,
    webPush: false,
  };

  const issues: string[] = [];
  const files: { file: string; role: string }[] = [];

  const pkgCandidates = [
    `${root}/package.json`,
    `${root}/apps/mobile/package.json`,
    `${root}/apps/app/package.json`,
  ];

  for (const candidate of pkgCandidates) {
    const file = Bun.file(candidate);
    if (await file.exists()) {
      const pkg = await file.json();
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps["expo-notifications"]) checks.expoNotifications = true;
      if (allDeps["expo-device"]) checks.expoDevice = true;
      if (allDeps["web-push"]) checks.webPush = true;
    }
  }

  const appJsonCandidates = [
    `${root}/app.json`,
    `${root}/apps/mobile/app.json`,
    `${root}/apps/app/app.json`,
  ];

  for (const candidate of appJsonCandidates) {
    const file = Bun.file(candidate);
    if (await file.exists()) {
      const content = await file.text();
      if (content.includes("expo-notifications")) {
        checks.appJsonConfig = true;
        files.push({ file: candidate, role: "Expo notification plugin config" });
      }
      if (!content.includes("remote-notification")) {
        issues.push("UIBackgroundModes missing 'remote-notification' in app.json");
      }
    }
  }

  const glob = new Bun.Glob("**/*.{ts,tsx}");

  for await (const file of glob.scan({ cwd: root, dot: false })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();

    if (content.includes("requestPermissionsAsync") || content.includes("getPermissionsAsync")) {
      checks.permissionHandling = true;
      files.push({ file, role: "Permission handling" });
    }

    if (content.includes("getExpoPushTokenAsync") || content.includes("getDevicePushTokenAsync")) {
      checks.tokenRegistration = true;
      files.push({ file, role: "Token registration" });
    }

    if (content.includes("setNotificationHandler")) {
      checks.notificationHandler = true;
      files.push({ file, role: "Foreground notification handler" });
    }

    if (content.includes("addNotificationResponseReceivedListener") ||
        content.includes("getLastNotificationResponseAsync")) {
      checks.deepLinking = true;
      files.push({ file, role: "Notification tap / deep linking" });
    }

    if (content.includes("setNotificationChannelAsync")) {
      checks.androidChannel = true;
    }

    if (content.includes("exp.host/--/api/v2/push/send") || content.includes("apn")) {
      checks.serverSending = true;
      files.push({ file, role: "Server-side push sending" });
    }
  }

  if (!checks.expoNotifications) issues.push("expo-notifications not installed");
  if (!checks.expoDevice) issues.push("expo-device not installed (needed for device check)");
  if (!checks.permissionHandling) issues.push("No permission request found");
  if (!checks.tokenRegistration) issues.push("No push token registration found");
  if (!checks.notificationHandler) issues.push("No foreground notification handler set");
  if (!checks.androidChannel) issues.push("No Android notification channel configured");

  const result = { checks, issues, files };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Push notification status:\n");

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
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
