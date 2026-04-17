---
name: typography
description: "Typographic decisions enable you to display readable text, establish an information hierarchy, communicate critical content, and convey your brand identity or style. Use when designing typography for watchOS, auditing typography against Apple's watchOS guidelines, or when the user says things like \"design typography for Apple Watch\", \"typography on watchOS\", \"how should typography work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Typography
Typographic decisions enable you to display readable text, establish an information hierarchy, communicate critical content, and convey your brand identity or style

## When to use
- User asks about **typography** on watchOS (e.g. `"how do I design typography for Apple Watch"`).
- User is building an Apple Watch UI that needs typography and wants to follow Apple's guidelines.
- User asks to audit or review typography in a watchOS design.
- User mentions typography in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Select font sizes optimized for readability** — Your content must be readable across different viewing distances and environmental conditions
- **Validate legibility across different contexts** — For instance, if you are developing game text, you must test its readability on every platform your game supports
- **Generally, refrain from using light font weights** — For example, when utilizing system-provided fonts, favor Regular, Medium, Semibold, or Bold weights
- **Modify font weight, size, and color to highlight critical information and establish a clear hierarchy** — Ensure that the relative visual distinction and hierarchical structure of text elements remain consistent when users adjust text sizes
- **Limit the variety of typefaces used, even within a highly customized interface** — Employing numerous different fonts can confuse the information hierarchy and reduce readability, besides making the interface appear inconsistent or poorly conceived
- **Give precedence to critical content when accommodating text-size adjustments** — Not all information holds equal weight
- **Consider using the built-in text styles** — The system-defined text styles offer a consistent and convenient method for conveying your information hierarchy through font size and weight
- **Modify the built-in text styles if necessary** — System APIs define font adjustments—called *symbolic traits*—that allow you to modify certain aspects of a text style
- **If necessary, adjust tracking in interface mockups** — In a live application, the system font dynamically adjusts tracking at every point size
- **Ensure custom fonts are readable** — Users must be able to easily decipher your typeface across different viewing distances and under diverse conditions
- **Integrate accessibility features into custom fonts** — System fonts automatically support Dynamic Type (where available) and respond to user accessibility settings, such as Bold Text
- **Ensure your application's layout accommodates all font sizes** — Confirm that your design scales appropriately, and that text and glyphs remain legible across the full range of font sizes

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/ensuring-legibility.md
- @references/conveying-hierarchy.md
- @references/using-system-fonts.md
- @references/using-custom-fonts.md
- @references/supporting-dynamic-type.md
- @references/platform-guidance-watchos.md
- @references/specifications.md
