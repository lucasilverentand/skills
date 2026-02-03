---
name: security-headers
description: Configures HTTP security headers. Use when hardening web application security, setting up CSP, or passing security audits.
argument-hint:
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Security Headers

Configures HTTP security headers for web applications.

## Your Task

1. **Audit current headers**: Check existing configuration
2. **Identify gaps**: Compare to security best practices
3. **Configure headers**: Add missing security headers
4. **Test**: Verify headers are sent correctly
5. **Monitor**: Set up CSP reporting

## Essential Headers

```typescript
// Express/Hono middleware
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

## Content Security Policy

```typescript
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.example.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.example.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

headers['Content-Security-Policy'] = csp;
```

## Header Reference

| Header | Purpose | Recommended Value |
|--------|---------|-------------------|
| `Strict-Transport-Security` | Force HTTPS | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | Prevent MIME sniffing | `nosniff` |
| `X-Frame-Options` | Prevent clickjacking | `DENY` |
| `Content-Security-Policy` | Control resource loading | See above |
| `Referrer-Policy` | Control referrer info | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disable browser features | `camera=(), microphone=()` |

## Testing

```bash
# Check headers
curl -I https://example.com

# Security scanner
npx is-website-vulnerable https://example.com
```

## Tips

- Start CSP in report-only mode
- Use nonces for inline scripts
- Test thoroughly before enforcing strict CSP
- Use securityheaders.com to verify
