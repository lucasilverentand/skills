# Skills Overview

75 skills organized into 16 atomic plugins and 7 intent-based bundles.

**Plugins** are non-overlapping groups — each skill belongs to exactly one plugin.
**Bundles** are user-intent collections that reference plugins — a plugin can appear in multiple bundles.

## Plugins

### git (5 skills)

| skill path | purpose |
| --- | --- |
| git/branching | Branch strategy, create/manage branches, rebase workflows |
| git/committing | Conventional commits, amend & fixup, pre-commit hooks |
| git/conflicts | Resolve merge conflicts, conflict prevention |
| git/history | Search history (log, blame, bisect), diff analysis |
| git/worktrees | Create/manage worktrees, cleanup stale ones |

### planning (3 skills)

| skill path | purpose |
| --- | --- |
| development/implementing | Implement code based on a plan |
| development/knowledge | Record learnings discovered during development |
| development/planning | Break down features into implementation plans and tasks |

### workflow (4 skills)

| skill path | purpose |
| --- | --- |
| development/debugging | Systematic root cause analysis, log analysis |
| development/environment | Bootstrap local dev setup, dev containers, tool version management |
| development/refactoring | General-purpose refactoring (extract, restructure, migrate patterns) |
| development/team | Orchestrate Claude agent teams with specialist roles |

### code-quality (5 skills)

| skill path | purpose |
| --- | --- |
| development/accessibility | Audit components for WCAG, fix a11y issues |
| development/error-handling | Error handling patterns and strategies |
| development/performance | Identify bottlenecks, bundle optimization, benchmarking |
| development/testing | Design test strategies and author tests (unit, integration, E2E) |
| development/type-safety | Tighten types, remove `any`, add Zod schemas |

### api-data (3 skills)

| skill path | purpose |
| --- | --- |
| development/api-design | Design endpoints, generate OpenAPI specs, review consistency |
| development/database | Database management, queries, and optimization |
| development/migrations | Generate ORM migrations (Drizzle) — never edit migration files directly |

### project-scaffold (9 skills)

| skill path | purpose |
| --- | --- |
| project/structure | Scaffold projects, monorepo setup, convention docs |
| project/parts | Container for monorepo part-specific skills |
| project/parts/cli-tool | CLI tool package setup and conventions |
| project/parts/config | Shared config (env vars, feature flags, constants) |
| project/parts/logger | Shared logging (structured logs, levels, transports) |
| project/parts/shared-packages | Shared workspace packages guidance |
| project/parts/tools | Dev tooling package setup |
| project/parts/types | Shared TypeScript types, interfaces, Zod schemas |
| project/parts/utils | Shared utility functions (formatters, validators, helpers) |

### backend (4 skills)

| skill path | purpose |
| --- | --- |
| project/parts/auth | Shared auth (Better Auth config, session types, middleware) |
| project/parts/database | Database package setup and configuration |
| project/parts/hono-api | Hono API service setup, routes, middleware |
| project/parts/schema | Shared database schema (Drizzle tables, types, migrations) |

### web (3 skills)

| skill path | purpose |
| --- | --- |
| project/parts/react-dashboard | React dashboard app setup |
| project/parts/ui | Shared UI component library (design system, primitives) |
| project/parts/website | Marketing/content website setup |

### mobile (2 skills)

| skill path | purpose |
| --- | --- |
| project/parts/expo-app | Expo React Native app setup, navigation, NativeWind |
| project/parts/ios-app | iOS/Swift app setup |

### integrations (6 skills)

| skill path | purpose |
| --- | --- |
| communication/discord | Discord bots, webhooks, channel management |
| project/parts/analytics | Analytics integration and dashboards |
| project/parts/email | Email templates and sending utilities |
| project/parts/i18n | Internationalization setup and translation management |
| project/parts/notifications | Notification system (push, in-app, email) |
| project/parts/payments | Payment integration (Stripe) |

### devops (7 skills)

| skill path | purpose |
| --- | --- |
| deployment/cloudflare | Deploy Workers/Pages, manage D1/KV/R2, configure DNS |
| deployment/kubernetes | Write/update manifests, Flux/GitOps deploys, scaling |
| deployment/railway | Deploy services, provision databases, multi-environment |
| development/ci | Create/update CI workflows, optimize CI speed |
| infrastructure/docker | Write Dockerfiles, image optimization, debug containers |
| infrastructure/gitops | Flux CD management, repo structure, reconciliation |
| infrastructure/secrets | Secret scanning, rotation, vault/store setup |

### docs (9 skills)

| skill path | purpose |
| --- | --- |
| documentation/contributing | CONTRIBUTING.md, PR templates, code of conduct |
| documentation/internal | Architecture docs, system overviews, data flow diagrams |
| documentation/readme | Generate and update README files |
| documentation/report | Structured report generation (container) |
| documentation/report/analysis | Analysis reports |
| documentation/report/comparison | Comparison reports |
| documentation/report/research | Research reports |
| documentation/report/retro | Retrospective reports |
| documentation/report/status | Status reports |

### research (7 skills)

| skill path | purpose |
| --- | --- |
| research/api | Explore external APIs, compare options, plan integrations |
| research/codebase-analysis | Architecture mapping, pattern discovery, dependency analysis |
| research/competitors | Feature comparison, UX teardown, market positioning |
| research/market | Market sizing, user research synthesis, trend analysis |
| research/technologies | Evaluate technologies, migration feasibility |
| research/user-experience | Flow analysis, heuristic evaluation, usability |
| research/user-interface | Design system research, component patterns, visual design |

### editors (5 skills)

| skill path | purpose |
| --- | --- |
| editors/neovim | Config management, plugin setup, troubleshoot issues |
| editors/terminal | Shell config (zsh), CLI tool setup and configuration |
| editors/vscode | Settings & extensions, task/launch config |
| editors/xcode | Project config, scheme & target setup, signing |
| editors/zed | Settings & config, extension setup |

### security (1 skill)

| skill path | purpose |
| --- | --- |
| security/audit | Code security review, dependency audit, auth/authz review |

### meta (2 skills)

| skill path | purpose |
| --- | --- |
| skills/authoring | Create, validate, and improve skills |
| skills/marketplace | Validate marketplace.json integrity, manage versioning |

## Bundles

| Bundle | Plugins | Use case |
| --- | --- | --- |
| **full-stack-web** | git, planning, workflow, code-quality, api-data, project-scaffold, backend, web, integrations, devops, docs | Building web apps with Hono + React + Drizzle |
| **mobile-dev** | git, planning, workflow, code-quality, api-data, project-scaffold, mobile, integrations, backend, docs | Expo/iOS apps with a backend |
| **api-backend** | git, planning, workflow, code-quality, api-data, project-scaffold, backend, devops, docs | Pure API/backend work |
| **devops-infra** | git, devops, security, docs | CI/CD, deployment, infrastructure |
| **open-source** | git, planning, workflow, code-quality, docs, meta, security | Maintaining OSS projects |
| **research-strategy** | git, research, planning, workflow, docs | Research, analysis, planning |
| **all** | *(all 16 plugins)* | Everything |
