# Plugin Structure

Plugins are grouped into two categories: **project-type** plugins that encode opinionated patterns for a specific kind of project, and **cross-cutting** plugins that apply across all project types.

When starting work on a project, you install the relevant project-type plugin plus whatever cross-cutting plugins apply. Bundles automate this — they're named presets that combine project-type and cross-cutting plugins for common workflows.

---

## Project-Type Plugins

Each project-type plugin gives Claude a complete, opinionated guide for building one kind of project. They cover architecture, patterns, conventions, and stack-specific tooling.

### `api` — Backend APIs

> Hono on Cloudflare Workers, Drizzle ORM, Better Auth, Zod validation

| Skill | Covers |
|---|---|
| routing | Hono route design, middleware chains, OpenAPI generation, versioning |
| data | Drizzle schemas, queries, relations, migrations (D1 + Postgres) |
| auth | Better Auth setup, session middleware, RBAC, API key management |
| errors | Result types (`{ ok, error }`), error codes, HTTP status mapping |
| validation | Zod schemas, request/response typing, type inference |
| background-jobs | Cloudflare Queues, cron triggers, consumers, retry patterns |

**Status:** Implemented. 6 skills with references and tools.

---

### `ios` — Native iOS Apps

> Swift 6.2, SwiftUI, SwiftData, iOS 26

| Skill | Covers |
|---|---|
| views | SwiftUI views, NavigationStack, layout, animations, iOS-specific modifiers |
| state | `@Observable`, `@State`, `@Environment`, `@MainActor`, data flow |
| data | SwiftData models, `@Query`, persistence, migrations, CloudKit sync |
| patterns | Push notifications, widgets, App Clips, HealthKit, deep links, App Intents |

**Status:** Not yet created. Shares SwiftUI/SwiftData foundations with `macos` but is platform-specific.

---

### `android` — Native Android Apps

> Kotlin, Jetpack Compose, Material 3

| Skill | Covers |
|---|---|
| views | Jetpack Compose UI, Material 3 components, navigation, theming |
| state | ViewModel, StateFlow, state hoisting, lifecycle-aware collection |
| data | Room database, DataStore, repository pattern, offline-first |
| patterns | Notifications, WorkManager, widgets, permissions, Gradle conventions |

**Status:** Not yet created. Entirely new platform.

---

### `macos` — Native macOS Apps

> Swift 6.2, SwiftUI, SwiftData, macOS 26

| Skill | Covers |
|---|---|
| views | SwiftUI layout, liquid glass, window chrome, custom modifiers |
| state | `@Observable`, `@State`, `@Environment`, multi-window state |
| data | SwiftData models, persistence, Spotlight integration |
| patterns | MenuBarExtra, window management, toolbars, sandboxing, Dock menus |

**Status:** Implemented. 4 skills.

---

### `expo` — Cross-Platform Apps

> React Native, Expo, Expo Router, NativeWind, Zustand, TanStack Query

| Skill | Covers |
|---|---|
| routing | Expo Router, file-based routing, typed routes, deep links, tabs/stacks |
| styling | NativeWind (Tailwind for RN), theming, dark mode, platform variants |
| state | Zustand for local state, TanStack Query for server state, AsyncStorage persistence |
| auth | Better Auth with `@better-auth/expo`, token management, session handling |
| patterns | Platform-specific code, shared workspace libs, New Architecture, EAS Build |

**Status:** Not yet created.

---

### `website` — Marketing Sites

> Astro, Tailwind CSS, content-driven

| Skill | Covers |
|---|---|
| structure | Astro project setup, page routing, layouts, `astro.config` conventions |
| components | Astro components, islands architecture, framework integration (React/Svelte) |
| content | Content collections, MDX, type-safe content schemas, CMS integration |
| seo | Meta tags, Open Graph, structured data, sitemap, Core Web Vitals, image optimization |

**Status:** Not yet created.

---

### `dashboard` — Internal Dashboards

> Astro, React islands, shadcn/ui, Tailwind CSS, TanStack Query

| Skill | Covers |
|---|---|
| structure | Astro + React islands setup, layout system, sidebar/nav patterns |
| components | shadcn/ui usage, custom components, Tailwind conventions, data tables |
| data | TanStack Query, API integration, loading/error states, optimistic updates |
| auth | Better Auth in dashboard context, protected routes, role-based UI, redirects |

**Status:** Not yet created.

---

## Cross-Cutting Plugins

These plugins apply regardless of what you're building. They cover practices, tools, and workflows that span project types.

### `development` — General Development Practices

The largest plugin. Covers the fundamentals of writing code regardless of stack.

| Skill | Covers |
|---|---|
| accessibility | WCAG compliance, semantic HTML, ARIA, testing |
| api | General API design principles (not Hono-specific) |
| database | Drizzle ORM patterns, schema design, migrations |
| debugging | Systematic debugging, reproduction, root cause analysis |
| environment | Local dev setup, .env files, toolchain configuration |
| errors | General error handling patterns, result types |
| implementing | Writing code: structure, naming, decomposition |
| knowledge | ADRs, decision logs, architecture documentation |
| performance | Profiling, optimization, benchmarking |
| planning | Breaking down features, task ordering, dependency mapping |
| refactoring | Code transformation, migration strategies, incremental changes |
| testing | Unit, integration, E2E testing across all stacks |
| type-safety | TypeScript hardening, Zod, branded types |
| workers | Cloudflare Workers local development, wrangler |

### `git` — Git Workflows

Single consolidated skill covering branching, committing, conflict resolution, tagging, stashing, remotes, worktrees. Includes the `/clean-repo` command for organizing messy working states into atomic commits.

### `github` — GitHub Integration

Issues, pull requests, code review, Actions, releases.

### `deployment` — Deploy Targets

| Skill | Covers |
|---|---|
| cloudflare | Workers, Pages, D1, KV, R2, Queues, wrangler config |
| kubernetes | Manifests, Helm, Flux CD, GitOps patterns |
| railway | Railway deployment, Nixpacks, environment config |

### `infrastructure` — Infrastructure & Operations

| Skill | Covers |
|---|---|
| docker | Dockerfiles, compose, multi-stage builds, OrbStack |
| gitops | Flux CD, Kustomize, reconciliation |
| secrets | Secret management, .env patterns, sealed secrets |

### `documentation` — Writing Docs

| Skill | Covers |
|---|---|
| coauthoring | Collaborative writing, review, editing |
| developer-docs | READMEs, API docs, setup guides |
| external-docs | User-facing documentation, tutorials |
| internal-docs | Architecture docs, runbooks, onboarding |
| reporting | Status reports, postmortems, RFCs |
| style | Voice, tone, formatting standards |

### `project` — Project Management

| Skill | Covers |
|---|---|
| description | Comprehensive project profiling |
| scaffolding | New project setup, templates, toolchain |
| structure | Directory organization, monorepo layout |

### `research` — Research & Analysis

| Skill | Covers |
|---|---|
| api | API research, documentation analysis |
| codebase | Code archaeology, convention discovery |
| competitor | Competitive analysis |
| market | Market research, sizing, trends |
| technology | Tech evaluation, comparison, POCs |
| ux | UX research, user flows, heuristic evaluation |

### `security` — Security

| Skill | Covers |
|---|---|
| audit | Security review, OWASP top 10, threat modeling |
| scan | Automated vulnerability scanning, dependency audit |

### `communication` — Messaging

| Skill | Covers |
|---|---|
| discord | Discord bot patterns, commands, embeds |

### `editor` — Editor Configuration

Cursor/VS Code settings, extensions, keybindings, workspace config.

### `skills` — Skill Authoring

| Skill | Covers |
|---|---|
| authoring | Writing new skills, SKILL.md format, references, tools |
| retrospecting | Reviewing and improving existing skills |

---

## Bundles

Bundles are named presets that combine project-type and cross-cutting plugins. They're defined in `scripts/plugin-config.ts` and compiled into `marketplace.json`.

| Bundle | Description | Plugins |
|---|---|---|
| `full-stack-web` | Web apps with Hono + React + Drizzle | git, api, development, project, deployment, infrastructure, documentation |
| `mobile-dev` | Expo/iOS/macOS apps with a backend | git, api, development, project, macos, communication, documentation |
| `api-backend` | Pure API/backend work | git, api, development, project, deployment, infrastructure, documentation |
| `devops-infra` | CI/CD and infrastructure | git, deployment, infrastructure, security, documentation |
| `open-source` | Maintaining OSS projects | git, development, documentation, skills, security |
| `research-strategy` | Research, analysis, planning | git, research, development, documentation |
| `all` | Everything | * |

### Planned bundle updates

Once the new project-type plugins are created, bundles should be updated:

| Bundle | Add |
|---|---|
| `mobile-dev` | `ios`, `android`, `expo` |
| `full-stack-web` | `website`, `dashboard` |
| New: `ios-app` | git, ios, development, project, documentation |
| New: `android-app` | git, android, development, project, documentation |
| New: `expo-app` | git, expo, api, development, project, documentation |
| New: `marketing-site` | git, website, development, project, documentation, deployment |
| New: `dashboard-app` | git, dashboard, api, development, project, documentation, deployment |

---

## Plugin Anatomy

Every plugin lives under `skills/<plugin-name>/` and contains one or more skills.

```
skills/<plugin>/
├── <skill-a>/
│   ├── SKILL.md            # Instructions, decision tree, conventions
│   ├── references/          # Supporting docs loaded on demand (optional)
│   │   ├── pattern-a.md
│   │   └── pattern-b.md
│   └── tools/               # TypeScript automation scripts (optional)
│       ├── tool-a.ts
│       └── tool-b.ts
└── <skill-b>/
    └── SKILL.md
```

### SKILL.md format

```yaml
---
name: skill-name
description: |
  One-paragraph description of what this skill does and when to activate it.
  Used by Claude to decide whether to load the skill.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(bun:*)
  - Edit
  - Write
---
```

The body contains:
1. **Decision tree** — when to use which pattern
2. **Conventions** — rules and patterns to follow
3. **Examples** — code samples showing the right approach
4. **References** — pointers to `references/*.md` for deeper detail

See `docs/SKILL-TAXONOMY.md` for the three skill tiers (atomic, workflow, agent) and when to use each.

### Auto-discovery

Plugins are auto-discovered from the `skills/` directory structure. You don't need to manually register them — just create the directory and add a SKILL.md. The build script (`scripts/plugin-config.ts`) handles:

- Discovering all plugins from `skills/*/`
- Applying category overrides (default is `devtools`)
- Generating `marketplace.json` with plugin metadata and bundle definitions

To override a plugin's category, add it to `CATEGORY_OVERRIDES` in `scripts/plugin-config.ts`.

---

## Relationship Between Project-Type and Cross-Cutting Plugins

Project-type plugins are **opinionated and stack-specific** — they tell Claude exactly how to build a Hono API or an iOS app, with concrete patterns and code examples.

Cross-cutting plugins are **universal practices** — they tell Claude how to write tests, manage git, handle security, or write docs regardless of the stack.

They complement each other:

```
┌─────────────────────────────────────────────┐
│  Bundle: "ios-app"                          │
│                                             │
│  Project-type:    ios                       │
│  Cross-cutting:   git, development,         │
│                   project, documentation    │
└─────────────────────────────────────────────┘
```

A project-type plugin should **not** duplicate cross-cutting guidance. For example:
- The `api` plugin covers Hono route patterns, not general testing strategies
- The `ios` plugin covers SwiftUI views, not how to write a good commit message
- Testing, git, docs — those come from the cross-cutting plugins in the bundle

When a cross-cutting concern needs stack-specific guidance (e.g., "how to test a Hono API route"), the project-type plugin's skill handles it directly. The cross-cutting `development/testing` skill provides the general framework; the `api/routing` skill includes Hono-specific test patterns.

---

## Implementation Roadmap

Ordered by what we build most and what content already exists:

| Priority | Plugin | Effort | Notes |
|---|---|---|---|
| Done | `api` | — | 6 skills, references, tools — fully implemented |
| Done | `macos` | — | 4 skills — fully implemented |
| 1 | `ios` | Medium | Shares SwiftUI/SwiftData patterns with macos, needs iOS-specific skills |
| 2 | `expo` | Medium | New stack, but patterns are well-established |
| 3 | `website` | Low-Medium | Astro patterns, content collections, SEO |
| 4 | `dashboard` | Low-Medium | Astro + React + shadcn, builds on website patterns |
| 5 | `android` | High | Entirely new platform, Kotlin/Compose patterns from scratch |
