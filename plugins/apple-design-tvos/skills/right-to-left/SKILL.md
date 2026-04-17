---
name: right-to-left
description: "Implement support for right-to-left languages, such as Arabic and Hebrew, by mirroring your interface to align with the scripts' natural reading direction. Use when designing right to left for tvOS, auditing right to left against Apple's tvOS guidelines, or when the user says things like \"design right to left for Apple TV\", \"right to left on tvOS\", \"how should right to left work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Right to left
Implement support for right-to-left languages, such as Arabic and Hebrew, by mirroring your interface to align with the scripts' natural reading direction

## When to use
- User asks about **right to left** on tvOS (e.g. `"how do I design right to left for Apple TV"`).
- User is building an Apple TV UI that needs right to left and wants to follow Apple's guidelines.
- User asks to audit or review right to left in a tvOS design.
- User mentions right to left in the context of an Apple TV app, game, or interface.

## Quick principles
- **Adjust text alignment to match the interface direction, if the system doesn’t do so automatically** — If you have left-aligned text content in a left-to-right (LTR) environment, for instance, you must right-align that text to maintain its mirrored…
- **Align a paragraph based on its language, not on the current context** — If a paragraph—defined as having three or more lines of text—is misaligned relative to its inherent language, readability suffers
- **Do not alter the sequence of numerals within a specific number** — Regardless of the current language or surrounding content, the digits comprising a particular number—such as "541," a phone number, or a credit…
- **Reverse the numeral order when indicating progress or a counting direction; never invert the numerals themselves** — Controls like rating controls, sliders, and progress bars frequently use numerals to enhance clarity
- **Flip controls that show progress from one value to another** — Since users naturally associate forward movement with the reading direction of their language, controls like sliders and progress indicators must be reversed…
- **Flip controls that help people navigate or access items in a fixed order** — For instance, within an RTL context, a back button must point right to align the screen flow with the language's reading sequence
- **Preserve the direction of a control that refers to an actual direction or points to an onscreen area** — For example, if a control is designed to signify "to the right," it must consistently point right, irrespective of the current display…
- **Visually balance adjacent Latin and RTL scripts when necessary** — In titles, labels, or buttons, Arabic or Hebrew text may appear undersized next to all-caps Latin text because those scripts lack uppercase…
- **Avoid mirroring images, including photographs, illustrations, and general artwork** — Flipping an image often changes its intended meaning; furthermore, flipping a copyrighted visual could lead to infringement
- **Flip interface icons that represent text or reading direction** — For instance, if an icon uses left-aligned bars to signify text in a Left-to-Right (LTR) context, those bars must be right-aligned when…
- **Consider creating a localized version of an interface icon that displays text** — Some icons incorporate letters or words to convey a script-related concept, such as font size selection or a signature
- **Flip an interface icon that indicates forward or backward motion** — When movement occurs in the same direction as reading, users typically interpret this as forward; conversely, they tend to perceive movement in…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-text-alignment.md
- @references/guidelines-numbers-and-characters.md
- @references/guidelines-controls.md
- @references/guidelines-images.md
- @references/guidelines-interface-icons.md
