# New App Blueprint
Use this when the user wants a starting architecture or scaffold for a new Expo app.

## Output Requirements
Provide:

1. Assumptions about platform, backend, and offline scope.
2. Recommended stack.
3. Folder structure.
4. Data model pattern.
5. Sync flow.
6. Adaptive layout approach.
7. Component reuse rules.
8. First implementation steps.

## Default Stack
```txt
Expo + TypeScript
Expo Router
Expo SQLite + Drizzle
Zod
NetInfo
expo-background-task
Zustand or Context for UI-only state
```

Use a sync product instead of custom sync when collaboration, shared data, or strict consistency are core requirements.

## Blueprint Skeleton
```txt
src/app
  routes only

src/features
  product modules

src/shared
  generic UI and utilities

src/data
  db, migrations, sync, network

src/providers
  app-level providers

src/design
  tokens, spacing, typography, breakpoints
```

Read `folder-structure.md` when the user needs a concrete tree.

## First Implementation Sequence
Recommend this order:

```txt
1. Create Expo Router app with TypeScript.
2. Add src alias and base folders.
3. Add design tokens and shared UI primitives.
4. Add database client and migrations.
5. Implement one feature end-to-end locally.
6. Add outbox writes for that feature.
7. Add sync engine with one entity type.
8. Add connectivity and foreground sync triggers.
9. Add adaptive list-detail layout.
10. Expand only after the vertical slice works offline.
```

Do not start by building every screen. Start with one offline-capable vertical slice.
