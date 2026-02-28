---
name: user-interface
description: Researches design systems and component patterns, audits design token usage, inventories components, evaluates visual consistency, and analyzes responsive breakpoint coverage. Use when the user needs a design system audit, wants to understand what components exist and how they're used, needs to evaluate token or Tailwind class consistency, or wants to understand responsive layout gaps.
allowed-tools: Read Glob Grep Bash
context: fork
agent: Explore
---

# User Interface

## Decision Tree

- What is the research goal?
  - **Audit design token and Tailwind class usage for consistency** → follow "Token Audit" below
  - **Inventory and categorize existing components** → follow "Component Inventory" below
  - **Evaluate visual design consistency across the product** → follow "Visual Consistency Review" below
  - **Analyze responsive layout and breakpoint coverage** → follow "Responsive Audit" below
  - **Research design system patterns for a new UI** → follow "Design System Research" below

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
   - **Tablet (640px–1024px)** — are `sm:` and `md:` classes used to adapt the layout?
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
   - **Third-party** (shadcn/ui, Radix, MUI, etc.) → evaluate fit against project requirements
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

## Key references

| File | What it covers |
|---|---|
| `tools/token-audit.ts` | Scan stylesheets and Tailwind classes for design token usage and deviations |
| `tools/component-inventory.ts` | Crawl the component directory and generate a categorized component catalog |
| `tools/breakpoint-report.ts` | Analyze responsive breakpoint usage across layout files and flag gaps |
