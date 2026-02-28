---
name: ui
description: Creates and maintains a shared UI component library package in a bun workspace monorepo — design system components, design tokens, Tailwind CSS configuration, accessibility, and component scaffolding. Use when building a shared component library, enforcing design tokens, auditing for hardcoded styles, or generating new component stubs with props and tests.
allowed-tools: Read Write Edit Glob Grep Bash
---

# UI

## Decision Tree

- What are you working on?
  - **New UI package** → follow "Bootstrap" workflow
  - **Adding a component** → follow "Add component" workflow
  - **Setting up design tokens** → see "Design tokens" section
  - **Fixing accessibility issues** → see "Accessibility" section
  - **Auditing hardcoded styles** → run `tools/token-audit.ts`

## Bootstrap

1. Create `packages/ui/`
2. `package.json`:
   ```json
   {
     "name": "@<project>/ui",
     "type": "module",
     "exports": { ".": "./src/index.ts" },
     "peerDependencies": {
       "react": ">=19",
       "tailwindcss": ">=4"
     }
   }
   ```
3. Create `src/index.ts` — barrel re-exporting all components
4. Set up shared Tailwind config in `tailwind.config.ts` — apps extend it
5. Define design tokens in CSS variables (Tailwind v4 uses `@theme`)

## Directory structure

```
packages/ui/
  src/
    components/       # one file per component
    hooks/            # shared React hooks
    tokens/           # design token definitions
    index.ts          # public exports
  tailwind.config.ts
  package.json
```

## Add component

1. Run `tools/component-scaffold.ts <ComponentName>` or create manually
2. File: `src/components/<ComponentName>.tsx`

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

- Export named, not default: `export function Button`
- Props interface above the component, not inline
- Use `cn()` (clsx + tailwind-merge) for conditional classes
- No inline styles — use Tailwind classes and design token CSS variables

## Design tokens

- Define tokens as CSS custom properties in a `tokens/` file, consumed by Tailwind
- Token categories: `color`, `spacing`, `radius`, `shadow`, `font-size`, `font-family`
- Reference tokens via CSS variables in component classes: `text-[--color-primary]`
- Run `tools/token-audit.ts` to detect hardcoded hex colors or pixel values

Example (Tailwind v4 `@theme`):
```css
@theme {
  --color-primary: oklch(60% 0.2 250);
  --color-surface: oklch(98% 0.005 250);
  --radius-md: 0.5rem;
}
```

## Accessibility

- All interactive elements need `aria-label` or visible text
- Use semantic HTML — `<button>` not `<div onClick>`
- Keyboard navigation: all interactive elements reachable by Tab, activated by Enter/Space
- Color contrast: 4.5:1 minimum for normal text, 3:1 for large text
- Test with a screen reader for any complex widget (modal, combobox, tooltip)

## Component library choice

If using a headless component library:
- **Radix UI** — unstyled, accessible primitives (Dialog, Select, Popover, etc.)
- **shadcn/ui** — copies Radix + Tailwind into your codebase, fully owned
- Build on primitives, don't fight them — if you need customization beyond the API, use a headless approach

## Key references

| File | What it covers |
|---|---|
| `tools/component-list.ts` | List all exported components with prop types and file paths |
| `tools/token-audit.ts` | Check for hardcoded style values that should use design tokens |
| `tools/component-scaffold.ts` | Generate component file with props interface, styles, and test stub |
