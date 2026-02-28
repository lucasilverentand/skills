# Notifications

Push notification module: Expo notifications, APNs, web push, and deep linking.

## Responsibilities

- Scaffold a notifications package in a bun workspace monorepo
- Register for push notifications and manage push tokens
- Send push notifications via the Expo Push API
- Handle notification receipt and tap response in React Native
- Configure Android notification channels
- Integrate notification taps with deep linking and expo-router navigation
- Support web push notifications via service workers and VAPID

## Tools

- `tools/notification-check.ts` — verify Expo project configuration, push token setup, and notification channel definitions
- `tools/push-test.ts` — send a test push notification to a given Expo push token for debugging
