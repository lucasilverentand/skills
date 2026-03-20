# Skills

72 skills organized into 16 atomic plugins and 7 intent-based bundles for Claude Code.

**Plugins** are non-overlapping groups — each skill belongs to exactly one plugin.
**Bundles** are user-intent collections that reference plugins — a plugin can appear in multiple bundles.

## Plugins

<details>
<summary><strong>git</strong> — 9 skills</summary>

| Skill | Description |
| --- | --- |
| `git/branching` | Branch strategy, create/manage branches, rebase workflows, branch comparison |
| `git/cherry-pick` | Apply specific commits across branches for backports and selective merges |
| `git/committing` | Conventional commits, amend & fixup, pre-commit hooks |
| `git/history` | Search history (log, blame, bisect), diff analysis |
| `git/remote` | Manage remote repositories, sync forks, maintain remote-tracking branches |
| `git/worktree` | Create/manage worktrees, cleanup stale ones |
| `git/conflicts` | Resolve merge conflicts, conflict prevention |
| `git/stashing` | Save and restore work-in-progress changes without committing |
| `git/tagging` | Create and manage tags for releases, milestones, and version markers |

</details>

<details>
<summary><strong>planning</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `development/implementing` | Implement code based on a plan |
| `development/knowledge` | Record development learnings and manage ADRs |
| `development/planning` | Break down features into implementation plans and tasks |

</details>

<details>
<summary><strong>workflow</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `development/debugging` | Systematic root cause analysis, log analysis |
| `development/environment` | Bootstrap local dev setup, dev containers, tool version management |
| `development/refactoring` | Restructure, extract, and clean up code without changing external behavior |

</details>

<details>
<summary><strong>code-quality</strong> — 5 skills</summary>

| Skill | Description |
| --- | --- |
| `development/accessibility` | Audit components for WCAG compliance, fix a11y issues |
| `development/errors` | Error handling patterns, result types, error code standards |
| `development/performance` | Identify bottlenecks, bundle optimization, benchmarking |
| `development/testing` | Design test strategies and author tests (unit, integration, E2E) |
| `development/type-safety` | Tighten types, remove `any`, add Zod schemas |

</details>

<details>
<summary><strong>api-data</strong> — 2 skills</summary>

| Skill | Description |
| --- | --- |
| `development/api` | Design endpoints, generate OpenAPI specs, review consistency |
| `development/database` | Drizzle ORM patterns, schema design, queries, migrations |

</details>

<details>
<summary><strong>project-scaffold</strong> — 2 skills</summary>

| Skill | Description |
| --- | --- |
| `project/scaffolding` | Navigate, create, and maintain monorepo workspace packages |
| `project/structure` | Scaffold projects, monorepo setup, convention docs |

</details>

<details>
<summary><strong>deployment</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `deployment/cloudflare` | Deploy Workers/Pages, manage D1/KV/R2, configure DNS |
| `deployment/kubernetes` | Write/update manifests, Flux/GitOps deploys, scaling |
| `deployment/railway` | Deploy services, provision databases, multi-environment |

</details>

<details>
<summary><strong>infrastructure</strong> — 3 skills</summary>

| Skill | Description |
| --- | --- |
| `infrastructure/docker` | Write Dockerfiles, image optimization, debug containers |
| `infrastructure/gitops` | Flux CD management, repo structure, reconciliation |
| `infrastructure/secrets` | Secret scanning, rotation, vault/store setup |

</details>

<details>
<summary><strong>docs</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `documentation/writing` | READMEs, contributing guides, architecture overviews, GitHub templates |

</details>

<details>
<summary><strong>research</strong> — 6 skills</summary>

| Skill | Description |
| --- | --- |
| `research/codebase` | Architecture mapping, pattern discovery, dependency analysis |
| `research/competitor` | Feature comparison, UX teardown, market positioning |
| `research/technology` | Evaluate technologies, migration feasibility |
| `research/api` | Explore external APIs, compare options, plan integrations |
| `research/market` | Market sizing, user research synthesis, trend analysis |
| `research/ux` | UI/UX research — design systems, component patterns, usability |

</details>

<details>
<summary><strong>editors</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `editor` | Config management across VS Code, Zed, Neovim, and Xcode |

</details>

<details>
<summary><strong>communication</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `communication/discord` | Discord bots, webhooks, channel management |

</details>

<details>
<summary><strong>macos</strong> — 4 skills</summary>

| Skill | Description |
| --- | --- |
| `macos/data` | SwiftData persistence — models, queries, migrations, ModelContainer |
| `macos/patterns` | macOS SwiftUI patterns — windows, MenuBarExtra, Settings, toolbars, sandboxing |
| `macos/state` | SwiftUI state management — @Observable, @State, @Environment, @Binding |
| `macos/views` | SwiftUI view composition, layout, modifiers, animations, liquid glass |

</details>

<details>
<summary><strong>security</strong> — 1 skill</summary>

| Skill | Description |
| --- | --- |
| `security/audit` | Code security review, dependency audit, auth/authz review |

</details>

<details>
<summary><strong>meta</strong> — 2 skills</summary>

| Skill | Description |
| --- | --- |
| `skills/authoring` | Create, test, publish, and maintain agent skills |
| `skills/retrospecting` | Mine conversations and code changes for struggles, turn findings into skills |

</details>

## Bundles

<details>
<summary><strong>Bundle reference</strong></summary>

| Bundle | Plugins | Use case |
| --- | --- | --- |
| **full-stack-web** | git, planning, workflow, code-quality, api-data, project-scaffold, deployment, infrastructure, docs | Building web apps with Hono + React + Drizzle |
| **mobile-dev** | git, planning, workflow, code-quality, api-data, project-scaffold, macos, docs | Expo/iOS apps with a backend |
| **api-backend** | git, planning, workflow, code-quality, api-data, project-scaffold, deployment, docs | Pure API/backend work |
| **devops-infra** | git, deployment, infrastructure, security, docs | CI/CD, deployment, infrastructure |
| **open-source** | git, planning, workflow, code-quality, docs, meta, security | Maintaining OSS projects |
| **research-strategy** | git, research, planning, workflow, docs | Research, analysis, planning |
| **all** | *(all 16 plugins)* | Everything |

</details>

## Skill structure

Each skill follows a standard layout:

```
skills/<category>/<skill-name>/
├── SKILL.md          # Main skill instructions
├── references/       # Supporting reference docs
└── tools/            # Automation scripts
```

- **SKILL.md** — the core instructions Claude follows when the skill is triggered
- **references/** — detailed reference material loaded on demand
- **tools/** — scripts that extend Claude's capabilities for the skill
