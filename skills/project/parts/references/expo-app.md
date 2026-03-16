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

## Auth

Use `@better-auth/expo`:

```ts
import { createAuthClient } from "better-auth/expo";
export const authClient = createAuthClient({ baseURL: env.API_URL });
```

## Tools

| Tool | Purpose |
|---|---|
| `tools/route-map.ts` | All screens with path patterns and params |
| `tools/native-check.ts` | Native module compatibility and Expo config plugins |
| `tools/screen-scaffold.ts` | Generate a new screen with layout and navigation typing |
