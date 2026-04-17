---
name: status-bars
description: "The status bar occupies the upper edge of the display and provides indicators regarding the device's current operational state, such as the time, cellular carrier, and battery level. Use when designing status bars for macOS, auditing status bars against Apple's macOS guidelines, or when the user says things like \"design status bars for Mac\", \"status bars on macOS\", \"how should status bars work on Mac\"."
allowed-tools: Read Grep Glob
---

# Status bars
The status bar occupies the upper edge of the display and provides indicators regarding the device's current operational state, such as the time, cellular carrier, and battery level

## When to use
- User asks about **status bars** on macOS (e.g. `"how do I design status bars for Mac"`).
- User is building a Mac UI that needs status bars and wants to follow Apple's guidelines.
- User asks to audit or review status bars in a macOS design.
- User mentions status bars in the context of a Mac app, game, or interface.

### Best practices
- **Obscure content under the status bar.** By default, the status bar background is transparent, allowing underlying content to be visible. This transparency can compromise the visibility of information presented in the status bar itself. If controls are placed behind the status bar, users may attempt to interact with them unsuccessfully. Ensure the status bar remains legible and do not suggest that content behind it is interactive. It is recommended to utilize a scroll edge effect to display a blurred view beneath the status bar. For technical guidance, consult [ScrollEdgeEffectStyle](apple:SwiftUI/ScrollEdgeEffectStyle) and [UIScrollEdgeEffect](apple:UIKit/UIScrollEdgeEffect).
- **Consider temporarily hiding the status bar when displaying full-screen media.** A visible status bar can detract from the user's focus on media content. To achieve a more immersive experience, these interface elements should be temporarily concealed. For instance, the Photos app conceals the status bar and other UI components while users view full-screen images.
- **Avoid permanently hiding the status bar.** If the status bar is absent, users must exit your application to check essential information like time or Wi-Fi connectivity. Allow users to reveal a hidden status bar using an intuitive and easily discoverable gesture. For example, when viewing full-screen photos in the Photos app, a single tap restores visibility of the status bar.
