---
name: audit
description: Performs security reviews of code — scans for hardcoded secrets, audits dependencies for CVEs, reviews authentication and authorization logic, checks input validation and output encoding, and generates a permission matrix of routes and roles. Use when the user wants a security review before a release, after adding authentication, when integrating third-party dependencies, or when sensitive data handling has changed.
allowed-tools: Read Grep Glob Bash
---

# Security Audit

## Decision Tree

- What kind of audit is needed?
  - **Full pre-release security review** → follow "Full audit" below
  - **Dependency CVE scan** → run `tools/dependency-audit.ts`
  - **Secret/credential scan** → run `tools/secret-scan.ts`
  - **Auth and authorization review** → follow "Auth review" below
  - **Generate a permission matrix** → run `tools/permission-matrix.ts`
  - **Input validation and output encoding review** → follow "Injection review" below

## Full audit

Run all checks in order:

1. `tools/secret-scan.ts` — detect hardcoded secrets before anything else
2. `tools/dependency-audit.ts` — check for CVEs in direct and transitive deps
3. `tools/permission-matrix.ts` — generate the route/role matrix and review it manually
4. Auth review (see below)
5. Injection review (see below)
6. CORS and CSP review (see below)
7. Compile findings into a report — severity (critical / high / medium / low), location, recommendation

## Secret scan

1. Run `tools/secret-scan.ts` — scans for API keys, tokens, passwords, private keys in source
2. For each finding:
   - **True positive** → remove the secret, rotate it immediately, add to `.gitignore`
   - **False positive** → add a `// nosec` or equivalent suppression comment with a justification
3. Add `.env.example` with placeholder values if it does not exist

## Dependency audit

1. Run `tools/dependency-audit.ts` — cross-references `package.json` against CVE databases
2. For each finding, assess exploitability in this specific project context
3. **Critical/High CVEs** → update immediately or find an alternative; do not ship
4. **Medium CVEs** → schedule for next sprint; document the accepted risk if deferring
5. **Low CVEs** → track; update opportunistically

## Auth review

1. Trace every authenticated route — confirm each one checks identity before acting
2. Trace every authorized action — confirm each one checks the caller's role or ownership
3. Check for:
   - **Missing auth checks** — routes that should require login but do not
   - **IDOR vulnerabilities** — object IDs taken from user input without ownership checks
   - **Privilege escalation** — any path where a lower-privilege user can reach a higher-privilege action
   - **Token handling** — tokens stored securely (httpOnly cookies, not localStorage for sensitive apps)
4. Run `tools/permission-matrix.ts` and verify every route appears with the correct required role

## Injection review

1. Identify all trust boundaries: HTTP request bodies, query params, headers, file uploads
2. Verify every input is validated with a schema (e.g. Zod) before use
3. Check database queries — parameterized queries or ORM only; no string concatenation with user input
4. Check output encoding — HTML output must escape user-controlled content; JSON APIs are generally safe
5. Check file path operations — user-supplied paths must be sanitized and confined to an allowed directory

## CORS and CSP review

- **CORS**: allowed origins must be an explicit allowlist, not `*` for credentialed requests
- **CSP**: `Content-Security-Policy` header should be set; `default-src 'self'` is a safe baseline
- **HSTS**: `Strict-Transport-Security` should be set in production

## Key references

| File | What it covers |
|---|---|
| `tools/dependency-audit.ts` | Scan package.json for CVEs in dependencies |
| `tools/secret-scan.ts` | Detect hardcoded secrets, API keys, and credentials |
| `tools/permission-matrix.ts` | Generate route/role permission matrix |
