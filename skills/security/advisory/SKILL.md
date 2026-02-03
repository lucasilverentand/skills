---
name: security-advisory
description: Creates and manages GitHub security advisories for vulnerabilities. Use when disclosing vulnerabilities, requesting CVEs, coordinating security fixes, or managing security reports.
argument-hint: [action]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Manage Security Advisories

Creates and manages GitHub security advisories for vulnerability disclosure.

## Your Task

<!-- TODO: Implement skill logic -->

1. Gather vulnerability details:
   - Affected versions
   - Severity (CVSS)
   - Attack vector
   - Impact description
2. Check existing advisories via `gh api`
3. Create draft advisory with:
   - Summary and description
   - Severity assessment
   - Affected products
   - Patched versions
   - Credits
4. Optionally request CVE
5. Coordinate disclosure timeline

## Examples

```bash
# Create new advisory
/security-advisory create

# List existing advisories
/security-advisory list

# Request CVE for advisory
/security-advisory request-cve GHSA-xxxx-xxxx-xxxx
```

## Advisory Components

<!-- TODO: Add advisory templates -->

- **Summary**: One-line vulnerability description
- **Description**: Technical details, attack scenario
- **Severity**: CVSS score and vector
- **Affected Versions**: Version ranges
- **Patched Versions**: Fixed versions
- **Workarounds**: Temporary mitigations

## Validation Checklist

- [ ] Severity accurately assessed
- [ ] Affected versions correct
- [ ] Patch available before disclosure
- [ ] Credits included
