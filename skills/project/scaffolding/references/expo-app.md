# Expo App

React Native app built with Expo and expo-router. Targets iOS, Android, and web from a single codebase.

## Setup

1. Scaffold: `bun create expo packages/app -- --template blank-typescript`
2. Add expo-router: `bun add expo-router expo-linking expo-constants expo-status-bar`
3. Enable New Architecture and React Compiler in `app.config.ts`
4. Install NativeWind: `bun add nativewind && bun add -d tailwindcss`
5. Enable typed routes: `{ router: { typedRoutes: true } }`

## Navigation

expo-router uses the file system as the router:

```
app/
  _layout.tsx          # Root layout (providers, fonts)
  (tabs)/
    _layout.tsx        # Tab bar layout
    index.tsx          # /
    explore.tsx        # /explore
  (auth)/
    login.tsx          # /login
    signup.tsx         # /signup
  [id].tsx             # /:id
```

- Group directories `(name)` for layout grouping without URL impact
- Use `<Stack>`, `<Tabs>`, `<Drawer>` from expo-router
- Always use typed routes: `router.push("/explore")`

### Typed params for dynamic routes

```tsx
// app/items/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // use id...
}
```

### Nested Stack navigation

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#007AFF" }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ... }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ... }} />
    </Tabs>
  );
}
```

## Adding screens

```tsx
import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">Settings</Text>
    </View>
  );
}
```

- Use NativeWind `className` for all styling — no `StyleSheet.create`
- Data fetching: TanStack Query
- Local state: Zustand, persisted to AsyncStorage when needed
- Server state in hooks in `src/hooks/`, not inline in screens

## NativeWind

- Use `className` on all RN primitives
- Define theme tokens in `tailwind.config.js` under `theme.extend`

## State management

### Zustand store with AsyncStorage persistence

Install: `bun add zustand @react-native-async-storage/async-storage`

```ts
// src/stores/useUserStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserStore {
  userId: string | null;
  displayName: string | null;
  setUser: (userId: string, displayName: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: null,
      displayName: null,
      setUser: (userId, displayName) => set({ userId, displayName }),
      clearUser: () => set({ userId: null, displayName: null }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

Rules:
- Only persist what needs to survive app restarts — session tokens, preferences, cached IDs
- Keep store shape flat; avoid nesting objects more than one level deep
- Don't persist sensitive values like API keys or full user profiles

## Data fetching

### TanStack Query setup

Install: `bun add @tanstack/react-query`

Wire up in the root layout:

```tsx
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,   // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

### API client with Hono client

Use `hono/client` for type-safe calls to a Hono API:

```ts
// src/lib/api.ts
import { hc } from "hono/client";
import type { AppType } from "@<project>/api";

export const api = hc<AppType>(process.env.EXPO_PUBLIC_API_URL!);
```

Wrap in a TanStack Query hook:

```ts
// src/hooks/useItems.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await api.v1.items.$get();
      const body = await res.json();
      if (!body.ok) throw new Error(body.error.message);
      return body.data;
    },
  });
}
```

Rules:
- Colocate query hooks with their feature, not in a single global `hooks/` folder
- Query keys must be serializable and specific enough to avoid cache collisions
- Always check `body.ok` before using data — never assume success

## Auth

### Client setup with Better Auth

Install: `bun add @better-auth/expo`

```ts
// src/lib/auth.ts
import { createAuthClient } from "better-auth/expo";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL!,
});
```

### Protected routes

Use expo-router's `<Redirect>` to guard screens that require authentication:

```tsx
// app/(tabs)/_layout.tsx
import { Redirect } from "expo-router";
import { useUserStore } from "../../src/stores/useUserStore";

export default function TabsLayout() {
  const userId = useUserStore((s) => s.userId);

  if (!userId) {
    return <Redirect href="/login" />;
  }

  return <Tabs />;
}
```

### Session check on startup

Check for an existing session in the root layout before rendering anything:

```tsx
// app/_layout.tsx
import { useEffect, useState } from "react";
import { SplashScreen } from "expo-router";
import { authClient } from "../src/lib/auth";
import { useUserStore } from "../src/stores/useUserStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    authClient.getSession()
      .then((session) => {
        if (session?.user) {
          setUser(session.user.id, session.user.name);
        } else {
          clearUser();
        }
      })
      .finally(() => {
        setReady(true);
        SplashScreen.hideAsync();
      });
  }, []);

  if (!ready) return null;

  return <Stack />;
}
```

### Sign in / sign out

```tsx
// Sign in
const { error } = await authClient.signIn.email({
  email,
  password,
});
if (!error) router.replace("/(tabs)");

// Sign out
await authClient.signOut();
clearUser();
router.replace("/login");
```

## Native modules

- Configure in `app.config.ts` under `plugins`
- Never modify `android/`/`ios/` directly in managed workflow
- Run `tools/native-check.ts` after adding native modules

## Deep linking

```ts
// app.config.ts
scheme: "myapp",
// enables: myapp://path/to/screen
```

## Tools

| Tool | Purpose |
|---|---|
| `tools/route-map.ts` | All screens with path patterns and params |
| `tools/native-check.ts` | Native module compatibility and Expo config plugins |
| `tools/screen-scaffold.ts` | Generate a new screen with layout and navigation typing |
