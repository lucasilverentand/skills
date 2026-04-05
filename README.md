# Skills

39 skills organized into 12 plugins and 7 intent-based bundles for Claude Code and Codex.

**Plugins** are non-overlapping groups — each skill belongs to exactly one plugin.
**Bundles** are user-intent collections that reference plugins — a plugin can appear in multiple bundles.

## Plugins

<details>
<summary><strong>development</strong> — 10 skills</summary>

| Skill | Description |
| --- | --- |
| `development/typescript/api` | API design, OpenAPI specs, Hono implementation tooling |
| `development/typescript/database` | Drizzle ORM patterns, schema design, queries, migrations |
| `development/typescript/errors` | Result type error handling, error codes, migration from throws |
| `development/typescript/type-safety` | Tighten types, remove `any`, add Zod schemas |
| `development/typescript/workers` | Local Cloudflare Workers dev, .dev.vars, D1 migrations, process-compose |
| `development/swift/data` | SwiftData persistence — models, queries, migrations |
| `development/swift/patterns` | macOS-specific SwiftUI — windows, MenuBarExtra, Settings, toolbars |
| `development/swift/state` | SwiftUI state management — @Observable, @State, @Environment |
| `development/swift/views` | SwiftUI view composition, layout, animations, liquid glass |
| `development/testing` | Test strategy, authoring, CI config (Bun, Playwright, Maestro, Swift Testing) |

</details>

<details>
<summary><strong>project</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `project/description` | Generate project overviews from codebase scanning |
| `project/scaffolding` | Navigate, create, and maintain monorepo workspace packages |
| `project/structure` | Scaffold projects, monorepo setup, bun workspaces |

</details>

<details>
<summary><strong>deployment</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `deployment/cloudflare` | Deploy Workers/Pages, manage D1/KV/R2, Service Bindings, Queues, Cron Triggers |
| `deployment/kubernetes` | Write/update manifests, Flux/GitOps deploys, debug pods |
| `deployment/railway` | Deploy services, provision databases, multi-environment config |

</details>

<details>
<summary><strong>infrastructure</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `infrastructure/docker` | Write Dockerfiles, image optimization, debug containers |
| `infrastructure/gitops` | Flux CD management, repo structure, reconciliation |
| `infrastructure/secrets` | Secret scanning, rotation, Doppler setup |

</details>

<details>
<summary><strong>security</strong> — 4 skills</summary>

| Skill | Description |
| --- | --- |
| `security/agent-safety` | No-secrets-on-disk architecture, forbidden commands, safe patterns |
| `security/audit` | OWASP Top 10 code scanning, secret detection, dependency CVEs, permission matrix |
| `security/scan` | Automated SAST/DAST with semgrep, nuclei, ZAP — built-in fallback scanners |
| `security/supply-chain` | Dependency review, lockfile integrity, action pinning |

</details>

<details>
<summary><strong>research</strong> — 6 skills</summary>

| Skill | Description |
| --- | --- |
| `research/api` | Explore external APIs, compare SDKs, plan integrations |
| `research/codebase` | Architecture mapping, pattern discovery, impact analysis |
| `research/competitor` | Feature comparison, UX teardown, market positioning |
| `research/market` | Market sizing, user research synthesis, trend analysis |
| `research/technology` | Evaluate technologies, migration feasibility, dependency health |
| `research/ux` | UI/UX research — design systems, accessibility, user flows |

</details>

<details>
<summary><strong>documentation</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `documentation/coauthoring` | 3-stage co-authoring workflow for specs, RFCs, proposals |
| `documentation/project-docs` | Interactive project documentation generation |
| `documentation/style` | Voice, tone, and formatting standards |

</details>

<details>
<summary><strong>git</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `git` | Branching, commits, and repo cleanup conventions |

</details>

<details>
<summary><strong>github</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `github` | PR workflow — clean history, structured descriptions, draft-first |

</details>

<details>
<summary><strong>editor</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `editor` | VS Code, Zed, Neovim, and Xcode configuration |

</details>

<details>
<summary><strong>communication</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `communication/discord` | Discord webhooks, embeds, polls, threads |

</details>

<details>
<summary><strong>skills</strong> — 2 skills</summary>

| Skill | Description |
| --- | --- |
| `skills/authoring` | Create, test, publish, and maintain agent skills |
| `skills/retrospecting` | Mine conversations and git history for patterns, turn into skills |

</details>

## Bundles

| Bundle | Plugins | Use case |
| --- | --- | --- |
| **full-stack-web** | git, development, project, deployment, infrastructure, security, documentation | Building web apps with Hono + React + Drizzle |
| **mobile-dev** | git, development, project, communication, security, documentation | Expo/iOS/macOS apps with a backend |
| **api-backend** | git, development, project, deployment, infrastructure, security, documentation | Pure API/backend work |
| **devops-infra** | git, deployment, infrastructure, security, documentation | CI/CD, infrastructure |
| **open-source** | git, development, documentation, skills, security | Maintaining OSS projects |
| **research-strategy** | git, research, development, security, documentation | Research, analysis, planning |
| **all** | *(all 12 plugins)* | Everything |

## Generated metadata

`bun run generate` writes both of the repo's generated metadata targets:

- `.claude-plugin/marketplace.json` for the existing Claude-style multi-plugin marketplace output
- `.codex-plugin/plugin.json` for the new Codex/OpenAI plugin manifest

The skills themselves still live in `skills/`, and the Claude marketplace grouping remains the source of truth for category/bundle organization.

## Skill structure

```
skills/<category>/<skill-name>/
├── SKILL.md          # Main skill instructions
├── references/       # Supporting reference docs
└── tools/            # Automation scripts
```
