const args = Bun.argv.slice(2);

const HELP = `
aria-lint — Detect missing or incorrect ARIA attributes in JSX/TSX/HTML files

Usage:
  bun run tools/aria-lint.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks for common ARIA attribute problems: redundant roles on semantic elements,
aria-label on non-interactive elements, aria-hidden on focusable elements,
missing required ARIA attributes, and invalid tabindex values.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface Issue {
  file: string;
  line: number;
  rule: string;
  message: string;
  snippet: string;
}

const CHECKS: Array<{
  pattern: RegExp;
  rule: string;
  message: string;
}> = [
  {
    pattern: /<button\s[^>]*role\s*=\s*["']button["']/gi,
    rule: "redundant-role",
    message: "Redundant role='button' on <button> — the implicit role is already 'button'",
  },
  {
    pattern: /<nav\s[^>]*role\s*=\s*["']navigation["']/gi,
    rule: "redundant-role",
    message: "Redundant role='navigation' on <nav> — the implicit role is already 'navigation'",
  },
  {
    pattern: /<main\s[^>]*role\s*=\s*["']main["']/gi,
    rule: "redundant-role",
    message: "Redundant role='main' on <main> — the implicit role is already 'main'",
  },
  {
    pattern: /<header\s[^>]*role\s*=\s*["']banner["']/gi,
    rule: "redundant-role",
    message: "Redundant role='banner' on <header> — the implicit role is already 'banner'",
  },
  {
    pattern: /<footer\s[^>]*role\s*=\s*["']contentinfo["']/gi,
    rule: "redundant-role",
    message: "Redundant role='contentinfo' on <footer> — the implicit role is already 'contentinfo'",
  },
  {
    pattern: /<(?:p|div|span|h[1-6])\s[^>]*aria-label\s*=\s*["'][^"']+["'](?![^>]*(?:role\s*=\s*["']|tabindex|onClick|href))[^>]*>/gi,
    rule: "aria-label-non-interactive",
    message: "aria-label on a non-interactive element without a role — screen readers may ignore it; use visible text instead",
  },
  {
    pattern: /aria-hidden\s*=\s*["']true["'][^>]*(?:href\s*=|tabindex\s*=\s*["'](?:0|[1-9]))/gi,
    rule: "aria-hidden-focusable",
    message: "aria-hidden='true' on a focusable element — hides content from screen readers while remaining tab-reachable",
  },
  {
    pattern: /tabindex\s*=\s*["']([2-9]|\d{2,})["']/g,
    rule: "tabindex-positive",
    message: "Positive tabindex value — disrupts natural tab order; use tabindex='0' and fix DOM order instead",
  },
  {
    pattern: /aria-expanded\s*=\s*["'](?:true|false)["'](?![^>]*aria-controls)/gi,
    rule: "aria-expanded-no-controls",
    message: "aria-expanded without aria-controls — add aria-controls pointing to the toggled element's ID",
  },
  {
    pattern: /role\s*=\s*["']dialog["'](?![^>]*(?:aria-label|aria-labelledby))/gi,
    rule: "dialog-no-label",
    message: "role='dialog' without aria-label or aria-labelledby — dialogs must have an accessible name",
  },
  {
    pattern: /role\s*=\s*["'](?:checkbox|radio|switch)["'](?![^>]*aria-checked)/gi,
    rule: "toggle-no-checked",
    message: "Toggle role without aria-checked — checkbox, radio, and switch roles require aria-checked",
  },
];

async function scanFile(filePath: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return issues;

  const content = await file.text();
  const lines = content.split("\n");

  for (const check of CHECKS) {
    const regex = new RegExp(check.pattern.source, check.pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split("\n").length;
      const snippetLine = lines[lineNum - 1]?.trim() ?? "";
      issues.push({
        file: filePath,
        line: lineNum,
        rule: check.rule,
        message: check.message,
        snippet: snippetLine.length > 120 ? snippetLine.substring(0, 120) + "..." : snippetLine,
      });
    }
  }

  return issues;
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
    console.error("No JSX/TSX/HTML files found in the specified path");
    process.exit(1);
  }

  const allIssues: Issue[] = [];
  for (const file of files) {
    const issues = await scanFile(file);
    allIssues.push(...issues);
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify({ total: allIssues.length, issues: allIssues }, null, 2)
    );
  } else {
    console.log(`ARIA Lint: ${files.length} files scanned, ${allIssues.length} issues found\n`);

    if (allIssues.length === 0) {
      console.log("No ARIA issues detected.");
    } else {
      for (const issue of allIssues) {
        console.log(`${issue.file}:${issue.line} — ${issue.rule}`);
        console.log(`  ${issue.message}`);
        console.log(`  > ${issue.snippet}\n`);
      }
    }
  }

  if (allIssues.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
