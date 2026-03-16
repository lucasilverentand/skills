# User Experience

UI and UX research — design systems, component patterns, visual consistency, responsive layout, user flows, heuristic evaluation, accessibility, and usability.

## Responsibilities

- Audit design token and Tailwind class consistency across the codebase
- Inventory and categorize existing components, detect duplicates and gaps
- Evaluate visual design consistency (color, typography, spacing, interaction states)
- Analyze responsive breakpoint coverage and layout behavior across screen sizes
- Research design system patterns and evaluate third-party options
- Map user flows and navigation structure
- Perform heuristic evaluations against Nielsen's 10 usability heuristics
- Audit accessibility compliance against WCAG guidelines
- Analyze user journeys and identify friction points
- Evaluate information architecture and navigation quality

## Tools

- `tools/token-audit.ts` — scan stylesheets and Tailwind classes for design token usage and deviations
- `tools/component-inventory.ts` — crawl the component directory and generate a categorized component catalog
- `tools/breakpoint-report.ts` — analyze responsive breakpoint usage across all layout files and flag gaps
- `tools/flow-mapper.ts` — parse route definitions and generate a visual user flow diagram in Mermaid format
- `tools/a11y-audit.ts` — run accessibility checks against rendered pages and report WCAG violations
- `tools/heuristic-checklist.ts` — generate a Nielsen heuristic evaluation checklist populated from page structure
