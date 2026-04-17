---
name: images
description: "To ensure optimal visual quality across all supported devices, familiarize yourself with how the system renders content and how to provide assets at the correct scale factors. Use when designing images for tvOS, auditing images against Apple's tvOS guidelines, or when the user says things like \"design images for Apple TV\", \"images on tvOS\", \"how should images work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Images
To ensure optimal visual quality across all supported devices, familiarize yourself with how the system renders content and how to provide assets at the correct scale factors

## When to use
- User asks about **images** on tvOS (e.g. `"how do I design images for Apple TV"`).
- User is building an Apple TV UI that needs images and wants to follow Apple's guidelines.
- User asks to audit or review images in a tvOS design.
- User mentions images in the context of an Apple TV app, game, or interface.

## Quick principles
- **Provide high-resolution assets for all bitmap images in your app, for every device you support** — As you incorporate each image into your project’s asset catalog, identify its scale factor by appending “@1x,” “@2x,” or “@3x” to its…
- **In general, design images at the lowest resolution and scale them up to generate high-resolution assets** — When utilizing resizable vectorized shapes, you may wish to place control points at integer values to ensure clean alignment at 1x
- **Include a color profile with each image** — These profiles guarantee that your application's colors render as intended across diverse displays
- **Always test images on a range of actual devices** — An image that appears flawless during the design phase may display as pixelated, stretched, or compressed when viewed on different hardware
- **Use standard interface elements to display layered images** — When you employ standard views and system-provided focus APIs—such as [FocusState](apple:SwiftUI/FocusState)—layered images will automatically receive the parallax treatment when brought into focus
- **Identify logical foreground, middle, and background elements** — Foreground layers should display primary content, such as a game character or text on an album cover or movie poster
- **Generally, keep text in the foreground** — Unless you intend to obscure it, place text in the foreground layer for optimal legibility
- **Keep the background layer opaque** — While using varying levels of opacity to allow higher layers to show through is acceptable, your background layer must remain opaque—an error…
- **Keep layering simple and subtle** — Parallax is intended to be nearly imperceptible
- **Leave a safe zone around the foreground layers of your image** — When focused, content on certain layers may be cropped as the layered image scales and moves
- **Always preview layered images** — To ensure your layered images render correctly on Apple TV, preview them throughout the design process using Xcode, the Parallax Previewer app…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
