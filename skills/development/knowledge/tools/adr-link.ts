const args = Bun.argv.slice(2);

const HELP = `
adr-link — Scan source files for decision references and verify they resolve

Usage:
  bun run tools/adr-link.ts [options]

Options:
  --dir <path>        ADR directory (default: docs/decisions)
  --src <path>        Source directory to scan (default: current directory)
  --json              Output as JSON instead of plain text
  --help              Show this help message

Scans source files for ADR references (e.g., "See ADR-001", "ADR-005") and
verifies that each referenced ADR exists and is not deprecated/superseded.
Also finds ADRs that are never referenced from code.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dirIdx = args.indexOf("--dir");
const adrDir = dirIdx !== -1 ? args[dirIdx + 1] : "docs/decisions";
const srcIdx = args.indexOf("--src");
const srcDir = srcIdx !== -1 ? args[srcIdx + 1] : ".";

interface AdrRef {
  file: string;
  line: number;
  adrId: string;
  snippet: string;
}

interface LinkIssue {
  type: "broken-reference" | "deprecated-reference" | "unreferenced-adr";
  adrId: string;
  message: string;
  file?: string;
  line?: number;
}

async function getExistingAdrs(dir: string): Promise<Map<string, { status: string; title: string; file: string }>> {
  const { existsSync, readdirSync } = await import("node:fs");
  const { join } = await import("node:path");

  const adrs = new Map<string, { status: string; title: string; file: string }>();

  if (!existsSync(dir)) return adrs;

  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));

  for (const filename of files) {
    const filePath = join(dir, filename);
    const content = await Bun.file(filePath).text();

    const titleMatch = content.match(/^#\s+ADR-(\d+):\s*(.+)/m);
    if (titleMatch) {
      const id = titleMatch[1];
      const title = titleMatch[2].trim();

      const statusMatch = content.match(/^##\s+Status\s*\n+\s*(\w+)/m);
      const status = statusMatch ? statusMatch[1] : "Unknown";

      adrs.set(id, { status, title, file: filePath });
      // Also store with leading zeros stripped
      adrs.set(String(parseInt(id)), { status, title, file: filePath });
    }
  }

  return adrs;
}

async function scanSourceFiles(dir: string): Promise<AdrRef[]> {
  const refs: AdrRef[] = [];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,py,rs,go,swift,java,kt,rb,css,scss}");

  for await (const path of glob.scan({ cwd: dir, absolute: true })) {
    if (path.includes("node_modules")) continue;
    if (path.includes("docs/decisions")) continue;

    const content = await Bun.file(path).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match patterns: ADR-001, ADR-1, See ADR-001, adr-001
      const adrMatches = line.matchAll(/\bADR-?(\d+)\b/gi);
      for (const match of adrMatches) {
        refs.push({
          file: path,
          line: i + 1,
          adrId: match[1],
          snippet: line.trim().length > 100 ? line.trim().substring(0, 100) + "..." : line.trim(),
        });
      }
    }
  }

  return refs;
}

async function main() {
  const { resolve } = await import("node:path");

  const resolvedAdrDir = resolve(adrDir);
  const resolvedSrcDir = resolve(srcDir);

  const existingAdrs = await getExistingAdrs(resolvedAdrDir);
  const sourceRefs = await scanSourceFiles(resolvedSrcDir);

  const issues: LinkIssue[] = [];
  const referencedIds = new Set<string>();

  // Check each source reference
  for (const ref of sourceRefs) {
    const normalizedId = String(parseInt(ref.adrId));
    referencedIds.add(normalizedId);

    const adr = existingAdrs.get(normalizedId);

    if (!adr) {
      issues.push({
        type: "broken-reference",
        adrId: ref.adrId,
        message: `Reference to ADR-${ref.adrId} but no such ADR exists`,
        file: ref.file,
        line: ref.line,
      });
    } else if (adr.status === "Deprecated" || adr.status === "Superseded") {
      issues.push({
        type: "deprecated-reference",
        adrId: ref.adrId,
        message: `Reference to ADR-${ref.adrId} which is ${adr.status} — "${adr.title}"`,
        file: ref.file,
        line: ref.line,
      });
    }
  }

  // Find ADRs that are never referenced from code
  for (const [id, adr] of existingAdrs) {
    if (id !== String(parseInt(id))) continue; // Skip padded duplicates
    if (adr.status === "Deprecated" || adr.status === "Superseded") continue;
    if (!referencedIds.has(id)) {
      issues.push({
        type: "unreferenced-adr",
        adrId: id,
        message: `ADR-${id} "${adr.title}" [${adr.status}] has no references in source code`,
      });
    }
  }

  const broken = issues.filter((i) => i.type === "broken-reference");
  const deprecated = issues.filter((i) => i.type === "deprecated-reference");
  const unreferenced = issues.filter((i) => i.type === "unreferenced-adr");

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          totalReferences: sourceRefs.length,
          totalAdrs: new Set([...existingAdrs.keys()].map((k) => String(parseInt(k)))).size,
          brokenReferences: broken.length,
          deprecatedReferences: deprecated.length,
          unreferencedAdrs: unreferenced.length,
          issues,
          references: sourceRefs,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `ADR Links: ${sourceRefs.length} references found, ${issues.length} issues\n`
    );

    if (broken.length > 0) {
      console.log("Broken references (ADR does not exist):\n");
      for (const issue of broken) {
        console.log(`  ${issue.file}:${issue.line} — ${issue.message}`);
      }
      console.log();
    }

    if (deprecated.length > 0) {
      console.log("References to deprecated/superseded ADRs:\n");
      for (const issue of deprecated) {
        console.log(`  ${issue.file}:${issue.line} — ${issue.message}`);
      }
      console.log();
    }

    if (unreferenced.length > 0) {
      console.log("ADRs with no source code references:\n");
      for (const issue of unreferenced) {
        console.log(`  ${issue.message}`);
      }
      console.log();
    }

    if (issues.length === 0) {
      console.log("All ADR references are valid and all active ADRs are referenced.");
    }
  }

  if (broken.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
