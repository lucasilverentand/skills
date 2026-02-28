# Analytics

PostHog analytics module: event tracking, feature flags, and user identification.

## Responsibilities

- Scaffold a PostHog analytics package in a bun workspace monorepo
- Configure PostHog for web (posthog-js) and native (posthog-react-native)
- Provide a platform-agnostic tracking interface
- Define and maintain typed event name constants
- Integrate feature flags for gradual rollouts and A/B testing
- Handle user identification and group analytics

## Tools

- `tools/analytics-check.ts` — verify PostHog configuration, API key presence, and SDK initialization patterns
- `tools/event-list.ts` — scan source files for tracked event usage and list all events with their properties
