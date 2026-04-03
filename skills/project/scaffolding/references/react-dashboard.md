# React Dashboard

Admin dashboards and internal tools built with React Router v7, React 19, TanStack Query, and Tailwind CSS.

## Setup

1. Scaffold: `bun create react-router@latest apps/dashboard -- --template remix`
2. Set `"name": "@scope/dashboard"` in package.json
3. Install: `bun add @tanstack/react-query @tanstack/react-query-devtools nanostores @nanostores/react react-hook-form @hookform/resolvers`
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

## Forms

Forms use react-hook-form with a Zod resolver for client-side validation. Server-side field errors from the API are mapped back to form fields using `setError`.

### Basic form with Zod validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: { role: "member" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateUserInput) => api.post("/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (error) => {
      // Map server-side field errors back to form fields
      for (const { field, message } of error.details ?? []) {
        form.setError(field as keyof CreateUserInput, { message });
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <input id="name" className="mt-1 w-full rounded border px-3 py-2" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" type="email" className="mt-1 w-full rounded border px-3 py-2" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      <button type="submit" disabled={isPending} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50">
        {isPending ? "Creating..." : "Create user"}
      </button>
    </form>
  );
}
```

### Server error integration

The API returns `{ ok: false, error: { code, message, details: [{ field, message }] } }` for validation failures (see `development/typescript/errors`). The `api` client should parse the error response and throw a structured error:

```ts
// lib/api.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details: { field: string; message: string }[] = [],
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new ApiError(json.error.code, json.error.message, json.error.details ?? []);
  return json.data;
}
```

The `onError` handler in the mutation maps `details` back to form fields so field-level errors appear inline next to the relevant input.

### Edit forms

Pre-populate with existing data using `defaultValues`:

```tsx
function EditUserForm({ user }: { user: User }) {
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      name: user.name,
      role: user.role,
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
