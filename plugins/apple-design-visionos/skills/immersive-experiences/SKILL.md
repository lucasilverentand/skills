---
name: immersive-experiences
description: "visionOS enables you to develop applications and games that go beyond conventional windows and volumes, providing users with deep immersion into your content. Use when designing immersive experiences for visionOS, auditing immersive experiences against Apple's visionOS guidelines, or when the user says things like \"design immersive experiences for Apple Vision Pro\", \"immersive experiences on visionOS\", \"how should immersive experiences work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Immersive experiences
visionOS enables you to develop applications and games that go beyond conventional windows and volumes, providing users with deep immersion into your content

## When to use
- User asks about **immersive experiences** on visionOS (e.g. `"how do I design immersive experiences for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs immersive experiences and wants to follow Apple's guidelines.
- User asks to audit or review immersive experiences in a visionOS design.
- User mentions immersive experiences in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Use dimmed passthrough to direct attention to your content** — You can subtly tint or dim the passthrough and other visible elements, drawing focus to your app in the Shared Space without…
- **Create unbounded 3D experiences** — Utilize the `mixed` immersion style in a Full Space to blend your content with passthrough
- **Use `progressive` immersion to blend your custom environment with a person’s surroundings** — The `progressive` style in a Full Space allows you to display a custom environment that partially overlays the passthrough
- **Use `full` immersion to achieve a completely immersive experience** — The `full` style in a Full Space allows you to present a 360-degree custom environment that entirely replaces passthrough, transporting users to…
- **Provide users with multiple ways to interact with your application or game** — Beyond granting users the freedom to select their experience, it is crucial that you engineer your software to support the accessibility features…
- **Favor launching your application or game in the Shared Space or utilizing the `mixed` immersion style** — Launching within the Shared Space allows users to reference your app or game while simultaneously running other software, enabling fluid transitions between…
- **Dedicate immersion to significant moments and content** — Not every task warrants immersion, nor does every immersive task require full immersion
- **Assist users in engaging with critical moments within your app or game, regardless of the immersion level** — Cues such as dimming, tinting, [Motion](motion.md), [Scale](spatial-layout.md#Scale), and [visionOS](playing-audio.md#visionOS) can direct user attention to specific content areas, whether that content is viewed…
- **Use subtle tint colors for passthrough** — In visionOS 2 and subsequent versions, you can apply a tint to the passthrough view to help align the user's surroundings visually…
- **Prioritize users' visual comfort** — For instance, while 3D content can be placed anywhere during a Full Space session, it is preferable to position it within the…
- **Select an immersion style that accommodates potential user movements within your application or game** — Choosing the correct style is crucial because it enables the system to react appropriately to user movement
- **Do not encourage movement while using a progressive or fully immersive experience** — Some users may be unable to move, or they may simply not wish to move, due to physical limitations or their environment

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/immersion-and-passthrough.md
- @references/best-practices.md
- @references/promoting-comfort.md
- @references/transitioning-between-immersive-styles.md
- @references/displaying-virtual-hands.md
- @references/creating-an-environment.md
