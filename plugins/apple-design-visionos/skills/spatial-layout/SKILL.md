---
name: spatial-layout
description: "Spatial arrangement techniques allow you to utilize the boundless canvas of Apple Vision Pro, enabling content presentation that is both comfortable and highly engaging. Use when designing spatial layout for visionOS, auditing spatial layout against Apple's visionOS guidelines, or when the user says things like \"design spatial layout for Apple Vision Pro\", \"spatial layout on visionOS\", \"how should spatial layout work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Spatial layout
Spatial arrangement techniques allow you to utilize the boundless canvas of Apple Vision Pro, enabling content presentation that is both comfortable and highly engaging

## When to use
- User asks about **spatial layout** on visionOS (e.g. `"how do I design spatial layout for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs spatial layout and wants to follow Apple's guidelines.
- User asks to audit or review spatial layout in a visionOS design.
- User mentions spatial layout in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Center important content within the field of view** — By default, visionOS launches an application directly ahead of users, positioning it within their field of view
- **Avoid anchoring content to the wearer’s head** — While your application should generally remain within the field of view, rigidly anchoring content statically in front of a person can induce…
- **Ensure visual cues accurately convey your content's depth** — If these visual indicators are absent or contradict a user’s real-world experience, it can lead to visual discomfort
- **Leverage depth to communicate hierarchy** — Depth assists an object in appearing distinct from surrounding content, thereby increasing its prominence
- **Generally, avoid applying depth effects to text** — Text that appears suspended above its background is difficult to read, which slows down the user and may sometimes induce vision discomfort
- **Ensure depth adds functional value** — Generally, you should employ depth to clarify and enhance the experience—it is not necessary everywhere
- **Consider using fixed scale when you wish a virtual object to precisely mimic its physical counterpart** — For instance, if you aim to preserve the life-size scale of a product offering, fixed scale helps achieve greater realism for viewers…
- **Avoid displaying too many windows** — Presenting numerous windows can overwhelm users, making them feel restricted or uncomfortable by obstructing their environment
- **Prioritize standard, indirect gestures** — Users can perform an *indirect* gesture without needing to move their hand into their visual field
- **Rely on the Digital Crown to help people recenter windows in their field of view** — When users move or turn their heads, content may drift from its intended location
- **Include enough space around interactive components to make them easy for people to look at** — When a user focuses on an interactive element, visionOS displays a visual hover effect confirming selection
- **Let people use your app with minimal or no physical movement** — Unless physical motion is integral to the experience, assist users in enjoying your app while remaining stationary

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-depth.md
- @references/guidelines-scale.md
- @references/guidelines-best-practices.md
