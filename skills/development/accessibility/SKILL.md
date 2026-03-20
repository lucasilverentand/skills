---
name: accessibility
description: Audits components for WCAG compliance, fixes accessibility issues, and generates audit reports. Use when implementing UI components, reviewing a feature for accessibility, fixing screen reader issues, verifying keyboard navigation, or checking color contrast ratios.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Accessibility

## Decision Tree

- What is the accessibility task?
  - **Audit a component or page for WCAG violations** → run `tools/wcag-audit.ts <path>`, then see "Fixing Violations" below
  - **Check color contrast** → run `tools/contrast-check.ts <stylesheet>`, then see "Contrast Fixes" below
  - **Fix ARIA attribute issues** → run `tools/aria-lint.ts <path>`, then see "ARIA Fixes" below
  - **Verify keyboard navigation and focus order** → run `tools/focus-order.ts <component>`, then see "Focus Management" below
  - **Generate a full accessibility report** → run all four tools, compile results

## Fixing WCAG Violations

After running `tools/wcag-audit.ts`, violations are ranked by severity (critical → serious → moderate → minor). Address critical and serious first.

Common critical violations and fixes:

| Violation | Fix |
|---|---|
| Images without alt text | Add `alt="description"` to meaningful images; `alt=""` for decorative ones |
| Form inputs without labels | Add `<label htmlFor="id">` or `aria-label` / `aria-labelledby` |
| Buttons with no accessible name | Add text content or `aria-label`; never use `<div onClick>` for interactive elements |
| Links that open in a new tab without warning | Add `aria-label="... (opens in new tab)"` or a visible indicator |
| Missing document language | Add `lang="en"` (or correct locale) to `<html>` |
| Insufficient heading structure | Ensure one `<h1>` per page, no skipped heading levels |

Rules:
- Use semantic HTML elements first (`<button>`, `<nav>`, `<main>`, `<article>`) — ARIA is a fallback
- Never remove focus outlines without providing a visible alternative
- Test with an actual screen reader (VoiceOver on macOS, NVDA on Windows) for critical paths

## Contrast Fixes

`tools/contrast-check.ts` reports color pairs with their contrast ratio and required minimum.

WCAG 2.1 requirements:
- Normal text (< 18pt): ratio ≥ 4.5:1 (AA), ≥ 7:1 (AAA)
- Large text (≥ 18pt or 14pt bold): ratio ≥ 3:1 (AA)
- UI components and graphics: ratio ≥ 3:1 (AA)

Fix approach:
1. Identify which color to adjust — usually darken foreground or lighten background
2. Use the browser DevTools color picker or a contrast checker to find a compliant value
3. Update the design token or Tailwind config — do not hardcode one-off colors
4. For Tailwind: prefer darker shade variants (`text-gray-700` over `text-gray-400` on white)

## ARIA Fixes

After running `tools/aria-lint.ts`, common issues:

| Issue | Fix |
|---|---|
| `role` on an element that already has that implicit role | Remove redundant `role` (e.g., `role="button"` on `<button>`) |
| `aria-label` on a non-interactive element | Remove; use visible text instead |
| `aria-hidden="true"` on a focusable element | Make it non-focusable or remove `aria-hidden` |
| `aria-expanded` without a controlled element | Add `aria-controls="panel-id"` pointing to the toggled element |
| Missing `aria-live` on dynamic content | Add `aria-live="polite"` for updates, `"assertive"` only for urgent alerts |
| `tabindex > 0` | Replace with `tabindex="0"` and fix DOM order to control tab sequence |

## Focus Management

After running `tools/focus-order.ts`:

1. **Unreachable elements** — elements that should be focusable but aren't:
   - Add `tabindex="0"` for non-interactive elements that need focus
   - Ensure the element has a visible focus indicator

2. **Wrong tab order** — tab order doesn't match visual order:
   - Fix DOM order to match visual layout instead of using `tabindex > 0`
   - Use CSS `order` property only when it doesn't break reading order

3. **Modal focus trapping** — focus must stay inside an open modal:
   - Trap focus with a focus trap library or manual `keydown` handler on `Tab`/`Shift+Tab`
   - Return focus to the trigger element when the modal closes

4. **Skip navigation** — long pages need a "Skip to main content" link:
   - Add as the first focusable element in `<body>`
   - Make it visible on focus, hidden otherwise (`sr-only` with `:focus` override)

## Key references

| File | What it covers |
|---|---|
| `tools/wcag-audit.ts` | Scan components and report WCAG 2.1 violations by severity |
| `tools/contrast-check.ts` | Extract color pairs from stylesheets and flag failing contrast ratios |
| `tools/aria-lint.ts` | Detect missing or incorrect ARIA attributes in JSX/TSX files |
| `tools/focus-order.ts` | Trace tab order through a component tree and flag unreachable elements |
