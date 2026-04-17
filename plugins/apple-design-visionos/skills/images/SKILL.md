---
name: images
description: "To ensure optimal visual quality across all supported devices, familiarize yourself with how the system renders content and how to provide assets at the correct scale factors. Use when designing images for visionOS, auditing images against Apple's visionOS guidelines, or when the user says things like \"design images for Apple Vision Pro\", \"images on visionOS\", \"how should images work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Images
To ensure optimal visual quality across all supported devices, familiarize yourself with how the system renders content and how to provide assets at the correct scale factors

## When to use
- User asks about **images** on visionOS (e.g. `"how do I design images for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs images and wants to follow Apple's guidelines.
- User asks to audit or review images in a visionOS design.
- User mentions images in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Provide high-resolution assets for all bitmap images in your app, for every device you support** — As you incorporate each image into your project’s asset catalog, identify its scale factor by appending “@1x,” “@2x,” or “@3x” to its…
- **In general, design images at the lowest resolution and scale them up to generate high-resolution assets** — When utilizing resizable vectorized shapes, you may wish to place control points at integer values to ensure clean alignment at 1x
- **Include a color profile with each image** — These profiles guarantee that your application's colors render as intended across diverse displays
- **Always test images on a range of actual devices** — An image that appears flawless during the design phase may display as pixelated, stretched, or compressed when viewed on different hardware
- **Create a layered app icon** — App icons in visionOS consist of two or three layers that create an appearance of depth by moving at slightly different rates…
- **Prefer vector-based art for 2D images** — Bitmap content should be avoided because it may render poorly when the system scales it up
- **If you need to use rasterized images, balance quality with performance as you choose a resolution** — While an @2x image appears acceptable at typical viewing distances, its fixed resolution prevents dynamic scaling by the system and may appear…
- **Ensure that spatial photos are rendered accurately within your application** — To display a spatial photo in your app, use the stereo High-Efficiency Image Codec (HEIC) format
- **Prefer the feathered glass background effect when displaying text over spatial photos** — If your app or game requires placing text on top of a spatial photo, utilize the feathered glass background effect
- **Consider visual comfort when creating spatial photos from existing 2D content** — When modifying a photo's spatial metadata for your app or game, consider the intended viewing experience
- **Display spatial photos and spatial scenes in standalone views** — Avoid presenting spatial photos integrated with other content, as this can lead to visual discomfort
- **Use spatial scenes for specific, impactful moments within your app** — Since generating a spatial scene from an existing image may require several seconds, design experiences accounting for this generation time

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
