# Project-Type Playbooks
Use the project type as the input, not the current organization of an existing repo. These playbooks encode common project types in Luca's work; adapt to local toolchain constraints.

## Apple Apps: iOS, macOS, SwiftUI, UIKit, AppKit
Prefer Xcode/Tuist/SwiftPM conventions where the toolchain expects them.

```text
AppName/
  App/                 # app entry, scenes, app lifecycle, composition root
  Features/            # product features or domains
  Shared/              # design system, primitives, cross-feature utilities
  Data/                # persistence, repositories, sync, model adapters
  Platform/            # device APIs, permissions, system services
  Resources/           # assets, localization, previews/sample data
  Tests/
  UITests/
```

Guidance:
- Keep SwiftUI views with their view models or reducers when the feature is small; split only when files become hard to navigate.
- Put OS integrations behind narrow adapters in `Platform/`.
- Keep generated project files and build output out of authored source unless the toolchain owns them.
- For multi-target apps, structure by target at the project level and by feature inside each target.

## Web Apps and Dashboards
Use framework route conventions, then organize business logic by feature/domain.

```text
app/ or src/app/       # routes, layouts, server/client entrypoints
features/             # user-visible product areas
components/           # only truly shared UI primitives
lib/                  # framework glue and small cross-cutting helpers
server/               # server-only domain services when framework allows
styles/ or tokens/    # design tokens and global styling
tests/
e2e/
```

Guidance:
- Route folders are not domain ownership by themselves. Keep substantial business logic out of route files.
- Avoid a huge global `components/`; feature-specific UI belongs with the feature.
- Put dashboard-specific tables, filters, actions, and state handling in the owning feature, not in generic UI folders.

## Marketing Websites and Content Sites
Optimize for content ownership, page patterns, media, and build-time safety.

```text
src/
  pages/ or app/       # framework routes
  content/             # markdown, MDX, CMS schemas, collections
  sections/            # reusable page sections with content contracts
  components/          # shared primitives
  styles/
  media/               # source media when checked in
public/                # static public assets
```

Guidance:
- Keep content models explicit. Do not bury page copy in arbitrary components if non-engineers need to edit it.
- Separate page sections from low-level UI primitives.
- Keep SEO, metadata, sitemap, and structured-data logic discoverable.

## Expo and React Native
Respect Expo Router and native platform folders while keeping domain logic portable.

```text
app/                   # Expo Router routes
features/              # product domains
components/            # shared cross-feature UI primitives
native/                # native modules or platform bridges
assets/
hooks/                 # only cross-feature hooks
lib/                   # config, clients, framework glue
ios/
android/
```

Guidance:
- Do not scatter product logic through route files.
- Keep platform-specific behavior behind adapters or `.ios` / `.android` files.
- Keep design tokens and shared UI primitives small enough for repeated mobile use.

## Cloudflare and Full-Stack Services
Separate deployable Workers from shared packages. A queue consumer or cron job is a separate lifecycle, even when it shares code with the API.

```text
apps/
  web/
  api/
services/
  queue-worker/
  cron-worker/
packages/
  db/
  auth/
  config/
  domain/
infra/
  wrangler/
```

Guidance:
- Keep Workers thin at the edge; domain logic should be testable outside request handlers.
- Put bindings and environment parsing close to the Worker that consumes them.
- Do not add a shared package for every small helper. Shared packages need contracts.
- Keep migrations with the database package or the app that owns the database.

## CLIs and Developer Tools
Separate command parsing from core behavior so the tool can be tested without spawning processes.

```text
src/
  cli/                 # argument parsing, terminal IO, exit codes
  commands/            # command handlers
  core/                # business logic independent of terminal IO
  adapters/            # filesystem, network, git, platform APIs
  output/              # formatting, reporters, diagnostics
tests/
fixtures/
```

Guidance:
- Command handlers should orchestrate; core modules should do the work.
- Keep terminal formatting out of domain logic.
- Put golden fixtures under `fixtures/` only when multiple suites need them.

## Agent Skills and Plugins
Use plugin-owned skill directories as the source of truth. Generated marketplace/plugin files are outputs.

```text
plugins/
  <plugin>/
    skills/
      <skill>/
        SKILL.md
        references/
        scripts/
        assets/
    commands/
    documents/
plugin-groups.json
scripts/
```

Guidance:
- Keep each skill focused. Split detailed guidance into one-level `references/`.
- Do not create root-level `skills/` when the repo uses plugin-owned sources.
- Regenerate marketplace artifacts after source changes when the repo requires it.
- Do not install or symlink live skills unless explicitly asked.

## Home Assistant Integrations and Automation
Separate integration runtime code, fixtures, config examples, and operational docs.

```text
custom_components/
  <domain>/
    __init__.py
    config_flow.py
    coordinator.py
    sensor.py
    binary_sensor.py
    services.yaml
tests/
  fixtures/
examples/
docs/
```

Guidance:
- Follow Home Assistant platform file conventions; they are part of the runtime contract.
- Keep test fixtures anonymized and deterministic.
- Put example YAML under `examples/`, not mixed into production integration code.
- Keep recorder/state-history analysis scripts separate from integration runtime code.

## GitOps, Homelab, and Kubernetes
Separate desired state, reusable base manifests, environment overlays, secrets strategy, and operational docs.

```text
clusters/
  <cluster>/
    apps/
    infrastructure/
apps/
  <app>/
    base/
    overlays/
infra/
  controllers/
  storage/
  networking/
docs/
  runbooks/
```

Guidance:
- Keep cluster-specific overlays explicit. Do not hide environment differences in generated YAML blobs.
- Separate render-valid from live-healthy validation in docs and scripts.
- Keep secret references in manifests; keep secret material in the chosen secret system.
- Put runbooks next to the operational surface, not inside application source.
