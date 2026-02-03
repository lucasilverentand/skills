---
name: state-management
description: Implements state management solutions. Use when setting up Zustand, Jotai, Redux, or managing complex application state.
argument-hint: [library]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# State Management

Implements state management for React applications.

## Your Task

1. **Assess needs**: Understand state requirements
2. **Choose library**: Select appropriate solution
3. **Implement store**: Create state management
4. **Connect components**: Use state in UI
5. **Test**: Verify state updates

## Zustand

```typescript
// store/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        const { user, token } = await api.login(email, password);
        set({ user, token });
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);

// Usage
function Profile() {
  const { user, logout } = useAuthStore();
  return user ? <div>{user.name}</div> : null;
}
```

## Jotai

```typescript
// atoms/counter.ts
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// Usage
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [double] = useAtom(doubleCountAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
```

## React Query (Server State)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  if (isLoading) return <Loading />;
  return <ul>{data.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

## Choosing a Solution

| Library | Best For |
|---------|----------|
| Zustand | Simple global state |
| Jotai | Atomic, bottom-up state |
| Redux Toolkit | Complex state with middleware |
| React Query | Server state/caching |
| Context | Theme, auth, simple state |

## Tips

- Don't over-engineer state
- Use React Query for server state
- Keep state close to where it's used
- Prefer composition over single store
