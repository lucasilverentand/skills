---
name: boxes
description: "A box groups related information and components into a visually distinct unit. Use when designing boxes for iOS and iPadOS, auditing boxes against Apple's iOS and iPadOS guidelines, or when the user says things like \"design boxes for iPhone\", \"boxes on iOS and iPadOS\", \"how should boxes work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Boxes
A box groups related information and components into a visually distinct unit

## When to use
- User asks about **boxes** on iOS and iPadOS (e.g. `"how do I design boxes for iPhone"`).
- User is building an iPhone UI that needs boxes and wants to follow Apple's guidelines.
- User asks to audit or review boxes in an iOS and iPadOS design.
- User mentions boxes in the context of an iPhone app, game, or interface.

By default, it uses a visible border or background color to separate its contents from the rest of the interface. A box may also include a title.

### Best practices
Keep a box relatively modest in size compared to its containing view. As a box approaches the dimensions of the screen or window, it loses effectiveness in communicating content separation and may crowd adjacent elements.

Use padding and alignment cues to convey additional grouping within a box. Since the border of a box is a distinct visual element, adding nested boxes to define subgroups can make your interface feel busy and constrained.

### Content
- **Provide a concise introductory title if it enhances clarity regarding the box's contents.** While the visual container suggests relatedness, a title allows you to specify the nature of that relationship. Furthermore, titles assist VoiceOver users in anticipating the information they will encounter within the box.
- **If a title is necessary, compose a brief phrase that accurately describes the contents.** Use sentence-style capitalization. Do not include terminal punctuation unless the box resides within a settings pane, in which case you must append a colon to the title.

## Platform guidance — iOS & iPadOS
By default, iOS and iPadOS render boxes using the secondary and tertiary background [colors](color.md).
