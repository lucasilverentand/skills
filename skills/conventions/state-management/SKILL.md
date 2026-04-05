---
name: state-management
description: State management patterns across web, React Native, and Swift — choosing the right tool per platform, structuring stores, and managing server state with TanStack Query. Use when choosing a state management approach, adding client or server state to a feature, designing store architecture, or porting state patterns between web and mobile.
---

# State Management

## Decision Tree

- What platform?
  - **Web (React / Astro)** → what kind of state?
    - **Client state** (UI toggles, form state, shared app state) → see "Web: Nanostores" below
    - **Server state** (data from APIs, cached responses) → see "Server State: TanStack Query" below
    - **Both** → use Nanostores for client, TanStack Query for server — they compose naturally
  - **React Native (Expo)** → what kind of state?
    - **Client state** → see "React Native: Zustand" below
    - **Server state** → see "Server State: TanStack Query" below (same patterns as web)
    - **Persisted local state** → see "React Native: Zustand" below (persist middleware)
  - **Swift / iOS** → see `development/swift/state` — covers `@Observable`, `@State`, `@Environment`, `@AppStorage`
  - **Not sure which approach** → see "Choosing" below

## Choosing

| Question | Answer |
|---|---|
| Does this data come from an API? | **Server state** → TanStack Query on all platforms |
| Is this purely UI state (open/closed, selected tab)? | **Client state** → Nanostores (web) or Zustand (RN) |
| Does it need to survive app restart? | **Persisted state** → `@AppStorage` (Swift), Zustand persist middleware (RN), `localStorage` (web) |
| Is it shared across many components? | **Global store** → Nanostores atom (web) or Zustand store (RN) |
| Is it owned by one component? | **Local state** → `useState` (React), `@State` (Swift) |

**Key principle:** Never cache server data in client state. If it comes from an API, it belongs in TanStack Query. Client stores hold UI state only.

## Web: Nanostores

Use **Nanostores** with signals for web client state — not Redux, Zustand, Jotai, or Recoil.

### Why Nanostores

- Tiny (< 1KB), framework-agnostic (works in React, Astro, Svelte, vanilla)
- Atomic by design — no single global store, each atom is independent
- Signals integration for fine-grained reactivity

### Patterns

See `references/nanostores.md` for:
- Atom and computed store patterns
- Using `@nanostores/react` hooks in React components
- Derived stores and store composition
- Lifecycle management (lazy initialization, cleanup)
- Integration with Astro islands

## React Native: Zustand

Use **Zustand** for React Native client state — not Nanostores (RN has different lifecycle needs), not Redux, not MobX.

### Why Zustand

- Simple API, minimal boilerplate
- Built-in persist middleware for AsyncStorage
- Selector-based subscriptions prevent unnecessary re-renders
- Works well with React Native's bridge and New Architecture

### Patterns

See `references/zustand.md` for:
- Store creation and typing
- Selectors for performance
- Persist middleware with AsyncStorage
- Splitting stores by domain
- Hydration on app startup

## Server State: TanStack Query

Use **TanStack Query** (`@tanstack/react-query`) for all server state on both web and React Native.

### Why TanStack Query

- Automatic caching, background refetching, and stale-while-revalidate
- Deduplicates identical requests
- Built-in loading/error states
- Optimistic updates for responsive UIs
- Same API on web and React Native

### Patterns

See `references/tanstack-query.md` for:
- Query key conventions (hierarchical, stable)
- Query function patterns with Hono RPC or fetch
- Mutation patterns with optimistic updates
- Cache invalidation strategies
- Prefetching for navigation
- Infinite queries for pagination
- Integration with Hono's typed client

## Cross-Platform Principles

1. **Separate concerns** — client state and server state use different tools. Don't put API data in Zustand/Nanostores.
2. **Colocate state** — put state as close to where it's used as possible. Lift only when multiple components need it.
3. **Derive, don't duplicate** — compute values from existing state rather than storing derived data separately.
4. **Single source of truth** — every piece of state should have exactly one owner. Other consumers read from it, not from their own copy.

## Key References

| File | What it covers |
|---|---|
| `references/nanostores.md` | Atom patterns, computed stores, React integration, Astro islands |
| `references/tanstack-query.md` | Query keys, mutations, cache invalidation, optimistic updates, Hono integration |
| `references/zustand.md` | Store patterns, selectors, persist middleware, domain splitting |
| `development/swift/state` | Swift state management (@Observable, @State, @Environment) |
