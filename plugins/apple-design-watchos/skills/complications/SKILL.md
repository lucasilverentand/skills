---
name: complications
description: "A complication presents current, relevant data on the watch face, allowing users to view it whenever they raise their wrist. Use when designing complications for watchOS, auditing complications against Apple's watchOS guidelines, or when the user says things like \"design complications for Apple Watch\", \"complications on watchOS\", \"how should complications work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Complications
A complication presents current, relevant data on the watch face, allowing users to view it whenever they raise their wrist

## When to use
- User asks about **complications** on watchOS (e.g. `"how do I design complications for Apple Watch"`).
- User is building an Apple Watch UI that needs complications and wants to follow Apple's guidelines.
- User asks to audit or review complications in a watchOS design.
- User mentions complications in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Identify essential, dynamic content that users want to see immediately** — While a complication allows quick app launching, its value is maximized by displaying information that feels current and relevant
- **Support all complication families when feasible** — Supporting different families increases the number of watch faces where your complications appear
- **Consider developing multiple complications for each family** — Offering several complications allows you to leverage shareable watch faces and enables users to customize a watch face centered on an app…
- **Define a unique deep link for every supported complication** — It is most effective when each complication directs the app to the most pertinent screen
- **Maintain user privacy** — Given the Always-On Retina display, information on the watch face may be visible to individuals other than the wearer
- **Thoughtfully determine when to refresh data** — You supply a complication’s information via a timeline, where each entry includes a value specifying the time your data should appear on…
- **Select a ring or gauge style based on the data you intend to display** — Many applications utilize a ring or gauge layout, offering consistent ways to represent numerical data that evolves over time
- **Ensure visuals render correctly in tinted mode** — In tinted mode, the system applies a solid color to a complication’s text, gauges, and images, and desaturates full-color visuals unless tinted…
- **Understand that users may prefer using tinted mode over viewing complications in full color** — When a user activates tinted mode, the system automatically converts your complication to grayscale and applies a single color tint to its…
- **When creating complication content, generally use line widths of two points or greater** — Thinner lines can be difficult to discern quickly, particularly if the wearer is moving
- **Provide a set of static placeholder images for every complication you support** — The system displays these placeholder images when there is no other content available for your complication’s data

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/visual-design.md
- @references/circular.md
- @references/corner.md
- @references/inline.md
- @references/rectangular.md
- @references/legacy-templates.md
