---
name: designing-for-tvos
description: "tvOS provides vibrant content, deeply immersive experiences, and streamlined interactions across media/games, as well as in fitness, education, and home companion applications. Use when designing designing for tvos for tvOS, auditing designing for tvos against Apple's tvOS guidelines, or when the user says things like \"design designing for tvos for Apple TV\", \"designing for tvos on tvOS\", \"how should designing for tvos work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Designing for tvOS
tvOS provides vibrant content, deeply immersive experiences, and streamlined interactions across media/games, as well as in fitness, education, and home companion applications

## When to use
- User asks about **designing for tvos** on tvOS (e.g. `"how do I design designing for tvos for Apple TV"`).
- User is building an Apple TV UI that needs designing for tvos and wants to follow Apple's guidelines.
- User asks to audit or review designing for tvos in a tvOS design.
- User mentions designing for tvos in the context of an Apple TV app, game, or interface.

When you begin developing an app or game for tvOS, it is essential to understand the following fundamental device characteristics and usage patterns that define the tvOS experience. Basing your design choices on these attributes will help you create an app or game that resonates with tvOS users.

- **Display.** The television screen is typically very large and offers high resolution.
- **Ergonomics.** Although users are usually situated many feet away from their stationary TV—often eight feet or more—they may still interact with content while moving around the room.
- **Inputs.** Users can engage with Apple TV using a [remote](remotes.md), a [game controller](game-controls.md), their [voice](siri.md), or apps running on their other devices.
- **App interactions.** Users can become deeply absorbed in a single experience, which may last for hours. They also value the ability to use picture-in-picture mode to concurrently follow an alternative app or video.
- **System features.** Apple TV users expect your apps and games to integrate seamlessly with the following system experiences:
- [Integrating with the TV app](playing-video.md#Integrating-with-the-TV-app)
- [SharePlay](shareplay.md)
- [Top Shelf](top-shelf.md)
- [TV provider accounts](managing-accounts.md#TV-provider-accounts)

### Best practices
Exceptional tvOS experiences seamlessly integrate the platform and device features users value most. To ensure your application feels native to tvOS, prioritize incorporating these capabilities in the following ways:

- Facilitate powerful and enjoyable interactions using the fluid, intuitive gestures characteristic of the Siri Remote.
- Utilize the tvOS focus system to subtly highlight and expand content as users navigate through it, ensuring they are always aware of their location and next steps.
- Provide high-quality, edge-to-edge artwork, along with subtle, fluid animations and compelling audio, creating a rich, cinematic experience that remains clear, readable, and engaging even from a distance.
- Improve support for multiple users by making the sign-in process simple and infrequent, accommodating shared logins, and automatically switching profiles when a different person takes over viewing.
