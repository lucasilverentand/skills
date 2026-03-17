const args = Bun.argv.slice(2);

const HELP = `
project-audit — Check iOS project health: Swift version, deps, test coverage

Usage:
  bun run tools/project-audit.ts [path] [options]

Arguments:
  path    Path to the iOS project (default: current directory)

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

interface AuditResult {
  hasTuist: boolean;
  hasPackageSwift: boolean;
  swiftFiles: number;
  testFiles: number;
  thirdPartyDeps: string[];
  usesObservable: boolean;
  usesObservableObject: boolean;
  usesXCTest: boolean;
  usesSwiftTesting: boolean;
  usesSwiftData: boolean;
  warnings: string[];
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const result: AuditResult = {
    hasTuist: false,
    hasPackageSwift: false,
    swiftFiles: 0,
    testFiles: 0,
    thirdPartyDeps: [],
    usesObservable: false,
    usesObservableObject: false,
    usesXCTest: false,
    usesSwiftTesting: false,
    usesSwiftData: false,
    warnings: [],
  };

  // Check for Tuist
  result.hasTuist = await Bun.file(`${root}/Project.swift`).exists();

  // Check for Package.swift
  result.hasPackageSwift = await Bun.file(`${root}/Package.swift`).exists();

  // Parse Package.swift for third-party deps
  if (result.hasPackageSwift) {
    const content = await Bun.file(`${root}/Package.swift`).text();
    const deps = content.matchAll(/\.package\(url:\s*"([^"]+)"/g);
    for (const d of deps) {
      const url = d[1];
      // Apple packages are not third-party
      if (url.includes("github.com/apple/")) continue;
      result.thirdPartyDeps.push(url);
    }
  }

  // Scan Swift files
  const swiftGlob = new Bun.Glob("**/*.swift");
  for await (const file of swiftGlob.scan({ cwd: root })) {
    if (file.includes(".build/") || file.includes("DerivedData/")) continue;

    result.swiftFiles++;

    const isTest = file.toLowerCase().includes("test");
    if (isTest) result.testFiles++;

    const content = await Bun.file(`${root}/${file}`).text();

    if (content.includes("@Observable")) result.usesObservable = true;
    if (content.includes("ObservableObject")) result.usesObservableObject = true;
    if (content.includes("import XCTest")) result.usesXCTest = true;
    if (content.includes("import Testing")) result.usesSwiftTesting = true;
    if (content.includes("import SwiftData") || content.includes("@Model"))
      result.usesSwiftData = true;
  }

  // Generate warnings
  if (result.usesObservableObject) {
    result.warnings.push(
      "Uses ObservableObject — migrate to @Observable (Observation framework)"
    );
  }
  if (result.usesXCTest) {
    result.warnings.push(
      "Uses XCTest — migrate to Swift Testing (@Test, #expect)"
    );
  }
  if (result.thirdPartyDeps.length > 0) {
    result.warnings.push(
      `${result.thirdPartyDeps.length} third-party dependency(ies) — prefer zero-dependency architecture`
    );
  }
  if (result.testFiles === 0 && result.swiftFiles > 0) {
    result.warnings.push("No test files found");
  }
  if (!result.hasTuist && !result.hasPackageSwift) {
    result.warnings.push("No Project.swift or Package.swift found");
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("iOS Project Audit:\n");
    console.log(`  Project management: ${result.hasTuist ? "Tuist" : result.hasPackageSwift ? "SPM" : "Unknown"}`);
    console.log(`  Swift files: ${result.swiftFiles}`);
    console.log(`  Test files: ${result.testFiles}`);
    console.log(`  SwiftData: ${result.usesSwiftData ? "yes" : "no"}`);
    console.log(`  @Observable: ${result.usesObservable ? "yes" : "no"}`);
    console.log(`  Swift Testing: ${result.usesSwiftTesting ? "yes" : "no"}`);
    console.log(`  Third-party deps: ${result.thirdPartyDeps.length}`);

    if (result.thirdPartyDeps.length > 0) {
      for (const dep of result.thirdPartyDeps) {
        console.log(`    - ${dep}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log("\nWarnings:");
      for (const w of result.warnings) {
        console.log(`  [!] ${w}`);
      }
    } else {
      console.log("\nNo warnings — project looks healthy.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
