# systems-design

Opinionated system design skills for Cloudflare-first projects. Covers the full lifecycle from vague idea to implementable spec — requirements, architecture, data modeling, API design, documentation, decision records, diagrams, and review.

Every skill encodes concrete conventions (prefixed ULIDs, RFC 7807 errors, cursor pagination, outbox pattern, presigned uploads, etc.) so designs are consistent across projects without relying on CLAUDE.md.

## Skills

### design-workflow

Entry point for broad design asks ("design a system for X"). Sequences the focused skills in order — requirements, architecture, data modeling, API design, design doc — with clear handoffs and skip logic. Use this when the task spans multiple concerns.

### requirements

Gathers and structures requirements before design begins. Interviews for purpose, scale, latency, consistency, data, constraints, and integrations. Outputs MoSCoW-prioritized functional requirements and NFR targets with concrete numbers. Includes a comprehensive non-functional requirements checklist.

### architecture

The thinking skill — turns requirements into a concrete system shape. Component decomposition, data flow analysis (trace 2-3 representative requests), state ownership, failure mode thinking, tech selection with trade-offs. Monolith-first philosophy, extract-early-when-clear, lean-on-existing-stack.

### data-modeling

Designs the data layer from entities to Drizzle schema. Covers data store selection (D1 vs Neon decision table), prefixed ULID IDs, naming conventions, standard columns (timestamps, soft delete), multi-tenancy (tenant_id + RLS), JSONB rules, audit logging patterns, schema organization, and expand-contract migrations.

### api-design

Designs REST, GraphQL, or gRPC APIs. Picks the protocol, models resources, defines Zod schemas, and addresses cross-cutting concerns: Better Auth, ABAC authorization (middleware + service + RLS), RFC 7807 errors, cursor pagination, idempotency keys, rate limiting, versioning, presigned URL uploads, webhooks, and CORS. Outputs a spec to `.context/architecture/api/`.

### write-design-doc

Assembles architecture, data, and API work into a structured 10-section design document. Focuses on writing quality and completeness — every section has content or an explicit "N/A". Includes a verification checklist and a filled-in example (Orders Service).

### write-adr

Writes Architecture Decision Records in MADR format. Captures context, decision drivers, considered options with honest pros/cons, the chosen option with justification, and consequences. Numbers files sequentially in `.context/architecture/adr/`. Includes guidance on what warrants an ADR and what doesn't.

### c4-diagrams

Generates C4 model architecture diagrams as Mermaid `flowchart` (renders in GitHub, Obsidian, VS Code, Notion). Picks the right C4 level (Context, Container, Component), labels every element with technology and responsibility, and includes stack-specific primitives (Workers, Durable Objects, CF Queues, Neon, KV, R2).

### design-review

Reviews existing or proposed designs against real failure modes and scale pressures. Six review lenses: failure modes, scaling cliffs, data consistency, security, operability, and design coherence. Plus a stack-defaults compliance checklist (18 items). Produces severity-tagged findings (CRITICAL/MAJOR/MINOR/QUESTION) with actionable suggestions.

## Stack conventions encoded

The reference files encode a complete set of architectural preferences:

| Area | Convention |
|---|---|
| Runtime | Cloudflare Workers with Static Assets (not Pages) |
| Framework | Hono |
| Database | D1 for small projects, Neon (EU) for complex/multi-tenant |
| ORM | Drizzle |
| Auth | Better Auth (sessions for web, tokens for mobile, API keys for machines) |
| IDs | Prefixed ULIDs (`ord_`, `usr_`, `inv_`) |
| Errors | RFC 7807 Problem Details, `domain.action.reason` taxonomy |
| Result types | `{ ok, error }` — only throw at system boundaries |
| Pagination | Cursor-based, opaque base64 cursors |
| Async | CF Queues for everything >50ms, outbox pattern for reliable events |
| Caching | CF Cache API + KV, TTL + stale-while-revalidate, no Redis |
| Observability | Pino structured logs, Workers Analytics Engine, OTel tracing |
| Testing | Vitest + `@cloudflare/vitest-pool-workers`, Pglite locally, real Neon in CI |
| Payments | Polar.sh (web), RevenueCat (mobile) |
| Analytics | PostHog (analytics + errors + feature flags) |
| Data residency | EU-primary |
| Multi-tenancy | `tenant_id` + Postgres RLS as backstop |
| Feature flags | PostHog, `kebab-case`, prefixed by type (`release-`, `ops-`, `exp-`) |

## File structure

```
systems-design/
  .claude-plugin/
    plugin.json
    README.md
  skills/
    design-workflow/SKILL.md
    requirements/
      SKILL.md
      references/
        nfr-checklist.md
        requirements-template.md
    architecture/
      SKILL.md
      references/
        philosophy.md        # monolith-first, extract-early, lean-on-stack
        async.md             # queues, cron, outbox, realtime
        resilience.md        # timeouts, retries, circuit breakers, caching
        observability.md     # logging, metrics, tracing, alerting
        deploy.md            # monorepo, Workers, secrets, feature flags
        testing.md           # pyramid, Worker tests, DB testing, E2E
        third-party.md       # vendor defaults (Resend, Polar, PostHog, etc.)
        privacy.md           # data residency, PII, GDPR, cookies
    data-modeling/
      SKILL.md
      references/
        ids.md               # prefixed ULID strategy
        naming.md            # table, column, index naming
        soft-delete.md       # timestamps and soft delete pattern
        tenancy.md           # multi-tenancy with tenant_id + RLS
        jsonb.md             # when to use JSONB and when not to
        audit.md             # three audit logging patterns
        schema-organization.md
        migrations.md        # expand-contract for breaking changes
        schema-examples.md
    api-design/
      SKILL.md
      references/
        http-conventions.md  # URLs, verbs, status codes, CORS
        error-handling.md    # RFC 7807, error taxonomy, Zod validation
        auth.md              # auth schemes, API keys, ABAC, middleware order
        pagination.md        # cursor-based and offset-based
        api-patterns.md      # idempotency, rate limiting, versioning, webhooks, uploads
        example-rest.md
        example-graphql.md
        example-grpc.md
    write-design-doc/
      SKILL.md
      references/
        design-template.md   # filled-in example (Orders Service)
    write-adr/
      SKILL.md
      references/
        madr-template.md
        examples.md
    c4-diagrams/
      SKILL.md
      references/
        mermaid-c4.md        # Mermaid templates for all 3 levels
    design-review/
      SKILL.md
```

## Installation

```json
{
  "plugins": ["plugins/systems-design"]
}
```

## Author

Luca Silverentand (<dev@lucasilverentand.com>)
