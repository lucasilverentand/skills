# Planner project structure
This is the reusable Linear planning structure that replaced the live "Project Planning Template" project. Use it to create fresh Linear records for a specific product. Do not store these as reusable live issues in Linear.

For labels, priorities, milestones, parent issues, related issues, blockers, and status updates, use `../../issue-authoring/references/issue-rules.md` and `../../issue-authoring/references/linear.md`.

## Project defaults
|Field|Value|
|---|---|
|Project name|`<Product> Planning` unless the user gives another name|
|Project status|Planning|
|Initiative|The matching product initiative|
|Lead|User-provided lead, or leave unset|
|Cycle|Do not set by default|
|Base labels|`<Product>`, `Planning` where useful|

## Project type profiles
Choose one primary profile before creating issues. For mixed products, keep one planning project and mention secondary surfaces in the relevant issue descriptions.

|Profile|Use for|Planning emphasis|
|---|---|---|
|Web product|Browser apps, marketing-backed SaaS, dashboards, customer portals|Browser support, frontend stack, hosting, SEO where relevant, analytics, accessibility, API boundaries.|
|Native mobile or tablet|iOS, iPadOS, Android, cross-platform mobile apps|Store distribution, OS targets, permissions, push, offline/sync, native capabilities, crash reporting, review constraints.|
|Native desktop|macOS, Windows, Linux, menu bar apps, desktop utilities|Installer/signing/notarization, auto-update, OS integration, filesystem access, background behavior, crash reporting.|
|Backend, API, or service|APIs, workers, sync engines, internal services|Client contracts, data model, jobs/queues, rate limits, auth/service accounts, SLAs, observability, operational runbooks.|
|Automation, CLI, or internal tool|CLIs, scripts, schedulers, operator tooling|Packaging, credentials, audit logs, retries, idempotency, dry-run behavior, operator UX, support handoff.|
|AI, agent, or data product|Agent workflows, model-backed features, analytics/data products|Model/provider choice, evals, prompt/versioning, data retention, safety boundaries, inference cost, human review.|
|Integration-heavy or other|Browser extensions, plugins, hardware-adjacent work, vendor integrations|Host platform rules, protocol/API limits, permissions, vendor failure modes, portability, support and fallback paths.|

## Milestones
|Order|Name|Purpose|
|---|---|---|
|0|Phase 0 — Frame|Pin down what we are building and who it is for.|
|1|Phase 1 — Decide|Record the product, system, data, auth, privacy, cost, observability, and security decisions.|
|2|Phase 2 — Living docs|Create the docs that stay alive through execution.|
|3|Phase 3 — Foundation|Create the repo, environments, testing, CI/CD, and observability foundation.|
|4|Phase 4 — Gate|Close planning and explicitly approve execution.|

## Issue records
Replace `<Product>` in labels and wording with the actual product label. Keep issue titles, milestone placement, priority, estimates, acceptance criteria, and out-of-scope boundaries.

The issue set is intentionally platform-neutral. Adapt each issue description with the chosen project type profile instead of creating separate web-only, native-only, backend-only, or tool-only variants.

### Phase 0 — Frame
|Title|Priority|Estimate|Labels|
|---|---|---|---|
|Define product brief|High|4|`<Product>`, Documentation, Planning|
|Choose target platform|High|2|`<Product>`, Documentation, Planning|
|Confirm or override tech stack|High|2|`<Product>`, Infrastructure, Documentation, Planning|
|Define success metrics|Medium|2|`<Product>`, Analytics, Documentation, Planning|
|Scan prior art and competitors|Medium|4|`<Product>`, Documentation, Research|

#### Define product brief
Context: The brief is the downstream source for architecture, scope, metrics, risks, assumptions, and kill conditions.
Goal: A short written brief covering audience, problem, value, MVP scope, non-goals, bets, and stop conditions.
Approach: Write after prior-art scanning. Keep it compact. State conclusions. End with key bets and kill conditions, and flag the least-certain bet.
Acceptance criteria:
- Target audience defined.
- Problem statement written.
- Value proposition written.
- MVP scope listed as 3-7 capabilities with one-line justification.
- Non-goals listed with what would reopen them.
- 3-5 key bets listed.
- Most-uncertain bet flagged.
- Kill conditions listed.
- Brief lives at the agreed location and is linked from the issue.
Out of scope: naming, branding, detailed user flows, pricing model.

#### Choose target platform
Goal: A defended v1 platform choice tied to where users actually are.
Acceptance criteria:
- Primary project type profile chosen.
- Primary platform or surface chosen.
- Secondary surfaces decided or deferred with rationale.
- Capability requirements listed.
- Minimum OS or browser versions chosen.
- Store, hosting, package, or distribution model decided.
- Platform-specific constraints and review risks listed.
- Decision recorded as a Linear ADR or project decision document.
Out of scope: UI library choices, native module selection.

#### Confirm or override tech stack
Goal: A one-pager stating the v1 stack, with overrides justified.
Acceptance criteria:
- Runtime/language, app framework, API or backend framework, persistence, auth or identity model, validation, package/build tooling, hosting or distribution target, state/sync model, and storage confirmed or explicitly marked not applicable.
- Native capability bridges, SDKs, background execution, and store tooling decided where relevant.
- Crash reporting, analytics, and observability libraries chosen where relevant.
- Each override carries a one-line rationale.
- Decision recorded as a Linear ADR or project decision document.
Default web/API stack to evaluate: Bun, Hono, Drizzle, Better Auth, Tailwind, Biome, Cloudflare, Zod. For native, backend-only, automation, AI, data, or integration-heavy projects, evaluate only the pieces that apply and use the platform's normal build, packaging, and distribution tools.
Out of scope: exact package versions, code style minutiae.

#### Define success metrics
Goal: Three to five v1 success signals with target value, timeframe, and measurement method.
Acceptance criteria:
- 3-5 success signals listed.
- Each has target value, timeframe, and measurement method.
- At least one activation metric and one retention metric included.
- At least one qualitative signal included.
- Document lives at agreed location and is linked from the product brief.
Out of scope: long-term revenue or LTV KPIs before monetization exists.

#### Scan prior art and competitors
Goal: A summary of five closest competitors or adjacent products, their strengths, weaknesses, and the product's differentiated position.
Acceptance criteria:
- Five competitors or prior-art products identified with links.
- For each: audience, pricing, what they do well, and what is weak.
- One-paragraph positioning statement.
- Findings linked from the product brief.
Out of scope: feature parity analysis, full market sizing.

### Phase 1 — Decide
|Title|Priority|Estimate|Labels|
|---|---|---|---|
|Map core user flows|High|4|`<Product>`, User Experience, Documentation, Planning|
|Design initial data model|High|4|`<Product>`, Data, Documentation, Planning|
|Sketch system architecture|High|4|`<Product>`, Infrastructure, Documentation, Planning|
|Pick auth and identity model|High|4|`<Product>`, Documentation, Auth, Security, Planning|
|Decide privacy and compliance posture|High|4|`<Product>`, Documentation, Legal, Security, Planning|
|Build cost model and budget guardrails|Medium|4|`<Product>`, Infrastructure, Billing, Documentation, Planning|
|Choose observability stack|Medium|2|`<Product>`, Observability, Documentation, Planning|
|Run security sanity check|Medium|2|`<Product>`, Documentation, Security, Planning|

#### Map core user flows
Goal: A document covering two to five primary happy paths plus edge and failure paths that change scope, architecture, or MVP shape.
Acceptance criteria: primary journeys mapped trigger-to-success, platform-specific entry points listed, meaningful edge cases listed, failure paths listed, offline/background behavior described where relevant, document linked from product brief.
Out of scope: pixel-level UX, every theoretical edge case.

#### Design initial data model
Goal: First-cut model with entities, key fields, relationships, meaningful state machines, tenancy, ID, soft-delete, audit, and timestamp decisions.
Acceptance criteria: core entities, relationships, state machines, tenancy boundary, ID strategy, soft-delete posture, audit posture, timestamps, local/offline data needs where relevant, sync/cache rules where relevant, Mermaid ER or equivalent diagram, Linear data model document, ADR.
Out of scope: indexing strategy, migration strategy.

#### Sketch system architecture
Goal: One-page architecture overview with 3-7 components, interactions, trust boundaries, external dependencies, and real-time/sync model.
Acceptance criteria: component responsibilities, surface/client responsibilities where relevant, interaction diagram with payload and sync/async notes, trust boundaries, external dependencies, native bridges/background jobs/vendor APIs where relevant, Mermaid C4 container-level diagram, ADR.
Out of scope: code-level file structure, specific API endpoints.

#### Pick auth and identity model
Goal: Decided identity model covering user types, sign-in, sessions, recovery, deletion, guest access, and multi-device behavior.
Acceptance criteria: user types, sign-in methods, session or token strategy, recovery, deletion, anonymous/guest posture, device identity or service accounts where relevant, multi-device policy, Better Auth or equivalent config sketch, ADR.
Out of scope: per-resource authorization, SSO/SAML unless v1 needs it.

#### Decide privacy and compliance posture
Goal: Short posture statement covering data residency, regulatory exposure, retention, consent, and deletion behavior.
Acceptance criteria: data categories, residency, retention, consent surfaces, platform permissions and store privacy disclosures where relevant, GDPR/CCPA/COPPA applicability, account deletion, data export/DSAR, privacy policy and ToS target date, ADR.
Out of scope: final legal text, SOC2/ISO.

#### Build cost model and budget guardrails
Goal: Cost per active user at 10, 1k, and 100k users; dominant cost drivers; provider budget alarms; monetization posture.
Acceptance criteria: vendor pricing list, store/developer/model/API fees where relevant, per-user-month model, dominant drivers, cost controls, budget alarms, monthly cost target, monetization model, pricing sketch if paid, ADR.
Out of scope: Stripe integration, final pricing page copy.

#### Choose observability stack
Goal: Decide logs, metrics, traces, error tracking, product analytics, session replay posture, alert destination, sampling, and retention.
Acceptance criteria: sink choices recorded for logs/metrics/tracing/errors/analytics, native crash/performance reporting where relevant, replay consent noted, alert destination chosen, sampling/retention chosen, ADR.
Out of scope: event taxonomy, SDK wiring.

#### Run security sanity check
Goal: Lightweight security checklist with each item mitigated, accepted, or deferred.
Acceptance criteria: auth basics, data handling, input validation, secrets handling, local storage safety where relevant, platform permission/deep-link/signing checks where relevant, third-party integration safety, dependency hygiene, disposition per item, follow-up issues for deferred work, notes at agreed location.
Out of scope: full pen test, compliance audit prep, bug bounty.

### Phase 2 — Living docs
|Title|Priority|Estimate|Labels|
|---|---|---|---|
|Create risk register|Medium|2|`<Product>`, Documentation, Planning|
|Create open questions log|Medium|1|`<Product>`, Documentation, Planning|
|Create domain glossary|Low|1|`<Product>`, Documentation, Planning|

#### Create risk register
Goal: Seed 6-12 product, technical, delivery, and operational risks for ongoing review.
Acceptance criteria: risks captured with severity, likelihood, mitigation or accepted/monitoring status, owner, review cadence, format, and product brief link.
Out of scope: full incident response plan, compliance risk register.

#### Create open questions log
Goal: Seed a living log from Phase 0 and Phase 1 outputs.
Acceptance criteria: questions captured, tagged blocking/non-blocking and by area, owner where known, format documented, triage cadence agreed, document location set.
Out of scope: resolving the questions.

#### Create domain glossary
Goal: Define 5-15 domain terms with canonical spelling, one-line definitions, and rejected synonyms.
Acceptance criteria: terms, definitions, rejected synonyms, Linear glossary document, repo agent-doc link once repo exists, review trigger.
Out of scope: API/schema naming conventions, marketing copy.

### Phase 3 — Foundation
|Title|Priority|Estimate|Labels|
|---|---|---|---|
|Initialize repository and workspace|High|4|`<Product>`, Developer Experience, Documentation, Planning|
|Define environment strategy|Medium|2|`<Product>`, Infrastructure, Documentation, Planning|
|Define testing strategy|Medium|2|`<Product>`, Developer Experience, Documentation, Planning|
|Set up CI/CD baseline|Medium|4|`<Product>`, CI / CD, Developer Experience, Planning|
|Wire observability and error tracking|Medium|4|`<Product>`, Developer Experience, Observability, Planning|

#### Initialize repository and workspace
Goal: Working repository with agreed layout, dev tooling, agent scaffolding, Linear planning links, and local hello-world path.
Acceptance criteria: GitHub repo, layout, package/workspace strategy where relevant, formatter/linter/typecheck choices, gitignore/README/license, agent configs, repo links back to Linear docs, no manual duplication of Linear planning, canonical local run command works for every v1 surface, cloneable setup notes.
Out of scope: feature code, production deploy, rewriting Linear docs into repo-local docs.

#### Define environment strategy
Goal: Strategy for environments, config, secrets, data, access, and branch-to-deploy mapping.
Acceptance criteria: environments and purpose, per-env database/storage/auth, app identifiers or bundle IDs where relevant, store/developer sandboxes where relevant, secret manager, config mapping, branch mapping, `.env.example` or equivalent sample config, document location.
Out of scope: production runbooks, per-env feature flags.

#### Define testing strategy
Goal: Shared test-layer contract for frameworks, DB strategy, fixtures, mocking policy, coverage, and CI scope.
Acceptance criteria: layers, frameworks, DB reset strategy where relevant, simulator/device/browser/CLI/API test targets where relevant, fixtures, mock policy, coverage target or none, PR/main/scheduled CI scope, long-running/flaky segregation, document location.
Out of scope: feature-specific test cases, load testing.

#### Set up CI/CD baseline
Goal: GitHub Actions for lint/typecheck/test/build on PRs, main deploy path, dependency automation, branch protection, and rollback plan.
Acceptance criteria: PR workflow, gates, build/deploy/release workflow, dependency automation, required checks, branch naming convention, release/versioning choice, signing/store/notarization path where relevant, rollback strategy, first green pipeline or first reproducible native build on main.
Out of scope: advanced deploy-preview infra, multi-environment promotion.

#### Wire observability and error tracking
Goal: Logs, errors, traces where applicable, analytics, PII scrubbing, one verified alert, and first dashboard.
Acceptance criteria: production logs, verified error or crash tracking, test analytics event, traces where applicable, native performance signals where relevant, PII rules, alert firing to destination, dashboard/saved view, cost controls.
Out of scope: full event taxonomy, on-call rotation.

### Phase 4 — Gate
|Title|Priority|Estimate|Labels|
|---|---|---|---|
|Draft launch checklist|Low|2|`<Product>`, Documentation, Release|
|Planning retrospective and exit sign-off|Low|1|`<Product>`, Documentation, Planning|

#### Draft launch checklist
Goal: Draft v1 launch checklist covering product, technical, legal, marketing, and support readiness.
Acceptance criteria: readiness items for product, technical, legal, marketing, distribution/store review where relevant, and support; lead-time target dates; rollback/kill-switch reference; document linked from product brief.
Out of scope: day-of-launch comms plan, post-launch growth experiments.

#### Planning retrospective and exit sign-off
Goal: Close planning explicitly and approve execution.
Acceptance criteria: retro notes, template-change follow-up issues, every Phase 0-3 issue done or linked to follow-up, risk register updated, no blocking open questions, first execution backlog current, project moved from Planning to In Progress, target date set, status update posted.
Out of scope: execution retrospective.
