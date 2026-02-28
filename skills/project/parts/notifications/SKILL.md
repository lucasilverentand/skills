---
name: notifications
description: Sets up push notifications for Expo (iOS/Android), APNs, and web push. Handles permission requests, token registration, deep linking from notifications, and server-side sending. Use when adding push notifications, managing notification permissions, or implementing notification-driven navigation.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Notifications

The `notifications` part provides push notification support across all platforms. Notification logic lives in a shared workspace package — platform-specific setup is minimal.

## Decision Tree

- What are you doing?
  - **Setting up push notifications from scratch** → see "Initial setup" below
  - **Requesting notification permissions** → see "Permission handling" below
  - **Sending push notifications from server** → see "Server-side sending" below
  - **Handling notification taps / deep linking** → see "Deep linking" below
  - **Adding web push** → see "Web push" below
  - **Checking notification config** → run `tools/notification-check.ts`
  - **Testing a push notification** → run `tools/push-test.ts`

## Initial setup

### Expo (React Native)

1. Install: `npx expo install expo-notifications expo-device expo-constants`
2. Configure in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

3. Create `packages/notifications/src/register.ts`:

```ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token.data;
}
```

4. Create `packages/notifications/src/handlers.ts`:

```ts
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function onNotificationTapped(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
```

## Permission handling

- Always check permission status before requesting — avoid repeated prompts
- If denied, show an in-app explanation with a link to system settings
- On iOS, permission can only be requested once — subsequent calls are no-ops
- Store the push token on the server tied to the user account

```ts
import { Linking } from "react-native";

async function handleDeniedPermission() {
  // Show explanation UI, then:
  await Linking.openSettings();
}
```

## Server-side sending

### Using Expo Push API

```ts
interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: "default" | null;
}

export async function sendPushNotification(message: PushMessage) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  return response.json();
}

// Batch sending (up to 100 per request)
export async function sendBatch(messages: PushMessage[]) {
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }
  const results = await Promise.all(
    chunks.map((chunk) =>
      fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      }).then((r) => r.json())
    )
  );
  return results.flat();
}
```

- Store push tokens in the database, associated with user accounts
- Remove tokens that return `DeviceNotRegistered` errors
- Use batch sending for bulk notifications

## Deep linking

Handle notification taps to navigate to specific screens:

```ts
import { router } from "expo-router";
import { onNotificationTapped } from "@scope/notifications";

useEffect(() => {
  const subscription = onNotificationTapped((response) => {
    const data = response.notification.request.content.data;
    if (data.screen) {
      router.push(data.screen as string);
    }
  });
  return () => subscription.remove();
}, []);
```

- Include a `screen` or `url` field in notification data for routing
- Handle both cold-start and warm-start notification taps
- Use `Notifications.getLastNotificationResponseAsync()` for cold starts:

```ts
useEffect(() => {
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      const data = response.notification.request.content.data;
      if (data.screen) router.push(data.screen as string);
    }
  });
}, []);
```

## Web push

For web push notifications using the Push API:

```ts
// Service worker: sw.js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Notification", {
      body: data.body,
      icon: "/icon-192.png",
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
```

- Generate VAPID keys: `npx web-push generate-vapid-keys`
- Store the public key in client config, private key in server env
- Register the service worker and subscribe in the client

## Key references

| File | What it covers |
|---|---|
| `tools/notification-check.ts` | Notification config, permissions setup, token storage |
| `tools/push-test.ts` | Send a test notification to a device token |
