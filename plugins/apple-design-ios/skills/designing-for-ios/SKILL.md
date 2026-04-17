---
name: designing-for-ios
description: "iPhone serves as a central device for users to maintain connectivity, engage in games and media consumption, complete tasks, and monitor personal data regardless of location or mobility. Use when designing designing for ios for iOS and iPadOS, auditing designing for ios against Apple's iOS and iPadOS guidelines, or when the user says things like \"design designing for ios for iPhone\", \"designing for ios on iOS and iPadOS\", \"how should designing for ios work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Designing for iOS
iPhone serves as a central device for users to maintain connectivity, engage in games and media consumption, complete tasks, and monitor personal data regardless of location or mobility

## When to use
- User asks about **designing for ios** on iOS and iPadOS (e.g. `"how do I design designing for ios for iPhone"`).
- User is building an iPhone UI that needs designing for ios and wants to follow Apple's guidelines.
- User asks to audit or review designing for ios in an iOS and iPadOS design.
- User mentions designing for ios in the context of an iPhone app, game, or interface.

When beginning the design process for an iOS application or game, it is essential to understand the following core device characteristics and interaction patterns that define the iOS user experience. Leveraging these traits in your design choices will help you create an app or game that iPhone users value.

- **Display.** The iPhone features a high-resolution, medium-sized display.
- **Ergonomics.** Users typically hold the iPhone in one or both hands during interaction, fluidly transitioning between portrait and landscape orientations as necessary. Furthermore, viewing distance usually remains within a few feet during use.
- **Inputs.** Actions and meaningful tasks can be executed while mobile using Multi-Touch [gestures](gestures.md), [virtual keyboards](virtual-keyboards.md), and voice commands via [Siri](siri.md). Additionally, users often expect apps to utilize their [personal data](privacy.md) and input from the device’s [gyroscope and accelerometer](gyro-and-accelerometer.md), and they may also wish to engage in [spatial interactions](spatial-interactions.md).
- **App interactions.** User sessions vary widely; some may involve checking updates, tracking data, or sending messages for only a minute or two. Conversely, users might spend an hour or more browsing content, playing games, or enjoying media. Users commonly have multiple applications running concurrently and appreciate the ability to switch between them frequently.
- **System features.** iOS offers several integrated features that allow users to interact with the system and their applications in predictable, familiar ways.
- [Widgets](widgets.md)
- [Home Screen quick actions](home-screen-quick-actions.md)
- [Spotlight](searching.md)
- [Shortcuts](siri.md#Shortcuts-and-suggestions)
- [Activity views](activity-views.md)

### Best practices
Exceptional iPhone experiences integrate platform and device functionalities that users value most. To ensure your design feels native to iOS, prioritize the following methods for incorporating these features and capabilities:

- Allow users to focus on core content and primary tasks by restricting the number of onscreen controls, while ensuring secondary details and actions remain discoverable with minimal effort.
- Adjust fluidly to visual configuration changes—such as device orientation, Dark Mode, and Dynamic Type—allowing users to select the settings that best suit their preferences.
- Support interactions that align with how users typically hold their device. For instance, placing controls in the middle or lower portion of the display is generally easier and more comfortable for users to reach, making it crucial to allow swiping for navigation or initiating actions within a list row.
- With user consent, integrate information available through platform capabilities in ways that enrich the experience without requiring users to input new data. Examples include accepting payments, providing security via biometric authentication, or offering features that utilize the device’s location.
