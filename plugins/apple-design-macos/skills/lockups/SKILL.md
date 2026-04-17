---
name: lockups
description: "A lockup integrates multiple distinct views into a single, interactive unit. Use when designing lockups for macOS, auditing lockups against Apple's macOS guidelines, or when the user says things like \"design lockups for Mac\", \"lockups on macOS\", \"how should lockups work on Mac\"."
allowed-tools: Read Grep Glob
---

# Lockups
A lockup integrates multiple distinct views into a single, interactive unit

## When to use
- User asks about **lockups** on macOS (e.g. `"how do I design lockups for Mac"`).
- User is building a Mac UI that needs lockups and wants to follow Apple's guidelines.
- User asks to audit or review lockups in a macOS design.
- User mentions lockups in the context of a Mac app, game, or interface.

Each lockup is composed of three elements: a content view, a header, and a footer. The header displays above the main content of the lockup, while the footer appears beneath it. All three views expand and contract simultaneously when the lockup receives focus.

Based on your application's specific needs, you have four types of lockups available: cards, caption buttons, monograms, and posters.

### Best practices
- **Ensure sufficient spacing between lockups.** Because a focused lockup expands in size, maintain adequate clearance between elements to prevent overlap or unintended displacement of adjacent lockups. For layout guidance, consult [Layout](layout.md).
- **Maintain uniform lockup dimensions within a row or group.** A collection of buttons or a sequence of content images presents greater visual appeal when all elements share matching widths and heights.

For developer implementation details, refer to [TVLockupView](apple:TVUIKit/TVLockupView) and [TVLockupHeaderFooterView](apple:TVUIKit/TVLockupHeaderFooterView).

### Cards
A card integrates a header, footer, and content view to display ratings and reviews for media items.

For implementation details, consult [TVCardView](apple:TVUIKit/TVCardView).

### Caption buttons
A caption button has the capability to display a title and a subtitle beneath it. The button itself must contain either text or an image.

Ensure that when users focus on the caption buttons, they tilt in response to the swipe motion. If aligned vertically, the tilting movement should be up and down. When aligned horizontally, the tilt must occur left and right. If displayed within a grid, the caption buttons should tilt both vertically and horizontally.

For implementation guidance, consult [TVCaptionButtonView](apple:TVUIKit/TVCaptionButtonView).

### Monograms
Monograms are used to identify individuals, typically comprising the cast and crew of a media production. Each monogram includes a circular photograph of the person alongside their name. If an image is unavailable, the individual's initials are displayed in its place.

**Prefer images over initials.** A visual representation of the person establishes a more personal connection than text.

For developer guidance, refer to [TVMonogramContentView](apple:TVUIKit/TVMonogramContentView).

### Posters
Posters comprise an image, along with optional title and subtitle fields. These elements remain hidden until the poster achieves focus. Although posters support diverse dimensions, the chosen size must be appropriate for the content displayed.

For related guidance, see [Image views](image-views.md).

For developer guidance, see [TVPosterView](apple:TVUIKit/TVPosterView).
