const args = Bun.argv.slice(2);

const HELP = `
license-audit — Audit licenses of all dependencies for compliance

Usage:
  bun run tools/license-audit.ts [directory] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Reads package.json and scans node_modules to collect the license of
every direct and transitive dependency. Classifies each by permissiveness
and flags potential compliance issues.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const PERMISSIVE = new Set([
  "MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0",
  "0BSD", "CC0-1.0", "Unlicense", "CC-BY-4.0", "CC-BY-3.0",
  "PSF-2.0", "Python-2.0", "Zlib", "BlueOak-1.0.0",
]);

const WEAK_COPYLEFT = new Set([
  "LGPL-2.1", "LGPL-2.1-only", "LGPL-2.1-or-later",
  "LGPL-3.0", "LGPL-3.0-only", "LGPL-3.0-or-later",
  "MPL-2.0", "EPL-1.0", "EPL-2.0", "CDDL-1.0",
]);

const STRONG_COPYLEFT = new Set([
  "GPL-2.0", "GPL-2.0-only", "GPL-2.0-or-later",
  "GPL-3.0", "GPL-3.0-only", "GPL-3.0-or-later",
  "AGPL-3.0", "AGPL-3.0-only", "AGPL-3.0-or-later",
  "SSPL-1.0",
]);

type LicenseClass = "permissive" | "weak-copyleft" | "strong-copyleft" | "unknown";

interface DepLicense {
  name: string;
  version: string;
  license: string;
  classification: LicenseClass;
  isDirect: boolean;
}

function classifyLicense(license: string): LicenseClass {
  // Handle SPDX expressions like "(MIT OR Apache-2.0)"
  const cleaned = license.replace(/[()]/g, "").trim();
  const parts = cleaned.split(/\s+OR\s+/i);

  // If any part is permissive, the overall expression is permissive
  for (const part of parts) {
    const trimmed = part.trim();
    if (PERMISSIVE.has(trimmed)) return "permissive";
  }
  for (const part of parts) {
    const trimmed = part.trim();
    if (WEAK_COPYLEFT.has(trimmed)) return "weak-copyleft";
  }
  for (const part of parts) {
    const trimmed = part.trim();
    if (STRONG_COPYLEFT.has(trimmed)) return "strong-copyleft";
  }
  return "unknown";
}

async function scanNodeModules(
  dir: string,
  directDeps: Set<string>
): Promise<DepLicense[]> {
  const nmDir = join(dir, "node_modules");
  const s = await stat(nmDir).catch(() => null);
  if (!s?.isDirectory()) {
    console.error("Warning: node_modules not found. Run `bun install` first.");
    return [];
  }

  const results: DepLicense[] = [];
  const entries = await readdir(nmDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    if (entry.name.startsWith("@")) {
      // Scoped package — read subdirectories
      const scopeDir = join(nmDir, entry.name);
      const scopeEntries = await readdir(scopeDir, { withFileTypes: true });
      for (const scopeEntry of scopeEntries) {
        if (!scopeEntry.isDirectory()) continue;
        const pkgName = `${entry.name}/${scopeEntry.name}`;
        const pkgDir = join(scopeDir, scopeEntry.name);
        const info = await readPackageInfo(pkgDir, pkgName, directDeps);
        if (info) results.push(info);
      }
    } else {
      const pkgDir = join(nmDir, entry.name);
      const info = await readPackageInfo(pkgDir, entry.name, directDeps);
      if (info) results.push(info);
    }
  }

  return results;
}

async function readPackageInfo(
  pkgDir: string,
  name: string,
  directDeps: Set<string>
): Promise<DepLicense | null> {
  try {
    const pkgJson = JSON.parse(
      await readFile(join(pkgDir, "package.json"), "utf-8")
    );
    const license = pkgJson.license ?? "unknown";
    return {
      name,
      version: pkgJson.version ?? "unknown",
      license: typeof license === "object" ? license.type ?? "unknown" : license,
      classification: classifyLicense(
        typeof license === "object" ? license.type ?? "" : license
      ),
      isDirect: directDeps.has(name),
    };
  } catch {
    return null;
  }
}

async function main() {
  const dir = resolve(filteredArgs[0] ?? ".");

  // Read package.json for direct deps
  let directDeps = new Set<string>();
  try {
    const pkgJson = JSON.parse(
      await readFile(join(dir, "package.json"), "utf-8")
    );
    const allDeps = {
      ...pkgJson.dependencies,
      ...pkgJson.devDependencies,
    };
    directDeps = new Set(Object.keys(allDeps));
  } catch {
    console.error("Warning: could not read package.json");
  }

  const deps = await scanNodeModules(dir, directDeps);

  // Sort: flagged items first, then alphabetical
  deps.sort((a, b) => {
    const classOrder: Record<LicenseClass, number> = {
      "strong-copyleft": 0,
      unknown: 1,
      "weak-copyleft": 2,
      permissive: 3,
    };
    const diff = classOrder[a.classification] - classOrder[b.classification];
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });

  const flagged = deps.filter(
    (d) =>
      d.classification === "strong-copyleft" ||
      d.classification === "unknown"
  );
  const weakCopyleft = deps.filter(
    (d) => d.classification === "weak-copyleft"
  );
  const permissive = deps.filter((d) => d.classification === "permissive");

  const result = {
    root: dir,
    totalDependencies: deps.length,
    directDependencies: deps.filter((d) => d.isDirect).length,
    summary: {
      permissive: permissive.length,
      weakCopyleft: weakCopyleft.length,
      strongCopyleft: deps.filter((d) => d.classification === "strong-copyleft").length,
      unknown: deps.filter((d) => d.classification === "unknown").length,
    },
    flagged,
    weakCopyleft,
    allDependencies: deps,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# License Audit Report\n");
  console.log(`Project: ${dir}`);
  console.log(`Total dependencies: ${deps.length}`);
  console.log(`Direct dependencies: ${result.directDependencies}\n`);

  console.log("## Summary\n");
  console.log(`  Permissive (MIT, Apache, BSD, ISC): ${result.summary.permissive}`);
  console.log(`  Weak copyleft (LGPL, MPL): ${result.summary.weakCopyleft}`);
  console.log(`  Strong copyleft (GPL, AGPL): ${result.summary.strongCopyleft}`);
  console.log(`  Unknown / no license: ${result.summary.unknown}`);

  if (flagged.length > 0) {
    console.log("\n## Flagged — requires review\n");
    for (const d of flagged) {
      const tag = d.isDirect ? "(direct)" : "(transitive)";
      console.log(`  ${d.name}@${d.version} — ${d.license} [${d.classification}] ${tag}`);
    }
  }

  if (weakCopyleft.length > 0) {
    console.log("\n## Weak Copyleft — generally OK for use as library\n");
    for (const d of weakCopyleft) {
      const tag = d.isDirect ? "(direct)" : "(transitive)";
      console.log(`  ${d.name}@${d.version} — ${d.license} ${tag}`);
    }
  }

  console.log("\n## All Dependencies\n");
  console.log("  | Package | Version | License | Class | Direct |");
  console.log("  | --- | --- | --- | --- | --- |");
  for (const d of deps) {
    console.log(
      `  | ${d.name} | ${d.version} | ${d.license} | ${d.classification} | ${d.isDirect ? "yes" : "no"} |`
    );
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
