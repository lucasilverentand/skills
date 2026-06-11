# Privacy & Compliance
Data residency, PII handling, GDPR deletion, and cookie consent.

## Data residency
EU-primary. Neon EU region, R2 EU buckets. CF edge cache serves globally but origin data stays in EU — because we're EU-based, privacy-first, and GDPR is the strictest regulatory baseline to build on. Meeting GDPR means you meet most other frameworks too.

## PII storage
PII columns (email, name, phone, address) encrypted with per-user key or Neon column encryption. Identify PII columns explicitly in schema comments — you can't protect what you can't find.

Mark PII fields in Drizzle schema with a comment convention (e.g., `// @pii`) so automated tooling can scan for unprotected PII columns.

## GDPR deletion flow
1. **Soft delete** the user row (sets `deleted_at`). User loses access immediately.
2. **Scheduled scrub job** runs after the retention window (e.g., 30 days). This delay allows for account recovery requests and fraud investigation.
3. **Scrub job removes/anonymizes PII** from: user row, audit log entries, analytics events, any denormalized copies (cached profiles, search indexes, exported reports).
4. This final step is where actual data removal happens — `deleted_at` alone does NOT satisfy GDPR right-to-erasure. The regulation requires the data to be gone, not just hidden.

Maintain a PII inventory: a document listing every table and column that contains PII, and every system that receives a copy (logs, analytics, backups, third-party integrations). Without this inventory, you cannot guarantee complete deletion.

## Cookie consent
PostHog with cookieless mode: no cookies, no localStorage, server-side session stitching. No consent banner needed for analytics — cookieless analytics don't fall under ePrivacy directive cookie rules.

Consent only for optional cookies. Auth session cookies are exempt as strictly necessary under ePrivacy — they don't need consent.

## Anti-patterns
- Assuming soft delete satisfies GDPR — it doesn't. The data must actually be removed or irreversibly anonymized.
- Storing PII in logs — logs are rarely subject to deletion workflows, creating a compliance gap.
- No PII inventory — you can't delete what you can't find, and you can't prove compliance without knowing where PII lives.
- Consent banner on cookieless analytics — unnecessary friction, confuses users, and implies you're tracking more than you are.
- Storing PII in third-party analytics — if PostHog has the user's email, you need to delete it there too during GDPR scrub.
