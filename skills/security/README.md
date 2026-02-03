# Security Skills

Skills for application security analysis and hardening.

## Skills

| Skill | Description |
|-------|-------------|
| [dependency-audit](./dependency-audit/) | Vulnerability scanning for dependencies |
| [secret-scanning](./secret-scanning/) | Detect leaked credentials and secrets |
| [security-headers](./security-headers/) | HTTP security header configuration |
| [auth-patterns](./auth-patterns/) | Secure authentication implementation |

## Usage

```
/dependency-audit              # Scan for vulnerable dependencies
/secret-scanning               # Check for leaked secrets
/security-headers              # Configure security headers
/auth-patterns jwt             # Implement secure JWT auth
```

## Security Categories

- **Dependencies** - Known vulnerabilities in packages
- **Secrets** - API keys, passwords, tokens in code
- **Headers** - CSP, HSTS, X-Frame-Options
- **Authentication** - Session management, token security
- **Input Validation** - Injection prevention

## OWASP Top 10 Coverage

- Injection attacks
- Broken authentication
- Sensitive data exposure
- Security misconfiguration
- Cross-site scripting (XSS)
