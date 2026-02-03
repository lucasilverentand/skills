---
name: tailwind-styling
description: Configures and uses Tailwind CSS effectively. Use when setting up Tailwind, creating design systems, or styling components.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Tailwind CSS

Configures and applies Tailwind CSS styling.

## Your Task

1. **Check setup**: Verify Tailwind configuration
2. **Apply styles**: Use utility classes
3. **Customize**: Extend theme if needed
4. **Organize**: Create component classes
5. **Optimize**: Ensure production build

## Quick Setup

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

## Component Patterns

```tsx
// Card component
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

// Button with variants using clsx/cn
function Button({ variant, children }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md px-4 py-2 font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        }
      )}
    >
      {children}
    </button>
  );
}
```

## Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>

<p className="text-sm md:text-base lg:text-lg">
  {/* Responsive text */}
</p>
```

## Tips

- Use `@apply` sparingly
- Prefer utility classes over custom CSS
- Use the `cn()` helper for conditional classes
- Configure theme for consistency
- Enable JIT mode (default in v3+)
