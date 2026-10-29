---
name: offline-first-adaptive-app
description: Design, review, scaffold, or refactor Expo and React Native apps that need offline-first behavior, local-first data, adaptive iOS/Android/web layouts, reusable component boundaries, or sync architecture. Use when the user asks for an Expo app blueprint, offline data model, sync/outbox design, cross-platform adaptive UI, feature folder structure, reusable component system, or an architecture review for an existing Expo app.
---

# Offline-First Adaptive App

## Overview
Use this skill to shape serious Expo apps around a local source of truth, thin Expo Router routes, feature modules, durable offline writes, explicit sync behavior, and adaptive layouts that work across phones, tablets, desktop-sized web, iOS, and Android.

The goal is not to produce a pile of screens. The goal is to produce an app architecture where routing, UI, domain logic, persistence, and sync each have a clear job.

## Core Rule
Treat the local database as the app's primary source of truth.

Screens should render from local state. User writes should commit locally first. Network sync should reconcile local state with the remote backend afterward. Do not make ordinary product use depend on a successful API request.

```txt
UI
 -> feature hooks
 -> repositories
 -> local database
 -> sync engine
 -> remote API or sync backend
```

## Start Here
Infer the minimum missing constraints before prescribing details:

1. Target platforms: native only, or native plus web?
2. Data model: personal single-user, multi-device personal, shared team data, or collaborative data?
3. Backend: custom REST or GraphQL, Supabase/Postgres, Firebase, an existing API, or not chosen yet?
4. Sync complexity: last-write-wins, server-version checks, field merges, user-visible conflicts, or CRDT/sync-product territory?
5. Offline scope: read-only offline, create/edit/delete offline, attachments offline, or full background sync?

Do not block on a long questionnaire. If the repo or request gives enough context, state assumptions and continue.

## SDK compatibility
Verify APIs and platform support against the project’s installed Expo SDK before implementation. SQLite web support and background execution have platform-specific limits. Treat background synchronization as opportunistic and also reconcile on foreground and connectivity changes.

Sources: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) and [Expo BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task/).

## Default Stack
Recommend this baseline unless the user's repo or constraints point elsewhere:

```txt
Expo + TypeScript
Expo Router
Expo SQLite + Drizzle ORM
Zod for validation and boundary parsing
NetInfo for connectivity state
expo-background-task for opportunistic background sync
Zustand or React Context for UI-only state
TanStack Query only for non-critical server state
StyleSheet, Unistyles, or Tamagui depending on UI-system needs
```

If web is equally important, avoid coupling feature code directly to `expo-sqlite`. Use repository/storage interfaces so web can use a different adapter.

## Task Routing
Load the smallest reference that matches the user's request:

|User intent|Read|
|---|---|
|New app architecture or scaffold|`references/new-app-blueprint.md`|
|Offline data, local writes, sync, outbox, conflicts|`references/offline-first-sync.md`|
|Responsive mobile/tablet/web layouts|`references/adaptive-ui.md`|
|Shared UI, layout primitives, feature components|`references/component-system.md`|
|Existing app architecture review|`references/architecture-review.md`|
|Concrete default folder tree|`references/folder-structure.md`|
|Concrete offline mutation flow|`references/offline-write-flow.md`|

## Architecture Defaults
Apply these defaults unless the existing codebase has a stronger convention:

- Keep Expo Router files thin. Route files should wire navigation to screens, not contain fetch calls, database calls, sync logic, or large UI trees.
- Group product code by feature. Feature modules own their screens, hooks, data adapters, and sync handlers.
- Keep shared UI generic. Shared primitives must not import feature modules, navigation decisions, API clients, or persistence.
- Separate durable data from UI state. Use the local database for core records and Zustand/Context for ephemeral UI state.
- Put repositories or feature data hooks between screens and persistence. Screens should not issue raw SQLite queries.
- Validate at boundaries with Zod or an equivalent parser: remote responses, sync payloads, form submissions, and migration-sensitive imports.
- Use client-generated IDs, tombstones for deletes, idempotency keys, sync cursors, and server versions where records sync with a backend.

## Sync Judgment
Do not overbuild a custom sync engine when the product needs strict consistency, realtime collaboration, shared permissions, or complex conflict semantics. Recommend a sync layer such as PowerSync, ElectricSQL, LiveStore, Jazz, TinyBase, Legend-State, RxDB, or another local-first framework when collaboration or multi-device consistency is core to the app.

A custom outbox sync is still reasonable for product apps with clear entities, simple conflicts, and a backend the team controls.

## Implementation Order
When building or refactoring, prefer one offline-capable vertical slice before expanding:

1. Define the route shell and feature module.
2. Add design tokens and shared layout primitives.
3. Add database schema, migrations, and repository boundaries.
4. Implement one feature locally end to end.
5. Add durable outbox writes for that feature.
6. Add sync for one entity type with conflict outcomes.
7. Add foreground, network-regained, manual, and opportunistic background sync triggers.
8. Add adaptive layouts once the data path is correct.
9. Expand the pattern to more features.

## Related Skills
- Use `expo:native-data-fetching` when the task is primarily about fetch, React Query, SWR, caching, or API request behavior.
- Use `expo:building-native-ui` when the task is primarily general Expo Router UI composition without offline-first architecture.
- Use `design:app-ux` or `design:dashboard-design` when the main problem is product UX architecture or dashboard design rather than Expo implementation.
