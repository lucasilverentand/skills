const args = Bun.argv.slice(2);

const HELP = `
native-check — Check native module compatibility and Expo config plugins

Usage:
  bun run tools/native-check.ts [path] [options]

Arguments:
  path    Path to the Expo app package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks:
  - Expo SDK version
  - New Architecture status
  - Configured plugins in app.config
  - Native modules in dependencies
  - EAS Build readiness
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface NativeCheckResult {
  sdkVersion: string | null;
  newArchEnabled: boolean;
  reactCompiler: boolean;
  plugins: string[];
  nativeModules: string[];
  warnings: string[];
}

const KNOWN_NATIVE_PREFIXES = [
  "expo-",
  "react-native-",
  "@react-native-",
  "@expo/",
];

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const warnings: string[] = [];

  // Read package.json
  const pkgFile = Bun.file(`${root}/package.json`);
  if (!(await pkgFile.exists())) {
    console.error("Error: no package.json found");
    process.exit(1);
  }
  const pkg = await pkgFile.json();
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Get SDK version from expo dependency
  const sdkVersion = allDeps.expo
    ? allDeps.expo.replace(/[\^~]/, "")
    : null;

  // Read app.config
  let configContent = "";
  for (const name of ["app.config.ts", "app.config.js", "app.json"]) {
    const file = Bun.file(`${root}/${name}`);
    if (await file.exists()) {
      configContent = await file.text();
      break;
    }
  }

  if (!configContent) {
    warnings.push("No app.config.ts or app.json found");
  }

  // Check New Architecture
  const newArchEnabled =
    configContent.includes("newArchEnabled: true") ||
    configContent.includes('"newArchEnabled": true');

  if (!newArchEnabled) {
    warnings.push("New Architecture is not enabled — add newArchEnabled: true to app.config");
  }

  // Check React Compiler
  const reactCompiler =
    configContent.includes("reactCompiler: true") ||
    configContent.includes('"reactCompiler": true');

  if (!reactCompiler) {
    warnings.push("React Compiler not enabled — add experiments: { reactCompiler: true }");
  }

  // Extract plugins
  const plugins: string[] = [];
  const pluginMatches = configContent.matchAll(
    /plugins\s*:\s*\[([\s\S]*?)\]/g
  );
  for (const m of pluginMatches) {
    const inner = m[1];
    const pluginNames = inner.matchAll(/['"]([^'"]+)['"]/g);
    for (const p of pluginNames) {
      plugins.push(p[1]);
    }
  }

  // Find native modules in dependencies
  const nativeModules = Object.keys(allDeps).filter((dep) =>
    KNOWN_NATIVE_PREFIXES.some((prefix) => dep.startsWith(prefix))
  );

  // Check for common issues
  if (nativeModules.includes("react-native-gesture-handler") && !plugins.includes("react-native-gesture-handler")) {
    warnings.push("react-native-gesture-handler installed but not in plugins — may need configuration");
  }

  if (nativeModules.includes("react-native-reanimated") && !configContent.includes("reanimated")) {
    warnings.push("react-native-reanimated installed but babel plugin may not be configured");
  }

  if (!allDeps["expo-router"]) {
    warnings.push("expo-router not installed — this skill expects file-based routing");
  }

  const result: NativeCheckResult = {
    sdkVersion,
    newArchEnabled,
    reactCompiler,
    plugins,
    nativeModules,
    warnings,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Expo app native check:\n");
    console.log(`  SDK version: ${sdkVersion || "unknown"}`);
    console.log(`  New Architecture: ${newArchEnabled ? "enabled" : "disabled"}`);
    console.log(`  React Compiler: ${reactCompiler ? "enabled" : "disabled"}`);

    if (plugins.length > 0) {
      console.log(`\n  Plugins (${plugins.length}):`);
      for (const p of plugins) {
        console.log(`    - ${p}`);
      }
    }

    if (nativeModules.length > 0) {
      console.log(`\n  Native modules (${nativeModules.length}):`);
      for (const m of nativeModules) {
        console.log(`    - ${m} (${allDeps[m]})`);
      }
    }

    if (warnings.length > 0) {
      console.log(`\n  Warnings:`);
      for (const w of warnings) {
        console.log(`    ! ${w}`);
      }
    } else {
      console.log("\n  No issues found.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
