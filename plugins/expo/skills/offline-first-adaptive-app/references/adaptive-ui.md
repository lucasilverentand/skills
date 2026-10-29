# Adaptive UI
Use this when the user asks for cross-platform layout, tablet or desktop support, or reusable adaptive components.

## Primary Rule
Prefer responsive layout based on available width over device-name assumptions.

```tsx
const { width } = useWindowDimensions();

const isCompact = width < 600;
const isMedium = width >= 600 && width < 1024;
const isWide = width >= 1024;
```

## Layout Patterns
```txt
compact:
  single column
  bottom tabs
  push detail screens
  full-screen forms

medium:
  larger spacing
  optional split panes
  content max widths

wide:
  sidebar nav
  list-detail views
  dialogs or side panels
  keyboard-friendly flows
```

## Layout Primitives
Create reusable primitives such as:

```txt
Screen
Stack
Inline
Grid
AdaptivePane
ListDetailLayout
PageHeader
ResponsiveTabs
```

Screens should compose these primitives rather than implement custom width logic everywhere.

## Platform Differences
Use small `Platform` checks for tiny behavior differences. Use `.native.tsx`, `.web.tsx`, `.ios.tsx`, or `.android.tsx` files for larger differences.

Do not spread large platform-specific branches across feature screens. Inside Expo Router route directories, keep universal route files where possible and delegate platform-specific implementation outside the route tree.
