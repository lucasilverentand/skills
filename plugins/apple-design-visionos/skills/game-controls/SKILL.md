---
name: game-controls
description: "Precise and intuitive controls improve gameplay quality and deepen player immersion. Use when designing game controls for visionOS, auditing game controls against Apple's visionOS guidelines, or when the user says things like \"design game controls for Apple Vision Pro\", \"game controls on visionOS\", \"how should game controls work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Game controls
Precise and intuitive controls improve gameplay quality and deepen player immersion

## When to use
- User asks about **game controls** on visionOS (e.g. `"how do I design game controls for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs game controls and wants to follow Apple's guidelines.
- User asks to audit or review game controls in a visionOS design.
- User mentions game controls in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Assess whether virtual controls are necessary on top of game content** — Generally, virtual controls benefit games with numerous actions or those requiring movement control
- **Position virtual buttons in easily accessible locations** — Consider the device's physical boundaries and [Guides and safe areas](layout.md#Guides-and-safe-areas), along with comfortable control placements
- **Ensure controls are adequately sized** — Make sure frequently used controls maintain a minimum size of 44x44 pt, while less critical controls like menus require a minimum size…
- **Always include visible and tactile press states** — A virtual control feels unresponsive without clear visual and physical feedback regarding its activation state
- **Use symbols that clearly communicate the actions** — Select artwork that visually represents the function of each button (e.g., a weapon graphic for attack)
- **Dynamically show and hide virtual controls based on gameplay context** — Utilize the dynamic nature of touch controls to adjust which controls are visible depending on the current game state
- **Consolidate functionality into a single control** — Consider redesigning game mechanics that currently require simultaneous or sequential button presses
- **Map movement and camera controls to predictable behavior** — Players typically expect the left side of the screen to control movement and the right side to control camera direction
- **Ensure support for the platform's default interaction method** — While a game controller is an optional accessory, every iPhone and iPad features a touchscreen, Macs offer keyboard/trackpad or mouse input, Apple…
- **Inform users about game controller prerequisites** — In tvOS and visionOS, it is permissible to require the use of a physical game controller
- **Automatically detect controller pairing status** — Instead of requiring players to manually configure a physical game controller, you can automatically determine if a controller is paired and retrieve…
- **Tailor onscreen content to the connected game controller** — To streamline your game's codebase, the Game Controller framework assigns standardized names to controller components based on their physical placement; however, the…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-touch-controls.md
- @references/guidelines-physical-controllers.md
- @references/guidelines-keyboards.md
