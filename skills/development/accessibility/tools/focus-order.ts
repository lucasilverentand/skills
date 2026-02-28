const args = Bun.argv.slice(2);

const HELP = `
focus-order — Trace tab order through component files and flag focus issues

Usage:
  bun run tools/focus-order.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Statically analyzes JSX/TSX/HTML files to detect focus management problems:
unreachable interactive elements, positive tabindex values, missing focus
trapping in modals/dialogs, and absence of skip navigation links.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface FocusIssue {
  file: string;
  line: number;
  category: "unreachable" | "tab-order" | "focus-trap" | "skip-nav";
  message: string;
  snippet: string;
}

interface FocusableElement {
  file: string;
  line: number;
  tag: string;
  tabindex: number | null;
  snippet: string;
}

async function scanFile(filePath: string): Promise<{
  elements: FocusableElement[];
  issues: FocusIssue[];
}> {
  const elements: FocusableElement[] = [];
  const issues: FocusIssue[] = [];

  const file = Bun.file(filePath);
  if (!(await file.exists())) return { elements, issues };

  const content = await file.text();
  const lines = content.split("\n");

  // Find all interactive/focusable elements
  const interactiveRegex =
    /<(a|button|input|select|textarea|details|summary)\b([^>]*)>/gi;
  let match: RegExpExecArray | null;

  while ((match = interactiveRegex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const lineNum = content.substring(0, match.index).split("\n").length;
    const snippet = lines[lineNum - 1]?.trim() ?? "";

    const tabindexMatch = attrs.match(/tabindex\s*=\s*["'](-?\d+)["']/);
    const tabindex = tabindexMatch ? parseInt(tabindexMatch[1]) : null;

    elements.push({
      file: filePath,
      line: lineNum,
      tag,
      tabindex,
      snippet: snippet.length > 100 ? snippet.substring(0, 100) + "..." : snippet,
    });

    // Check for tabindex=-1 on naturally focusable elements (makes them unreachable)
    if (tabindex === -1 && !attrs.includes("aria-hidden")) {
      issues.push({
        file: filePath,
        line: lineNum,
        category: "unreachable",
        message: `<${tag}> with tabindex="-1" is removed from tab order — ensure this is intentional`,
        snippet: snippet.length > 100 ? snippet.substring(0, 100) + "..." : snippet,
      });
    }

    // Positive tabindex
    if (tabindex !== null && tabindex > 0) {
      issues.push({
        file: filePath,
        line: lineNum,
        category: "tab-order",
        message: `<${tag}> has tabindex="${tabindex}" — positive tabindex disrupts natural order; fix DOM order instead`,
        snippet: snippet.length > 100 ? snippet.substring(0, 100) + "..." : snippet,
      });
    }
  }

  // Check for onClick on non-interactive elements without tabindex
  const divClickRegex = /<(div|span|li|p)\s([^>]*onClick[^>]*)>/gi;
  while ((match = divClickRegex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const lineNum = content.substring(0, match.index).split("\n").length;
    const snippet = lines[lineNum - 1]?.trim() ?? "";

    const hasTabindex = /tabindex\s*=/.test(attrs);
    const hasRole = /role\s*=/.test(attrs);

    if (!hasTabindex) {
      issues.push({
        file: filePath,
        line: lineNum,
        category: "unreachable",
        message: `<${tag}> with onClick but no tabindex — keyboard users cannot reach this element`,
        snippet: snippet.length > 100 ? snippet.substring(0, 100) + "..." : snippet,
      });
    }

    if (!hasRole) {
      issues.push({
        file: filePath,
        line: lineNum,
        category: "unreachable",
        message: `<${tag}> with onClick but no role — screen readers do not announce this as interactive`,
        snippet: snippet.length > 100 ? snippet.substring(0, 100) + "..." : snippet,
      });
    }
  }

  // Check for dialog/modal without focus trap indicators
  const dialogRegex = /role\s*=\s*["']dialog["']|aria-modal\s*=\s*["']true["']/gi;
  while ((match = dialogRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split("\n").length;
    const snippet = lines[lineNum - 1]?.trim() ?? "";

    // Look for focus trap implementation nearby (within ~30 lines)
    const surroundingStart = Math.max(0, lineNum - 5);
    const surroundingEnd = Math.min(lines.length, lineNum + 30);
    const surroundingContent = lines.slice(surroundingStart, surroundingEnd).join("\n");

    const hasFocusTrap =
      /focusTrap|focus-trap|useFocusTrap|FocusLock|FocusTrap|trapFocus|onKeyDown.*Tab/i.test(
        surroundingContent
      );

    if (!hasFocusTrap) {
      issues.push({
        file: filePath,
        line: lineNum,
        category: "focus-trap",
        message:
          "Dialog/modal detected without visible focus trap — focus must be trapped inside open modals",
        snippet: snippet.length > 100 ? snippet.substring(0, 100) + "..." : snippet,
      });
    }
  }

  // Check for skip navigation in main layout/page files
  const isLayoutFile =
    /layout|_app|App\.|index\.(?:tsx|jsx|html)|page\./i.test(filePath);
  if (isLayoutFile) {
    const hasSkipNav =
      /skip.*(?:nav|content|main)|skipTo|SkipNav/i.test(content) ||
      /<a[^>]*href\s*=\s*["']#(?:main|content)["']/i.test(content);

    if (!hasSkipNav && content.includes("<nav") && content.includes("<main")) {
      issues.push({
        file: filePath,
        line: 1,
        category: "skip-nav",
        message:
          "Layout file with navigation but no skip-to-content link — add a visually hidden skip link as the first focusable element",
        snippet: "",
      });
    }
  }

  return { elements, issues };
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
    console.error("No component files found in the specified path");
    process.exit(1);
  }

  const allElements: FocusableElement[] = [];
  const allIssues: FocusIssue[] = [];

  for (const file of files) {
    const { elements, issues } = await scanFile(file);
    allElements.push(...elements);
    allIssues.push(...issues);
  }

  const categoryCounts = {
    unreachable: allIssues.filter((i) => i.category === "unreachable").length,
    "tab-order": allIssues.filter((i) => i.category === "tab-order").length,
    "focus-trap": allIssues.filter((i) => i.category === "focus-trap").length,
    "skip-nav": allIssues.filter((i) => i.category === "skip-nav").length,
  };

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          filesScanned: files.length,
          focusableElements: allElements.length,
          totalIssues: allIssues.length,
          categoryCounts,
          issues: allIssues,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Focus Order: ${files.length} files, ${allElements.length} focusable elements, ${allIssues.length} issues\n`
    );

    if (allIssues.length === 0) {
      console.log("No focus management issues detected.");
    } else {
      const categories = ["unreachable", "tab-order", "focus-trap", "skip-nav"] as const;
      for (const cat of categories) {
        const catIssues = allIssues.filter((i) => i.category === cat);
        if (catIssues.length === 0) continue;

        const catLabel = {
          unreachable: "Unreachable Elements",
          "tab-order": "Tab Order Problems",
          "focus-trap": "Missing Focus Traps",
          "skip-nav": "Missing Skip Navigation",
        }[cat];

        console.log(`## ${catLabel}\n`);
        for (const issue of catIssues) {
          console.log(`  ${issue.file}:${issue.line}`);
          console.log(`  ${issue.message}`);
          if (issue.snippet) console.log(`  > ${issue.snippet}`);
          console.log();
        }
      }
    }
  }

  if (allIssues.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
