---
name: drag-and-drop
description: "Drag and drop allows users to relocate or duplicate selected items, such as photos, text, or other content, by moving the selection from one location to another. Use when designing drag and drop for iOS and iPadOS, auditing drag and drop against Apple's iOS and iPadOS guidelines, or when the user says things like \"design drag and drop for iPhone\", \"drag and drop on iOS and iPadOS\", \"how should drag and drop work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Drag and drop
Drag and drop allows users to relocate or duplicate selected items, such as photos, text, or other content, by moving the selection from one location to another

## When to use
- User asks about **drag and drop** on iOS and iPadOS (e.g. `"how do I design drag and drop for iPhone"`).
- User is building an iPhone UI that needs drag and drop and wants to follow Apple's guidelines.
- User asks to audit or review drag and drop in an iOS and iPadOS design.
- User mentions drag and drop in the context of an iPhone app, game, or interface.

## Quick principles
- **Maximize drag and drop support throughout your application** — Most users are accustomed to drag and drop, and they frequently attempt to use it across many contexts
- **Provide alternative methods for drag-and-drop actions** — Since drag-and-drop operations can sometimes be difficult or impossible for users to execute, it is crucial to offer alternative ways to achieve…
- **Define whether dragging and dropping content within your app constitutes a move or a copy** — Generally, a move is appropriate when the source and destination containers are identical—for example, moving text from one location to another within…
- **Support multi-item drag and drop when it is relevant** — Users value the efficiency of dragging a collection of items to a destination rather than handling each item individually
- **Favor allowing users to undo a drag-and-drop operation** — Occasionally, users unintentionally drop content in the incorrect location; therefore, they benefit from the ability to reverse the action and return to…
- **Consider offering multiple fidelity versions of dragged content, ordered from highest to lowest** — By providing different alternatives, the destination application can select the most acceptable quality version
- **Evaluate supporting spring loading** — Spring loading enables users to activate specific controls, such as buttons and segmented controls, by dragging selected content over them
- **Display a drag image once the user has dragged a selection after approximately three points** — It is effective to use a translucent representation of the content being moved
- **If it enhances clarity, modify the drag image to help users predict the outcome of the drag-and-drop operation** — For instance, if a photo is dragged into a document, the drag image could enlarge to reflect the default size it will…
- **Indicate whether a destination can accept dragged content** — For example, you might display an insertion point or highlight a container view only when the destination is valid for accepting the…
- **Provide visual feedback when an item is dropped onto an invalid destination or when the drop fails** — For example, the item could return to its original location (if the source remains visible), or it could scale up and fade…
- **Scroll the contents of a destination when necessary** — If a user drags an item within a scrolling container containing extensive content, the system should automatically scroll the destination as the…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines-overview.md
- @references/guidelines-best-practices.md
- @references/guidelines-providing-feedback.md
- @references/guidelines-accepting-drops.md
