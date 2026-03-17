# UI

Shared component library package using React, Tailwind CSS, and design tokens.

## Setup

1. Create `packages/ui/`
2. Peer deps: `react >= 19`, `tailwindcss >= 4`
3. Structure: `src/components/`, `src/hooks/`, `src/tokens/`, `src/index.ts`
4. Define design tokens in CSS variables (Tailwind v4 `@theme`)

## Adding a component

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = "primary", size = "md", disabled, children, onClick }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }))} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
```

- Named exports only (no default exports)
- Props interface above the component
- Use `cn()` (clsx + tailwind-merge) for conditional classes
- No inline styles — Tailwind classes and CSS variables only

## Design tokens

```css
@theme {
  --color-primary: oklch(60% 0.2 250);
  --color-surface: oklch(98% 0.005 250);
  --radius-md: 0.5rem;
}
```

- Token categories: color, spacing, radius, shadow, font-size, font-family
- Run `tools/token-audit.ts` to detect hardcoded hex colors or pixel values

## Accessibility

- All interactive elements need `aria-label` or visible text
- Use semantic HTML (`<button>` not `<div onClick>`)
- Keyboard navigation: Tab, Enter/Space
- Color contrast: 4.5:1 minimum for normal text

## Headless components

- **Radix UI** — unstyled, accessible primitives
- **shadcn/ui** — Radix + Tailwind, fully owned in codebase

## Tools

| Tool | Purpose |
|---|---|
| `tools/component-scaffold.ts` | Generate component with props, styles, test stub |
| `tools/token-audit.ts` | Check for hardcoded values that should use tokens |
| `tools/component-list.ts` | All exported components with prop types |
