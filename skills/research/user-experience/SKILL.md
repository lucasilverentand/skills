---
name: user-experience
description: Analyzes user flows, performs heuristic evaluations, maps information architecture, audits accessibility, and identifies usability friction. Use when the user needs a UX review of an existing product, wants to evaluate onboarding quality, needs an accessibility audit, or wants to understand where users struggle in a flow.
allowed-tools: Read Glob Grep Bash WebFetch
context: fork
agent: Explore
---

# User Experience

## Decision Tree

- What is the research goal?
  - **Map the flows and navigation structure of an app** → follow "Flow Mapping" below
  - **Evaluate usability against established heuristics** → follow "Heuristic Evaluation" below
  - **Audit accessibility compliance** → follow "Accessibility Audit" below
  - **Identify friction in onboarding or a specific user journey** → follow "Journey Friction Analysis" below
  - **Audit information architecture** → follow "Information Architecture Review" below

## Flow Mapping

1. Run `tools/flow-mapper.ts` to parse route definitions and generate a Mermaid flow diagram
2. Review the generated diagram for:
   - **Dead ends** — routes with no exit path
   - **Missing back-navigation** — flows that can't be reversed
   - **Unexpected branching** — flows that split based on non-obvious conditions
   - **Entry point completeness** — can users reach all key features from the main navigation?
3. Supplement with code reading: check route guards, redirects, and conditional rendering
4. Map flows by user type if roles exist (authenticated, anonymous, admin, etc.)
5. Produce a flow diagram (Mermaid) and a written summary of navigation structure and gaps

## Heuristic Evaluation

1. Run `tools/heuristic-checklist.ts` to generate a Nielsen heuristic evaluation checklist for the relevant screens
2. Evaluate each of the 10 heuristics against the current UI:
   - **Visibility of system status** — does the UI tell users what's happening? (loading states, progress indicators)
   - **Match with real world** — does the language match users' mental models?
   - **User control and freedom** — can users undo, cancel, and go back?
   - **Consistency and standards** — are similar actions in similar places with similar labels?
   - **Error prevention** — does the UI prevent errors before they happen?
   - **Recognition over recall** — is all needed information visible rather than memorized?
   - **Flexibility and efficiency** — are there shortcuts for power users?
   - **Aesthetic and minimalist design** — is irrelevant information absent?
   - **Error recovery** — are error messages helpful and actionable?
   - **Help and documentation** — is context-sensitive help available when needed?
3. Rate each heuristic: pass / minor issue / major issue / critical
4. For each issue, note: which heuristic is violated, severity, affected screens, recommended fix
5. Produce a heuristic evaluation report: per-heuristic scores, issue list sorted by severity

## Accessibility Audit

1. Run `tools/a11y-audit.ts` against the relevant pages to report WCAG violations
2. Categorize findings by WCAG level:
   - **Level A** — fundamental accessibility; must fix
   - **Level AA** — standard compliance target for most products; should fix
   - **Level AAA** — enhanced; good-to-have
3. For each violation, record:
   - WCAG criterion violated (e.g., 1.4.3 Contrast Minimum)
   - Affected component or page
   - How to reproduce
   - Recommended fix
4. Check beyond automated tools — these miss ~50% of accessibility issues:
   - Keyboard navigation: can all interactive elements be reached and activated with keyboard only?
   - Focus management: does focus move logically after modals open/close?
   - Screen reader: are form fields labeled, images alt-texted, and dynamic regions announced?
5. Prioritize: critical blockers (Level A) → standard compliance (Level AA) → enhancements
6. Produce an accessibility audit report: violation list with severity, WCAG reference, and fix guidance

## Journey Friction Analysis

1. Define the journey to analyze (e.g., signup to first value, checkout, invite a teammate)
2. Map each step in the journey — include all decisions, forms, confirmations, and error states
3. For each step, assess friction:
   - **Cognitive load** — how much does the user need to understand or remember?
   - **Input burden** — how many fields or clicks are required?
   - **Trust signals** — does the UI provide enough confidence to proceed?
   - **Error recovery** — if the user makes a mistake, how easy is it to fix?
4. Identify the highest-friction steps — these are the drop-off risk points
5. For onboarding specifically:
   - Is there a clear first action?
   - Does the user reach a meaningful "aha moment" quickly?
   - Are progressive disclosure and empty states well-designed?
6. Produce a journey map with friction scores per step and prioritized improvement recommendations

## Information Architecture Review

1. Catalog all navigation structures: top nav, sidebar, bottom tab bar, contextual menus, breadcrumbs
2. List all distinct sections/pages and their depth from the root (how many clicks to reach?)
3. Evaluate IA quality:
   - **Findability** — can users predict where to find things before clicking?
   - **Grouping** — are related items grouped together logically?
   - **Labeling** — are navigation labels clear, specific, and jargon-free?
   - **Depth vs. breadth** — is the hierarchy too deep (too many clicks) or too wide (too many choices at once)?
4. Check for common IA problems:
   - Items that could reasonably belong to multiple categories
   - Important features buried deep in the hierarchy
   - Settings mixed with content navigation
5. Produce an IA review: structure diagram, issues found, recommended reorganization

## Key references

| File | What it covers |
|---|---|
| `tools/flow-mapper.ts` | Parse route definitions and generate Mermaid user flow diagram |
| `tools/a11y-audit.ts` | Run accessibility checks and report WCAG violations |
| `tools/heuristic-checklist.ts` | Generate Nielsen heuristic evaluation checklist from page structure |
