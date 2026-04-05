# Approved Stack

Vetted packages for each concern. Use these by default in new projects. If an alternative exists in this list, prefer the primary choice unless there's a specific reason not to.

## TypeScript / Web

| Concern | Package | Why | Alternative |
|---|---|---|---|
| Runtime | `bun` | Runtime, test runner, package manager in one | — |
| API framework | `hono` | Tiny, fast, edge-native, type-safe | — |
| Web framework | `astro` | Zero-JS default, islands architecture | Vite + React for pure SPAs |
| Lint + format | `@biomejs/biome` | Replaces ESLint + Prettier, Rust-speed | — |
| Styling | `tailwindcss` | Utility-first, tree-shakes unused styles | — |
| Validation | `zod` | TypeScript-first schema validation | `valibot` (smaller bundle) |
| ORM | `drizzle-orm` | SQL-first, lightweight, D1-compatible | — |
| Auth | `better-auth` | Self-hosted, framework-agnostic | — |
| Client state | `nanostores` | Tiny, framework-agnostic signals | — |
| Server state | `@tanstack/react-query` | Cache, refetch, optimistic updates | — |
| Routing (SPA) | `@tanstack/react-router` | Type-safe, file-based routing | — |
| HTTP client | `fetch` (built-in) | Standard API, no wrapper needed | `ky` for retries/hooks |

## React Native / Expo

| Concern | Package | Why | Alternative |
|---|---|---|---|
| Framework | `expo` | Managed workflow, OTA updates, file-based routing | — |
| Routing | `expo-router` | File-based, typed routes | ��� |
| Styling | `nativewind` | Tailwind syntax in RN | — |
| Local state | `zustand` | Simple, no boilerplate, persist middleware | — |
| Server state | `@tanstack/react-query` | Same patterns as web | — |
| Auth | `better-auth` + `@better-auth/expo` | Consistent with web auth | — |
| E2E testing | `maestro` | Native-first, readable YAML flows | — |

## Swift / iOS

| Concern | Approach | Why |
|---|---|---|
| UI | SwiftUI | Apple's declarative framework, first-class support |
| State | `@Observable` + `@State` + `@Environment` | Built-in, no third-party needed |
| Networking | `URLSession` + `async/await` | Built-in, modern concurrency |
| Persistence | SwiftData or `UserDefaults` | Built-in, no Core Data boilerplate |
| Testing | Swift Testing (`@Test`, `#expect`) | Modern, replaces XCTest |
| Dependencies | **None** | Swift's stdlib + Apple frameworks cover everything |

## Rust

| Concern | Crate | Why |
|---|---|---|
| CLI args | `clap` | Derive macro, auto-generated help |
| Serialization | `serde` + `serde_json` | De facto standard |
| HTTP client | `reqwest` | Async, TLS, well-maintained |
| Error handling | `thiserror` (libraries), `anyhow` (apps) | Ergonomic error types |
| Async runtime | `tokio` | Industry standard for async Rust |
| Logging | `tracing` | Structured, async-aware |

## Cross-Platform

| Concern | Tool | Why |
|---|---|---|
| Secrets | Doppler | Single source of truth, syncs to all envs |
| Containers | OrbStack | Fast, low-memory Docker alternative on macOS |
| CI | GitHub Actions | Integrated with repos, good free tier |
| Monorepo | Bun workspaces | Native workspace support, fast installs |
