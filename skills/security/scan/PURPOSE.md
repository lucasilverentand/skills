# Security Scanning

Automated security scanning using SAST and DAST tools — runs scanners, normalizes results, triages findings, and generates tool configurations.

## Responsibilities

- Detect available SAST tools and run them against a codebase
- Run DAST scans against target URLs using nuclei or ZAP
- Normalize scan output across tools into a unified finding format
- Triage and deduplicate findings by severity, confidence, and CWE
- Generate and validate scanner configuration files (semgrep rules, nuclei templates, eslint-plugin-security configs)
- Guide CI pipeline integration for automated scanning
- Manage false positive suppressions with audit trails

## Tools

- `tools/sast-scan.ts` — detect available SAST tools and run them, normalize output into a unified format
- `tools/dast-scan.ts` — run DAST tools (nuclei, ZAP) against a target URL, normalize output
- `tools/triage-findings.ts` — parse scan results, deduplicate, prioritize by severity and confidence
- `tools/scan-config.ts` — generate or validate tool-specific configuration files
