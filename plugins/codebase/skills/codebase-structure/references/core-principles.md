# Core Structure Principles

## Boundary Order
Choose boundaries in this order:

1. **Deployable runtime**: app, Worker, native target, CLI binary, Home Assistant integration, Kubernetes app, or plugin package.
2. **Domain ownership**: account, billing, camera, occupancy, routing, publishing, planning, etc.
3. **Interface layer**: UI, API route, command, automation, background job, device adapter.
4. **Shared primitives**: design tokens, config loaders, test helpers, domain-agnostic utilities.

Do not start with generic folders. A tree full of `components`, `services`, `helpers`, `utils`, `models`, and `hooks` usually describes implementation technique, not product ownership.

## Top-Level Shape
Use stable top-level roots that answer lifecycle questions:

|Root|Use for|
|---|---|
|`apps/`|Deployable user-facing apps or app targets in a workspace|
|`services/`|Deployable non-UI services, queue workers, cron jobs, sync daemons|
|`packages/`|Reusable libraries with clear owners and public APIs|
|`integrations/`|External-system adapters when they are first-class products|
|`infra/` or `deploy/`|Terraform, Kubernetes, Helm, Kustomize, Wrangler deploy config, release manifests|
|`docs/`|Durable human documentation, decisions, runbooks, architecture notes|
|`scripts/`|Repo automation invoked by humans or CI|
|`tools/`|Developer tools that are built or maintained as code|
|`fixtures/`|Shared test fixtures that are intentionally cross-suite|

Not every repo needs every root. A single-platform app can be flatter. A monorepo earns more roots because each deployable has a separate lifecycle.

## Naming
- Name folders after owned concepts, not programming patterns.
- Prefer `billing`, `recording`, `occupancy`, `routing`, `publishing`, `settings`, or `devices` over `services` or `managers`.
- Avoid suffixes that hide responsibility: `Core`, `Common`, `Shared`, `Base`, `Utils`.
- If a shared package cannot state its public contract in one sentence, it is probably too broad.

## Shared Code Test
Move code to `packages/` or a shared module only when one of these is true:

- Two or more deployables import it today.
- Centralizing it prevents a correctness or security bug.
- It is a stable public abstraction with tests and documented ownership.

Otherwise keep it inside the app or domain that owns it. Premature shared packages create dependency knots and slow refactors.

## Tests
- Put fast unit tests next to the code when the ecosystem supports it.
- Put integration tests near the boundary they exercise, such as API routes, database adapters, device adapters, or queue handlers.
- Put end-to-end tests under `e2e/` or `tests/e2e/` when they cross deployables or drive UI.
- Keep test helpers scoped. A global test helper should earn its place by removing real duplication across suites.

## Configuration
- Keep checked-in defaults close to the runtime that consumes them.
- Keep secrets out of source. Provide examples only when they cannot leak real values.
- Separate local-only config from production deploy config.
- Validate runtime config at startup when the language/runtime supports it.

## Generated Files
- Keep generated artifacts in predictable generated roots or beside the owning source only when the toolchain requires it.
- Add a short comment or docs note for how generated files are produced.
- Do not edit generated files manually unless the repo convention explicitly requires checked-in output.

## Documentation
Use docs for decisions that change maintenance behavior:

- `docs/architecture/` for system shape and boundaries.
- `docs/runbooks/` for operational recovery.
- `docs/decisions/` for ADRs or durable trade-offs.
- Feature README files only when a folder has a non-obvious local workflow.

Do not add documentation to justify clutter. Fix the structure first.
