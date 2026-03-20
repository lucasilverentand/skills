const args = Bun.argv.slice(2);

const HELP = `
scan-config — Generate or validate scanner configuration files

Usage:
  bun run tools/scan-config.ts <command> [options]

Commands:
  generate <tool> [directory]                    Generate a starter config for a tool
  validate <config-file>                         Validate a scanner config file
  suppress <rule-id> <file:line> --reason <text> Add a false-positive suppression

Supported tools: semgrep, bandit, eslint-security, nuclei

Options:
  --json    Output as JSON
  --help    Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

import { readFile, writeFile, appendFile, access } from "node:fs/promises";
import { resolve, extname } from "node:path";

const jsonOutput = args.includes("--json");
const command = args[0];

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// --- Generate ---

const SEMGREP_CONFIG = `rules:
  - id: custom-rules
    patterns: []
    message: "Custom rule placeholder"
    severity: WARNING
    languages: [typescript, javascript, python]

# Use rulesets from the Semgrep registry:
# semgrep scan --config p/owasp-top-ten
# semgrep scan --config p/typescript
# semgrep scan --config p/python
# semgrep scan --config p/secrets
`;

const BANDIT_CONFIG = `[bandit]
# Exclude directories from scanning
exclude_dirs = tests,venv,.venv,node_modules

# Skip specific test IDs (e.g., B101 = assert_used)
# skips = B101

# Set severity threshold
# severity = medium

# Profile (optional)
# profile = gate
`;

const ESLINT_SECURITY_CONFIG = `// Add to your existing .eslintrc or eslint.config
// npm install --save-dev eslint-plugin-security

// For flat config (eslint.config.js):
// import security from "eslint-plugin-security";
// export default [security.configs.recommended];

// For legacy config (.eslintrc):
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}
`;

const NUCLEI_CONFIG = `# nuclei config — place in ~/.config/nuclei/config.yaml or pass with -config
severity: critical,high,medium
rate-limit: 50
bulk-size: 25
concurrency: 10
retries: 1
timeout: 10
# templates-directory: ./nuclei-templates
# exclude-templates: dos/
`;

async function generate(tool: string, dir: string): Promise<void> {
  const configs: Record<string, { file: string; content: string }> = {
    semgrep: { file: ".semgrep.yml", content: SEMGREP_CONFIG },
    bandit: { file: ".bandit", content: BANDIT_CONFIG },
    "eslint-security": { file: ".eslint-security-example.js", content: ESLINT_SECURITY_CONFIG },
    nuclei: { file: ".nuclei-config.yml", content: NUCLEI_CONFIG },
  };

  const config = configs[tool];
  if (!config) {
    console.error(`Unknown tool: ${tool}. Supported: ${Object.keys(configs).join(", ")}`);
    process.exit(1);
  }

  const outPath = resolve(dir, config.file);
  if (await fileExists(outPath)) {
    console.error(`File already exists: ${outPath}`);
    console.error("Remove it first or use 'validate' to check the existing config.");
    process.exit(1);
  }

  await writeFile(outPath, config.content, "utf-8");

  if (jsonOutput) {
    console.log(JSON.stringify({ action: "generate", tool, file: outPath }));
  } else {
    console.log(`Generated ${config.file} at ${outPath}`);
    console.log(`Edit the file to customize rules for your project.`);
  }
}

// --- Validate ---

async function validate(configPath: string): Promise<void> {
  const fullPath = resolve(configPath);
  if (!(await fileExists(fullPath))) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const content = await readFile(fullPath, "utf-8");
  const ext = extname(fullPath);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation by file type
  if (ext === ".yml" || ext === ".yaml") {
    // Check for valid YAML structure
    if (!content.trim()) {
      errors.push("File is empty");
    }
    if (content.includes("\t")) {
      warnings.push("YAML files should use spaces, not tabs");
    }
    // Check semgrep-specific structure
    if (fullPath.includes("semgrep")) {
      if (!content.includes("rules:") && !content.includes("config:")) {
        warnings.push("Semgrep config should contain 'rules:' or reference a registry config");
      }
    }
  } else if (ext === ".json") {
    try {
      JSON.parse(content);
    } catch (err: any) {
      errors.push(`Invalid JSON: ${err.message}`);
    }
  }

  // Check for overly broad suppressions
  if (content.includes("nosemgrep") && !content.includes(":")) {
    warnings.push("Semgrep suppression without specific rule ID — suppress specific rules instead");
  }

  const result = {
    file: fullPath,
    valid: errors.length === 0,
    errors,
    warnings,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`# Config Validation: ${configPath}\n`);
    if (errors.length === 0 && warnings.length === 0) {
      console.log("No issues found.");
    }
    if (errors.length) {
      console.log("## Errors\n");
      for (const e of errors) console.log(`  - ${e}`);
      console.log();
    }
    if (warnings.length) {
      console.log("## Warnings\n");
      for (const w of warnings) console.log(`  - ${w}`);
      console.log();
    }
  }

  if (errors.length) process.exit(1);
}

// --- Suppress ---

async function suppress(): Promise<void> {
  const ruleId = args[1];
  const fileLineArg = args[2];
  const reasonIdx = args.indexOf("--reason");
  const reason = reasonIdx !== -1 ? args.slice(reasonIdx + 1).filter((a) => !a.startsWith("--")).join(" ") : "";

  if (!ruleId || !fileLineArg) {
    console.error("Usage: scan-config.ts suppress <rule-id> <file:line> --reason <text>");
    process.exit(1);
  }

  if (!reason) {
    console.error("A --reason is required for all suppressions.");
    process.exit(1);
  }

  const [filePath, lineStr] = fileLineArg.split(":");
  const line = parseInt(lineStr, 10);

  if (!filePath || isNaN(line)) {
    console.error("Invalid file:line format. Example: src/auth.ts:42");
    process.exit(1);
  }

  const fullPath = resolve(filePath);
  if (!(await fileExists(fullPath))) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const content = await readFile(fullPath, "utf-8");
  const lines = content.split("\n");

  if (line < 1 || line > lines.length) {
    console.error(`Line ${line} is out of range (file has ${lines.length} lines)`);
    process.exit(1);
  }

  // Determine suppression comment based on rule ID pattern
  let comment: string;
  const ext = extname(fullPath);
  const commentPrefix = [".py", ".rb", ".sh", ".bash", ".yml", ".yaml"].includes(ext) ? "#" : "//";

  if (ruleId.startsWith("B") && /^B\d+$/.test(ruleId)) {
    // Bandit rule
    comment = `${commentPrefix} nosec ${ruleId} — ${reason}`;
  } else if (ruleId.startsWith("security/")) {
    // ESLint security plugin
    comment = `${commentPrefix} eslint-disable-next-line ${ruleId} — ${reason}`;
  } else {
    // Default to semgrep style
    comment = `${commentPrefix} nosemgrep: ${ruleId} — ${reason}`;
  }

  // Insert suppression comment above the target line
  const indent = lines[line - 1].match(/^(\s*)/)?.[1] ?? "";
  lines.splice(line - 1, 0, `${indent}${comment}`);

  await writeFile(fullPath, lines.join("\n"), "utf-8");

  // Append to audit log
  const logEntry = `${new Date().toISOString()} | SUPPRESS | ${ruleId} | ${filePath}:${line} | ${reason}\n`;
  await appendFile(resolve("scan-suppressions.log"), logEntry, "utf-8");

  if (jsonOutput) {
    console.log(JSON.stringify({ action: "suppress", ruleId, file: filePath, line, reason, comment }));
  } else {
    console.log(`Added suppression for ${ruleId} at ${filePath}:${line}`);
    console.log(`Comment: ${comment}`);
    console.log(`Logged to scan-suppressions.log`);
  }
}

// --- Main ---

async function main() {
  switch (command) {
    case "generate": {
      const tool = args[1];
      const dir = args[2] ?? ".";
      if (!tool) {
        console.error("Usage: scan-config.ts generate <tool> [directory]");
        console.error("Tools: semgrep, bandit, eslint-security, nuclei");
        process.exit(1);
      }
      await generate(tool, dir);
      break;
    }
    case "validate": {
      const configFile = args[1];
      if (!configFile) {
        console.error("Usage: scan-config.ts validate <config-file>");
        process.exit(1);
      }
      await validate(configFile);
      break;
    }
    case "suppress": {
      await suppress();
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      console.error("Commands: generate, validate, suppress");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
