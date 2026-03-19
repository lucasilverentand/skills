const args = Bun.argv.slice(2);

const HELP = `
wcag-audit — Scan JSX/TSX/HTML files for WCAG 2.1 violations

Usage:
  bun run tools/wcag-audit.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans files for common WCAG 2.1 violations and categorizes them by severity
(critical, serious, moderate, minor).
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface Violation {
  file: string;
  line: number;
  severity: "critical" | "serious" | "moderate" | "minor";
  rule: string;
  message: string;
  snippet: string;
}

const RULES: Array<{
  pattern: RegExp;
  severity: Violation["severity"];
  rule: string;
  message: string;
}> = [
  {
    pattern: /<img(?![^>]*alt\s*=)[^>]*>/gi,
    severity: "critical",
    rule: "img-alt",
    message: "Image missing alt attribute",
  },
  {
    pattern: /<input(?![^>]*(?:aria-label|aria-labelledby|id\s*=\s*["'][^"']*["'][^>]*<label|<label[^>]*for))[^>]*(?:type\s*=\s*["'](?:text|email|password|search|tel|url|number)["'])[^>]*>/gi,
    severity: "critical",
    rule: "input-label",
    message: "Form input missing associated label or aria-label",
  },
  {
    pattern: /<(?:div|span)\s[^>]*onClick[^>]*>(?!.*(?:role\s*=\s*["']button["']|role\s*=\s*["']link["']))/gi,
    severity: "critical",
    rule: "interactive-element",
    message:
      "Non-interactive element used as clickable without role attribute — use <button> or <a> instead",
  },
  {
    pattern: /<button(?![^>]*(?:aria-label|aria-labelledby))[^>]*>\s*<(?:img|svg|Icon)[^>]*>\s*<\/button>/gi,
    severity: "serious",
    rule: "button-name",
    message: "Icon-only button missing accessible name (aria-label)",
  },
  {
    pattern: /<html(?![^>]*lang\s*=)[^>]*>/gi,
    severity: "serious",
    rule: "html-lang",
    message: "Missing lang attribute on <html> element",
  },
  {
    pattern: /tabindex\s*=\s*["']([2-9]|\d{2,})["']/gi,
    severity: "serious",
    rule: "tabindex-positive",
    message:
      "Positive tabindex disrupts natural tab order — use tabindex='0' and fix DOM order",
  },
  {
    pattern: /<a\s[^>]*target\s*=\s*["']_blank["'](?![^>]*(?:aria-label|rel\s*=\s*["'][^"']*noopener))[^>]*>/gi,
    severity: "moderate",
    rule: "link-new-tab",
    message:
      "Link opens in new tab without warning — add aria-label or visible indicator",
  },
  {
    pattern:
      /aria-hidden\s*=\s*["']true["'][^>]*(?:tabindex\s*=\s*["'](?:0|[1-9])["']|href\s*=|onClick)/gi,
    severity: "serious",
    rule: "aria-hidden-focusable",
    message:
      "aria-hidden='true' on a focusable element — content is hidden from screen readers but still tab-reachable",
  },
  {
    pattern:
      /<button\s[^>]*role\s*=\s*["']button["'][^>]*>|<nav\s[^>]*role\s*=\s*["']navigation["'][^>]*>|<main\s[^>]*role\s*=\s*["']main["'][^>]*>/gi,
    severity: "minor",
    rule: "redundant-role",
    message:
      "Redundant ARIA role on semantic element — the implicit role is already correct",
  },
  {
    pattern: /outline\s*:\s*(?:none|0)\s*;?(?![^{}]*outline-offset|[^{}]*:focus-visible)/gi,
    severity: "serious",
    rule: "focus-outline",
    message:
      "Focus outline removed without providing a visible alternative — breaks keyboard navigation",
  },
];

async function scanFile(filePath: string): Promise<Violation[]> {
  const violations: Violation[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return violations;

  const content = await file.text();
  const lines = content.split("\n");

  for (const rule of RULES) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      const lineNum =
        content.substring(0, match.index).split("\n").length;
      const snippetLine = lines[lineNum - 1]?.trim() ?? "";
      violations.push({
        file: filePath,
        line: lineNum,
        severity: rule.severity,
        rule: rule.rule,
        message: rule.message,
        snippet:
          snippetLine.length > 120
            ? snippetLine.substring(0, 120) + "..."
            : snippetLine,
      });
    }
  }

  return violations;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{jsx,tsx,html,svelte,vue}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required path argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error(
      "No JSX/TSX/HTML files found in the specified path"
    );
    process.exit(1);
  }

  const allViolations: Violation[] = [];
  for (const file of files) {
    const violations = await scanFile(file);
    allViolations.push(...violations);
  }

  const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  allViolations.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const counts = {
    critical: allViolations.filter((v) => v.severity === "critical").length,
    serious: allViolations.filter((v) => v.severity === "serious").length,
    moderate: allViolations.filter((v) => v.severity === "moderate").length,
    minor: allViolations.filter((v) => v.severity === "minor").length,
    total: allViolations.length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify({ counts, violations: allViolations }, null, 2));
  } else {
    console.log(`WCAG Audit: ${files.length} files scanned\n`);
    console.log(
      `  Critical: ${counts.critical}  Serious: ${counts.serious}  Moderate: ${counts.moderate}  Minor: ${counts.minor}\n`
    );
    if (allViolations.length === 0) {
      console.log("No violations found.");
    } else {
      for (const v of allViolations) {
        console.log(
          `[${v.severity.toUpperCase()}] ${v.file}:${v.line} — ${v.rule}`
        );
        console.log(`  ${v.message}`);
        console.log(`  > ${v.snippet}\n`);
      }
    }
  }

  if (counts.critical > 0 || counts.serious > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
