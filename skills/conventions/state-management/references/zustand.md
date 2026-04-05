# Zustand Patterns (React Native)

## Store Creation

```ts
import { create } from "zustand"

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}))
```

## Selectors

Always use selectors to subscribe to specific slices — prevents unnecessary re-renders:

```tsx
// Good — only re-renders when user changes
function ProfileHeader() {
  const user = useAuthStore((s) => s.user)
  return <Text>{user?.name}</Text>
}

// Bad — re-renders on ANY store change
function ProfileHeader() {
  const { user } = useAuthStore()
  // ...
}
```

For multiple values, use `useShallow` to prevent re-renders when the selected object is structurally equal:

```tsx
import { useShallow } from "zustand/react/shallow"

function Header() {
  const { user, token } = useAuthStore(
    useShallow((s) => ({ user: s.user, token: s.token })),
  )
}
```

## Persist Middleware

Persist state to AsyncStorage for offline support and app restart survival:

```ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface SettingsStore {
  theme: "light" | "dark" | "system"
  notifications: boolean
  setTheme: (theme: SettingsStore["theme"]) => void
  toggleNotifications: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "system",
      notifications: true,
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () =>
        set((state) => ({ notifications: !state.notifications })),
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
```

## Domain Splitting

Split stores by domain — one store per concern, not one mega-store:

```
stores/
  auth.ts       → useAuthStore (user, token, login/logout)
  settings.ts   → useSettingsStore (theme, notifications, language)
  onboarding.ts → useOnboardingStore (completed steps, current step)
```

Each store is independent. If one store needs data from another, read it at the call site — don't couple stores.

```tsx
// Read from two stores in a component — fine
function App() {
  const user = useAuthStore((s) => s.user)
  const theme = useSettingsStore((s) => s.theme)
  // ...
}
```

## Hydration

For persisted stores, handle the hydration delay on app startup:

```tsx
import { useEffect, useState } from "react"

function AppRoot() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Zustand persist fires onRehydrateStorage when done
    const unsubFinish = useSettingsStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    // Check if already hydrated
    if (useSettingsStore.persist.hasHydrated()) {
      setHydrated(true)
    }

    return unsubFinish
  }, [])

  if (!hydrated) return <SplashScreen />
  return <Navigation />
}
```

## Actions Outside Components

Access stores outside React components (e.g., in API interceptors, navigation guards):

```ts
// In an API client or utility
const token = useAuthStore.getState().token

// Subscribe to changes outside React
const unsubscribe = useAuthStore.subscribe(
  (state) => state.token,
  (token) => {
    if (!token) navigateToLogin()
  },
)
```

## Rules

- One store per domain — never a single global store
- Always use selectors — never destructure the whole store
- Only persist what needs to survive app restart — don't persist derived or server state
- Keep actions in the store — components call `store.action()`, not `store.setState()`
- Don't put server data in Zustand — that belongs in TanStack Query
