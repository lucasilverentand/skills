---
name: scan
description: Runs automated SAST and DAST security scans using semgrep, nuclei, and ZAP — detects available scanners, executes them, normalizes and triages findings, generates scanner configs, and guides CI integration. Falls back to the built-in code-audit scanner when no external tools are installed. Use when the user wants to run a security scan, configure semgrep or nuclei, triage scan results, set up security scanning in CI, or suppress false positives from automated scanners.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Security Scanning

## Decision Tree

- What kind of scanning?
  - **Run a SAST scan on the codebase** → run `tools/sast-scan.ts`; if no external scanners installed, fall back to `audit/tools/code-audit.ts`
  - **Run a DAST scan against a live target** → run `tools/dast-scan.ts`
  - **Quick scan without external tools** → run `audit/tools/code-audit.ts` + `audit/tools/secret-scan.ts` (no install required)
  - **Triage or review existing scan results** → run `tools/triage-findings.ts`
  - **Generate or validate scanner config** → run `tools/scan-config.ts`
  - **Set up scanning in CI** → see `references/ci-integration.md`
  - **Suppress a false positive** → follow "Suppressing false positives" below
  - **Full automated security scan** → follow "Full scan" below

## Full scan

Run SAST and DAST together, then triage:

1. `tools/sast-scan.ts [directory] --json > sast-results.json` — runs all available SAST tools (semgrep, bandit, eslint-plugin-security)
2. If no external scanners are available, the tool prints install instructions. **Fall back** to the built-in scanner:
   - `audit/tools/code-audit.ts [directory] --json` — 50+ vulnerability patterns, no external tools needed
   - `audit/tools/secret-scan.ts [directory] --json` — 35+ secret provider patterns
   - `audit/tools/config-audit.ts [directory] --json` — Dockerfile, CI, config security
3. If there is a live target URL: `tools/dast-scan.ts <url> --json > dast-results.json`
4. `tools/triage-findings.ts sast-results.json [dast-results.json]` — deduplicate and prioritize
5. Review triaged output with the user — walk through critical and high findings first
6. For findings that need config changes, run `tools/scan-config.ts` to generate suppression rules or custom policies

## SAST scanning

1. Run `tools/sast-scan.ts [directory] [--tools semgrep,bandit,eslint]`
2. The tool auto-detects which scanners are installed and which languages are present
3. If no scanner is available, it prints installation instructions for the best match
4. Results are normalized into a common format: file, line, rule ID, severity, message, CWE
5. Review findings starting from critical severity — for each finding:
   - **True positive** → fix the code or file an issue
   - **False positive** → suppress with `tools/scan-config.ts suppress <rule-id> <file:line> --reason "justification"`
   - **Needs investigation** → flag for manual review (suggest `audit` for deeper analysis)

### When no external SAST tools are installed

If semgrep, bandit, and eslint-plugin-security are all missing, use the built-in scanners from `audit/tools/`:

1. Run `audit/tools/code-audit.ts [directory] --verbose` — covers OWASP Top 10 with 50+ regex-based patterns
2. Run `audit/tools/secret-scan.ts [directory]` — detects hardcoded secrets for 35+ providers
3. Run `audit/tools/config-audit.ts [directory]` — checks Dockerfiles, CI workflows, env files, security headers

These built-in tools work without any installation — they're pure Bun/TypeScript. They're less precise than semgrep (regex vs. AST analysis) but catch the most common and dangerous patterns.

## DAST scanning

1. Confirm the target URL is authorized for scanning — never scan without explicit permission
2. Run `tools/dast-scan.ts <url> [--tools nuclei,zap] [--severity critical,high]`
3. Results include: URL, method, vulnerability type, severity, evidence
4. For each finding, verify exploitability before reporting as confirmed

## Suppressing false positives

Every suppression needs a reason. The pattern depends on the tool:

- **semgrep**: add `# nosemgrep: <rule-id>` inline, or add to `.semgrep-exclude.yml`
- **bandit**: add `# nosec B<number>` inline, or add to `.bandit` config
- **eslint-plugin-security**: `// eslint-disable-next-line security/<rule>`
- **nuclei**: exclude template IDs in the nuclei config
- **built-in code-audit**: add `// security-ok` or `// nosec` inline with a justification comment

Use `tools/scan-config.ts suppress` to generate the correct suppression with an audit comment.

## Boundary with audit

This skill runs automated scanners and interprets their output. For manual code review, auth logic analysis, permission matrices, secret scanning, or dependency CVE audits, use `audit` instead. If a SAST finding needs deeper manual analysis (e.g., a complex injection path), hand off to `audit`.

## Key references

| File | What it covers |
|---|---|
| `tools/sast-scan.ts` | Detect and run SAST tools, normalize output |
| `tools/dast-scan.ts` | Run DAST tools against target URLs |
| `tools/triage-findings.ts` | Deduplicate, prioritize, format findings |
| `tools/scan-config.ts` | Generate/validate scanner configs, manage suppressions |
| `references/ci-integration.md` | Patterns for GitHub Actions, GitLab CI |
| `audit/tools/code-audit.ts` | Built-in OWASP Top 10 scanner (no external tools needed) |
| `audit/tools/secret-scan.ts` | Built-in secret scanner (no external tools needed) |
| `audit/tools/config-audit.ts` | Built-in config/infrastructure auditor (no external tools needed) |
