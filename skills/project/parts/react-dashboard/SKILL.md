---
name: react-dashboard
description: Sets up and maintains an admin dashboard or internal tool using TanStack Start, TanStack Router, React 19, and Tailwind CSS. Handles page layout, data tables, forms, auth guards, and server-side data loading. Use when creating an admin panel, adding dashboard pages, building data tables, or wiring up server-side loaders.
allowed-tools: Read Write Edit Glob Grep Bash
---

# React Dashboard

Admin dashboards and internal tools built with TanStack Start for full-stack React, TanStack Router for type-safe routing, and Tailwind CSS for styling. Biome for linting and formatting.

## Decision Tree

- What are you doing?
  - **Creating a new dashboard app** → see "Initial setup" below
  - **Adding a page** → see "Adding pages" below
  - **Adding a data table** → see "Data tables" below
  - **Adding a form** → see "Forms" below
  - **Adding auth guards** → see "Auth" below
  - **Listing all routes** → run `tools/route-list.ts`
  - **Scaffolding a new page** → run `tools/page-scaffold.ts <route>`

## Initial setup

1. Create the package (e.g. `apps/dashboard/` in a workspace)
2. Install dependencies:
   ```
   bun add @tanstack/react-start @tanstack/react-router react@19 react-dom@19
   bun add @tanstack/react-query @nanostores/react nanostores
   bun add -d tailwindcss @tailwindcss/vite vite
   ```
3. Add `package.json` scripts:
   ```json
   {
     "name": "@<project>/dashboard",
     "type": "module",
     "scripts": {
       "dev": "vinxi dev",
       "build": "vinxi build",
       "start": "vinxi start"
     }
   }
   ```
4. Create `app.config.ts` for TanStack Start:
   ```ts
   import { defineConfig } from "@tanstack/react-start/config";
   import tailwindcss from "@tailwindcss/vite";

   export default defineConfig({
     vite: {
       plugins: [tailwindcss()],
     },
   });
   ```
5. Set up Biome: `bunx @biomejs/biome init`

## Directory structure

```
apps/dashboard/
  app/
    routes/
      __root.tsx         # Root layout (sidebar, header, providers)
      index.tsx           # Dashboard home / overview
      users.tsx           # Users list page
      users.$id.tsx       # User detail page
      settings.tsx        # Settings page
    components/
      layout/             # Shell, sidebar, header, nav
      ui/                 # Buttons, inputs, cards, badges
      data/               # Tables, charts, stat cards
    lib/
      api.ts              # API client (fetch wrapper or hono/client)
      auth.ts             # Auth state and guards
      stores.ts           # Nanostores for client state
    styles/
      app.css             # Tailwind import
  app.config.ts
  package.json
```

## Adding pages

1. Create a route file in `app/routes/`:

```tsx
// app/routes/users.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  const res = await fetch("https://api.example.com/users");
  return res.json();
});

export const Route = createFileRoute("/users")({
  loader: () => getUsers(),
  component: UsersPage,
});

function UsersPage() {
  const users = Route.useLoaderData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      {/* render users */}
    </div>
  );
}
```

- Use `createServerFn` for server-side data loading — runs on the server, returns typed data
- Use `loader` in the route definition — data is available before render
- Keep page components focused on layout and data display

## Data tables

Build tables with plain HTML table elements and Tailwind:

```tsx
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
}: {
  data: T[];
  columns: Column<T>[];
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b text-gray-500">
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)} className="px-4 py-2 font-medium">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {data.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td key={String(col.key)} className="px-4 py-2">
                {col.render
                  ? col.render(row[col.key], row)
                  : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- Add sorting, filtering, and pagination as needed — not upfront
- Use `@tanstack/react-query` for client-side data refetching and mutations
- Cursor-based pagination with `useInfiniteQuery` for large datasets

## Forms

Use controlled components with React 19 `useActionState` or plain state:

```tsx
import { useActionState } from "react";
import { createServerFn } from "@tanstack/react-start";

const createUser = createServerFn({ method: "POST" })
  .validator((data: FormData) => ({
    name: data.get("name") as string,
    email: data.get("email") as string,
  }))
  .handler(async ({ data }) => {
    // call API, return result
  });

function CreateUserForm() {
  const [state, action, pending] = useActionState(
    (_prev: unknown, formData: FormData) => createUser({ data: formData }),
    null
  );

  return (
    <form action={action} className="space-y-4">
      <input name="name" placeholder="Name" className="border rounded px-3 py-2 w-full" />
      <input name="email" type="email" placeholder="Email" className="border rounded px-3 py-2 w-full" />
      <button type="submit" disabled={pending} className="bg-blue-600 text-white px-4 py-2 rounded">
        {pending ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

- Validate on the server with Zod via `validator`
- Show loading state with the `pending` flag
- Display server errors from the action result

## Auth

Guard dashboard routes with auth middleware:

```tsx
// app/routes/__root.tsx
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getSession = createServerFn({ method: "GET" }).handler(async () => {
  // check session cookie, return user or null
});

export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) throw redirect({ to: "/login" });
    return { user: session.user };
  },
  component: () => (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  ),
});
```

- Auth check happens in `beforeLoad` — unauthorized users never see the page
- Pass user context down via route context, access with `Route.useRouteContext()`
- Role-based guards: check `user.role` in `beforeLoad` and redirect if insufficient

## Client state

Use nanostores for simple client-side state (sidebar open, theme, filters):

```ts
// app/lib/stores.ts
import { atom } from "nanostores";

export const $sidebarOpen = atom(true);
export const $theme = atom<"light" | "dark">("light");
```

```tsx
// In a component
import { useStore } from "@nanostores/react";
import { $sidebarOpen } from "../lib/stores";

function Sidebar() {
  const open = useStore($sidebarOpen);
  if (!open) return null;
  return <aside>...</aside>;
}
```

- Nanostores for UI state (sidebar, modals, filters)
- TanStack Query for server state (data fetching, mutations, cache)
- Never duplicate server state in client stores

## Key references

| File | What it covers |
|---|---|
| `tools/route-list.ts` | List all dashboard routes with their loaders and auth requirements |
| `tools/page-scaffold.ts` | Generate a new page with loader, component, and auth guard boilerplate |
