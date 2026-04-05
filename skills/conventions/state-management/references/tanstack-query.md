# TanStack Query Patterns

## Query Key Conventions

Use hierarchical, stable query keys. Structure them as arrays from general to specific:

```ts
// Entity list
["users"]
["users", { role: "admin" }]

// Entity detail
["users", userId]
["users", userId, "posts"]

// Scoped to a workspace/org
["orgs", orgId, "users"]
["orgs", orgId, "users", userId]
```

Extract key factories to avoid typos and enable type-safe invalidation:

```ts
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
```

## Query Functions

### With fetch

```ts
import { useQuery } from "@tanstack/react-query"

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error(`Failed to fetch user ${id}`)
      const body = await res.json() as { ok: true; data: User }
      return body.data
    },
  })
}
```

### With Hono RPC client

When using Hono's typed client, queries get end-to-end type safety:

```ts
import { hc } from "hono/client"
import type { AppType } from "@scope/api"

const client = hc<AppType>("/api")

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res = await client.users[":id"].$get({ param: { id } })
      if (!res.ok) throw new Error("Failed to fetch user")
      const body = await res.json()
      return body.data
    },
  })
}
```

## Mutations

### Basic mutation

```ts
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error("Failed to create user")
      return (await res.json() as { data: User }).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
```

### Optimistic updates

For responsive UIs — update the cache before the server responds:

```ts
export function useToggleFavorite(itemId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (favorited: boolean) =>
      fetch(`/api/items/${itemId}/favorite`, {
        method: favorited ? "POST" : "DELETE",
      }),
    onMutate: async (favorited) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.detail(itemId) })
      const previous = queryClient.getQueryData<Item>(itemKeys.detail(itemId))
      queryClient.setQueryData<Item>(itemKeys.detail(itemId), (old) =>
        old ? { ...old, favorited } : old,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.detail(itemId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
    },
  })
}
```

## Cache Invalidation

```ts
// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all })

// Invalidate only user lists (not details)
queryClient.invalidateQueries({ queryKey: userKeys.lists() })

// Invalidate one specific user
queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
```

Invalidation triggers a background refetch — the stale data is shown while fresh data loads.

## Prefetching

Prefetch data before navigation for instant page loads:

```ts
// In a link component or on hover
function handleMouseEnter(userId: string) {
  queryClient.prefetchQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // Don't refetch if data is < 5 min old
  })
}
```

## Infinite Queries

For cursor-based pagination:

```ts
export function useInfiniteItems() {
  return useInfiniteQuery({
    queryKey: ["items"],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/items?cursor=${pageParam ?? ""}`)
      return (await res.json()) as { data: Item[]; nextCursor: string | null }
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
```

## Rules

- Every API endpoint gets its own query hook — don't inline query configs in components
- Use key factories — never hardcode query key strings in components
- Invalidate broadly, fetch specifically — `invalidateQueries` with a prefix key to catch related queries
- Set reasonable `staleTime` — the default (0) means every mount triggers a refetch. For data that changes rarely, use `5 * 60 * 1000` (5 minutes)
- Don't store server data in Nanostores/Zustand — TanStack Query is the cache
