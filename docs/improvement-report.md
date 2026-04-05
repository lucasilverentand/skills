# Skills Library Improvement Report

**Date:** 2026-04-03
**Branch:** `feat/project-docs-skill`
**Commits:** 32
**Files changed:** 89
**Lines added:** 1,113 | **Lines removed:** 918

---

## 1. Platform Reorganization

### 1.1 Reorganize development skills by platform (`2d77f79`)

**What changed:** Restructured `development/` from a flat layout (api, database, errors, testing, type-safety, workers) into platform subdirectories:

```
development/
├── typescript/   ← api, database, errors, type-safety, workers
├── swift/        ← data, patterns, state, views (moved from macos/)
└── testing/      ← stays top-level (cross-cutting)
```

**Why:** The flat structure mixed TypeScript-only skills with cross-platform ones. The user works across TypeScript, Swift, and Rust — organizing by platform makes it clear which skills apply to which stack. The separate `macos/` top-level directory was also misleading since the Swift skills (views, data, state) apply to iOS too.

**Files:** 47 files (all moves + marketplace.json update)

### 1.2 Broaden Swift skill descriptions to include iOS (`88c5b88`)

**What changed:** Updated `description` fields in `views`, `data`, and `state` from "macOS apps" to "iOS and macOS apps."

**Why:** These skills contain SwiftUI fundamentals (layout, SwiftData, @Observable) that apply equally to iOS. The macOS-only description prevented triggering when working on iOS projects. The `patterns` skill was left macOS-only since it covers genuinely platform-specific APIs (MenuBarExtra, window management, NSViewRepresentable).

**Files:** `development/swift/views/SKILL.md`, `development/swift/data/SKILL.md`, `development/swift/state/SKILL.md`

### 1.3 Update stale cross-reference paths (`88da9ee`)

**What changed:** Fixed 7 files that still referenced old flat paths like `development/api` instead of `development/typescript/api`.

**Why:** The platform reorg moved skills but didn't update cross-references in other skills. An agent following these links would fail to find the referenced content.

**Files:** errors SKILL.md, api SKILL.md, workers-project.md, schema.md, auth.md, react-dashboard.md, structure SKILL.md

### 1.4 Fix nonexistent project/parts/* references (`f5796a2`)

**What changed:** The structure skill's monorepo layout diagram pointed to `project/parts/config`, `project/parts/auth`, etc. — a directory that never existed. Updated all 9 pointers to `project/scaffolding/references/*.md` and rewrote the "how parts plug in" section.

**Why:** Agents following the structure skill's setup instructions would be sent to nonexistent skill paths.

**Files:** `project/structure/SKILL.md`

---

## 2. Stack Alignment — Removing Non-Stack Tools

### 2.1 Remove npm/pnpm from lockfile policy and git skill (`2d77f79`, `8b13bea`)

**What changed:** Stripped npm and pnpm sections from `lockfile-policy.md` (tables, CI examples, notes). Changed git skill from `bun install` / `npm install` to just `bun install`.

**Why:** The user uses Bun exclusively. npm/pnpm sections add token cost when the skill is loaded and could mislead agents into using the wrong package manager.

**Files:** `security/supply-chain/references/lockfile-policy.md`, `git/SKILL.md`, `security/supply-chain/SKILL.md`

### 2.2 Remove Vitest from testing skill (`8b13bea`)

**What changed:** Replaced "Bun/Vitest" with "Bun test" in the description and removed Vitest from the runner configuration section.

**Why:** Bun's built-in test runner is the standard. Vitest is not used.

**Files:** `development/testing/SKILL.md`

### 2.3 Remove Express/Fastify/NestJS references (`2d77f79`, `384462a`)

**What changed:** Removed Express from errors skill ("Hono/Express middleware" → "Hono middleware"), audit skill permission matrix description, and route-lint.ts help text. Removed Fastify/NestJS from audit tool description.

**Why:** Hono is the only API framework. Mentioning Express in skill content suggests it's a valid choice. The audit/scan tools that detect multiple frameworks were left untouched since they analyze arbitrary codebases.

**Files:** `development/typescript/errors/SKILL.md`, `security/audit/SKILL.md`, `development/typescript/api/tools/route-lint.ts`

### 2.4 Remove Python and Go from editor configs (`195a93e`, `babe392`)

**What changed:** Removed ~234 lines across 5 editor reference files:
- Neovim: Python (basedpyright + ruff) and Go (gopls) LSP configs, debug adapter configs, formatter configs, treesitter parsers, Mason ensure_installed entries
- Zed: Python and Go extension recommendations, LSP configs, built-in support table entries

Added `swift_format` to Neovim conform.nvim config.

**Why:** The user works in TypeScript, Swift, and Rust — not Python or Go. Every line of Python/Go config is wasted tokens when the editor skill is loaded.

**Files:** `editor/SKILL.md`, `editor/references/nvim-lsp-configs.md`, `editor/references/nvim-plugin-configs.md`, `editor/references/nvim-dap-configs.md`, `editor/references/zed-lsp-configs.md`, `editor/references/zed-extensions.md`

### 2.5 Replace npx with bunx (`48f6648`)

**What changed:** `npx expo start` → `bunx expo start` in Maestro reference. `npx expo install` → `bunx expo install` and `npx web-push` → `bunx web-push` in notifications reference.

**Why:** Bun is the package manager. Agents following these examples would invoke npx instead of bunx.

**Files:** `development/testing/references/maestro.md`, `project/scaffolding/references/notifications.md`

### 2.6 Replace .next with .astro in Zed scan exclusions (`195a93e`)

**What changed:** Zed file scan exclusions example: `"**/.next"` → `"**/.astro"`.

**Why:** The user uses Astro, not Next.js.

**Files:** `editor/SKILL.md`

### 2.7 Replace Vercel OG with Cloudflare satori (`38bdca3`)

**What changed:** OG image generation suggestion changed from `@vercel/og` to `@cloudflare/pages-plugin-satori`.

**Why:** The user deploys to Cloudflare, not Vercel.

**Files:** `project/scaffolding/references/website.md`

### 2.8 Remove generic framework list from API skill (`4f01d09`)

**What changed:** "Use your language's validation library (Zod in TS, Pydantic in Python, serde in Rust, Codable in Swift, etc.)" → "Use Zod for validation — derive TypeScript types from schemas, not the other way around."

**Why:** This is a TypeScript API skill under `development/typescript/`. Listing 4 languages dilutes the instruction.

**Files:** `development/typescript/api/SKILL.md`

---

## 3. Convention Alignment — Config, Secrets, Env

### 3.1 Use @scope/config instead of process.env (`d418bb6`, `4f01d09`, `f3e5f0c`)

**What changed:** Updated code examples in auth.md, payments.md, schema.md, logging.md, and api-keys.md to import `env` from `@scope/config` instead of reading `process.env` directly. Left build-time config files (drizzle.config.ts, playwright.config.ts) unchanged with a clarifying comment.

**Why:** The scaffolding skill's `config.md` says "never read `process.env` directly outside the config package." Multiple reference files violated this, teaching agents the wrong pattern. The api-keys function was refactored to accept `isProduction: boolean` as a parameter so it works in both Workers (`c.env`) and Bun (`@scope/config`) contexts.

**Files:** `project/scaffolding/references/auth.md`, `project/scaffolding/references/payments.md`, `project/scaffolding/references/schema.md`, `development/typescript/api/references/logging.md`, `development/typescript/api/references/api-keys.md`

### 3.2 Fix Railway env strategy to reference Doppler (`8b13bea`)

**What changed:** Railway skill's development environment strategy changed from "local overrides via `.env` (gitignored)" to "secrets injected via Doppler, non-secret config in `.dev.vars` (gitignored)."

**Why:** Contradicted the agent-safety skill's no-secrets-on-disk architecture.

**Files:** `deployment/railway/SKILL.md`

### 3.3 Add OrbStack as local container runtime (`4c41388`)

**What changed:** Added a callout to the Docker skill: "Local runtime: OrbStack, not Docker Desktop."

**Why:** The user's CLAUDE.md specifies OrbStack for containers but no skill mentioned it.

**Files:** `infrastructure/docker/SKILL.md`

### 3.4 Align logger with conventions (`a8deb11`)

**What changed:** Logger reference: `crypto.randomUUID()` → `nanoid(12)` for request IDs (matching API middleware). Refactored `setupLogger()` to accept config as params instead of reading `process.env`. Renamed "Node/Bun" to "Bun."

**Why:** The API middleware uses nanoid(12) for request IDs, but the logger suggested UUID. The function directly read `process.env` violating the config package convention.

**Files:** `project/scaffolding/references/logger.md`

---

## 4. Security — SHA Pinning

### 4.1 Pin GitHub Actions to SHA in CI example (`1dbc82a`)

**What changed:** The testing skill's CI workflow template used `actions/checkout@v4` and `oven-sh/setup-bun@v2` while the rule below it said "never use tags." Fixed to use SHA-pinned actions with version comments.

**Why:** The example contradicted its own rule. Agents copying this template would use unpinned actions.

**Files:** `development/testing/SKILL.md`

### 4.2 Pin GitHub Actions in repo's own CI workflows (`379dc2b`)

**What changed:** All 3 CI workflows (validate.yml, claude.yml, claude-code-review.yml) pinned `actions/checkout` and `anthropics/claude-code-action` to commit SHA.

**Why:** The supply-chain skill requires SHA pinning but the repo's own workflows violated it.

**Files:** `.github/workflows/validate.yml`, `.github/workflows/claude.yml`, `.github/workflows/claude-code-review.yml`

---

## 5. Trimming Redundancy

### 5.1 Remove dead documentation skill references (`12a3451`)

**What changed:** The style skill's decision tree pointed to 4 nonexistent skills (`developer-docs`, `internal-docs`, `reports`, `external-docs`). Replaced with links to the actual `coauthoring` and `project-docs` skills.

**Why:** Dead links that would confuse agents trying to follow them.

**Files:** `documentation/style/SKILL.md`, `documentation/style/references/voice-and-tone.md`

### 5.2 Trim discord and coauthoring redundancy (`bce88a8`)

**What changed:** Discord: merged duplicate "Validation before sending" and "Constraints" sections into a single "Limits" block. Coauthoring: collapsed 28-line "Tips for Effective Guidance" into 5-line "Operating Rules."

**Why:** The discord skill had the same limits listed twice. The coauthoring tips repeated guidance already given inline in each stage.

**Files:** `communication/discord/SKILL.md`, `documentation/coauthoring/SKILL.md`

### 5.3 Remove redundant PURPOSE.md files (`0bae518`)

**What changed:** Deleted `development/workers/PURPOSE.md` and `security/scan/PURPOSE.md`.

**Why:** Their content duplicated the SKILL.md description and decision tree. The scan PURPOSE.md also had a stale eslint-plugin-security reference.

**Files:** 2 files deleted

### 5.4 Remove co-authoring-workflow.md duplicate (`1d75bad`)

**What changed:** Deleted the 208-line `documentation/style/references/co-authoring-workflow.md` and removed the duplicate decision tree entry in style SKILL.md.

**Why:** It was a near-complete duplicate of the `coauthoring` SKILL.md (297 lines). The same 3-stage workflow existed in two places, doubling token cost when loaded.

**Files:** `documentation/style/references/co-authoring-workflow.md` (deleted), `documentation/style/SKILL.md`

### 5.5 Extract sandboxing section to reference (`84c2403`)

**What changed:** Moved Sandboxing, File Access, and Drag & Drop (~120 lines) from swift/patterns SKILL.md into `references/sandboxing.md`. Brought SKILL.md from 569 lines to 448.

**Why:** The validator flagged it as over the 500-line limit. The extracted content is self-contained and doesn't need to be in the main skill file.

**Files:** `development/swift/patterns/SKILL.md`, `development/swift/patterns/references/sandboxing.md` (new)

### 5.6 Remove dead debugging cross-reference (`384462a`)

**What changed:** Removed `development/debugging` cross-reference from agent-safety SKILL.md.

**Why:** No debugging skill exists.

**Files:** `security/agent-safety/SKILL.md`

---

## 6. Adding Missing Conventions

### 6.1 Add nanostores to TanStack Router app reference (`0bae518`)

**What changed:** Added a "Client state" section with nanostores usage example to `tanstack-app.md`.

**Why:** The react-dashboard reference already had nanostores for client state, and the expo-app had Zustand. The TanStack Router app was the only web scaffold missing client state guidance. Per CLAUDE.md: "Nanostores / signals for client state, TanStack Query for server state."

**Files:** `project/scaffolding/references/tanstack-app.md`

### 6.2 Add Expo config snippet (`38bdca3`)

**What changed:** Replaced the vague "Enable New Architecture and React Compiler in app.config.ts" with an actual config snippet showing `newArchEnabled: true` and `experiments: { reactCompiler: true, typedRoutes: true }`.

**Why:** The instruction was too vague for an agent to act on. Per CLAUDE.md: "New Architecture + React Compiler enabled."

**Files:** `project/scaffolding/references/expo-app.md`

### 6.3 Add proactive CI fix convention (`b6b9a6f`)

**What changed:** Added "Fix before shipping" as both a pre-flight step and a PR convention in the github skill. Agents should verify `bun run check`, `bun run typecheck`, and `bun test` pass before creating PRs.

**Why:** Encodes the CLAUDE.md rule: "Fix broken things proactively — if CI checks are failing (tests, lint, typecheck), fix them as part of the current work since they block merging anyway."

**Files:** `github/SKILL.md`

### 6.4 Add commit-after-each-piece-of-work convention (`7dc3997`)

**What changed:** Added lead instruction to the git skill's commits section: "Commit after completing each distinct piece of work — don't batch unrelated changes and don't wait until asked."

**Why:** Encodes the CLAUDE.md rule. Without it, agents might accumulate changes into one big commit or not commit until asked.

**Files:** `git/SKILL.md`

### 6.5 Add "Use when" trigger clauses to 5 skills (`1a05903`)

**What changed:** Fixed descriptions for database, coauthoring, style, git, and github skills to include a standardized "Use when" clause.

**Why:** The marketplace validator flagged these. The "Use when" clause is what Claude matches against user intent — without it, skills are less likely to trigger correctly. "Trigger when" and "Use for" variants were also normalized to "Use when" for consistency.

**Files:** 5 SKILL.md files

### 6.6 Add workers prerequisites section (`87bbf72`)

**What changed:** Added a prerequisites check before the bootstrap sequence: verify bun, doppler, process-compose, and mise are installed, with `brew install` commands.

**Why:** The bootstrap section assumed all tools were present. An agent running first-time setup on a fresh machine would hit "command not found" with no recovery guidance.

**Files:** `development/typescript/workers/SKILL.md`

---

## 7. Marketplace and Generator

### 7.1 Normalize plugin categories to devtools (`67dfea9`)

**What changed:** Changed the `project` plugin category from `web-development` to `devtools`. Updated the authoring skill's category mapping and marketplace-errors.md valid category list.

**Why:** The project plugin was the only one using `web-development`. Project skills (description, scaffolding, structure) apply to any project type, not just web.

**Files:** `.claude-plugin/marketplace.json`, `skills/authoring/SKILL.md`, `skills/authoring/references/marketplace-errors.md`

### 7.2 Fix stale macos plugin in bundle config (`4af4084`)

**What changed:** Removed `macos` from the `mobile-dev` bundle in `plugin-config.ts` and removed the `project: "web-development"` category override. Regenerated marketplace.json.

**Why:** The generator's source of truth (`plugin-config.ts`) still referenced the deleted `macos` plugin, causing `bun run generate -- --check` to fail.

**Files:** `scripts/plugin-config.ts`, `.claude-plugin/marketplace.json`

### 7.3 Group skills by platform in generated descriptions (`4567a20`)

**What changed:** Enhanced `buildPluginDescription()` in the generator to group skills by subdirectory when a plugin has nested structure. The development plugin description now reads `"Development toolkit: testing, Swift (data, patterns, state, views), Typescript (api, database, errors, type-safety, workers)"` instead of a flat alphabetical list.

**Why:** The flat list lost the platform grouping that the reorganization was meant to communicate.

**Files:** `scripts/generate-marketplace.ts`, `.claude-plugin/marketplace.json`

### 7.4 Remove stale PURPOSE.md check from skill review workflow (`379dc2b`)

**What changed:** Removed "Has PURPOSE.md with responsibilities and tools list" from the claude-code-review.yml skill review prompt.

**Why:** PURPOSE.md files were deleted as redundant.

**Files:** `.github/workflows/claude-code-review.yml`

---

## 8. Documentation

### 8.1 Add project CLAUDE.md (`6dd89fa`)

**What changed:** Created a project-level CLAUDE.md with validation commands, skill structure conventions, and stack alignment rules.

**Why:** Agents editing this repo had no project-level instructions. The CLAUDE.md encodes the standards applied across all 32 improvement commits so future edits stay consistent.

**Files:** `CLAUDE.md` (new)

### 8.2 Rewrite README (`0a508f2`)

**What changed:** Complete rewrite. Old README described 73 skills in 16 plugins with paths that no longer exist (git/branching, development/debugging, macos/*, etc.). New README accurately reflects 38 skills in 12 plugins with correct paths and descriptions.

**Why:** The README was the most visibly stale artifact in the repo.

**Files:** `README.md`

---

## Summary by Category

| Category | Commits | Impact |
|---|---|---|
| Platform reorganization | 4 | Clearer structure, correct cross-references |
| Remove non-stack tools | 8 | ~350 lines removed, no misleading framework mentions |
| Convention alignment (config/secrets) | 5 | Consistent @scope/config, Doppler, OrbStack patterns |
| Security (SHA pinning) | 2 | CI examples and repo workflows follow supply-chain rules |
| Trimming redundancy | 6 | ~450 lines removed, no duplicate content |
| Adding missing conventions | 6 | Key workflow preferences now encoded in skills |
| Marketplace and generator | 4 | Clean validation, platform-grouped descriptions |
| Documentation | 2 | Accurate README, project-level CLAUDE.md |
