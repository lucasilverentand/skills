const args = Bun.argv.slice(2);

const HELP = `
xcode-signing-check — Verify code signing and provisioning profiles are valid

Usage:
  bun run tools/xcode-signing-check.ts [project-dir] [options]

Arguments:
  project-dir   Path containing the .xcodeproj (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks:
  - Signing certificates in keychain
  - Provisioning profiles validity and expiration
  - Bundle ID and team ID configuration in the project

Examples:
  bun run tools/xcode-signing-check.ts
  bun run tools/xcode-signing-check.ts ~/Developer/MyApp
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface CertInfo {
  name: string;
  type: string;
  expiration: string;
  isValid: boolean;
}

interface ProfileInfo {
  name: string;
  uuid: string;
  bundleId: string;
  teamId: string;
  expiration: string;
  isValid: boolean;
}

interface SigningCheckResult {
  projectPath: string | null;
  projectSigningConfig: {
    bundleIds: string[];
    teamIds: string[];
    codeSignIdentities: string[];
    provisioningProfiles: string[];
    autoSigning: boolean;
  };
  certificates: CertInfo[];
  profiles: ProfileInfo[];
  issues: string[];
}

async function findXcodeproj(dir: string): Promise<string | null> {
  const glob = new Bun.Glob("*.xcodeproj");
  for await (const path of glob.scan({ cwd: dir })) {
    return `${dir}/${path}`;
  }
  return null;
}

async function getProjectSigningConfig(projectDir: string) {
  const config = {
    bundleIds: [] as string[],
    teamIds: [] as string[],
    codeSignIdentities: [] as string[],
    provisioningProfiles: [] as string[],
    autoSigning: false,
  };

  const xcodeproj = await findXcodeproj(projectDir);
  if (!xcodeproj) return config;

  try {
    const pbxproj = await Bun.file(`${xcodeproj}/project.pbxproj`).text();

    // Bundle IDs
    const bundlePattern = /PRODUCT_BUNDLE_IDENTIFIER\s*=\s*"?([^";]+)"?/g;
    let match: RegExpExecArray | null;
    while ((match = bundlePattern.exec(pbxproj)) !== null) {
      if (!config.bundleIds.includes(match[1])) config.bundleIds.push(match[1]);
    }

    // Team IDs
    const teamPattern = /DEVELOPMENT_TEAM\s*=\s*"?([^";]+)"?/g;
    while ((match = teamPattern.exec(pbxproj)) !== null) {
      if (match[1] && !config.teamIds.includes(match[1])) config.teamIds.push(match[1]);
    }

    // Code sign identity
    const identityPattern = /CODE_SIGN_IDENTITY\s*=\s*"([^"]+)"/g;
    while ((match = identityPattern.exec(pbxproj)) !== null) {
      if (!config.codeSignIdentities.includes(match[1])) config.codeSignIdentities.push(match[1]);
    }

    // Provisioning profiles
    const profilePattern = /PROVISIONING_PROFILE_SPECIFIER\s*=\s*"?([^";]+)"?/g;
    while ((match = profilePattern.exec(pbxproj)) !== null) {
      if (match[1] && !config.provisioningProfiles.includes(match[1])) {
        config.provisioningProfiles.push(match[1]);
      }
    }

    // Auto signing
    config.autoSigning = pbxproj.includes("CODE_SIGN_STYLE = Automatic");
  } catch {
    // Project parsing failed
  }

  return config;
}

async function getSigningCertificates(): Promise<CertInfo[]> {
  const proc = Bun.spawnSync([
    "security", "find-identity", "-v", "-p", "codesigning",
  ], { timeout: 10_000 });

  const output = proc.stdout.toString();
  const certs: CertInfo[] = [];

  // Parse output: lines like:  1) HASH "Name (Team ID)"
  const certPattern = /\d+\)\s+\w+\s+"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = certPattern.exec(output)) !== null) {
    const name = match[1];
    let type = "Unknown";
    if (name.includes("Apple Development")) type = "Development";
    else if (name.includes("Apple Distribution")) type = "Distribution";
    else if (name.includes("iPhone Developer")) type = "Development (Legacy)";
    else if (name.includes("iPhone Distribution")) type = "Distribution (Legacy)";
    else if (name.includes("Developer ID")) type = "Developer ID";
    else if (name.includes("Mac Developer")) type = "Mac Development";

    certs.push({
      name,
      type,
      expiration: "", // Would need openssl to get expiration
      isValid: true, // security find-identity -v only shows valid
    });
  }

  return certs;
}

async function getProvisioningProfiles(): Promise<ProfileInfo[]> {
  const profileDir = `${process.env.HOME}/Library/MobileDevice/Provisioning Profiles`;
  const profiles: ProfileInfo[] = [];

  const glob = new Bun.Glob("*.mobileprovision");
  try {
    for await (const file of glob.scan({ cwd: profileDir })) {
      const fullPath = `${profileDir}/${file}`;

      // Use security cms to decode the profile
      const proc = Bun.spawnSync([
        "security", "cms", "-D", "-i", fullPath,
      ], { timeout: 5_000 });

      if (proc.exitCode !== 0) continue;

      const plist = proc.stdout.toString();

      // Extract fields from the plist XML
      const nameMatch = plist.match(/<key>Name<\/key>\s*<string>([^<]+)<\/string>/);
      const uuidMatch = plist.match(/<key>UUID<\/key>\s*<string>([^<]+)<\/string>/);
      const teamMatch = plist.match(/<key>TeamIdentifier<\/key>\s*<array>\s*<string>([^<]+)<\/string>/);
      const expMatch = plist.match(/<key>ExpirationDate<\/key>\s*<date>([^<]+)<\/date>/);
      const bundleMatch = plist.match(/application-identifier<\/key>\s*<string>[^.]*\.([^<]+)<\/string>/);

      const expDate = expMatch ? new Date(expMatch[1]) : null;
      const isValid = expDate ? expDate > new Date() : false;

      profiles.push({
        name: nameMatch?.[1] || file,
        uuid: uuidMatch?.[1] || "",
        bundleId: bundleMatch?.[1] || "",
        teamId: teamMatch?.[1] || "",
        expiration: expDate?.toISOString().split("T")[0] || "unknown",
        isValid,
      });
    }
  } catch {
    // Profile directory doesn't exist
  }

  return profiles;
}

async function main() {
  const projectDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const projectConfig = await getProjectSigningConfig(projectDir);
  const certificates = await getSigningCertificates();
  const profiles = await getProvisioningProfiles();

  const xcodeproj = await findXcodeproj(projectDir);
  const issues: string[] = [];

  // Check for certificates
  if (certificates.length === 0) {
    issues.push("No code signing certificates found in keychain");
  }

  // Check for matching profiles
  for (const bundleId of projectConfig.bundleIds) {
    if (bundleId.includes("$(")) continue; // Skip variable references
    const matchingProfile = profiles.find((p) =>
      p.bundleId === bundleId || p.bundleId === "*" || bundleId.endsWith(p.bundleId.replace("*", ""))
    );
    if (!matchingProfile && !projectConfig.autoSigning) {
      issues.push(`No provisioning profile found for bundle ID: ${bundleId}`);
    }
  }

  // Check for expired profiles
  for (const profile of profiles) {
    if (!profile.isValid) {
      issues.push(`Expired provisioning profile: ${profile.name} (expired ${profile.expiration})`);
    }
  }

  const result: SigningCheckResult = {
    projectPath: xcodeproj,
    projectSigningConfig: projectConfig,
    certificates,
    profiles,
    issues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Xcode Signing Check`);
    if (xcodeproj) console.log(`Project: ${xcodeproj}`);
    console.log();

    console.log("Project Config:");
    console.log(`  Auto signing: ${projectConfig.autoSigning}`);
    console.log(`  Bundle IDs: ${projectConfig.bundleIds.join(", ") || "none"}`);
    console.log(`  Team IDs: ${projectConfig.teamIds.join(", ") || "none"}`);
    console.log(`  Code sign identities: ${projectConfig.codeSignIdentities.join(", ") || "default"}`);
    console.log();

    console.log(`Certificates (${certificates.length}):`);
    for (const cert of certificates) {
      console.log(`  [${cert.type}] ${cert.name}`);
    }
    console.log();

    console.log(`Provisioning Profiles (${profiles.length}):`);
    for (const profile of profiles) {
      const status = profile.isValid ? "VALID" : "EXPIRED";
      console.log(`  [${status}] ${profile.name}`);
      console.log(`    Bundle: ${profile.bundleId}  Team: ${profile.teamId}  Expires: ${profile.expiration}`);
    }
    console.log();

    if (issues.length > 0) {
      console.log(`Issues (${issues.length}):`);
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
    } else {
      console.log("No signing issues detected.");
    }
  }

  if (issues.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
