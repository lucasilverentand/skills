# Non-Functional Requirements Checklist

Walk this list when designing. Don't cargo-cult every item — skip what's irrelevant, but mark it as "N/A — reason" rather than silently dropping it. Silent gaps become incidents later.

## Scale

- **Peak throughput** (req/s, writes/s) — today and in 2 years
- **Data volume** — rows, total bytes, growth rate
- **Concurrency** — simultaneous users, connections, long-lived sessions
- **Fanout** — does one request trigger N downstream calls? N = ?
- **Hotspots** — is traffic uniformly distributed or does one key dominate?

## Latency

- **Target p50 / p99 / p999** for each user-facing operation
- **Budget breakdown** — what does each hop cost? Network + DB + compute + downstream?
- **Tail latency** — what causes the long tail? GC? Cold starts? Contention? Queue depth?
- **Timeouts** — every network call needs one. Default to short, bump up only when justified.

## Availability

- **Target uptime** (99.9%, 99.95%, 99.99%) and the maintenance window
- **Weakest link** — which dependency has the worst SLA? Does the composed SLA still meet target?
- **Graceful degradation** — what can the system do when a dependency is down? (read-only mode, cached fallbacks, queued writes)
- **Recovery** — RTO (how long to restore) and RPO (how much data can be lost)
- **Blast radius** — when X fails, what else breaks? Can failures be contained?

## Consistency

- **Strong vs eventual** — where does each apply? Don't default to strong everywhere, it has a cost.
- **Source of truth** — exactly one component owns each piece of data
- **Cross-service writes** — how do you avoid dual-write inconsistency? (outbox, sagas, idempotent retries)
- **Read-after-write** — does the client expect to see their own writes immediately?
- **Conflict resolution** — when concurrent writes race, who wins?

## Security

- **AuthN** — how do we know who's calling? (Better Auth, JWT, mTLS, API keys)
- **AuthZ** — who is allowed to do what? Where is that enforced?
- **Data in transit** — TLS everywhere. No exceptions for "internal" traffic.
- **Data at rest** — encryption, key rotation, who has decryption access
- **PII / compliance** — GDPR, HIPAA, SOC2, PCI — what's in scope?
- **Input validation** — every boundary, with Zod or equivalent. Never trust the client.
- **Secrets** — how are they stored, rotated, accessed? (Wrangler secrets, Doppler, Vault)
- **Rate limiting** — per-user and per-IP, on every public endpoint

## Observability

- **Metrics** — RED (rate, errors, duration) on every service, USE (utilization, saturation, errors) on every resource
- **Logs** — structured, queryable, with request IDs threaded through
- **Traces** — distributed tracing for any request that touches more than one service
- **Alerts** — what pages oncall? What's just a ticket? Alert on symptoms, not causes.
- **Dashboards** — can you debug an incident without writing ad-hoc queries?

## Operability

- **Deploys** — zero-downtime, rollback story, feature flags, canary
- **Schema migrations** — backwards-compatible deploys, how you handle the read-old-write-new window
- **Config changes** — hot-reloadable vs restart-required
- **Runbooks** — does anyone know what to do when this pages at 3am?
- **Backups** — tested restores, not just tested backups

## Cost

- **Cost per request** or per tenant — rough estimate
- **Variable vs fixed** — does cost scale with usage or stay flat?
- **Dominant cost driver** — compute, storage, egress, third-party APIs?
- **Efficiency levers** — what would you pull if you needed to cut cost by 30%?

## Compliance / legal

- **Data residency** — where can data physically live?
- **Retention** — how long must we keep it? How long can we keep it?
- **Deletion** — GDPR right to erasure, how it works across services
- **Audit trail** — who did what, when, from where — is it tamper-evident?
