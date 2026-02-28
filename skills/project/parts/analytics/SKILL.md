---
name: analytics
description: Sets up PostHog analytics for web (Astro/React) and native (Expo) apps. Handles event tracking, feature flags, user identification, group analytics, and dashboards. Use when adding analytics, implementing feature flags, tracking user events, or setting up A/B tests.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Analytics

The `analytics` part provides product analytics using PostHog. Analytics configuration lives in a shared workspace package — web and native apps import the client and tracking helpers from it.

## Decision Tree

- What are you doing?
  - **Setting up analytics from scratch** → see "Initial setup" below
  - **Tracking custom events** → see "Event tracking" below
  - **Adding feature flags** → see "Feature flags" below
  - **Identifying users** → see "User identification" below
  - **Setting up group analytics** → see "Group analytics" below
  - **Auditing tracked events** → run `tools/event-audit.ts`
  - **Checking analytics config** → run `tools/analytics-check.ts`

## Initial setup

### Shared package

1. Create the analytics workspace package: `packages/analytics/`
2. Install: `bun add posthog-js posthog-node posthog-react-native`

3. Create `src/config.ts`:

```ts
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
  ?? process.env.EXPO_PUBLIC_POSTHOG_KEY
  ?? "";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST
  ?? process.env.EXPO_PUBLIC_POSTHOG_HOST
  ?? "https://us.i.posthog.com";
```

4. Export from `src/index.ts`:

```ts
export { trackEvent, identifyUser, resetAnalytics } from "./track";
export { isFeatureEnabled, getFeatureFlag } from "./flags";
export { POSTHOG_KEY, POSTHOG_HOST } from "./config";
```

### Web (Astro/React)

```ts
// src/web.ts
import posthog from "posthog-js";
import { POSTHOG_KEY, POSTHOG_HOST } from "./config";

export function initAnalytics() {
  if (typeof window === "undefined") return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  posthog.capture(name, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  posthog.identify(userId, traits);
}

export function resetAnalytics() {
  posthog.reset();
}
```

### Expo (React Native)

```ts
// src/native.ts
import PostHog from "posthog-react-native";
import { POSTHOG_KEY, POSTHOG_HOST } from "./config";

let client: PostHog | null = null;

export async function initAnalytics() {
  client = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST });
  return client;
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  client?.capture(name, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  client?.identify(userId, traits);
}

export function resetAnalytics() {
  client?.reset();
}
```

### Server-side (Hono)

```ts
// src/server.ts
import { PostHog } from "posthog-node";
import { POSTHOG_KEY, POSTHOG_HOST } from "./config";

const posthog = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST });

export function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  posthog.capture({ distinctId, event, properties });
}

export async function shutdownAnalytics() {
  await posthog.shutdown();
}
```

## Event tracking

Define events as typed constants to prevent typos:

```ts
// src/events.ts
export const EVENTS = {
  SIGNED_UP: "signed_up",
  SIGNED_IN: "signed_in",
  SIGNED_OUT: "signed_out",
  ITEM_CREATED: "item_created",
  ITEM_UPDATED: "item_updated",
  ITEM_DELETED: "item_deleted",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_CREATED: "subscription_created",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  PAGE_VIEWED: "page_viewed",
  FEATURE_USED: "feature_used",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
```

Usage:

```ts
import { trackEvent } from "@scope/analytics";
import { EVENTS } from "@scope/analytics/events";

trackEvent(EVENTS.ITEM_CREATED, { itemType: "project", source: "dashboard" });
```

- Always include context properties (source, item type, etc.)
- Never track PII (email, name) in event properties — use `identify` instead
- Use past tense for event names (`item_created`, not `create_item`)

## Feature flags

```ts
// src/flags.ts — Web
import posthog from "posthog-js";

export function isFeatureEnabled(flag: string): boolean {
  return posthog.isFeatureEnabled(flag) ?? false;
}

export function getFeatureFlag(flag: string): string | boolean | undefined {
  return posthog.getFeatureFlag(flag);
}
```

Usage:

```tsx
import { isFeatureEnabled } from "@scope/analytics";

function Component() {
  if (!isFeatureEnabled("new-dashboard")) {
    return <OldDashboard />;
  }
  return <NewDashboard />;
}
```

- Define feature flags in the PostHog dashboard
- Use descriptive kebab-case names: `new-dashboard`, `beta-export`
- Always provide a fallback for when flags fail to load
- Use feature flags for gradual rollouts, A/B tests, and kill switches

## User identification

```ts
// After sign-in
identifyUser(user.id, {
  plan: user.plan,
  createdAt: user.createdAt,
});

// After sign-out
resetAnalytics();
```

- Call `identify` after every successful sign-in
- Call `reset` after sign-out to avoid mixing user data
- Only pass stable traits to `identify` — avoid frequently changing properties
- Never pass PII like email or full name unless your privacy policy allows it

## Group analytics

For B2B apps, group users by organization:

```ts
// Web
posthog.group("company", companyId, {
  name: companyName,
  plan: companyPlan,
});

// Server
posthog.groupIdentify({
  groupType: "company",
  groupKey: companyId,
  properties: { name: companyName, plan: companyPlan },
});
```

## Key references

| File | What it covers |
|---|---|
| `tools/event-audit.ts` | All tracked events, their locations, and property usage |
| `tools/analytics-check.ts` | PostHog configuration, initialization, and environment |
