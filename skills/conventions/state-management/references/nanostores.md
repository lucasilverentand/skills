# Nanostores Patterns

## Atoms

Atoms hold a single value. They're the building blocks of all state.

```ts
import { atom } from "nanostores"

// Simple atom
export const $currentTheme = atom<"light" | "dark">("light")

// Update
$currentTheme.set("dark")

// Read
const theme = $currentTheme.get()
```

Name convention: prefix store variables with `$` to distinguish them from regular variables.

## Computed Stores

Derive state from one or more atoms:

```ts
import { computed } from "nanostores"

export const $user = atom<User | null>(null)
export const $isLoggedIn = computed($user, (user) => user !== null)
export const $displayName = computed($user, (user) => user?.name ?? "Guest")
```

Computed stores recalculate only when their dependencies change.

## Maps

For object state with multiple keys:

```ts
import { map } from "nanostores"

export const $filters = map<{
  search: string
  category: string
  sortBy: "date" | "name"
}>({
  search: "",
  category: "all",
  sortBy: "date",
})

// Update one key
$filters.setKey("search", "query")
```

## React Integration

Use `@nanostores/react` for React components:

```tsx
import { useStore } from "@nanostores/react"
import { $currentTheme, $isLoggedIn } from "../stores/auth"

export function Header() {
  const theme = useStore($currentTheme)
  const isLoggedIn = useStore($isLoggedIn)

  return (
    <header className={theme === "dark" ? "bg-gray-900" : "bg-white"}>
      {isLoggedIn ? <UserMenu /> : <LoginButton />}
    </header>
  )
}
```

## Astro Islands

Nanostores work across Astro islands — multiple React/Svelte/Vue islands can share the same store:

```astro
---
// page.astro
import Header from "../components/Header" // React island
import Sidebar from "../components/Sidebar" // React island
---

<!-- Both islands share $currentTheme -->
<Header client:load />
<Sidebar client:visible />
```

Both components import from the same store module and stay in sync automatically.

## Store Composition

Build complex state from simple atoms:

```ts
export const $cart = map<Record<string, CartItem>>({})
export const $cartCount = computed($cart, (cart) => Object.keys(cart).length)
export const $cartTotal = computed($cart, (cart) =>
  Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0),
)

export function addToCart(item: CartItem) {
  $cart.setKey(item.id, {
    ...$cart.get()[item.id],
    ...item,
    quantity: ($cart.get()[item.id]?.quantity ?? 0) + 1,
  })
}
```

## Lifecycle

Stores are created eagerly on import. For expensive initialization, use `onMount`:

```ts
import { atom, onMount } from "nanostores"

export const $settings = atom<Settings>(defaultSettings)

onMount($settings, () => {
  // Runs when first subscriber attaches
  const stored = localStorage.getItem("settings")
  if (stored) $settings.set(JSON.parse(stored))

  // Return cleanup function
  return () => {}
})
```

## Rules

- One atom per concern — don't put unrelated state in the same store
- Prefix store names with `$`
- Export action functions alongside stores (e.g., `addToCart`) rather than letting components call `.set()` directly for complex mutations
- Never store server data in atoms — that belongs in TanStack Query
