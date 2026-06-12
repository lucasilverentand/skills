# Resilience Patterns
Timeouts, retries, circuit breakers, caching, and service-to-service communication.

## Timeouts
Per-operation budgets enforced via `AbortSignal`. A single generous global timeout either clips fast paths or is too lenient for slow ones.

|Call type|Timeout|Why|
|---|---|---|
|Internal service|5s|Should be fast; if it's not, something is wrong|
|Third-party API|10s|External services are slower; give reasonable room|
|Webhooks / file ops|30s|Large payloads and slow endpoints need more time|

## Retries
3 attempts, exponential backoff + jitter (200ms -> 1s -> 4s). Only retry 5xx and timeouts. Respect the `Retry-After` header. Never retry 4xx — a 4xx means the request is wrong, not unlucky. Retrying it just wastes resources and annoys rate limiters.

Jitter prevents thundering herd — when many clients retry simultaneously after a blip, synchronized retries amplify the load spike.

## Circuit breakers
Opt-in per dependency, not global. Add explicitly for known-flaky or critical dependencies (payment provider, email service). A global breaker adds hidden state and causes surprising behavior when it trips on a non-critical dependency.

Pattern: closed (normal) -> open (failing, return error immediately) -> half-open (try one request to see if recovered).

## Caching
Only cache static/reference + rarely-changing data. Lean on the edge.

- **Location:** Cloudflare Cache API for GETs, KV for key-value lookups. No Redis — CF-native caching avoids extra infra.
- **Invalidation:** TTL + Stale-While-Revalidate as default. Event-driven purge (`cache.delete()`) on write paths for sensitive keys (permissions, billing state).
- **Anti-patterns:** caching everything (stale data bugs), no cache-busting strategy, adding Redis for simple KV when CF KV exists.

## Service-to-service communication
|Context|Mechanism|Why|
|---|---|---|
|Same CF account|Service Bindings|No network hop, no auth overhead, type-safe RPC|
|Cross-account / non-CF|HTTP + Access Service Tokens|Standard, auditable, works everywhere|
|Async inter-service|Cloudflare Queues|Never synchronous fan-out when async works|
