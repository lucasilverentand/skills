# Analytics

The `analytics` part provides product analytics using PostHog across web, native, and server.

## Setup

1. Create `packages/analytics/`
2. Install: `bun add posthog-js posthog-node posthog-react-native`
3. Create platform-specific clients (`src/web.ts`, `src/native.ts`, `src/server.ts`)
4. Export from `src/index.ts`: `trackEvent`, `identifyUser`, `resetAnalytics`, `isFeatureEnabled`

### Web (Astro/React)

```ts
import posthog from "posthog-js";
export function initAnalytics() {
  if (typeof window === "undefined") return;
  posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, capture_pageview: true });
}
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  posthog.capture(name, properties);
}
```

### Server-side (Hono)

```ts
import { PostHog } from "posthog-node";
const posthog = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST });
export function trackServerEvent(distinctId: string, event: string, properties?: Record<string, unknown>) {
  posthog.capture({ distinctId, event, properties });
}
```

## Event tracking

Define events as typed constants:

```ts
export const EVENTS = {
  SIGNED_UP: "signed_up",
  ITEM_CREATED: "item_created",
  CHECKOUT_STARTED: "checkout_started",
} as const;
```

- Use past tense (`item_created`, not `create_item`)
- Always include context properties (source, item type)
- Never track PII in event properties — use `identify` instead

## User identification

- Call `identify` after every sign-in, `reset` after sign-out
- Only pass stable traits — avoid frequently changing properties

## Feature flags

```ts
export function isFeatureEnabled(flag: string): boolean {
  return posthog.isFeatureEnabled(flag) ?? false;
}
```

- Descriptive kebab-case names: `new-dashboard`, `beta-export`
- Always provide a fallback for when flags fail to load

## Tools

| Tool | Purpose |
|---|---|
| `tools/event-audit.ts` | All tracked events, their locations, and property usage |
| `tools/analytics-check.ts` | PostHog configuration, initialization, and environment |
