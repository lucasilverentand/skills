---
name: expo-app
description: Sets up and maintains the Expo React Native app workspace package. Handles expo-router navigation, NativeWind styling, native module configuration, deep linking, and app.config.ts. Use when creating an Expo app package, adding screens, configuring navigation, or setting up native modules.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Expo App

The `expo-app` part is the React Native application built with Expo and expo-router. It targets iOS, Android, and web from a single codebase. All navigation is file-based via expo-router.

## Decision Tree

- What are you doing?
  - **Setting up the Expo app from scratch** → see "Initial setup" below
  - **Adding a screen** → see "Adding screens" below
  - **Adding or changing navigation structure** → see "Navigation" below
  - **Adding native modules or Expo plugins** → see "Native modules" below
  - **Setting up styling** → see "NativeWind" below
  - **Listing all routes** → run `tools/route-map.ts`
  - **Checking native compatibility** → run `tools/native-check.ts`
  - **Scaffolding a new screen** → run `tools/screen-scaffold.ts <route>`

## Initial setup

1. Scaffold: `bun create expo packages/app -- --template blank-typescript`
2. Add expo-router:
   ```
   bun add expo-router expo-linking expo-constants expo-status-bar
   ```
3. Enable New Architecture in `app.config.ts`:
   ```ts
   export default {
     newArchEnabled: true,
     experiments: { reactCompiler: true },
   };
   ```
4. Install NativeWind: `bun add nativewind && bun add -d tailwindcss`
5. Configure Tailwind: `tailwind.config.js` with `content: ["./app/**/*.tsx", "./components/**/*.tsx"]`
6. Wrap `_layout.tsx` root with NativeWind provider
7. Enable typed routes in `app.config.ts`: `{ router: { typedRoutes: true } }`

## Navigation

expo-router uses the file system as the router — files in `app/` become routes:

```
app/
  _layout.tsx          # Root layout (providers, fonts, global nav)
  (tabs)/
    _layout.tsx        # Tab bar layout
    index.tsx          # /
    explore.tsx        # /explore
  (auth)/
    login.tsx          # /login
    signup.tsx         # /signup
  [id].tsx             # /:id
```

- Group directories `(name)` for layout grouping — they don't appear in the URL
- Use `<Stack>`, `<Tabs>`, `<Drawer>` from expo-router for navigation chrome
- Use `useRouter()` and `<Link>` for programmatic and declarative navigation
- Always use typed routes: `router.push("/explore")` — not string literals without types

## Adding screens

Run `tools/screen-scaffold.ts <route>` to generate a new screen with boilerplate, or create manually:

```tsx
// app/(tabs)/settings.tsx
import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">Settings</Text>
    </View>
  );
}
```

- Use NativeWind `className` for all styling — no StyleSheet.create
- Data fetching: TanStack Query (`@tanstack/react-query`)
- Local state: Zustand, persisted to AsyncStorage when needed
- Server state goes in hooks in `src/hooks/` — not inline in screen files

## NativeWind

- Use `className` on all RN primitives — NativeWind patches them
- Define theme tokens in `tailwind.config.js` under `theme.extend`
- For custom components: wrap in `styled()` if className isn't picked up natively

## Native modules

- Configure in `app.config.ts` under `plugins` — all native module setup goes here
- Never modify `android/` or `ios/` directly if using Expo managed workflow
- Run `tools/native-check.ts` after adding native modules to verify compatibility

## Deep linking

```ts
// app.config.ts
scheme: "myapp",
// enables: myapp://path/to/screen
```

- Typed routes handle deep link mapping automatically in expo-router
- Test deep links with: `npx uri-scheme open myapp://login --ios`

## Auth

Use `@better-auth/expo` for auth — it integrates with Better Auth and handles token storage:

```ts
import { createAuthClient } from "better-auth/expo";
export const authClient = createAuthClient({ baseURL: env.API_URL });
```

## Key references

| File | What it covers |
|---|---|
| `tools/route-map.ts` | All screens with path patterns and params |
| `tools/native-check.ts` | Native module compatibility and Expo config plugins |
| `tools/screen-scaffold.ts` | Generate a new screen with layout and navigation typing |
