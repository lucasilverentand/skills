---
name: windows
description: "A window displays the user interface views and components within your application or game. Use when designing windows for visionOS, auditing windows against Apple's visionOS guidelines, or when the user says things like \"design windows for Apple Vision Pro\", \"windows on visionOS\", \"how should windows work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Windows
A window displays the user interface views and components within your application or game

## When to use
- User asks about **windows** on visionOS (e.g. `"how do I design windows for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs windows and wants to follow Apple's guidelines.
- User asks to audit or review windows in a visionOS design.
- User mentions windows in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Ensure your windows adapt fluidly to different sizes to support multiwindow and multitasking workflows** — Refer to [Layout](layout.md) and [Multitasking](multitasking.md) for detailed guidance
- **Determine the appropriate time to open a new window** — Presenting content in a separate window is beneficial for preserving context or enabling multitasking
- **Provide users with the option to view content in a new window** — Although it is recommended not to default to opening new windows unless it enhances the user experience, offering flexibility in how users…
- **Do not build custom window user interfaces** — System-managed windows possess a predictable appearance and behavior that users recognize
- **Prefer using a window to present a familiar interface and to support familiar tasks** — To help users feel comfortable with your application, display an interface they already know, reserving [Immersive experiences](immersive-experiences.md) for the core activities and…
- **Retain the window’s glass background** — The default glass material allows your content to feel integrated into the user's environment while dynamically adjusting to lighting conditions and using…
- **Choose an initial window size that minimizes empty areas within it** — By default, a window is sized at 1280x720 pt
- **Aim for an initial shape that suits a window’s content** — For instance, a default Safari window is tall because most webpages are much longer than they are wide, whereas a default Keynote…
- **Choose a minimum and maximum size for each window to help keep your content looking great** — Users value the ability to customize their viewing experience by resizing windows, but you must ensure your layout remains functional across all…
- **Minimize the depth of 3D content you display in a window** — The system adds highlights and shadows to views and controls within the window, giving them a sense of [Depth](spatial-layout.md#Depth) and making them…
- **Prioritize using a volume for rich, 3D content** — Conversely, if your goal is to present a conventional, UI-focused interface, utilizing [visionOS windows](#visionOS-windows) is usually the most effective approach
- **Position 2D content so it renders well from multiple viewpoints** — Since a person's perspective shifts as they move around a volume, the placement of 2D content within it might appear to change…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-best-practices-overview.md
- @references/guidelines-best-practices-visionos-windows.md
- @references/guidelines-best-practices-visionos-volumes.md
