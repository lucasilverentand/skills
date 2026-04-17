---
name: apple-pencil-and-scribble
description: "The Apple Pencil enables drawing, handwriting, and annotation with natural ease, while also functioning effectively as a pointer and UI interaction device. Use when designing apple pencil and scribble for iOS and iPadOS, auditing apple pencil and scribble against Apple's iOS and iPadOS guidelines, or when the user says things like \"design apple pencil and scribble for iPhone\", \"apple pencil and scribble on iOS and iPadOS\", \"how should apple pencil and scribble work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Apple Pencil and Scribble
The Apple Pencil enables drawing, handwriting, and annotation with natural ease, while also functioning effectively as a pointer and UI interaction device

## When to use
- User asks about **apple pencil and scribble** on iOS and iPadOS (e.g. `"how do I design apple pencil and scribble for iPhone"`).
- User is building an iPhone UI that needs apple pencil and scribble and wants to follow Apple's guidelines.
- User asks to audit or review apple pencil and scribble in an iOS and iPadOS design.
- User mentions apple pencil and scribble in the context of an iPhone app, game, or interface.

## Quick principles
- **Support behaviors users naturally expect from a marking instrument** — Most individuals are familiar with physical marking tools, and this background knowledge shapes their expectations when using Apple Pencil within your application
- **Allow users control over switching between Apple Pencil and finger input** — For example, if your app supports Apple Pencil for marking, ensure that the application's controls are also responsive to Apple Pencil input…
- **Enable marking the instant Apple Pencil contacts the display** — The experience of applying Apple Pencil to the screen must mirror putting a classic pencil on paper; therefore, it is crucial that…
- **Enable self-expression by responding to how Apple Pencil is used** — Apple Pencil can detect tilt (altitude), force (pressure), orientation (azimuth), and [Barrel roll](#Barrel-roll)
- **Provide visual feedback confirming a direct link to the content** — Ensure that Apple Pencil appears to be immediately and directly manipulating the content it touches on screen
- **Optimize for both left- and right-handed usage** — Avoid placing controls in locations that may be blocked by either hand
- **Use hover to help users predict the outcome when Apple Pencil interacts with the screen** — For instance, while the Apple Pencil is held above the display, a hover preview can indicate the dimensions and color of the…
- **Do not use hover to initiate an action** — Unlike tapping a button or marking the screen, hovering is a relatively imprecise motion that does not require users to precisely control…
- **Prefer displaying a preview value that falls near the middle of a range of dynamic values** — Dynamic properties, such as opacity or flow, are challenging to accurately represent at the highest or lowest limits of their spectrum
- **Prefer showing hover previews for Apple Pencil, not for a pointing device** — While a pointing device can also respond to hover gestures, providing identical visual feedback for both devices may cause confusion
- **Respect people’s settings for the double-tap gesture when they make sense in your app** — By default, Apple Pencil models that support this gesture toggle between the active tool and the eraser
- **Give people a way to specify custom double-tap behavior if necessary** — If your app offers unique double-tap actions alongside or instead of the default behaviors, you must provide a control allowing users to…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/hover.md
- @references/double-tap.md
- @references/squeeze.md
- @references/barrel-roll.md
- @references/scribble.md
- @references/custom-drawing.md
