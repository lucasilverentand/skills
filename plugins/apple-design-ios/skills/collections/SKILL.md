---
name: collections
description: "A collection organizes an ordered series of content and displays it using a highly visual, configurable layout. Use when designing collections for iOS and iPadOS, auditing collections against Apple's iOS and iPadOS guidelines, or when the user says things like \"design collections for iPhone\", \"collections on iOS and iPadOS\", \"how should collections work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Collections
A collection organizes an ordered series of content and displays it using a highly visual, configurable layout

## When to use
- User asks about **collections** on iOS and iPadOS (e.g. `"how do I design collections for iPhone"`).
- User is building an iPhone UI that needs collections and wants to follow Apple's guidelines.
- User asks to audit or review collections in an iOS and iPadOS design.
- User mentions collections in the context of an iPhone app, game, or interface.

In general use cases, collections are best suited for presenting image-based content.

### Best practices
- **Use standard row or grid layouts whenever possible.** Collections natively present content using a horizontal row or a grid, offering simple and intuitive displays that users anticipate. Avoid developing custom layouts that may confuse the user or unnecessarily draw attention to themselves.
- **Consider using a table instead of a collection for text.** Presenting textual information in a scrollable list format is typically more efficient and easier for users to view and process.
- **Make item selection straightforward.** If accessing an individual item within your collection proves difficult, users may become frustrated and abandon the app before reaching desired content. Ensure sufficient padding around images to maintain focus or make hover effects clearly visible and prevent content overlap.
- **Add custom interactions only when required.** By default, users can select via tap, enter edit mode by touch and hold, and scroll using swipe gestures. If your application demands it, you may introduce additional gestures for specialized actions.
- **Consider using animations to provide feedback during structural changes.** Collections support standard animations for inserting, deleting, or reordering items, though custom animations are also available.

## Platform guidance — iOS & iPadOS
**Use caution when making dynamic layout changes.** A collection's appearance may shift dynamically. Ensure that any such modifications are logical and easily tracked. Whenever possible, refrain from altering the layout while users are viewing or interacting with it, unless the change is a direct result of an explicit user action.
