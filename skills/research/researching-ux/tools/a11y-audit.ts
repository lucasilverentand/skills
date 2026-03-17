const args = Bun.argv.slice(2);

const HELP = `
a11y-audit — Audit source files for common accessibility issues

Usage:
  bun run tools/a11y-audit.ts <directory> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans JSX/TSX files for common accessibility violations:
missing alt text, missing form labels, missing ARIA attributes,
non-semantic elements used as buttons, and more.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const JSX_EXTENSIONS = new Set([".tsx", ".jsx"]);

interface A11yViolation {
  file: string;
  line: number;
  rule: string;
  wcag: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  message: string;
}

const RULES: {
  pattern: RegExp;
  rule: string;
  wcag: string;
  severity: A11yViolation["severity"];
  message: string;
  negativeMatch?: RegExp;
}[] = [
  {
    pattern: /<img\b(?![^>]*\balt\b)/gi,
    rule: "img-alt",
    wcag: "1.1.1",
    severity: "critical",
    message: "<img> missing alt attribute",
  },
  {
    pattern: /<img\b[^>]*\balt\s*=\s*""\s*/gi,
    rule: "img-alt-empty",
    wcag: "1.1.1",
    severity: "moderate",
    message: '<img> has empty alt="" — verify this is decorative',
  },
  {
    pattern: /<(?:div|span)\b[^>]*\bonClick\b/gi,
    rule: "click-events-have-key-events",
    wcag: "2.1.1",
    severity: "serious",
    message: "Non-interactive element has onClick — use <button> or add keyboard handlers",
    negativeMatch: /role\s*=\s*["']button["']/i,
  },
  {
    pattern: /<input\b(?![^>]*(?:\baria-label\b|\baria-labelledby\b|<label))/gi,
    rule: "label",
    wcag: "1.3.1",
    severity: "serious",
    message: "<input> may be missing an associated label or aria-label",
  },
  {
    pattern: /tabIndex\s*=\s*\{?\s*(?:[1-9]|\d{2,})\s*\}?/g,
    rule: "tabindex",
    wcag: "2.4.3",
    severity: "serious",
    message: "Positive tabIndex disrupts natural tab order — use 0 or -1",
  },
  {
    pattern: /<a\b[^>]*\bhref\s*=\s*["']#["']/gi,
    rule: "anchor-is-valid",
    wcag: "2.1.1",
    severity: "moderate",
    message: '<a href="#"> is not a valid link — use <button> for actions',
  },
  {
    pattern: /autoFocus\b/g,
    rule: "no-autofocus",
    wcag: "2.4.3",
    severity: "moderate",
    message: "autoFocus can disorient screen reader users",
  },
  {
    pattern: /<(?:h1|h2|h3|h4|h5|h6)[^>]*>\s*<\/(?:h1|h2|h3|h4|h5|h6)>/gi,
    rule: "heading-has-content",
    wcag: "2.4.6",
    severity: "serious",
    message: "Empty heading element",
  },
  {
    pattern: /<html\b(?![^>]*\blang\b)/gi,
    rule: "html-has-lang",
    wcag: "3.1.1",
    severity: "serious",
    message: "<html> missing lang attribute",
  },
  {
    pattern: /style\s*=\s*\{\s*\{[^}]*display\s*:\s*["']?none/gi,
    rule: "visible-focus",
    wcag: "2.4.7",
    severity: "moderate",
    message: "Check that hidden elements are also removed from focus order",
  },
];

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (JSX_EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const files = await collectFiles(target);
  const violations: A11yViolation[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");
    const rel = relative(process.cwd(), file);

    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        // Check negative match (if present)
        if (rule.negativeMatch) {
          // Get the full tag context
          const tagStart = content.lastIndexOf("<", match.index);
          const tagEnd = content.indexOf(">", match.index);
          const tagContent = content.slice(tagStart, tagEnd + 1);
          if (rule.negativeMatch.test(tagContent)) continue;
        }

        // Find line number
        const lineNum =
          content.slice(0, match.index).split("\n").length;

        violations.push({
          file: rel,
          line: lineNum,
          rule: rule.rule,
          wcag: rule.wcag,
          severity: rule.severity,
          message: rule.message,
        });
      }
    }
  }

  // Sort by severity
  const severityOrder: Record<string, number> = {
    critical: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
  };
  violations.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const summary = {
    critical: violations.filter((v) => v.severity === "critical").length,
    serious: violations.filter((v) => v.severity === "serious").length,
    moderate: violations.filter((v) => v.severity === "moderate").length,
    minor: violations.filter((v) => v.severity === "minor").length,
  };

  const result = {
    root: relative(process.cwd(), target),
    filesScanned: files.length,
    totalViolations: violations.length,
    summary,
    violations,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Accessibility Audit: ${result.root}\n`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Total violations: ${violations.length}\n`);
  console.log("## Summary\n");
  console.log(`  Critical (WCAG A): ${summary.critical}`);
  console.log(`  Serious: ${summary.serious}`);
  console.log(`  Moderate: ${summary.moderate}`);
  console.log(`  Minor: ${summary.minor}`);

  if (violations.length === 0) {
    console.log("\nNo automated violations found. Note: automated checks catch ~50% of issues.");
    console.log("Manual testing (keyboard navigation, screen reader) is still needed.");
    return;
  }

  console.log("\n## Violations\n");

  let currentSeverity = "";
  for (const v of violations) {
    if (v.severity !== currentSeverity) {
      currentSeverity = v.severity;
      console.log(`### ${v.severity.toUpperCase()}\n`);
    }
    console.log(`  ${v.file}:${v.line} — ${v.message}`);
    console.log(`    Rule: ${v.rule} | WCAG: ${v.wcag}`);
  }

  console.log("\n## Manual Checks Required\n");
  console.log("  - Keyboard navigation: can all interactive elements be reached with Tab?");
  console.log("  - Focus management: does focus move logically after modals/dialogs?");
  console.log("  - Screen reader: are dynamic content changes announced?");
  console.log("  - Color contrast: do all text elements meet 4.5:1 ratio?");
  console.log("  - Touch targets: are all interactive areas at least 44x44px on mobile?");
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
