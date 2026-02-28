const args = Bun.argv.slice(2);

const HELP = `
integration-audit — Check installed Astro integrations and their configuration status

Usage:
  bun run tools/integration-audit.ts [path] [options]

Arguments:
  path    Path to the Astro site package (default: current directory)

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

interface IntegrationInfo {
  name: string;
  installed: boolean;
  configured: boolean;
  recommendation: string;
}

const KNOWN_INTEGRATIONS = [
  { pkg: "@astrojs/tailwind", name: "tailwind", recommended: true },
  { pkg: "@astrojs/sitemap", name: "sitemap", recommended: true },
  { pkg: "@astrojs/mdx", name: "mdx", recommended: false },
  { pkg: "@astrojs/react", name: "react", recommended: false },
  { pkg: "@astrojs/vue", name: "vue", recommended: false },
  { pkg: "@astrojs/svelte", name: "svelte", recommended: false },
  { pkg: "@astrojs/image", name: "image", recommended: false },
  { pkg: "@astrojs/node", name: "node", recommended: false },
  { pkg: "@astrojs/cloudflare", name: "cloudflare", recommended: false },
  { pkg: "@astrojs/vercel", name: "vercel", recommended: false },
];

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Read package.json for installed deps
  const pkgPath = `${root}/package.json`;
  const pkgFile = Bun.file(pkgPath);
  if (!(await pkgFile.exists())) {
    console.error(`Error: no package.json found at ${root}`);
    process.exit(1);
  }

  const pkg = await pkgFile.json();
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Read astro.config for configured integrations
  let configContent = "";
  for (const configName of ["astro.config.ts", "astro.config.mjs", "astro.config.js"]) {
    const configFile = Bun.file(`${root}/${configName}`);
    if (await configFile.exists()) {
      configContent = await configFile.text();
      break;
    }
  }

  if (!configContent) {
    console.error("Error: no astro.config.{ts,mjs,js} found");
    process.exit(1);
  }

  const results: IntegrationInfo[] = [];

  for (const integration of KNOWN_INTEGRATIONS) {
    const installed = integration.pkg in allDeps;
    // Check if the integration is imported and used in integrations array
    const configured =
      configContent.includes(integration.name + "(") ||
      configContent.includes(`"${integration.pkg}"`) ||
      configContent.includes(`'${integration.pkg}'`);

    let recommendation = "";
    if (installed && !configured) {
      recommendation = "Installed but not configured — add to integrations[] in astro.config";
    } else if (!installed && integration.recommended) {
      recommendation = "Recommended — consider installing";
    } else if (installed && configured) {
      recommendation = "OK";
    } else {
      recommendation = "Not installed";
    }

    if (installed || integration.recommended) {
      results.push({
        name: integration.pkg,
        installed,
        configured: installed && configured,
        recommendation,
      });
    }
  }

  // Check for non-standard integrations in deps
  const astroIntegrations = Object.keys(allDeps).filter(
    (d) => d.startsWith("@astrojs/") && !KNOWN_INTEGRATIONS.some((k) => k.pkg === d)
  );

  for (const pkg of astroIntegrations) {
    const name = pkg.replace("@astrojs/", "");
    const configured =
      configContent.includes(name + "(") ||
      configContent.includes(`"${pkg}"`) ||
      configContent.includes(`'${pkg}'`);

    results.push({
      name: pkg,
      installed: true,
      configured,
      recommendation: configured ? "OK" : "Installed but not configured",
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log("Astro integration audit:\n");

    for (const r of results) {
      const installedIcon = r.installed ? "+" : " ";
      const configuredIcon = r.configured ? "+" : " ";
      console.log(
        `  [${installedIcon}] installed  [${configuredIcon}] configured  ${r.name}`
      );
      if (r.recommendation !== "OK" && r.recommendation !== "Not installed") {
        console.log(`      -> ${r.recommendation}`);
      }
    }

    const issues = results.filter(
      (r) => r.recommendation !== "OK" && r.recommendation !== "Not installed"
    );
    if (issues.length > 0) {
      console.log(`\n${issues.length} issue(s) found.`);
    } else {
      console.log("\nAll integrations properly configured.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
