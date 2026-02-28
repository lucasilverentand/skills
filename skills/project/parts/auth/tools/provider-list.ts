const args = Bun.argv.slice(2);

const HELP = `
provider-list — List configured OAuth providers, callback URLs, and status

Usage:
  bun run tools/provider-list.ts [path] [options]

Arguments:
  path    Path to the auth package (default: current directory)

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

interface ProviderInfo {
  name: string;
  configured: boolean;
  envVars: { name: string; set: boolean }[];
  callbackUrl: string;
}

const KNOWN_PROVIDERS = [
  { name: "github", clientIdEnv: "GITHUB_CLIENT_ID", clientSecretEnv: "GITHUB_CLIENT_SECRET" },
  { name: "google", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  { name: "discord", clientIdEnv: "DISCORD_CLIENT_ID", clientSecretEnv: "DISCORD_CLIENT_SECRET" },
  { name: "apple", clientIdEnv: "APPLE_CLIENT_ID", clientSecretEnv: "APPLE_CLIENT_SECRET" },
  { name: "twitter", clientIdEnv: "TWITTER_CLIENT_ID", clientSecretEnv: "TWITTER_CLIENT_SECRET" },
  { name: "microsoft", clientIdEnv: "MICROSOFT_CLIENT_ID", clientSecretEnv: "MICROSOFT_CLIENT_SECRET" },
];

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Find auth config file
  let authContent = "";
  const candidates = [
    `${root}/src/auth.ts`,
    `${root}/src/auth.js`,
    `${root}/src/lib/auth.ts`,
    `${root}/src/index.ts`,
  ];

  for (const candidate of candidates) {
    const file = Bun.file(candidate);
    if (await file.exists()) {
      authContent = await file.text();
      break;
    }
  }

  // Also scan all .ts files in src/ for socialProviders
  if (!authContent.includes("socialProviders") && !authContent.includes("social")) {
    const glob = new Bun.Glob("src/**/*.ts");
    for await (const file of glob.scan({ cwd: root })) {
      const content = await Bun.file(`${root}/${file}`).text();
      if (content.includes("socialProviders") || content.includes("betterAuth")) {
        authContent += "\n" + content;
      }
    }
  }

  const providers: ProviderInfo[] = [];
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.APP_URL || "https://<domain>";

  for (const provider of KNOWN_PROVIDERS) {
    const isReferenced =
      authContent.includes(`${provider.name}:`) ||
      authContent.includes(`"${provider.name}"`) ||
      authContent.includes(`'${provider.name}'`);

    if (!isReferenced) continue;

    const clientIdSet = !!process.env[provider.clientIdEnv];
    const clientSecretSet = !!process.env[provider.clientSecretEnv];

    providers.push({
      name: provider.name,
      configured: clientIdSet && clientSecretSet,
      envVars: [
        { name: provider.clientIdEnv, set: clientIdSet },
        { name: provider.clientSecretEnv, set: clientSecretSet },
      ],
      callbackUrl: `${baseUrl}/api/auth/callback/${provider.name}`,
    });
  }

  // Check email+password
  const hasEmailPassword =
    authContent.includes("emailAndPassword") &&
    authContent.includes("enabled: true");

  if (jsonOutput) {
    console.log(
      JSON.stringify({ providers, emailAndPassword: hasEmailPassword }, null, 2)
    );
  } else {
    console.log("Auth providers:\n");

    if (hasEmailPassword) {
      console.log("  [+] Email & Password (built-in)");
    }

    if (providers.length === 0 && !hasEmailPassword) {
      console.log("  No providers configured.");
      return;
    }

    for (const p of providers) {
      const icon = p.configured ? "+" : "x";
      console.log(`  [${icon}] ${p.name}`);
      console.log(`      callback: ${p.callbackUrl}`);
      for (const env of p.envVars) {
        const envIcon = env.set ? "+" : "x";
        console.log(`      [${envIcon}] ${env.name}`);
      }
    }

    const unconfigured = providers.filter((p) => !p.configured);
    if (unconfigured.length > 0) {
      console.log(
        `\n${unconfigured.length} provider(s) missing environment variables.`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
