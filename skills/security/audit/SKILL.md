---
name: audit
description: Performs comprehensive security audits of code — runs built-in vulnerability scanners (OWASP Top 10 code patterns, hardcoded secrets, dependency CVEs, configuration issues), reviews authentication and authorization logic, checks input validation and output encoding, generates a permission matrix of routes and roles, and audits infrastructure config (Dockerfiles, CI workflows, security headers). Use when the user wants a security review before a release, after adding authentication, when integrating third-party dependencies, when sensitive data handling has changed, or when auditing a specific file or feature for vulnerabilities.
allowed-tools: Read Grep Glob Bash Agent
---

# Security Audit

## Decision Tree

- What kind of audit is needed?
  - **Full pre-release security review** → follow "Full audit" below
  - **Audit a specific file or feature** → follow "Targeted audit" below
  - **Agent-safety compliance review** → verify no commands leak secrets, see `security/agent-safety`
  - **Supply chain review** → run `tools/lockfile-verify.ts` and `tools/action-pin.ts --check`, see `security/supply-chain`
  - **Dependency CVE scan** → run `tools/dependency-audit.ts`
  - **Secret/credential scan** → run `tools/secret-scan.ts`
  - **Code vulnerability scan (OWASP Top 10)** → run `tools/code-audit.ts`
  - **Configuration & infrastructure audit** → run `tools/config-audit.ts`
  - **Auth and authorization review** → follow "Auth review" below
  - **Generate a permission matrix** → run `tools/permission-matrix.ts`
  - **Input validation and output encoding review** → follow "Injection review" below
  - **Specific OWASP category** → run `tools/code-audit.ts --category <category>`

## Full audit

Run all automated checks first, then perform manual review:

### Phase 1: Automated scanning (run all tools)

1. `tools/secret-scan.ts` — detect hardcoded secrets, API keys, credentials
2. `tools/dependency-audit.ts` — check all dependencies for known CVEs
3. Supply chain review: `tools/lockfile-verify.ts` and `tools/action-pin.ts --check` — see `security/supply-chain`
4. `tools/code-audit.ts --verbose` — deep pattern-based vulnerability scan (OWASP Top 10)
5. `tools/config-audit.ts` — audit Dockerfiles, CI workflows, env files, security headers, package.json
6. `tools/permission-matrix.ts <src-dir>` — generate and review the route/role matrix

### Phase 2: Manual code review

After reviewing automated findings, perform these manual checks:

7. **Auth review** (see section below) — trace every authenticated and authorized route
8. **Injection review** (see section below) — trace all trust boundaries and input handling
9. **Data flow review** (see section below) — trace sensitive data through the application
10. **CORS and security headers** (see section below) — verify defensive headers
11. **Business logic review** (see section below) — look for logic flaws the tools can't catch

### Phase 3: Report

Compile all findings into a structured report:

```
## Security Audit Report — [project name] — [date]

### Executive Summary
- Total findings: X (Y critical, Z high, ...)
- Automated scan findings: N
- Manual review findings: M
- Immediate action required: [yes/no]

### Critical Findings
[For each: description, location, impact, remediation steps]

### High Findings
[...]

### Medium/Low Findings
[...]

### Positive Observations
[Security practices done well — reinforce good patterns]

### Recommendations
[Prioritized list of improvements]
```

## Targeted audit

When auditing a specific file or feature:

1. Read the file(s) being audited — understand the context and data flow
2. Run `tools/code-audit.ts <directory>` scoped to the relevant directory
3. Run `tools/secret-scan.ts <directory>` on the same scope
4. Then perform manual review focused on the specific concern:
   - For new API endpoints → auth review + injection review + permission matrix
   - For data model changes → data flow review + mass assignment check
   - For auth changes → full auth review + token handling check
   - For dependency additions → dependency audit + license check
   - For frontend changes → XSS review + CSP check
   - For infrastructure → config-audit + Dockerfile review + CI workflow review

## Secret scan

1. Run `tools/secret-scan.ts` — scans for API keys, tokens, passwords, private keys, connection strings for 35+ providers (AWS, GitHub, Stripe, OpenAI, Anthropic, Cloudflare, Vercel, Supabase, Neon, Firebase, Google Cloud, Azure, etc.)
2. For each finding:
   - **True positive** → remove the secret, rotate it immediately, add to `.gitignore`
   - **False positive** → add a `// nosec` or equivalent suppression comment with a justification
3. Add `.env.example` with placeholder values if it does not exist
4. Check git history: `git log --all --diff-filter=A -- '*.env' '*.pem' '*.key'` — if secrets were committed, they need to be rotated even if removed

## Dependency audit

1. Run `tools/dependency-audit.ts` — cross-references dependencies against the OSV database
2. For each finding, assess exploitability in this specific project context
3. **Critical/High CVEs** → update immediately or find an alternative; do not ship
4. **Medium CVEs** → schedule for next sprint; document the accepted risk if deferring
5. **Low CVEs** → track; update opportunistically
6. Also check: are there dependencies that are unmaintained (no release in 2+ years)?

## Code vulnerability scan

1. Run `tools/code-audit.ts --verbose` — scans for 50+ vulnerability patterns across:
   - **Injection**: SQL, NoSQL, command, LDAP injection
   - **XSS**: innerHTML, dangerouslySetInnerHTML, document.write, template injection
   - **Cryptographic failures**: weak hashes, insecure random, hardcoded IVs, weak ciphers
   - **Broken access control**: IDOR, CORS misconfiguration, missing auth
   - **SSRF**: user-controlled fetch/axios URLs
   - **Path traversal**: user input in file operations
   - **Open redirect**: user-controlled redirect targets
   - **Prototype pollution**: dynamic property assignment from user input
   - **Mass assignment**: request body spread into DB operations
   - **Insecure deserialization**: eval, pickle, yaml.load
   - **Code execution**: eval(), new Function(), vm module
   - **Timing attacks**: secret comparison with ===
   - **Information disclosure**: stack traces, sensitive data in logs
   - **JWT issues**: none algorithm, weak secret, no expiry
   - **Insecure config**: TLS bypass, cookie flags, debug mode
2. Review each finding in context — the tool marks test files at lower severity automatically
3. For false positives, add suppression comments (`// nosec`, `// nosemgrep`, `// security-ok`)

## Configuration audit

1. Run `tools/config-audit.ts` — checks:
   - **Package.json**: suspicious lifecycle scripts (supply chain attacks), unpinned deps, missing lockfile
   - **Dockerfiles**: running as root, latest tags, secrets in ENV/ARG, COPY of sensitive files
   - **GitHub Actions**: script injection via untrusted event data, unpinned actions, excessive permissions, pull_request_target
   - **Environment files**: .env files not gitignored, real secrets in committed .env files
   - **TypeScript config**: strict mode, noUncheckedIndexedAccess
   - **Security headers**: missing CSP/HSTS/helmet, missing rate limiting, permissive CORS

## Auth review

Systematic manual review — read the actual code, don't just pattern match:

1. **Map the auth architecture**:
   - What auth library is used? (Better Auth, Lucia, Clerk, custom)
   - Where are sessions stored? (cookies, JWT, database)
   - What's the token lifecycle? (creation, validation, refresh, revocation)

2. **Trace every authenticated route** — confirm each one checks identity before acting:
   - Read the middleware chain for each route group
   - Verify the auth check cannot be bypassed (e.g., by omitting a header, sending invalid JSON)
   - Check that auth errors return 401, not 200 with an error body

3. **Trace every authorized action** — confirm each one checks the caller's role or ownership:
   - For multi-tenant apps: verify tenant isolation (user A cannot access user B's data)
   - For role-based access: verify role checks are on the server, not just UI-hidden

4. **Check for specific auth vulnerabilities**:
   - **Missing auth checks** — routes that should require login but do not
   - **IDOR vulnerabilities** — object IDs taken from user input without ownership checks
   - **Privilege escalation** — any path where a lower-privilege user can reach a higher-privilege action
   - **Token handling** — tokens stored securely (httpOnly cookies, not localStorage for sensitive apps)
   - **Session fixation** — session ID regenerated after login
   - **Brute force protection** — rate limiting on login/password reset endpoints
   - **Account enumeration** — login/register responses don't reveal whether an email exists
   - **Password reset flow** — tokens are single-use, time-limited, and invalidate previous tokens
   - **OAuth state parameter** — CSRF protection in OAuth flows

5. Run `tools/permission-matrix.ts` and verify every route appears with the correct required role

## Injection review

1. **Identify all trust boundaries**: HTTP request bodies, query params, headers, URL path params, file uploads, WebSocket messages, webhook payloads, third-party API responses
2. **Verify input validation**:
   - Every input is validated with a schema (Zod, Valibot, etc.) before use
   - Validation happens at the boundary, not deep inside business logic
   - Schemas are strict (no `.passthrough()` or extra keys allowed)
   - File uploads: validate MIME type, size, and filename; store outside webroot
3. **Check database queries**:
   - Parameterized queries or ORM only — no string concatenation with user input
   - For raw SQL: verify use of parameterized placeholders (`$1`, `?`, `%s` with param array)
   - For MongoDB: verify no user-controlled `$` operators in queries
4. **Check output encoding**:
   - HTML output: user-controlled content is escaped (React/JSX auto-escapes; watch for `dangerouslySetInnerHTML`)
   - URL construction: user input is URL-encoded
   - JSON APIs: generally safe, but check for reflected XSS in error messages
5. **Check file path operations**:
   - User-supplied paths must be sanitized and confined to an allowed directory
   - Verify `path.resolve()` result `startsWith(allowedBase)`
   - Reject paths containing `..`
6. **Check command execution**:
   - No shell command construction from user input
   - Use `spawn()` with argument arrays, not `exec()` with string concatenation

## Data flow review

Trace sensitive data (passwords, tokens, PII, payment info) through the application:

1. **At rest**: Is sensitive data encrypted in the database? Are passwords hashed with bcrypt/scrypt/argon2?
2. **In transit**: Is TLS enforced? HSTS set? No mixed content?
3. **In logs**: Does the application log sensitive fields? Check logger configurations.
4. **In responses**: Do API responses include fields they shouldn't? (e.g., password hashes, internal IDs, other users' data)
5. **In errors**: Do error responses leak implementation details? (stack traces, SQL errors, internal paths)
6. **In caches**: Is sensitive data cached? Are cache headers appropriate?
7. **In URLs**: Are sensitive params in query strings? (they end up in access logs, browser history, Referer headers)

## CORS and security headers review

- **CORS**: allowed origins must be an explicit allowlist, not `*` for credentialed requests
  - Check: is the Origin header reflected back verbatim? (if so, it's effectively `*`)
  - Check: are credentials (cookies) sent cross-origin? If yes, `*` is blocked by browsers but the intent is wrong
- **CSP**: `Content-Security-Policy` header should be set
  - Minimum: `default-src 'self'`
  - Avoid `unsafe-inline` and `unsafe-eval` — use nonces or hashes for inline scripts
  - Review for overly broad `script-src` (allowing CDNs that host user-uploaded content)
- **HSTS**: `Strict-Transport-Security` should be set in production with `max-age >= 31536000`
- **X-Content-Type-Options**: `nosniff` prevents MIME type sniffing
- **X-Frame-Options**: `DENY` or `SAMEORIGIN` to prevent clickjacking (or use CSP `frame-ancestors`)
- **Referrer-Policy**: `strict-origin-when-cross-origin` or stricter

## Business logic review

These issues can't be found by automated scanners — they require understanding the domain:

1. **Race conditions**: Can two concurrent requests cause inconsistent state? (double-spend, double-vote, etc.)
   - Check: are critical state transitions atomic? (use database transactions or optimistic locking)
2. **Rate limiting**: Can expensive operations be abused? (email sending, SMS, AI API calls)
3. **Numeric overflow**: Are quantities, prices, or balances validated for reasonable ranges?
4. **Time-of-check to time-of-use (TOCTOU)**: Is there a gap between checking a condition and acting on it?
5. **Insufficient logging**: Are security-relevant events logged? (login attempts, permission changes, data access)
6. **Denial of service**: Can a user cause excessive resource consumption? (large file uploads, unbounded queries, regex with backtracking)

## Key references

| File | What it covers |
|---|---|
| `tools/code-audit.ts` | Deep pattern-based vulnerability scan (OWASP Top 10, 50+ patterns) |
| `tools/config-audit.ts` | Audit Dockerfiles, CI workflows, env files, security headers, package.json |
| `tools/dependency-audit.ts` | Scan package.json for CVEs in dependencies via OSV database |
| `tools/secret-scan.ts` | Detect hardcoded secrets, API keys, credentials (35+ providers) |
| `tools/permission-matrix.ts` | Generate route/role permission matrix (Hono, file-based routing) |
