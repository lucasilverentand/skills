# Accessibility

Audit components for WCAG compliance, fix accessibility issues, and generate audit reports.

## Responsibilities

- Audit components for WCAG compliance
- Fix accessibility issues
- Generate accessibility audit reports
- Verify keyboard navigation and focus management
- Check color contrast ratios and text alternatives
- Validate ARIA attributes and semantic HTML usage

## Tools

- `tools/wcag-audit.ts` — scan components and report WCAG 2.1 violations by severity
- `tools/contrast-check.ts` — extract color pairs from stylesheets and flag failing contrast ratios
- `tools/aria-lint.ts` — detect missing or incorrect ARIA attributes in JSX/TSX files
- `tools/focus-order.ts` — trace tab order through a component tree and flag unreachable elements
