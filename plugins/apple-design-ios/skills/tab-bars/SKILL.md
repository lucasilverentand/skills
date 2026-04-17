---
name: tab-bars
description: "A tab bar enables users to navigate between the application's highest-level sections. Use when designing tab bars for iOS and iPadOS, auditing tab bars against Apple's iOS and iPadOS guidelines, or when the user says things like \"design tab bars for iPhone\", \"tab bars on iOS and iPadOS\", \"how should tab bars work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Tab bars
A tab bar enables users to navigate between the application's highest-level sections

## When to use
- User asks about **tab bars** on iOS and iPadOS (e.g. `"how do I design tab bars for iPhone"`).
- User is building an iPhone UI that needs tab bars and wants to follow Apple's guidelines.
- User asks to audit or review tab bars in an iOS and iPadOS design.
- User mentions tab bars in the context of an iPhone app, game, or interface.

## Quick principles
- **Utilize a tab bar for navigation between sections, not for providing actions** — A tab bar allows users to move between distinct parts of an application, similar to the Alarm, Stopwatch, and Timer views in…
- **Ensure the tab bar remains visible when users transition between sections of your app** — If you conceal the tab bar, users may lose track of their location within the application
- **Select the appropriate number of tabs necessary to facilitate app navigation** — Since the tab bar represents your app's hierarchy, you must balance the complexity introduced by extra tabs against the need for users…
- **Prevent overflow tabs** — Depending on the device size and orientation, the number of visible tabs may be less than the total count
- **Do not disable or hide tab bar buttons, even if their content is temporarily unavailable** — Having some tab bar buttons functional while others are not gives the impression that your app's interface is unstable and unpredictable
- **Include tab labels to aid navigation** — A tab label appears either below or beside a tab bar icon and assists navigation by clearly describing the content type or…
- **Consider using SF Symbols to provide recognizable and scalable tab bar icons** — When you use [SF Symbols](sf-symbols.md), the tab bar icons automatically adjust to different contexts
- **Use a badge to indicate the availability of critical information** — You can display a badge—a red oval containing white text and either a number or an exclamation point—on a tab to signal…
- **Avoid using similar colors for tab labels and content layer backgrounds** — If your app already features bright, colorful content in the content layer, opt for a monochromatic appearance for the tab bars, or…
- **Use a tab bar for navigation** — A tab bar grants users access to the most frequently used sections of your application
- **Allow users to customize the tab bar** — In applications with numerous sections that users may wish to access, it is beneficial to enable users to select and add frequently…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
