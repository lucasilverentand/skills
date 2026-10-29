# Folder Structure
Use this as the default scaffold for an offline-first adaptive Expo app.

```txt
src/
  app/
    _layout.tsx
    +not-found.tsx
    (public)/
      _layout.tsx
      sign-in.tsx
      onboarding.tsx
    (app)/
      _layout.tsx
      index.tsx
      settings.tsx
      tasks/
        index.tsx
        [taskId].tsx
    modals/
      task-create.tsx

  features/
    tasks/
      screens/
        TaskListScreen.tsx
        TaskDetailScreen.tsx
      components/
        TaskCard.tsx
        TaskForm.tsx
        TaskStatusBadge.tsx
      hooks/
        useTasks.ts
        useTask.ts
        useCreateTask.ts
      data/
        task.repo.ts
        task.schema.ts
        task.mapper.ts
        task.types.ts
      sync/
        task.sync.ts

  shared/
    ui/
      Button/
      Text/
      Card/
      Input/
      Dialog/
      EmptyState/
      Spinner/
    layout/
      Screen.tsx
      Stack.tsx
      Grid.tsx
      AdaptivePane.tsx
      ListDetailLayout.tsx
    forms/
    hooks/
    utils/

  data/
    db/
      client.ts
      schema.ts
      migrations/
      migrate.ts
    sync/
      outbox.schema.ts
      outbox.repo.ts
      sync-engine.ts
      conflict-resolution.ts
      sync-state.repo.ts
    network/
      connectivity.ts

  design/
    tokens.ts
    breakpoints.ts
    typography.ts
    spacing.ts
    radius.ts

  providers/
    AppProviders.tsx
    DatabaseProvider.tsx
    ThemeProvider.tsx
    SyncProvider.tsx

  config/
    env.ts
```

## Root Provider Pattern
Initialize app-level providers in the root layout.

```tsx
// src/app/_layout.tsx
import { Slot } from 'expo-router';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
```

```tsx
// src/providers/AppProviders.tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DatabaseProvider>
          <SyncProvider>{children}</SyncProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```
