const args = Bun.argv.slice(2);

const HELP = `
commit-lint — Validate commit messages against conventional commit format

Usage:
  bun run tools/commit-lint.ts <message-or-file> [options]

Arguments:
  <message-or-file>  A commit message string, or a path to a file containing the message
                     (e.g. .git/COMMIT_EDITMSG when used as a commit-msg hook)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

const VALID_TYPES = ["feat", "fix", "refactor", "test", "docs", "chore", "ci", "perf", "build", "style", "revert"];
const HEADER_PATTERN = /^(\w+)(\([\w./-]+\))?!?:\s.+$/;
const MAX_SUBJECT_LENGTH = 72;

interface LintResult {
  valid: boolean;
  message: string;
  issues: string[];
  warnings: string[];
}

function lint(raw: string): LintResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Strip comment lines (lines starting with #)
  const lines = raw.split("\n").filter((l) => !l.startsWith("#"));
  const message = lines.join("\n").trim();

  if (!message) {
    return { valid: false, message: "", issues: ["Commit message is empty"], warnings: [] };
  }

  const header = lines[0].trim();

  // Check header matches conventional commit pattern
  if (!HEADER_PATTERN.test(header)) {
    issues.push(`Header does not match conventional commit format: <type>(<scope>): <description>`);
  } else {
    // Extract type
    const typeMatch = header.match(/^(\w+)/);
    if (typeMatch && !VALID_TYPES.includes(typeMatch[1])) {
      issues.push(`Invalid type "${typeMatch[1]}" — expected one of: ${VALID_TYPES.join(", ")}`);
    }

    // Check description starts lowercase
    const descMatch = header.match(/:\s*(.)/);
    if (descMatch && descMatch[1] !== descMatch[1].toLowerCase()) {
      warnings.push("Description should start with a lowercase letter");
    }

    // Check for trailing period
    if (header.endsWith(".")) {
      warnings.push("Header should not end with a period");
    }
  }

  // Check subject length
  if (header.length > MAX_SUBJECT_LENGTH) {
    issues.push(`Header is ${header.length} chars — maximum is ${MAX_SUBJECT_LENGTH}`);
  }

  // Check for blank line between header and body
  if (lines.length > 1 && lines[1].trim() !== "") {
    issues.push("Second line must be blank (separates header from body)");
  }

  // Check for BREAKING CHANGE footer format
  const bodyLines = lines.slice(2);
  for (const line of bodyLines) {
    if (line.startsWith("BREAKING CHANGE") && !line.startsWith("BREAKING CHANGE: ")) {
      warnings.push('BREAKING CHANGE footer should be formatted as "BREAKING CHANGE: <description>"');
    }
  }

  return { valid: issues.length === 0, message: header, issues, warnings };
}

async function main() {
  const input = filteredArgs[0];
  if (!input) {
    console.error("Error: missing commit message or file path");
    process.exit(1);
  }

  let message: string;

  // Check if input is a file path
  const file = Bun.file(input);
  if (await file.exists()) {
    message = await file.text();
  } else {
    message = input;
  }

  const result = lint(message);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.valid && result.warnings.length === 0) {
      console.log(`OK: ${result.message}`);
    } else if (result.valid) {
      console.log(`OK (with warnings): ${result.message}`);
      for (const w of result.warnings) {
        console.log(`  warning: ${w}`);
      }
    } else {
      console.log(`FAIL: ${result.message || "(empty)"}`);
      for (const issue of result.issues) {
        console.log(`  error: ${issue}`);
      }
      for (const w of result.warnings) {
        console.log(`  warning: ${w}`);
      }
    }
  }

  if (!result.valid) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
