# React Dashboard

Admin dashboards and internal tools built with React Router v7, React 19, TanStack Query, and Tailwind CSS.

## Setup

1. Scaffold: `bun create react-router@latest apps/dashboard -- --template remix`
2. Set `"name": "@scope/dashboard"` in package.json
3. Install: `bun add @tanstack/react-query @tanstack/react-query-devtools nanostores @nanostores/react`
4. Dev dependencies: `bun add -d @tailwindcss/vite tailwindcss`
5. Set up Biome: `bunx @biomejs/biome init` — remove any eslint/prettier config

## Directory structure

```
apps/dashboard/
  app/
    routes/               # Route modules
      home.tsx            # Home/index page
      auth-layout.tsx     # Auth pages (login, signup)
      login.tsx
      authenticated-layout.tsx  # Auth guard layout
      dashboard-layout.tsx       # Shell (sidebar, header)
      dashboard/
        index.tsx
        users.tsx
        users.$id.tsx
    components/
      layout/             # Shell, sidebar, header
      ui/                 # Buttons, inputs, cards
    hooks/
      use-auth.ts         # Session query hook
    lib/
      api.ts              # API client
      query-client.ts     # TanStack Query client instance
    root.tsx              # App root — providers, HTML shell
    routes.ts             # Route config (all routes declared here)
    styles/
      globals.css
```

## Route config

Routes are declared explicitly in `app/routes.ts` using `@react-router/dev/routes`:

```ts
import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/auth-layout.tsx", [
    route("login", "routes/login.tsx"),
  ]),
  layout("routes/authenticated-layout.tsx", [
    layout("routes/dashboard-layout.tsx", [
      index("routes/dashboard/index.tsx"),
      route("users", "routes/dashboard/users.tsx"),
      route("users/:id", "routes/dashboard/users.$id.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
```

Do not use file-based routing — always declare routes explicitly in `routes.ts`. This keeps the route tree readable and makes auth guards obvious.

## Root layout

`app/root.tsx` wraps the entire app with providers and renders the HTML shell:

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { queryClient } from "@/lib/query-client";
import "./styles/globals.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
```

## Auth guard

Auth is enforced in a layout route that checks session state client-side. No loaders — auth is verified via TanStack Query on mount:

```tsx
// routes/authenticated-layout.tsx
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.href)}`);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <Outlet />;
}
```

## Auth hook

Session state lives in TanStack Query — one cache entry, shared across the app:

```ts
// hooks/use-auth.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => api.get<{ user: User | null } | null>("/api/auth/get-session"),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: data?.user ?? null,
    isAuthenticated: !!data?.user,
    isLoading,
  };
}
```

## Adding pages

Pages are default exports. Data fetching uses TanStack Query — no React Router loaders for data:

```tsx
// routes/dashboard/users.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/api/users"),
  });

  if (isLoading) return <UsersSkeleton />;
  if (!users?.length) return <EmptyState />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UserTable users={users} />
    </div>
  );
}
```

### Route params

Use the generated `+types/` for typed params:

```tsx
import type { Route } from "./+types/users.$id";

export default function UserDetailPage({ params }: Route.ComponentProps) {
  const { id } = params;
  // ...
}
```

## Mutations

Use TanStack Query mutations for writes. Invalidate the affected query key on success:

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateUserForm() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: NewUser) => api.post("/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // ...
}
```

## Client state

- Nanostores for UI-only state (sidebar open, selected filters, modal visibility)
- TanStack Query for all server state — never duplicate it in a client store
- Never store auth state in a Nanostore — use `useAuth()` which reads from TanStack Query

```ts
// lib/stores.ts
import { atom } from "nanostores";

export const $sidebarOpen = atom(true);
export const $selectedFilters = atom<string[]>([]);
```

## Tools

| Tool | Purpose |
|---|---|
| `tools/route-list.ts` | All routes with auth requirements |
| `tools/page-scaffold.ts` | Generate page component with query and skeleton |
