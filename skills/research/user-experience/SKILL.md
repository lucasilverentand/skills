---
name: user-experience
description: Researches UI and UX quality — audits design tokens, component structure, responsive layout, accessibility, user flows, and usability heuristics. Use when the user needs a design system audit, component inventory, responsive breakpoint analysis, accessibility audit, heuristic evaluation, user flow mapping, or journey friction analysis.
allowed-tools: Read Glob Grep Bash WebFetch
context: fork
agent: Explore
---

# User Experience

## Decision Tree

- What is the research goal?
  - **Visual design and component structure**
    - **Audit design token and Tailwind class usage for consistency** → follow "Token Audit" below
    - **Inventory and categorize existing components** → follow "Component Inventory" below
    - **Evaluate visual design consistency across the product** → follow "Visual Consistency Review" below
    - **Analyze responsive layout and breakpoint coverage** → follow "Responsive Audit" below
    - **Research design system patterns for a new UI** → follow "Design System Research" below
  - **Usability and interaction quality**
    - **Map the flows and navigation structure of an app** → follow "Flow Mapping" below
    - **Evaluate usability against established heuristics** → follow "Heuristic Evaluation" below
    - **Audit accessibility compliance** → follow "Accessibility Audit" below
    - **Identify friction in onboarding or a specific user journey** → follow "Journey Friction Analysis" below
    - **Audit information architecture** → follow "Information Architecture Review" below

---

## Token Audit

1. Run `tools/token-audit.ts` to scan stylesheets and Tailwind classes for design token usage and deviations
2. Identify:
   - **Raw values where tokens should be used** — hardcoded hex colors, px sizes, font families
   - **Inconsistent token usage** — same semantic concept expressed with different tokens in different places
   - **Undefined tokens** — class names or CSS variables that reference non-existent tokens
   - **Unused tokens** — defined tokens that are never referenced
3. For Tailwind-based projects:
   - Check for arbitrary values (`text-[#3B82F6]`) that should be design tokens
   - Check for one-off spacing values that break the scale
   - Verify dark mode usage is consistent (`.dark:` prefix vs. CSS variables)
4. Categorize deviations by type: color, spacing, typography, border-radius, shadow
5. Produce a token audit report: deviation list grouped by type, severity, and a remediation plan

## Component Inventory

1. Run `tools/component-inventory.ts` to crawl the component directory and generate a categorized catalog
2. Supplement the automated inventory by reading the component directory structure:
   - How are components organized? (by type, by feature, by domain)
   - Is there a shared UI package or are components co-located with features?
3. For each component, note:
   - Purpose and usage context
   - Props interface (does it accept design tokens, or hardcoded values?)
   - Whether it's generic (reusable) or specific (single-use)
   - Whether it has tests and documentation (Storybook, JSDoc, etc.)
4. Identify gaps:
   - Common UI patterns that are reimplemented multiple times instead of shared
   - Components that are similar but slightly different — consolidation candidates
   - Missing primitive components (button, input, modal) that force one-off implementations
5. Produce a component catalog: categorized list, duplication analysis, and gap report

## Visual Consistency Review

1. Review the color system:
   - Is there a defined primary/secondary/neutral palette?
   - Are semantic color roles defined (success, warning, error, info)?
   - Is dark mode coverage complete and systematic?
2. Review typography:
   - Are font sizes, weights, and line heights defined as a type scale?
   - Is heading hierarchy (h1-h6) used consistently?
   - Are there rogue font sizes outside the scale?
3. Review spacing:
   - Is there a spacing scale? (4px, 8px, 16px, 24px, 32px, 48px, 64px)
   - Are margins and padding values consistent across similar components?
4. Review interaction patterns:
   - Are hover, focus, active, and disabled states defined for interactive elements?
   - Is focus ring styling consistent and accessible?
   - Are loading and empty states handled consistently?
5. Produce a visual consistency review: system quality assessment per category, issues, recommendations

## Responsive Audit

1. Run `tools/breakpoint-report.ts` to analyze responsive breakpoint usage across layout files
2. Identify the breakpoints in use:
   - Are they from a defined system (Tailwind defaults: sm/md/lg/xl/2xl)?
   - Are custom breakpoints used? If so, are they justified?
3. For each major layout/page type, assess coverage:
   - **Mobile (< 640px)** — is the default (no prefix) layout mobile-first?
   - **Tablet (640px-1024px)** — are `sm:` and `md:` classes used to adapt the layout?
   - **Desktop (> 1024px)** — do `lg:` and `xl:` classes add desktop-specific optimizations?
4. Check for common responsive issues:
   - Fixed widths that overflow on small screens
   - Touch targets below 44px on mobile
   - Horizontal scroll on any breakpoint
   - Navigation patterns that don't adapt (desktop nav shown on mobile)
5. Produce a responsive audit report: breakpoint coverage matrix, issues by screen size, fix recommendations

## Design System Research

1. Clarify what design system is in use or being considered:
   - **Custom system** — assess current token and component coverage
   - **Third-party** (shadcn/ui, Radix, MUI, etc.) — evaluate fit against project requirements
2. For third-party systems, evaluate:
   - Compatibility with the project's styling approach (Tailwind vs. CSS-in-JS vs. CSS modules)
   - Accessibility quality out of the box (ARIA, keyboard navigation)
   - Customization flexibility (can tokens and styles be overridden?)
   - Bundle size impact
   - TypeScript quality
3. Compare against a custom component approach:
   - **Use a design system** when: you need speed, consistent accessibility baseline, and a large component surface
   - **Build custom** when: you need deep visual differentiation or the system doesn't fit the tech stack
4. Produce a design system recommendation: evaluation of options, recommendation with rationale

---

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

---

## Key references

| File | What it covers |
|---|---|
| `tools/token-audit.ts` | Scan stylesheets and Tailwind classes for design token usage and deviations |
| `tools/component-inventory.ts` | Crawl the component directory and generate a categorized component catalog |
| `tools/breakpoint-report.ts` | Analyze responsive breakpoint usage across layout files and flag gaps |
| `tools/flow-mapper.ts` | Parse route definitions and generate Mermaid user flow diagram |
| `tools/a11y-audit.ts` | Run accessibility checks and report WCAG violations |
| `tools/heuristic-checklist.ts` | Generate Nielsen heuristic evaluation checklist from page structure |
