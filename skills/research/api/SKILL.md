---
name: api
description: Researches and evaluates external APIs, compares SDK options, and produces integration recommendations. Use when the user needs to choose between API providers, understand rate limits and pricing tiers, review authentication schemes, assess SDK bundle sizes, or plan how to integrate a third-party service.
allowed-tools: Read Glob Grep Bash WebFetch WebSearch
context: fork
agent: Explore
---

# API Research

## Decision Tree

- What is the research goal?
  - **Choose between multiple API providers** → follow "Provider Comparison" below
  - **Understand limits and costs for a known API** → follow "Quota and Pricing Audit" below
  - **Evaluate an SDK before adopting it** → follow "SDK Evaluation" below
  - **Plan how to integrate a specific API** → follow "Integration Planning" below

## Provider Comparison

1. Identify the capability needed (e.g. email delivery, payments, maps, AI inference)
2. List the candidate APIs — if the user hasn't named them, web-search for the top providers in that category
3. For each candidate, collect:
   - Feature coverage against stated requirements
   - Authentication scheme (API key, OAuth2, mTLS)
   - Rate limits and quota model (per-minute, per-day, burst allowances)
   - Pricing tiers and free tier limits
   - Versioning and deprecation policy
   - SLA and uptime guarantees
4. Run `tools/api-compare.ts <url1> <url2> ...` with OpenAPI spec URLs to generate a side-by-side feature matrix
5. Produce a recommendation table: rank candidates by fit, note trade-offs

## Quota and Pricing Audit

1. Identify the API endpoint(s) the project will call
2. Run `tools/rate-limit-check.ts <endpoint>` to probe rate limit headers
3. Cross-reference observed headers with published docs — note discrepancies
4. Model usage:
   - **Low volume (< 1k req/day)** → free tier likely sufficient, note limits
   - **Medium volume** → calculate cost at expected call volume; flag cliff pricing
   - **High or bursty volume** → assess burst limits, retry semantics, queue strategies
5. Summarize: daily/monthly cost estimate, risk of hitting limits, recommended tier

## SDK Evaluation

1. Identify candidate SDK packages (npm, PyPI, etc.)
2. Run `tools/sdk-size-audit.ts <package-name>` for each candidate
3. Check:
   - Bundle size (minified + gzipped)
   - Direct and transitive dependency count
   - Last publish date and release cadence
   - Open issues and known CVEs
   - TypeScript types (included, DefinitelyTyped, or absent)
4. Compare against using the raw HTTP API directly — is the SDK adding enough value?
5. Recommend the SDK or the raw API with rationale

## Integration Planning

1. Read the relevant parts of the official API docs — focus on:
   - Auth setup (where credentials live, token refresh flow)
   - Key endpoints for the use case
   - Error codes and retry guidance
   - Webhook/event model if applicable
2. Map the integration to the project's architecture:
   - **Cloudflare Workers** → note fetch-based client requirements, no Node APIs
   - **Server-side (Hono/Node/Bun)** → standard SDK usage, env var credential injection
   - **Client-side** → never expose secret keys, route through a server proxy
3. Identify required environment variables and secret handling
4. Note any SDK limitations against the target runtime
5. Produce an integration plan: auth setup, call pattern, error handling, testing approach

## Key references

| File | What it covers |
|---|---|
| `tools/api-compare.ts` | Fetch OpenAPI specs and generate side-by-side feature comparison |
| `tools/rate-limit-check.ts` | Probe endpoints and summarize rate limit headers and quota policies |
| `tools/sdk-size-audit.ts` | Measure bundle size and dependency count of candidate SDK packages |
