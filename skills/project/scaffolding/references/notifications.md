# Notifications

Push notification support across Expo (iOS/Android) and web.

## Setup (Expo)

1. Install: `npx expo install expo-notifications expo-device expo-constants`
2. Configure `app.json` with expo-notifications plugin and `UIBackgroundModes`
3. Create `packages/notifications/src/register.ts` for permission handling and token registration

### Token registration

```ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = newStatus;
  }
  if (finalStatus !== "granted") return null;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}
```

## Permission handling

- Check permission status before requesting — avoid repeated prompts
- If denied, show in-app explanation with link to system settings
- Store push tokens in the database tied to user accounts

## Server-side sending

```ts
export async function sendPushNotification(message: PushMessage) {
  return fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  }).then((r) => r.json());
}
```

- Batch up to 100 messages per request
- Remove tokens that return `DeviceNotRegistered` errors

## Deep linking from notifications

```ts
import { router } from "expo-router";
import { onNotificationTapped } from "@scope/notifications";

// Include a `screen` field in notification data for routing
const subscription = onNotificationTapped((response) => {
  const data = response.notification.request.content.data;
  if (data.screen) router.push(data.screen as string);
});
```

- Handle both cold-start and warm-start taps
- Use `Notifications.getLastNotificationResponseAsync()` for cold starts

## Web push

Use the Push API with service workers. Generate VAPID keys: `npx web-push generate-vapid-keys`.

## Tools

| Tool | Purpose |
|---|---|
| `tools/notification-check.ts` | Notification config, permissions setup, token storage |
| `tools/push-test.ts` | Send a test notification to a device token |
