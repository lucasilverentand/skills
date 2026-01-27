---
name: hono-jsx
description: Server-side rendering with Hono JSX. Use when building HTML pages, SSR, or streaming responses with Hono.
---

# Hono JSX

Guide to server-side rendering with Hono's built-in JSX support.

## Setup

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

**Important:** Rename files using JSX from `.ts` to `.tsx`.

### Deno Configuration

```json
// deno.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@hono/hono/jsx"
  }
}
```

### Pragma Alternative

Instead of tsconfig, use file-level pragmas:

```typescript
/** @jsx jsx */
/** @jsxImportSource hono/jsx */
```

## Basic Usage

### Simple Components

```tsx
import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

const app = new Hono()

const Hello: FC<{ name: string }> = ({ name }) => {
  return <h1>Hello {name}!</h1>
}

app.get('/', (c) => {
  return c.html(<Hello name="World" />)
})

export default app
```

### Full Page Layout

```tsx
import { Hono } from 'hono'
import type { FC, PropsWithChildren } from 'hono/jsx'

const Layout: FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </head>
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>&copy; 2024 My App</footer>
      </body>
    </html>
  )
}

const HomePage: FC = () => {
  return (
    <Layout title="Home">
      <h1>Welcome</h1>
      <p>This is the home page.</p>
    </Layout>
  )
}

const app = new Hono()

app.get('/', (c) => {
  return c.html(<HomePage />)
})

export default app
```

## Fragments

Group elements without wrapper nodes:

```tsx
import { Fragment } from 'hono/jsx'

const List: FC = () => {
  return (
    <Fragment>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </Fragment>
  )
}

// Shorthand syntax
const List2: FC = () => {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  )
}
```

## Dynamic Content

### Lists and Iteration

```tsx
const UserList: FC<{ users: { id: string; name: string }[] }> = ({ users }) => {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

app.get('/users', async (c) => {
  const users = await getUsers()
  return c.html(<UserList users={users} />)
})
```

### Conditional Rendering

```tsx
const UserProfile: FC<{ user: User | null }> = ({ user }) => {
  return (
    <div>
      {user ? (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>
      ) : (
        <p>User not found</p>
      )}
    </div>
  )
}
```

## Async Components

```tsx
const AsyncComponent: FC = async () => {
  const data = await fetchData()

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </div>
  )
}

app.get('/async', async (c) => {
  return c.html(
    <Layout title="Async">
      <AsyncComponent />
    </Layout>
  )
})
```

## Streaming SSR

### Basic Streaming

```tsx
import { Hono } from 'hono'
import { Suspense, renderToReadableStream } from 'hono/jsx/streaming'

const SlowComponent: FC = async () => {
  await new Promise((r) => setTimeout(r, 2000))
  return <div>Loaded after 2 seconds!</div>
}

const app = new Hono()

app.get('/', (c) => {
  const stream = renderToReadableStream(
    <html>
      <body>
        <h1>Streaming SSR</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <SlowComponent />
        </Suspense>
      </body>
    </html>
  )

  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})
```

### Multiple Suspense Boundaries

```tsx
app.get('/', (c) => {
  const stream = renderToReadableStream(
    <html>
      <body>
        <h1>Dashboard</h1>

        <Suspense fallback={<div>Loading stats...</div>}>
          <Stats />
        </Suspense>

        <Suspense fallback={<div>Loading recent activity...</div>}>
          <RecentActivity />
        </Suspense>

        <Suspense fallback={<div>Loading notifications...</div>}>
          <Notifications />
        </Suspense>
      </body>
    </html>
  )

  return c.body(stream, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
    },
  })
})
```

## Error Boundaries

```tsx
import { ErrorBoundary } from 'hono/jsx/streaming'

const RiskyComponent: FC = async () => {
  const data = await fetchDataThatMightFail()
  return <div>{data}</div>
}

app.get('/', async (c) => {
  return c.html(
    <html>
      <body>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <RiskyComponent />
        </ErrorBoundary>
      </body>
    </html>
  )
})
```

## Context API

### Creating and Using Context

```tsx
import { createContext, useContext } from 'hono/jsx'
import type { FC } from 'hono/jsx'

// Create context
const ThemeContext = createContext<{ color: string; background: string }>({
  color: '#000000',
  background: '#ffffff',
})

// Consumer component
const ThemedButton: FC<{ label: string }> = ({ label }) => {
  const theme = useContext(ThemeContext)

  return (
    <button style={{ color: theme.color, backgroundColor: theme.background }}>
      {label}
    </button>
  )
}

// Provider usage
app.get('/', (c) => {
  return c.html(
    <ThemeContext.Provider value={{ color: '#ffffff', background: '#0066cc' }}>
      <ThemedButton label="Click me" />
    </ThemeContext.Provider>
  )
})
```

### Request Context

```tsx
const RequestContext = createContext<{ requestId: string }>({ requestId: '' })

const RequestInfo: FC = () => {
  const { requestId } = useContext(RequestContext)
  return <span>Request ID: {requestId}</span>
}

app.get('/', (c) => {
  const requestId = crypto.randomUUID()

  return c.html(
    <RequestContext.Provider value={{ requestId }}>
      <Layout title="Home">
        <RequestInfo />
      </Layout>
    </RequestContext.Provider>
  )
})
```

## HTML Helper

Mix JSX with raw HTML using the `html` helper:

```tsx
import { Hono } from 'hono'
import { html, raw } from 'hono/html'

const app = new Hono()

// Template literal HTML
const RawLayout = (props: { title: string; children: any }) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${props.title}</title>
    </head>
    <body>
      ${props.children}
    </body>
  </html>
`

// JSX inside html template
const Page: FC<{ name: string }> = ({ name }) => {
  return (
    <RawLayout title="Hello">
      <h1>Hello {name}!</h1>
    </RawLayout>
  )
}

// Raw HTML (unescaped)
app.get('/raw', (c) => {
  const userContent = '<script>alert("xss")</script>'
  const safeContent = 'Hello World'

  return c.html(
    <div>
      {/* Escaped (safe) */}
      <p>{userContent}</p>

      {/* Unescaped (use with caution!) */}
      <div>{raw(safeContent)}</div>
    </div>
  )
})
```

## JSX Renderer Middleware

Use the JSX renderer middleware for consistent layouts:

```tsx
import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'

const app = new Hono()

// Set up renderer
app.use(
  '*',
  jsxRenderer(({ children }) => {
    return (
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>My App</title>
        </head>
        <body>{children}</body>
      </html>
    )
  })
)

// Routes use c.render()
app.get('/', (c) => {
  return c.render(<h1>Home</h1>)
})

app.get('/about', (c) => {
  return c.render(<h1>About</h1>)
})
```

### Renderer with Props

```tsx
declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response
  }
}

app.use(
  '*',
  jsxRenderer(({ children, title }) => {
    return (
      <html>
        <head>
          <title>{title}</title>
        </head>
        <body>{children}</body>
      </html>
    )
  })
)

app.get('/', (c) => {
  return c.render(<h1>Home</h1>, { title: 'Home Page' })
})
```

## Metadata Hoisting

Document metadata automatically moves to `<head>`:

```tsx
app.use('*', jsxRenderer(({ children }) => {
  return (
    <html>
      <head></head>
      <body>{children}</body>
    </html>
  )
}))

app.get('/about', (c) => {
  return c.render(
    <>
      {/* These will be hoisted to <head> */}
      <title>About Page</title>
      <meta name="description" content="About our company" />

      {/* Regular content */}
      <h1>About Us</h1>
      <p>We are a great company.</p>
    </>
  )
})
```

## Memoization

Cache expensive components:

```tsx
import { memo } from 'hono/jsx'

const ExpensiveComponent: FC<{ data: Data }> = memo(({ data }) => {
  // Complex rendering
  return <div>{processData(data)}</div>
})

const Header = memo(() => (
  <header>
    <nav>Navigation</nav>
  </header>
))

const Footer = memo(() => (
  <footer>Footer content</footer>
))
```

## CSS Patterns

### Inline Styles

```tsx
const Card: FC<{ highlighted: boolean }> = ({ highlighted, children }) => {
  const style = {
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: highlighted ? '#fffbcc' : '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }

  return <div style={style}>{children}</div>
}
```

### CSS Classes

```tsx
const Button: FC<{ variant: 'primary' | 'secondary' }> = ({ variant, children }) => {
  const className = `btn btn-${variant}`
  return <button class={className}>{children}</button>
}
```

### Scoped CSS with Style Tags

```tsx
const StyledComponent: FC = () => {
  return (
    <>
      <style>{`
        .my-component {
          padding: 16px;
          background: #f0f0f0;
        }
        .my-component h1 {
          color: #333;
        }
      `}</style>
      <div class="my-component">
        <h1>Styled!</h1>
      </div>
    </>
  )
}
```

## Form Handling

```tsx
const ContactForm: FC<{ error?: string }> = ({ error }) => {
  return (
    <form method="POST" action="/contact">
      {error && <div class="error">{error}</div>}

      <label>
        Name:
        <input type="text" name="name" required />
      </label>

      <label>
        Email:
        <input type="email" name="email" required />
      </label>

      <label>
        Message:
        <textarea name="message" required></textarea>
      </label>

      <button type="submit">Send</button>
    </form>
  )
}

app.get('/contact', (c) => {
  return c.html(<ContactForm />)
})

app.post('/contact', async (c) => {
  const body = await c.req.parseBody()

  if (!body.name || !body.email) {
    return c.html(<ContactForm error="All fields are required" />)
  }

  await sendEmail(body)
  return c.redirect('/thank-you')
})
```

## Client-Side Interactivity

### Adding Scripts

```tsx
const InteractivePage: FC = () => {
  return (
    <html>
      <head>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
      </head>
      <body>
        <button hx-get="/api/data" hx-target="#result">
          Load Data
        </button>
        <div id="result"></div>
      </body>
    </html>
  )
}
```

### Inline Scripts

```tsx
import { html } from 'hono/html'

const Counter: FC = () => {
  return (
    <div>
      <span id="count">0</span>
      <button id="increment">+</button>

      {html`
        <script>
          let count = 0;
          document.getElementById('increment').addEventListener('click', () => {
            count++;
            document.getElementById('count').textContent = count;
          });
        </script>
      `}
    </div>
  )
}
```

## Best Practices

1. **Use TypeScript** with proper FC types
2. **Create reusable Layout components**
3. **Use Suspense** for streaming slow content
4. **Escape user input** (default behavior)
5. **Use memo()** for expensive static components
6. **Keep components small** and focused
7. **Use Context** for shared data (theme, user, etc.)
8. **Prefer server-side rendering** over client-side hydration
9. **Use html helper** for raw HTML templates
10. **Test components** with simple unit tests
