---
name: dark-mode
description: "Dark Mode is a system-wide appearance setting that utilizes a dark color palette to deliver a comfortable viewing experience optimized for low-light environments. Use when designing dark mode for iOS and iPadOS, auditing dark mode against Apple's iOS and iPadOS guidelines, or when the user says things like \"design dark mode for iPhone\", \"dark mode on iOS and iPadOS\", \"how should dark mode work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Dark Mode
Dark Mode is a system-wide appearance setting that utilizes a dark color palette to deliver a comfortable viewing experience optimized for low-light environments

## When to use
- User asks about **dark mode** on iOS and iPadOS (e.g. `"how do I design dark mode for iPhone"`).
- User is building an iPhone UI that needs dark mode and wants to follow Apple's guidelines.
- User asks to audit or review dark mode in an iOS and iPadOS design.
- User mentions dark mode in the context of an iPhone app, game, or interface.

## Quick principles
- **Avoid offering an app-specific appearance setting** — Providing a mode unique to your application increases user cognitive load, as they must manage multiple settings to achieve their desired look
- **Ensure that your app looks good in both appearance modes** — Beyond selecting a single mode, users may utilize the Auto appearance setting
- **Test your content to make sure that it remains comfortably legible in both appearance modes** — For instance, when Dark Mode is combined with Increase Contrast and Reduce Transparency (used individually or together), you might encounter instances where…
- **In rare cases, consider using only a dark appearance in the interface** — For example, an application supporting immersive media playback might benefit from maintaining a perpetually dark appearance
- **Embrace colors that adapt to the current appearance** — Semantic colors (like [labelColor](apple:AppKit/NSColor/labelColor) and [controlColor](apple:AppKit/NSColor/controlColor) in macOS or [separator](apple:UIKit/UIColor/separator) in iOS and iPadOS) automatically adjust to the current appearance
- **Aim for sufficient color contrast in all appearances** — Utilizing system-defined colors assists you in achieving a good contrast ratio between your foreground and background content
- **Soften the color of white backgrounds** — If you display a content image that features a white background, consider slightly darkening the image to prevent the background from glowing…
- **Utilize SF Symbols whenever feasible** — These symbols render effectively in either appearance mode when dynamic colors are applied for tinting or vibrancy is added
- **Develop distinct interface icons for light and dark appearances if required** — For instance, an icon representing a full moon might require a subtle dark outline to achieve contrast against a light background but…
- **Ensure that full-color images and icons appear correct in both appearances** — If an asset renders well across both light and dark modes, use a single version
- **Use the system-provided label colors for labels** — The primary, secondary, tertiary, and quaternary label hues automatically adjust depending on the light or dark appearance mode
- **Use system views to draw text fields and text views** — System controls ensure your application's typography appears polished on any background, automatically accommodating the presence or absence of vibrancy

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
