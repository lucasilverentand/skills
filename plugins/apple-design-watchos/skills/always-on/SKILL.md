---
name: always-on
description: "On devices equipped with Always On display, the system can keep an app's interface visible even when users pause interaction with the device. Use when designing always on for watchOS, auditing always on against Apple's watchOS guidelines, or when the user says things like \"design always on for Apple Watch\", \"always on on watchOS\", \"how should always on work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Always On
On devices equipped with Always On display, the system can keep an app's interface visible even when users pause interaction with the device

## When to use
- User asks about **always on** on watchOS (e.g. `"how do I design always on for Apple Watch"`).
- User is building an Apple Watch UI that needs always on and wants to follow Apple's guidelines.
- User asks to audit or review always on in a watchOS design.
- User mentions always on in the context of an Apple Watch app, game, or interface.

In Always On mode, a device can continue providing useful, glanceable information in a power-efficient and privacy-conscious manner by dimming the display and minimizing on-screen movement. The content displayed differs depending on the device.

- On iPhone 14 Pro and iPhone 14 Pro Max, the system presents Lock Screen items like [Widgets](widgets.md) and [Live Activities](live-activities.md) when the device is set face up and interaction stops.
- When a user lowers their wrist while wearing an Apple Watch, the system dims the watch face, maintaining the app's interface display as long as it is either in the foreground or running a background session.

Both devices will show notifications while in Always On, and users can tap the display to exit this mode and resume interaction.

### Best practices
- **Hide sensitive information.** It is essential to redact private data that casual observers should not view, such as health metrics or financial balances. You must also conceal personal information that might be visible in a notification; refer to [Notifications](notifications.md) for specific guidance.
- **Keep other types of personal information glanceable when it makes sense.** For instance, on the Apple Watch, users often value seeing pace and heart rate data during exercise. Similarly, iPhone users appreciate quick updates regarding flight arrivals or ride-sharing service arrival notifications. If no information should be visible, users have the option to disable Always On.
- **Keep important content legible and dim nonessential content.** You can enhance visual hierarchy by increasing the dimming applied to secondary text, images, and color fills, thereby emphasizing information critical to the user. For example, a task management application could remove row backgrounds and subdue each item's supplementary details to highlight the main title. Additionally, if you display large areas of color or rich imagery, consider removing the images and using dimmed colors instead.
- **Maintain a consistent layout.** Avoid introducing distracting interface changes when Always On begins or ends, and throughout the entire Always On experience. For example, upon entering Always On mode, prefer transitioning an interactive element into a non-interactive state rather than simply removing it. Within the Always On context, aim for infrequent and subtle interface updates. For example, a fitness application might pause detailed play-by-play updates while in Always On, only refreshing the score when it changes. Note that unnecessary modifications during Always On can be particularly distracting on iPhone, as users often place their device face up on a surface, making screen motion visible even when they are not looking directly at it.
- **Gracefully transition motion to a resting state; don’t stop it instantly.** A smooth conclusion of current activity helps communicate the transition and prevents users from thinking that an error has occurred.
