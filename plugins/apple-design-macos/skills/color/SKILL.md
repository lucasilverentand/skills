---
name: color
description: "Thoughtful color usage serves multiple purposes: enhancing communication, establishing brand identity, ensuring visual continuity, conveying status and feedback, and improving information comprehen…. Use when designing color for macOS, auditing color against Apple's macOS guidelines, or when the user says things like \"design color for Mac\", \"color on macOS\", \"how should color work on Mac\"."
allowed-tools: Read Grep Glob
---

# Color
Thoughtful color usage serves multiple purposes: enhancing communication, establishing brand identity, ensuring visual continuity, conveying status and feedback, and improving information comprehension

## When to use
- User asks about **color** on macOS (e.g. `"how do I design color for Mac"`).
- User is building a Mac UI that needs color and wants to follow Apple's guidelines.
- User asks to audit or review color in a macOS design.
- User mentions color in the context of a Mac app, game, or interface.

## Quick principles
- **Avoid using the same color to signify multiple concepts** — Maintain strict color consistency throughout your interface, especially when colors are used to convey information such as status or interactivity
- **Ensure your app's colors render correctly across light, dark, and high-contrast modes** — iOS, iPadOS, macOS, and tvOS support both light and [Dark Mode](dark-mode.md) appearances
- **Validate your app's color scheme under diverse lighting conditions** — The way colors appear varies depending on whether the app is viewed outdoors in sunlight or indoors in low light
- **Test your application across different devices** — For example, the True Tone display (found on select iPhone, iPad, and Mac models) automatically uses ambient light sensors to adjust the…
- **Consider the influence of artwork and translucency on adjacent colors** — Variations in artwork may necessitate adjustments to nearby colors to maintain visual coherence and prevent interface elements from appearing either overwhelming or…
- **If your app allows users to select colors, prioritize system-provided color controls when available** — Utilizing native color pickers ensures a unified user experience and allows users to save palettes accessible from any application
- **Do not use color as the sole means to distinguish objects, signal interactivity, or convey critical information** — If you employ color to communicate data, ensure that the same information is conveyed through alternative means so users with visual impairments…
- **Do not select colors that impair the legibility of content within your application** — For example, low contrast levels can cause text and icons to merge with the background, hindering readability, and certain color combinations may…
- **Take into account how your chosen colors may be interpreted across different countries and cultures** — For example, while red signifies danger in some societies, it carries positive associations in others
- **Do not hardcode system color values within your application** — The documented color values should only serve as a reference during the design phase
- **Do not redefine the inherent meaning of dynamic system colors** — To guarantee a cohesive user experience and maintain visual quality when the platform's appearance shifts, utilize dynamic system colors according to their…
- **Apply color sparingly to the Liquid Glass material, and to symbols or text on the material** — If you introduce color, reserve it only for elements that genuinely benefit from emphasis, such as primary actions or status indicators

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/inclusive-color.md
- @references/system-colors.md
- @references/liquid-glass-color.md
- @references/color-management.md
- @references/platform-guidance-macos.md
- @references/specifications.md
