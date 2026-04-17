---
name: accessibility
description: "Accessible user interfaces enable everyone to have a positive experience with your application or game. Use when designing accessibility for visionOS, auditing accessibility against Apple's visionOS guidelines, or when the user says things like \"design accessibility for Apple Vision Pro\", \"accessibility on visionOS\", \"how should accessibility work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Accessibility
Accessible user interfaces enable everyone to have a positive experience with your application or game

## When to use
- User asks about **accessibility** on visionOS (e.g. `"how do I design accessibility for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs accessibility and wants to follow Apple's guidelines.
- User asks to audit or review accessibility in a visionOS design.
- User mentions accessibility in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Intuitive** — Your interface provides familiar and consistent interactions, making task completion straightforward
- **Perceivable** — Your interface does not depend on a single method to convey information
- **Adaptable** — Your interface adjusts to how users wish to operate their device, either by supporting system accessibility features or allowing users to customize…
- **Support larger text sizes** — Ensure users can modify the size of your text and icons to improve legibility, visibility, and reading comfort
- **Use recommended defaults for custom type sizes** — Each platform maintains distinct default and minimum sizes for system-defined type styles to optimize readability
- **Consider that font weight also influences text readability** — If you utilize a custom font with a thin weight, aim for sizes larger than the recommended minimums to enhance legibility
- **Strive to meet color contrast minimum standards** — To guarantee all information within your app is legible, sufficient contrast must exist between foreground elements (text and icons) and background colors
- **Prefer system-defined colors** — These colors include accessible variations that automatically adjust when users modify their color preferences, such as activating Increase Contrast or switching between…
- **Convey information using more than color alone** — Some users have difficulty distinguishing between specific colors and shades
- **Support text-based methods for experiencing audio and video** — It is crucial that essential information or dialogue within your app or game is not conveyed solely through sound
- **Pair haptics with audio cues** — If your interface communicates information using auditory signals—such as a success chime, an error sound, or game feedback—consider pairing that sound with…
- **Enhance audio cues with visual indicators** — This is particularly important for games and spatial applications where critical content may be occurring outside the screen view

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/vision.md
- @references/hearing.md
- @references/mobility.md
- @references/speech.md
- @references/cognitive.md
- @references/platform-guidance-visionos.md
