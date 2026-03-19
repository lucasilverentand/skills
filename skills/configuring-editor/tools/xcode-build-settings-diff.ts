const args = Bun.argv.slice(2);

const HELP = `
xcode-build-settings-diff — Compare build settings between two schemes or targets

Usage:
  bun run tools/xcode-build-settings-diff.ts <scheme1> <scheme2> [options]

Arguments:
  scheme1   First scheme or target name
  scheme2   Second scheme or target name

Options:
  --project <path>   Path to the .xcodeproj (default: auto-detect in cwd)
  --json             Output as JSON instead of plain text
  --help             Show this help message

Examples:
  bun run tools/xcode-build-settings-diff.ts Debug Release
  bun run tools/xcode-build-settings-diff.ts MyApp MyAppTests
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const projectIdx = args.indexOf("--project");
const projectPath = projectIdx !== -1 ? args[projectIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== projectIdx + 1
);

interface SettingsDiff {
  key: string;
  value1: string;
  value2: string;
  status: "different" | "only-first" | "only-second";
}

interface DiffResult {
  scheme1: string;
  scheme2: string;
  differences: SettingsDiff[];
  onlyFirst: SettingsDiff[];
  onlySecond: SettingsDiff[];
  same: number;
  total: number;
}

async function findXcodeproj(dir: string): Promise<string | null> {
  const glob = new Bun.Glob("*.xcodeproj");
  for await (const path of glob.scan({ cwd: dir })) {
    return `${dir}/${path}`;
  }
  return null;
}

async function getBuildSettings(
  scheme: string,
  xcodeproj: string
): Promise<Map<string, string>> {
  const settings = new Map<string, string>();

  // Try xcodebuild -showBuildSettings
  const proc = Bun.spawnSync([
    "xcodebuild",
    "-project", xcodeproj,
    "-scheme", scheme,
    "-showBuildSettings",
  ], { timeout: 30_000 });

  if (proc.exitCode !== 0) {
    // Try as configuration name instead of scheme
    const proc2 = Bun.spawnSync([
      "xcodebuild",
      "-project", xcodeproj,
      "-configuration", scheme,
      "-showBuildSettings",
    ], { timeout: 30_000 });

    if (proc2.exitCode !== 0) {
      console.error(`Error: could not get build settings for "${scheme}"`);
      console.error(`Tried as both scheme and configuration name.`);
      console.error(proc.stderr.toString().split("\n").slice(0, 5).join("\n"));
      process.exit(1);
    }

    return parseBuildSettings(proc2.stdout.toString());
  }

  return parseBuildSettings(proc.stdout.toString());
}

function parseBuildSettings(output: string): Map<string, string> {
  const settings = new Map<string, string>();
  const lines = output.split("\n");

  for (const line of lines) {
    const match = line.match(/^\s+(\w+)\s*=\s*(.*)$/);
    if (match) {
      settings.set(match[1], match[2].trim());
    }
  }

  return settings;
}

// Settings that are always different and not interesting to compare
const IGNORE_SETTINGS = new Set([
  "BUILD_DIR",
  "BUILD_ROOT",
  "CONFIGURATION_BUILD_DIR",
  "CONFIGURATION_TEMP_DIR",
  "DERIVED_FILE_DIR",
  "OBJECT_FILE_DIR",
  "TARGET_TEMP_DIR",
  "TEMP_DIR",
  "TEMP_FILES_DIR",
  "TEMP_FILE_DIR",
  "DWARF_DSYM_FILE_NAME",
  "DWARF_DSYM_FOLDER_PATH",
  "FULL_PRODUCT_NAME",
  "PRODUCT_NAME",
  "TARGET_BUILD_DIR",
  "SYMROOT",
  "OBJROOT",
]);

// Settings that are most interesting to compare
const KEY_SETTINGS = new Set([
  "SWIFT_VERSION",
  "IPHONEOS_DEPLOYMENT_TARGET",
  "MACOSX_DEPLOYMENT_TARGET",
  "PRODUCT_BUNDLE_IDENTIFIER",
  "CODE_SIGN_IDENTITY",
  "CODE_SIGN_STYLE",
  "DEVELOPMENT_TEAM",
  "SWIFT_OPTIMIZATION_LEVEL",
  "GCC_OPTIMIZATION_LEVEL",
  "ENABLE_STRICT_CONCURRENCY_CHECKING",
  "SWIFT_STRICT_CONCURRENCY",
  "DEBUG_INFORMATION_FORMAT",
  "ENABLE_TESTABILITY",
  "SWIFT_ACTIVE_COMPILATION_CONDITIONS",
  "GCC_PREPROCESSOR_DEFINITIONS",
  "OTHER_SWIFT_FLAGS",
  "OTHER_LDFLAGS",
]);

async function main() {
  const scheme1 = filteredArgs[0];
  const scheme2 = filteredArgs[1];

  if (!scheme1 || !scheme2) {
    console.error("Error: both <scheme1> and <scheme2> are required");
    process.exit(1);
  }

  const xcodeproj = projectPath || await findXcodeproj(process.cwd());
  if (!xcodeproj) {
    console.error("Error: no .xcodeproj found. Use --project to specify one.");
    process.exit(1);
  }

  const resolvedProject = projectPath
    ? Bun.resolveSync(projectPath, process.cwd())
    : xcodeproj;

  console.error(`Comparing build settings: ${scheme1} vs ${scheme2}...`);

  const settings1 = await getBuildSettings(scheme1, resolvedProject);
  const settings2 = await getBuildSettings(scheme2, resolvedProject);

  const allKeys = new Set([...settings1.keys(), ...settings2.keys()]);
  const differences: SettingsDiff[] = [];
  const onlyFirst: SettingsDiff[] = [];
  const onlySecond: SettingsDiff[] = [];
  let same = 0;

  for (const key of [...allKeys].sort()) {
    if (IGNORE_SETTINGS.has(key)) continue;

    const val1 = settings1.get(key);
    const val2 = settings2.get(key);

    if (val1 !== undefined && val2 === undefined) {
      onlyFirst.push({ key, value1: val1, value2: "", status: "only-first" });
    } else if (val1 === undefined && val2 !== undefined) {
      onlySecond.push({ key, value1: "", value2: val2, status: "only-second" });
    } else if (val1 !== val2) {
      differences.push({ key, value1: val1!, value2: val2!, status: "different" });
    } else {
      same++;
    }
  }

  const result: DiffResult = {
    scheme1,
    scheme2,
    differences,
    onlyFirst,
    onlySecond,
    same,
    total: allKeys.size,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nBuild Settings Diff: ${scheme1} vs ${scheme2}`);
    console.log(`Project: ${resolvedProject}`);
    console.log(`Total settings: ${result.total}  Same: ${same}  Different: ${differences.length}\n`);

    // Show key settings first
    const keyDiffs = differences.filter((d) => KEY_SETTINGS.has(d.key));
    if (keyDiffs.length > 0) {
      console.log("Key differences:");
      for (const d of keyDiffs) {
        console.log(`  ${d.key}:`);
        console.log(`    ${scheme1}: ${d.value1}`);
        console.log(`    ${scheme2}: ${d.value2}`);
      }
      console.log();
    }

    // Then other differences
    const otherDiffs = differences.filter((d) => !KEY_SETTINGS.has(d.key));
    if (otherDiffs.length > 0) {
      console.log(`Other differences (${otherDiffs.length}):`);
      for (const d of otherDiffs) {
        console.log(`  ${d.key}:`);
        console.log(`    ${scheme1}: ${d.value1 || "(empty)"}`);
        console.log(`    ${scheme2}: ${d.value2 || "(empty)"}`);
      }
    }

    if (differences.length === 0) {
      console.log("No differences found between the two configurations.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
