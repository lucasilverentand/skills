# TanStack Router App

React SPAs and full-stack apps built with TanStack Router, Vite, TanStack Query, and Tailwind CSS. Use this when building a client-side or full-stack TypeScript web app with file-based routing and type-safe navigation.

## When to use TanStack Router vs React Router

| Scenario | Choose |
|---|---|
| Need fully type-safe routes, search params, and link components | TanStack Router |
| Need a full-stack framework with server functions (like Remix) | TanStack Start (built on TanStack Router) |
| Team is already familiar with Remix conventions | React Router v7 (see `react-dashboard.md`) |
| Marketing or content-heavy site with SSG | Astro (see `website.md`) |

TanStack Router's distinguishing feature is end-to-end type safety: route params, search params, and navigation calls are all fully typed at compile time.

## Bootstrap

1. Scaffold: `bun create @tanstack/router-app@latest apps/web`
   - Select: TypeScript, Tailwind, file-based routing
2. Install workspace deps: `bun add @tanstack/react-query @tanstack/react-query-devtools`
3. Add to root `package.json` workspaces and root `tsconfig.json` references
4. Set `"name": "@scope/web"` in `apps/web/package.json`

## Directory structure

```
apps/web/
  src/
    routes/
      __root.tsx         # Root layout route
      index.tsx          # Home page (/)
      _auth.tsx          # Auth guard layout (non-path segment)
      _auth.dashboard/
        index.tsx        # /dashboard
        settings.tsx     # /dashboard/settings
      login.tsx          # /login
    lib/
      query-client.ts    # TanStack Query client singleton
      api.ts             # Typed fetch wrapper
    components/          # Shared UI components
    main.tsx             # Entry point — RouterProvider + QueryClientProvider
  vite.config.ts
  package.json
  tsconfig.json
```

## Vite config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
});
```

The Vite plugin watches `src/routes/` and auto-generates `src/routeTree.gen.ts`. **Never edit the generated file** — it is overwritten on every change.

## Entry point

```tsx
// src/main.tsx
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree, context: { queryClient } });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
```

Passing `queryClient` as context makes it available in all route `beforeLoad` and `loader` functions — required for prefetching.

## Root route

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet, Link } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div>
      <nav>
        <Link to="/" activeOptions={{ exact: true }}>Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Outlet />
    </div>
  );
}
```

## File-based routing conventions

| File | Route path |
|---|---|
| `routes/index.tsx` | `/` |
| `routes/about.tsx` | `/about` |
| `routes/users/$userId.tsx` | `/users/:userId` |
| `routes/_auth.tsx` | Layout only (no path segment, prefix `_`) |
| `routes/_auth.dashboard/index.tsx` | `/dashboard` (inside `_auth` layout) |
| `routes/settings.lazy.tsx` | `/settings` (code-split, loads on demand) |

- Route files prefixed with `_` add a layout without adding a path segment
- Nested directories match nested paths
- `.lazy.tsx` suffix code-splits the route component

## Route definition

```tsx
// src/routes/users/$userId.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId")({
  component: UserPage,
});

function UserPage() {
  const { userId } = Route.useParams(); // fully typed
  return <div>User: {userId}</div>;
}
```

## Type-safe search params

Declare the search schema on the route — TanStack Router validates and types search params automatically:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().int().min(1).default(1),
  q: z.string().optional(),
});

export const Route = createFileRoute("/users")({
  validateSearch: searchSchema,
  component: UsersPage,
});

function UsersPage() {
  const { page, q } = Route.useSearch(); // typed as { page: number; q?: string }
  const navigate = Route.useNavigate();

  return (
    <button onClick={() => navigate({ search: { page: page + 1 } })}>
      Next page
    </button>
  );
}
```

Use `<Link>` with `search` for type-safe links:

```tsx
<Link to="/users" search={{ page: 2, q: "alice" }}>Page 2</Link>
```

## Auth guard

Protect routes with `beforeLoad`. Use a layout route (prefixed `_`) to apply the guard to a group:

```tsx
// src/routes/_auth.tsx
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { sessionQueryOptions } from "../lib/queries/session";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions());
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
```

Any route nested inside `/_auth/` inherits the guard. Never duplicate auth checks in individual route files.

## Data fetching

Prefer **TanStack Query** over route loaders for data fetching. Loaders are useful for prefetching; the component still reads from the query cache:

```tsx
// src/lib/queries/users.ts
import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";

export const usersQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ["users", page],
    queryFn: () => api.get<User[]>(`/api/v1/users?page=${page}`),
  });
```

```tsx
// src/routes/_auth.dashboard/users.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptions } from "../../lib/queries/users";

export const Route = createFileRoute("/_auth/dashboard/users")({
  // Prefetch on navigation — component reads from cache
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(usersQueryOptions(deps.page ?? 1)),
  component: UsersPage,
});

function UsersPage() {
  const { page } = Route.useSearch();
  const { data: users, isLoading } = useQuery(usersQueryOptions(page ?? 1));

  if (isLoading) return <Spinner />;
  return <UserList users={users} />;
}
```

## Mutations

Use TanStack Query mutations. Invalidate the relevant query key on success:

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

function CreateUserForm() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateUserInput) => api.post("/api/v1/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate(formData); }}>
      <button type="submit" disabled={isPending}>Create</button>
    </form>
  );
}
```

## Error and pending UI

```tsx
export const Route = createFileRoute("/_auth/dashboard/users")({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQueryOptions(1)),
  errorComponent: ({ error }) => (
    <div>Failed to load: {error.message}</div>
  ),
  pendingComponent: () => <Spinner />,
  component: UsersPage,
});
```

- `pendingComponent` renders while the loader is in flight
- `errorComponent` renders if the loader throws
- Both are scoped to the route — they do not affect sibling routes

## Navigation

Always use `<Link>` and `useNavigate` from `@tanstack/react-router` — never `<a>` or `window.location`:

```tsx
import { Link, useNavigate } from "@tanstack/react-router";

// Declarative
<Link to="/users/$userId" params={{ userId: "usr_abc123" }}>View user</Link>

// Programmatic
const navigate = useNavigate();
navigate({ to: "/dashboard", replace: true });
```

Both are type-checked: TypeScript will error if the route or params are wrong.

## Key references

| File | What it covers |
|---|---|
| `src/routeTree.gen.ts` | Auto-generated route tree — never edit directly |
| `src/lib/query-client.ts` | TanStack Query client singleton |
| `src/lib/api.ts` | Typed fetch wrapper for API calls |
| `tools/route-list.ts` | All routes with auth requirements |
