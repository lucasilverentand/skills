---
name: nextjs-app
description: Creates Next.js App Router projects and patterns. Use when setting up Next.js, implementing server components, or using App Router features.
argument-hint: [feature]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Next.js App Router

Creates and configures Next.js projects using the App Router.

## Your Task

1. **Check setup**: Verify Next.js version and configuration
2. **Implement feature**: Use App Router patterns
3. **Optimize**: Apply best practices
4. **Test**: Verify functionality
5. **Document**: Add usage notes

## Project Structure

```
app/
├── layout.tsx           # Root layout
├── page.tsx             # Home page
├── loading.tsx          # Loading UI
├── error.tsx            # Error boundary
├── not-found.tsx        # 404 page
├── api/
│   └── users/
│       └── route.ts     # API route
└── dashboard/
    ├── layout.tsx       # Nested layout
    └── page.tsx         # Dashboard page
```

## Server Component

```tsx
// app/users/page.tsx
async function UsersPage() {
  const users = await db.user.findMany();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UsersPage;
```

## Client Component

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Server Actions

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  await db.user.create({ data: { name } });
  revalidatePath('/users');
}
```

## API Route

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  const user = await db.user.create({ data });
  return NextResponse.json(user, { status: 201 });
}
```

## Tips

- Default to Server Components
- Use 'use client' only when needed
- Leverage Server Actions for mutations
- Use loading.tsx for Suspense boundaries
