# React Dashboard

Admin dashboards and internal tools built with TanStack Start, TanStack Router, React 19, and Tailwind CSS.

## Setup

1. Create `apps/dashboard/`
2. Install: `bun add @tanstack/react-start @tanstack/react-router react@19 react-dom@19 @tanstack/react-query @nanostores/react nanostores`
3. Dev dependencies: `bun add -d tailwindcss @tailwindcss/vite vite`
4. Set up Biome: `bunx @biomejs/biome init`

## Directory structure

```
apps/dashboard/
  app/
    routes/
      __root.tsx         # Root layout, auth guard
      index.tsx           # Dashboard home
      users.tsx           # Users list
      users.$id.tsx       # User detail
    components/
      layout/             # Shell, sidebar, header
      ui/                 # Buttons, inputs, cards
      data/               # Tables, charts
    lib/
      api.ts              # API client
      stores.ts           # Nanostores for client state
  app.config.ts
```

## Adding pages

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  return fetch("https://api.example.com/users").then((r) => r.json());
});

export const Route = createFileRoute("/users")({
  loader: () => getUsers(),
  component: UsersPage,
});

function UsersPage() {
  const users = Route.useLoaderData();
  return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Users</h1></div>;
}
```

## Forms

Use `createServerFn` with `.validator()` for server-side Zod validation and `useActionState` for form state.

## Auth guards

```tsx
export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) throw redirect({ to: "/login" });
    return { user: session.user };
  },
});
```

## Client state

- Nanostores for UI state (sidebar, modals, filters)
- TanStack Query for server state (data fetching, mutations, cache)
- Never duplicate server state in client stores

## Tools

| Tool | Purpose |
|---|---|
| `tools/route-list.ts` | All routes with loaders and auth requirements |
| `tools/page-scaffold.ts` | Generate page with loader, component, and auth guard |
