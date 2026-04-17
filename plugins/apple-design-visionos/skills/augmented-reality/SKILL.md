---
name: augmented-reality
description: "Augmented reality (AR) enables you to provide deeply engaging and immersive experiences by seamlessly merging virtual elements with the physical world. Use when designing augmented reality for visionOS, auditing augmented reality against Apple's visionOS guidelines, or when the user says things like \"design augmented reality for Apple Vision Pro\", \"augmented reality on visionOS\", \"how should augmented reality work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Augmented reality
Augmented reality (AR) enables you to provide deeply engaging and immersive experiences by seamlessly merging virtual elements with the physical world

## When to use
- User asks about **augmented reality** on visionOS (e.g. `"how do I design augmented reality for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs augmented reality and wants to follow Apple's guidelines.
- User asks to audit or review augmented reality in a visionOS design.
- User mentions augmented reality in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Only offer AR features on devices that support them** — If your app's core function is AR, restrict its availability solely to hardware compatible with ARKit
- **Let people use the entire display** — Maximize the screen real estate dedicated to displaying both the physical world and your application's virtual elements
- **Strive for convincing illusions when placing realistic objects** — Design highly detailed 3D assets with lifelike textures so that objects appear genuinely integrated into the physical environment where they are placed
- **Consider how virtual objects with reflective surfaces show the environment** — Reflections in ARKit are approximations based on the camera-captured environment
- **Use audio and haptics to enhance the immersive experience** — A sound effect or vibration is an effective way to confirm that a virtual object has made contact with a physical surface…
- **Minimize text in the environment** — Only display the information that is essential for your app experience
- **If additional information or controls are necessary, consider displaying them in screen space** — Content displayed in *screen space* appears fixed to a consistent location, either within the virtual world or, less commonly, on the device…
- **Consider using indirect controls when you need to provide persistent controls** — *Indirect controls* are not part of the virtual environment; rather, they are 2D controls presented in screen space
- **Anticipate that people will use your app in a wide variety of real-world environments** — Users may launch your app in locations with limited movement space or without large, flat surfaces
- **Be mindful of people’s comfort** — Prolonged use of a device held at a specific distance or angle can cause fatigue
- **If your app encourages people to move, introduce motion gradually** — For example, you shouldn't require users to dodge a virtual projectile immediately upon entering your AR game
- **Be mindful of people’s safety** — When users are immersed in an AR experience, they may not be fully aware of their physical surroundings, so rapid, sweeping, or…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/providing-coaching.md
- @references/helping-people-place-objects.md
- @references/designing-object-interactions.md
- @references/offering-a-multiuser-experience.md
- @references/reacting-to-real-world-objects.md
- @references/communicating-with-people.md
- @references/handling-interruptions.md
- @references/suggesting-problem-resolutions.md
- @references/icons-and-badges.md
- @references/platform-guidance-visionos.md
