---
name: sf-symbols
description: "SF Symbols offers thousands of uniform, highly adjustable symbols that integrate flawlessly with the San Francisco system font, automatically matching text across all weights and sizes. Use when designing sf symbols for macOS, auditing sf symbols against Apple's macOS guidelines, or when the user says things like \"design sf symbols for Mac\", \"sf symbols on macOS\", \"how should sf symbols work on Mac\"."
allowed-tools: Read Grep Glob
---

# SF Symbols
SF Symbols offers thousands of uniform, highly adjustable symbols that integrate flawlessly with the San Francisco system font, automatically matching text across all weights and sizes

## When to use
- User asks about **sf symbols** on macOS (e.g. `"how do I design sf symbols for Mac"`).
- User is building a Mac UI that needs sf symbols and wants to follow Apple's guidelines.
- User asks to audit or review sf symbols in a macOS design.
- User mentions sf symbols in the context of a Mac app, game, or interface.

## Quick principles
- **Ensure that a symbol's rendering mode functions correctly in every context** — Since factors like symbol size and contrast against the background can influence how well users perceive a symbol's details, different rendering modes…
- **Use variable color to communicate change — don’t use it to communicate depth** — To effectively convey visual hierarchy and depth, utilize Hierarchical rendering mode to elevate specific layers and differentiate foreground from background elements within…
- **Apply symbol animations judiciously** — Although there is no limit to the number of animations you can apply to a view, excessive animation can overwhelm an interface…
- **Ensure that animations serve a clear purpose in communicating the symbol’s intent** — Each animation type has a distinct movement that communicates a specific action or elicits a particular response
- **Utilize symbol animations to communicate information more efficiently** — Animations provide visual feedback, reinforcing that an action has taken place within your interface
- **Consider your app’s tone when adding animations** — When animating a symbol, reflect on what the animation conveys and how that aligns with your brand identity and the app's overall…
- **Use the template as your reference** — Develop a custom symbol that matches the system-provided symbols in terms of optical weight, alignment, perspective, and level of detail
- **Apply negative side margins to your custom symbol if needed** — SF Symbols supports the use of negative side margins to assist with optical horizontal alignment when a symbol incorporates a badge or…
- **Optimize layers when using animations with custom symbols** — If you intend to animate your symbol by layer, ensure those layers are annotated within the SF Symbols application
- **Test animations thoroughly for custom symbols** — It is crucial to test your custom symbols using all animation presets because the shapes and paths may not behave as anticipated…
- **Avoid creating custom symbols that include common variants, such as enclosures or badges** — The SF Symbols app provides a component library specifically for generating variations of your custom symbol
- **Provide alternative text labels for custom symbols** — Alternative text labels, also known as accessibility descriptions, allow VoiceOver to describe visible UI and content, thereby simplifying navigation for users with…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/rendering-modes.md
- @references/gradients.md
- @references/variable-color.md
- @references/weights-and-scales.md
- @references/design-variants.md
- @references/animations.md
- @references/custom-symbols.md
