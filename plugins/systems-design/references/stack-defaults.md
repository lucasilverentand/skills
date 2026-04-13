# Stack Defaults

The strong priors for system design. Every default has a "because" — the reason is what makes the rule portable across edge cases. These are defaults, not laws: deviate when there's a specific reason, but document why.

If the project has `.context/architecture/overrides.md`, that file takes precedence over anything here.

---

## Philosophy

- **Monolith-first.** Split into services only when forced by real operational or scaling pain — because premature service boundaries add network hops, deployment complexity, and distributed-system failure modes for no benefit. Pick patterns that are scale-friendly *within* a monolith (queues over DB polling, outbox over direct publish) so splitting later is refactor, not rewrite.
- **Extract early when the concept is clear.** Don't wait for a strict rule-of-three — because waiting too long bakes implicit assumptions into call sites that are harder to unwind than extracting a clean abstraction when you first see the shape.
- **Lean on the existing stack hard.** Don't introduce a new tool unless the current ones genuinely can't do the job — because every new dependency is a new failure mode, a new thing to learn, monitor, and upgrade.

## Monorepo layout

```
apps/          # deployable user-facing things (web, api, mobile)
packages/      # shared libs (db, auth, config, ui)
services/      # non-user-facing Workers (queue consumers, cron, internal APIs)
```

- Bun workspaces. Shared `tsconfig.json` and `biome.json` at root.
- Flat within each directory — no nesting — because nesting creates import path hell and doesn't add clarity over good naming.
- Package scope: `@repo/<name>` (e.g. `@repo/db`, `@repo/auth`, `@repo/config`) — because it's short, clearly internal, and won't collide with npm.
- Cron workers and queue consumers are separate Workers in `services/`, not handlers in the API Worker — because isolated deploys mean independent scaling and failure isolation.

## Data model

### IDs

Prefixed ULID: `ord_01HF2M3N4P5QRSTVWXYZ123456`.

- Time-sortable (48-bit ms prefix), 128-bit, Crockford base32, 26 chars.
- Prefix gives type safety in logs — a human (or grep) can tell `ord_` from `usr_` at a glance.
- Because sequential integers leak count and enable enumeration; UUIDs aren't sortable; ULIDs are both.

### Timestamps

`created_at` + `updated_at` + `deleted_at` on every table. Soft delete by default.

- Soft-deleted rows excluded by default via Drizzle filter (`WHERE deleted_at IS NULL`). Explicit `.withDeleted()` to see deleted rows — because accidental data leaks from forgotten filters are worse than the mild query overhead.

### Naming

- Tables: plural snake_case (`orders`, `line_items`).
- Columns: snake_case (`created_at`, `tenant_id`).
- Indexes: `idx_<table>_<columns>` (`idx_orders_customer_id`).
- Drizzle maps to camelCase in TypeScript — because Postgres conventions are snake_case, and fighting them means quoting everything in raw SQL.

### Schema organization

Single `packages/db/` workspace with `schema/<domain>.ts` files (`auth.ts`, `orders.ts`, `billing.ts`) + barrel `index.ts`. Migrations in `packages/db/migrations/`. All apps and services import from `@repo/db` — because one source of truth prevents schema drift across services.

### JSONB

- **Opaque blobs (webhooks, event envelopes, audit payloads):** NO — parse at the boundary and store structured columns. Even for webhooks — because structured columns are queryable, indexable, and schema-validated.
- **User-extensible fields (per-tenant custom attributes, form builders):** YES — `metadata jsonb` column, Zod-validated at write. Schema lives in code; DB stays flexible.
- **Denormalized read models:** YES when a single join is hot enough to justify it.

### Audit logging

1. `audit_log` table (append-only): `id`, `tenant_id`, `actor_id`, `action`, `entity_type`, `entity_id`, `occurred_at`, `context jsonb`. Middleware inserts on every mutation.
2. Per-entity `<entity>_history` tables only for high-value entities (money, legal, compliance). Trigger snapshots old row on update.
3. Event sourcing only when the domain is genuinely event-shaped (ledgers, IoT, collaborative editing). Default: don't — because event sourcing adds read complexity for every consumer.

### Multi-tenancy

Postgres RLS layered on a `tenant_id` column on every tenant-scoped table. `tenant_id` filter is the primary mechanism; RLS is the backstop — because RLS error messages are cryptic but it protects against app-layer bugs that forget the filter.

### Database

- Default: **Neon** (Postgres). D1 only for tiny projects — because Neon gives you real Postgres with autoscaling, branching, and the full extension ecosystem.
- **EU region** for primary data — because we're privacy-first and EU-based.
- Connection: `@neondatabase/serverless` driver (HTTP-based) + **Hyperdrive** for pooling and caching — because Workers can't hold TCP connections, and Hyperdrive adds connection reuse without extra infra.

### Migrations

- `drizzle-kit generate` → commit SQL files → `drizzle migrate` in CI before deploy — because committed migration files are reviewable, auditable, and work with Neon branching.
- **Expand-contract** for breaking changes: (1) add new column, (2) deploy code that writes both + reads new, (3) drop old column — because single-step renames/type changes break during gradual rollout when old and new code coexist.
- Never rename or change column types in a single migration.

### Transactions

- Multi-table writes: always in a transaction.
- Single-table writes: transaction only for read-then-write dependencies (check-and-update).
- Single inserts/updates don't need one — because unnecessary transactions add contention without safety benefit.

## API

### Protocol

- **Public-facing:** REST + JSON over Hono — because it's cacheable, debuggable with curl, and works in every language.
- **Internal TS-to-TS:** Hono RPC (typed) — because you get end-to-end type safety without schema duplication.

### Casing

- `camelCase` in internal APIs and TypeScript.
- `snake_case` in public APIs — because most API consumers (Python, Ruby, Go) use snake_case, and Hono serializers handle the boundary conversion.

### Error shape

RFC 7807 Problem Details: `{ type, title, status, detail, instance }`.

- Validation errors: RFC 7807 envelope with `errors: [{ field, code, message }]` in `details`.
- Error code taxonomy: `domain.action.reason` (e.g. `order.create.insufficient_stock`) — because hierarchical codes are greppable, and clients can match on prefix for broad handling.
- Because RFC 7807 is a standard with broad tooling support, and custom error shapes become a mini-standard you maintain forever.

### Versioning

- URL path: `/v1/`, integer bumps — because it's the simplest to understand, deploy side-by-side, and debug in access logs.
- Bump on breaking *and* semantically changed behavior (even if the shape is unchanged).
- Deprecation: `Deprecation: true` + `Sunset: <date>` headers. 30–90 days for internal, 6+ months for public.
- Internal APIs get the same versioning as public — because internal "we'll just update all clients" is a lie at scale.

### Pagination

Cursor-based by default: `{ data: [...items], meta: { next_cursor: "abc", has_more: true } }`.

- Default limit 25, max 100. Cursor is opaque base64.
- Because cursor pagination is stable under concurrent writes; offset pagination drops or duplicates rows when items are inserted or deleted between requests.

### Idempotency

Enforced via middleware on all write endpoints (POST/PATCH). Every write requires `Idempotency-Key` header; middleware caches responses and enforces the contract. Reject if missing — because at-least-once retry semantics (the default for any resilient client) will retry writes, and without an idempotency key you'll charge the card twice.

### Rate limiting

Two layers:

1. **Cloudflare platform** — broad abuse/DDoS protection (outer ring).
2. **Durable Object per-key counters** — business-rule limits (per-plan API quotas).

Default tiers: Free 60 req/min, Paid 600 req/min, Enterprise custom. 2x burst allowance. `429` with `Retry-After` and `X-RateLimit-*` headers — because platform stops the flood, DO enforces the contract.

### Nullable vs missing vs empty

- Missing = "not provided". `null` = "explicitly no value". Empty array = "zero items".
- Document the convention — because mixing them is a classic source of client bugs.

### API documentation

OpenAPI spec generated from Zod schemas via `hono-zod-openapi`. Served with **Scalar**. Spec committed to git (reviewable in PRs). CI verifies committed spec matches generated output — because hand-written docs drift, and committed specs make API changes visible in code review.

### API key format

Prefixed + random: `sk_live_<32 random chars>` (secret), `pk_live_<32 chars>` (publishable). Prefix encodes type + environment. Only the hash stored in DB. Last 4 chars shown in UI — because prefixes make keys identifiable in logs without exposing them, and hashing prevents leaked DB dumps from being usable.

## Authentication & authorization

### Auth

| Caller | Mechanism |
|---|---|
| Users (web + mobile) | Better Auth. Cookie for web, secure-storage token for mobile. |
| Machines (CLI, integrators) | Scoped API keys, hashed in DB, with `scopes[]`, `last_used_at`, `expires_at`. |
| Same-process calls | No auth — pass `actor` parameter. |
| Cross-Worker (same CF account) | Service Bindings (no network hop, type-safe RPC) or Access Service Tokens. |

### AuthZ

ABAC (attribute-based): `user.id === resource.owner_id || user.role === 'admin'`. Enforced in depth:

1. **Middleware** — coarse: `requireAuthenticated`, `requireRole('admin')`.
2. **Service layer** — primary ABAC decision; every mutating function takes `actor` and checks inline.
3. **Postgres RLS** — backstop (not primary; protects against app bugs).
4. **Never handlers-only** — because handlers duplicate checks and forget them.

## Hono middleware

Default order: Request ID → Logger → CORS → Auth → Rate limit → Idempotency → Validation.

- Request ID first so all downstream logs include it.
- CORS before auth because preflight must pass without credentials.
- Auth before rate limiting so limits are per-key, not per-IP.

## Error handling & validation

- **Result types `{ ok, error }`** everywhere except true system failures (OOM, unreachable). Only genuine bugs throw — because result types make error paths explicit and prevent unhandled rejections.
- **Zod validation** at every system boundary: HTTP in, HTTP out, DB rows, env, config, queue messages. Plus Drizzle-zod derived schemas for DB types — because runtime data never matches your assumptions, and Zod catches the mismatch at the boundary instead of deep in business logic.
- **`safeParse`** at the HTTP request boundary (structured 400s). **`parse`** for system-internal sources (env, queue messages) where failure should throw.
- **Multi-step writes:** prefer single-transaction design. Use outbox only when a side effect is genuinely external — because unnecessary outbox patterns add complexity without improving consistency.

## Async work

- **Default:** inline in-request for short work (~< 50ms); Cloudflare Queues otherwise.
- **Job retries:** exponential backoff + jitter, 8 attempts, then DLQ.
- **Background job duration:** break at 30s. If a job will take longer, split into steps chained via Queue messages — because Workers have CPU time limits, and per-step splitting gives you retry and visibility for free.
- **Cron:** Cron Triggers that enqueue onto Queues (not run inline) — because that gives you retry/DLQ for free.
- **Durable Objects:** realtime coordination (WebSocket rooms, presence) AND stateful per-key coordination (rate limits, per-user counters).

## Webhooks

### Incoming

Verify signature in the handler → return 200 immediately → enqueue onto CF Queue for async processing — because fast responses prevent the sender from timing out, and the queue handles retries if processing fails.

### Outgoing

- HMAC-SHA256 signing with a shared secret per endpoint. Timestamp in the signature to prevent replay attacks.
- 5 retry attempts with backoff over ~1 hour.
- Dead-letter queue for exhausted retries; manual replay available — because at-least-once delivery with a DLQ means events are never silently lost.

## File uploads

- **Method:** presigned URL direct to R2. API never touches file bytes. R2 event notification triggers post-upload processing — because streaming through the Worker hits CPU/memory limits on large files.
- **Validation:** presigned URL conditions enforce allowed MIME types, max file size (e.g. 50MB), and 15-minute expiry. Server re-validates after upload — because client-side checks are bypassable.

## Caching

- **Default:** only static/reference + rarely-changing data. Lean on edge where possible.
- **Location:** Cloudflare Cache API for GETs + KV for key-value lookups. No Redis — because CF-native caching avoids extra infra and latency.
- **Invalidation:** TTL + Stale-While-Revalidate as default. Event-driven purge (`cache.delete()`) on write paths for sensitive keys (permissions, billing state) — because TTL+SWR handles 90% of cases, and purge covers the rest without the complexity of write-through or versioned keys.

## Resilience (outbound calls)

### Timeouts

Per-operation budgets enforced via `AbortSignal`:

| Call type | Timeout |
|---|---|
| Internal service | 5s |
| Third-party API | 10s |
| Webhooks / file ops | 30s |

Because a single generous global timeout either clips fast paths or is too lenient for slow ones.

### Retries

3 attempts, exponential backoff + jitter (200ms → 1s → 4s). 5xx and timeouts only. Respect `Retry-After` header. Never retry 4xx — because 4xx means the request is wrong, not unlucky.

### Circuit breakers

Opt-in per dependency, not global. Add explicitly for known-flaky or critical dependencies (payment provider, email service) — because a global breaker adds state and can cause surprising behavior when it trips on a non-critical dependency.

## Realtime

- **One-way push** (notifications, status updates): SSE — because it's simpler than WebSocket, works through more proxies, and doesn't need a Durable Object.
- **Bidirectional** (chat, collaboration, presence): Durable Objects + WebSocket.

## Observability

- **Logging:** pino structured JSON logs. Child loggers per request with `request_id`. Strict blocklist auto-redaction: passwords, tokens, secrets, cookies, emails, IPs, names, phones, user-agent → `[REDACTED]` — because we're privacy-first and a single leaked PII field in logs creates a compliance incident.
- **Request IDs:** first Worker generates a ULID (or uses CF-Ray). Propagated via `X-Request-Id` header. Every log line includes it. Returned to client in responses — because request IDs are the fastest way to debug a support ticket across services.
- **Metrics:** Workers Analytics Engine — native CF, queryable with SQL, no external dep.
- **Tracing:** OTel SDK wired from day 1. Spans propagate via headers; traces correlate with logs via `trace_id`.
- **Alerting:** symptom-based SLO alerts (error rate, p99 latency, availability) + a few cause alerts for known bad signals (DB down, queue backed up) — because symptoms page for user impact, cause alerts speed up triage.
- **Access logs:** CF Logpush to R2 (EU bucket). Retained 90 days — because compliance, debugging, and abuse detection all need raw access data.

## Privacy & compliance

- **Data residency:** EU-primary. Neon EU region, R2 EU buckets. CF edge cache serves globally but origin data stays in EU — because we're EU-based and privacy-first.
- **PII storage:** PII columns encrypted with per-user key (or Neon column encryption). Soft delete marks user as deleted. Scheduled scrub job removes PII after retention window (e.g. 30 days). Audit log entries anonymized — because GDPR right-to-erasure requires actual data removal, not just a deleted_at flag.
- **Cookie consent:** PostHog with cookieless mode (no cookies, no localStorage, server-side session stitching). No consent banner needed for analytics. Consent only for optional cookies (auth sessions exempt as strictly necessary) — because cookieless tracking is GDPR-compliant without degrading UX with consent banners.

## Third-party defaults

| Concern | Default | Why |
|---|---|---|
| Email | Resend (React Email for templates) | Modern API, great DX, good deliverability |
| Payments (web) | Polar.sh | Simpler than Stripe Billing for most billing models |
| Payments (mobile IAP) | RevenueCat | Handles App Store/Play Store receipt validation |
| Analytics | PostHog | Self-hostable, all-in-one, avoids vendor lock-in |
| Error tracking | PostHog errors | Built in, avoids extra vendor |
| Feature flags | PostHog flags | Same SDK/dashboard as analytics |
| Search | Postgres FTS first | No extra infra; graduate to dedicated engine when FTS limits hit |
| Uptime monitoring | Better Stack | Uptime + status pages + incident management |
| Status page | Custom static page | On separate domain, updated via CI/Worker, no vendor dependency |

## Deploy & operations

- **Deploy:** CF Workers versioning with gradual rollout (percentage-based traffic split). Roll back instantly if metrics degrade — because gradual rollout catches issues before 100% of traffic is affected.
- **CORS:** explicit allowlist per environment. Production: known frontend origins. Staging: staging + localhost. Dev: `localhost:*`. Credentials allowed. Preflight cached 1 hour. Never `Access-Control-Allow-Origin: *` with credentials — because wildcard + credentials is a security hole.
- **Secrets:** Wrangler secrets for prod (encrypted at rest), `.dev.vars` for local (gitignored) — because it's native to CF, no extra tooling, and secrets never touch source control.
- **Environment config:** non-secret config in `wrangler.toml [vars]` per environment. Parsed and validated with Zod at Worker startup — because runtime config errors should fail fast at boot, not silently at request time.
- **Health checks** (non-Workers only): `/healthz` (liveness), `/readyz` (readiness: DB + critical deps). Include version/commit hash. Workers skip health checks — because CF handles Worker availability.
- **Local dev:** `wrangler dev --local` (Miniflare under the hood). All bindings work locally. `--remote` only for real CF infra testing.

## Testing

- **Pyramid:** mostly unit, some integration, few E2E.
- **Worker tests:** Vitest + `@cloudflare/vitest-pool-workers`. Tests run inside local Workers runtime with real bindings — because mocked bindings don't catch D1 SQL differences, KV eventual consistency, or DO behavior.
- **Test DB:** pglite locally, real Neon branch in CI. Catches version drift, RLS, extension behavior.
- **Reset:** fresh schema per suite (migrations at boot), truncate per test.
- **Fixtures:** factories for test subjects; seed file for static reference data (plans, enums, lookups).
- **Mocking:** real implementations whenever possible; mock at hard boundaries only. Sandboxes (Stripe, Resend) for services that have them.
- **E2E:** split into quick smoke (every PR, critical paths) and in-depth (nightly/main, broader coverage). Playwright for web, Maestro for mobile.

## Tooling

- **i18n:** Paraglide (compiler-based, typesafe, tree-shakeable). i18n-ready from day one — because retrofitting i18n is painful, and Paraglide's compiled output adds zero runtime cost for unused translations.
- **Dependencies:** Renovate with automerge for patch/minor, grouped PRs for major. Scheduled weekly. **3-day stability delay** on all package updates — because most npm supply chain attacks are caught within 48 hours. Pin exact versions in lockfile.
- **OpenAPI:** generated at build from Zod schemas, committed to git. CI verifies committed spec matches generated output.

## Documentation

- **ADR triggers:** structural changes (new service/worker), new external dependency, auth/authz changes, data model changes affecting multiple services, deviations from these stack defaults. Skip for library upgrades, styling choices, internal refactors — because ADRs are for decisions where the reasoning matters to future readers, not for obvious defaults.
- **`.context/` structure:** `architecture/overview.md` (system map), `architecture/<service>.md` per service, `architecture/api/<service>.md` for API specs, `architecture/decisions/` for ADRs.
- **Runbooks:** every service from day one in `.context/runbooks/<service>.md`. Covers: what it does, how to deploy, how to roll back, common failure modes, who to page — because the first incident shouldn't be the first time someone writes down how to respond.

## Service-to-service communication

- **Same CF account:** Service Bindings (no network hop, no auth, type-safe RPC) — because it's the fastest and simplest option within CF.
- **Cross-account or non-CF:** HTTP with Access Service Tokens.
- **Async inter-service:** Cloudflare Queues. Never synchronous fan-out when async will do — because sync chains multiply latency and create cascading failure risk.
