# UI

Shared UI component library: design system and primitives.

## Responsibilities

- Maintain shared design system components
- Provide UI primitives for applications
- Define and enforce design tokens for colors, spacing, and typography
- Ensure components are accessible and follow ARIA guidelines
- Document component props and usage variants

## Tools

- `tools/component-list.ts` — list all exported components with their prop types and file paths
- `tools/token-audit.ts` — check for hardcoded style values that should use design tokens
- `tools/component-scaffold.ts` — generate a new component file with props interface, default styles, and test stub
