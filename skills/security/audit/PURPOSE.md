# Security Audit

Code security review, dependency audit, auth/authz review, and security reporting.

## Responsibilities

- Review code for security vulnerabilities
- Audit dependencies for known issues
- Review authentication and authorization logic
- Generate security reports
- Check for hardcoded secrets and credentials
- Validate input sanitization and output encoding
- Assess CORS and CSP configurations

## Tools

- `tools/dependency-audit.ts` — scan package.json for dependencies with known CVEs
- `tools/secret-scan.ts` — detect hardcoded secrets, API keys, and credentials in source
- `tools/permission-matrix.ts` — generate a matrix of routes and their required auth roles
