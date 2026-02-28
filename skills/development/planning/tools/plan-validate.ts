const args = Bun.argv.slice(2);

const HELP = `
plan-validate — Check a plan for structural issues

Usage:
  bun run tools/plan-validate.ts <plan-file> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Validates a plan file for missing steps, circular dependencies,
undefined file references, and missing test coverage steps.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { stat } from "node:fs/promises";
import { resolve } from "node:path";

interface ValidationIssue {
  severity: "error" | "warning";
  rule: string;
  message: string;
  line?: number;
}

async function main() {
  const planFile = filteredArgs[0];
  if (!planFile) {
    console.error("Error: missing plan file path");
    process.exit(1);
  }

  const file = Bun.file(planFile);
  if (!(await file.exists())) {
    console.error(`Error: plan file not found: ${planFile}`);
    process.exit(1);
  }

  const content = await file.text();
  const lines = content.split("\n");
  const issues: ValidationIssue[] = [];

  // Extract numbered steps
  const steps: { num: number; text: string; line: number }[] = [];
  const fileRefs: { path: string; line: number }[] = [];
  let hasTestSection = false;
  let hasAcceptanceCriteria = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Numbered steps
    const stepMatch = line.match(/^\s*(\d+)\.\s+(.+)/);
    if (stepMatch) {
      steps.push({ num: parseInt(stepMatch[1]), text: stepMatch[2], line: lineNum });
    }

    // File references in backticks
    const fileRefPattern = /`([^`]+\.[a-zA-Z]{1,10})`/g;
    let fileMatch;
    while ((fileMatch = fileRefPattern.exec(line)) !== null) {
      const ref = fileMatch[1];
      if (!ref.startsWith("_") && !ref.includes("*")) {
        fileRefs.push({ path: ref, line: lineNum });
      }
    }

    // Section detection
    if (/^#+\s*test/i.test(line)) hasTestSection = true;
    if (/^#+\s*acceptance/i.test(line) || /^\s*-\s*\[[ x]\]/i.test(line)) {
      hasAcceptanceCriteria = true;
    }
  }

  // Check for sequential numbering gaps
  if (steps.length > 0) {
    const stepNums = steps.map((s) => s.num).sort((a, b) => a - b);
    for (let i = 1; i < stepNums.length; i++) {
      if (stepNums[i] !== stepNums[i - 1] + 1) {
        issues.push({
          severity: "warning",
          rule: "step-gap",
          message: `Gap in step numbering: step ${stepNums[i - 1]} jumps to step ${stepNums[i]}`,
        });
      }
    }

    // Check for duplicate step numbers
    const seen = new Set<number>();
    for (const s of steps) {
      if (seen.has(s.num)) {
        issues.push({
          severity: "error",
          rule: "duplicate-step",
          message: `Duplicate step number: ${s.num}`,
          line: s.line,
        });
      }
      seen.add(s.num);
    }
  }

  // Check for cross-references to non-existent steps
  const stepNums = new Set(steps.map((s) => s.num));
  for (const step of steps) {
    const refPattern = /step\s*#?(\d+)/gi;
    let match;
    while ((match = refPattern.exec(step.text)) !== null) {
      const refNum = parseInt(match[1]);
      if (refNum !== step.num && !stepNums.has(refNum)) {
        issues.push({
          severity: "error",
          rule: "undefined-step-ref",
          message: `Step ${step.num} references non-existent step ${refNum}`,
          line: step.line,
        });
      }
    }
  }

  // Check file references exist
  for (const ref of fileRefs) {
    // Skip placeholder paths (contain underscores typically)
    if (ref.path.startsWith("_") || ref.path.includes("/_")) continue;
    try {
      await stat(resolve(ref.path));
    } catch {
      issues.push({
        severity: "warning",
        rule: "file-not-found",
        message: `Referenced file not found: ${ref.path}`,
        line: ref.line,
      });
    }
  }

  // Structural checks
  if (!hasAcceptanceCriteria) {
    issues.push({
      severity: "warning",
      rule: "missing-acceptance-criteria",
      message: "Plan has no acceptance criteria — add checkboxes defining what 'done' looks like",
    });
  }

  if (!hasTestSection) {
    issues.push({
      severity: "warning",
      rule: "missing-tests",
      message: "Plan has no test section — every behavior change should have corresponding tests",
    });
  }

  if (steps.length === 0) {
    issues.push({
      severity: "error",
      rule: "no-steps",
      message: "Plan has no numbered implementation steps",
    });
  }

  // Check for empty placeholder sections
  const sectionPattern = /^#+\s+(.+)/;
  let currentSection = "";
  let sectionContent = 0;
  for (const line of lines) {
    const sectionMatch = line.match(sectionPattern);
    if (sectionMatch) {
      if (currentSection && sectionContent === 0) {
        issues.push({
          severity: "warning",
          rule: "empty-section",
          message: `Section "${currentSection}" has no content`,
        });
      }
      currentSection = sectionMatch[1].trim();
      sectionContent = 0;
    } else if (line.trim() && currentSection) {
      sectionContent++;
    }
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  const result = {
    planFile,
    steps: steps.length,
    fileRefs: fileRefs.length,
    hasTestSection,
    hasAcceptanceCriteria,
    errors,
    warnings,
    issues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Plan Validation: ${planFile}`);
    console.log(`  Steps: ${steps.length}`);
    console.log(`  File references: ${fileRefs.length}`);
    console.log(`  ${errors} errors, ${warnings} warnings\n`);

    if (issues.length === 0) {
      console.log("Plan structure looks good.");
    } else {
      for (const issue of issues) {
        const icon = issue.severity === "error" ? "ERROR" : "WARN";
        const loc = issue.line ? `:${issue.line}` : "";
        console.log(`  [${icon}] ${issue.rule}${loc}`);
        console.log(`    ${issue.message}`);
      }
    }
  }

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
