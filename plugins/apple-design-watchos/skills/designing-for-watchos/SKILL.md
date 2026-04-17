---
name: designing-for-watchos
description: "When a user glances at their Apple Watch, they understand it provides quick access to vital information and allows for simple, timely actions, regardless of whether the user is moving or stationary. Use when designing designing for watchos for watchOS, auditing designing for watchos against Apple's watchOS guidelines, or when the user says things like \"design designing for watchos for Apple Watch\", \"designing for watchos on watchOS\", \"how should designing for watchos work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Designing for watchOS
When a user glances at their Apple Watch, they understand it provides quick access to vital information and allows for simple, timely actions, regardless of whether the user is moving or stationary

## When to use
- User asks about **designing for watchos** on watchOS (e.g. `"how do I design designing for watchos for Apple Watch"`).
- User is building an Apple Watch UI that needs designing for watchos and wants to follow Apple's guidelines.
- User asks to audit or review designing for watchos in a watchOS design.
- User mentions designing for watchos in the context of an Apple Watch app, game, or interface.

When starting to design an app for Apple Watch, begin by understanding the following core device characteristics and interaction patterns unique to watchOS. Basing your design choices on these attributes will help you create an app that resonates with Apple Watch users.

- **Display.** The small display of the Apple Watch fits on the wrist while still offering a high-resolution, easily readable experience.
- **Ergonomics.** Since users wear the Apple Watch, they are typically within a foot of the display. They raise their wrist to view it and use their opposite hand to interact with the device. Furthermore, the Always On display allows users to view information on the watch face even when their wrist is lowered.
- **Inputs.** Users can navigate vertically or review data by turning the [Digital Crown](digital-crown.md), which provides consistent control across the watch face, Home Screen, and within apps. They can also provide input while in motion using standard [gestures](gestures.md) such as tap, swipe, and drag. Pressing the [Action button](action-button.md) enables an essential action without requiring visual confirmation, and using [shortcuts](siri.md#Shortcuts-and-suggestions) allows users to perform routine tasks quickly and efficiently. Users can also leverage data provided by device features, including GPS, sensors for heart function and blood oxygen, and the altimeter, accelerometer, and gyroscope.
- **App interactions.** Users frequently check the Always On display multiple times a day, performing brief app interactions that usually take less than a minute. Users often engage with related experiences of a watchOS app—such as complications, notifications, and Siri interactions—more than they use the core application itself.
- **System features.** watchOS includes several features that enable users to interact with the system and their apps in predictable, familiar ways.
- [Complications](complications.md)
- [Notifications](notifications.md)
- [Always On](always-on.md)
- [Watch faces](watch-faces.md)

### Best practices
Excellent Apple Watch experiences are streamlined and specialized, integrating the platform and device capabilities users value most. To ensure your experience feels native to watchOS, prioritize these approaches for incorporating features and capabilities:

- Support interactions that are quick and glanceable, delivering essential information concisely and enabling users to perform specific actions with minimal gestures.
- Keep the app's navigation hierarchy shallow, utilizing the [Digital Crown](digital-crown.md) for vertical scrolling or screen switching.
- Tailor the experience by proactively predicting user needs and leveraging on-device data to deliver actionable, contextually relevant content immediately or very soon.
- Employ [complications](complications.md) to display relevant, potentially dynamic data and graphics directly on the watch face, allowing users to view them upon each wrist raise and tap into your app.
- Utilize [notifications](notifications.md) to convey timely, high-value information and allow users to execute important actions without launching your application.
- Use background content, such as [color](color.md), to convey useful supplementary information, and use [materials](materials.md) to illustrate hierarchy and spatial context.
- Design your app to operate autonomously, providing additional details and functionality that complements its notifications and complications.
