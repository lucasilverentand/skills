---
name: ornaments
description: "In visionOS, an ornament displays controls and information pertaining to a window without interfering with or blocking the window's content. Use when designing ornaments for visionOS, auditing ornaments against Apple's visionOS guidelines, or when the user says things like \"design ornaments for Apple Vision Pro\", \"ornaments on visionOS\", \"how should ornaments work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Ornaments
In visionOS, an ornament displays controls and information pertaining to a window without interfering with or blocking the window's content

## When to use
- User asks about **ornaments** on visionOS (e.g. `"how do I design ornaments for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs ornaments and wants to follow Apple's guidelines.
- User asks to audit or review ornaments in a visionOS design.
- User mentions ornaments in the context of an Apple Vision Pro app, game, or interface.

An ornament exists in a plane parallel to its associated window, positioned slightly ahead along the z-axis. When the linked window translates, the ornament moves with it, preserving its relative placement; however, if the window's content scrolls, the controls or information within the ornament remain static.

Ornaments can be attached to any edge of a window and may house UI elements such as buttons, segmented controls, or other views. The system utilizes ornaments to construct and manage components like [Toolbars](toolbars.md) and [Tab bars](tab-bars.md); developers can leverage an ornament to build custom components.

### Best practices
- **Consider using an ornament to present frequently needed controls or information in a consistent location that doesn’t clutter the window.** Since an ornament remains near its associated window, users always know where to locate it. For instance, Music employs an ornament for Now Playing controls, ensuring these functions are predictably and easily accessible.
- **In general, keep an ornament visible.** While it may be appropriate to hide an ornament when users are deeply engaged with the window’s content—such as watching a video or viewing a photograph—most users benefit from consistent access to the ornament’s controls.
- **If you need to display multiple ornaments, prioritize the overall visual balance of the window.** Although ornaments enhance important actions, they can occasionally distract from your primary content. If necessary, limit the total number of ornaments to prevent increasing the window's visual weight and making the application feel overly complex. Should you choose to remove an ornament, its elements can be integrated back into the main window.
- **Aim to keep an ornament’s width the same or narrower than the width of the associated window.** If an ornament exceeds its window's width, it may interfere with vertical content on the window’s side, such as a tab bar.
- **Consider using borderless buttons in an ornament.** By default, an ornament’s background is [visionOS](materials.md#visionOS); therefore, if a button is placed directly onto this background, it may not require a visible border. When users view a borderless button within an ornament, the system automatically applies the hover effect to it (refer to [Eyes](eyes.md) for guidance).
- **Use system-provided toolbars and tab bars unless you need to create custom components.** In visionOS, these elements automatically render as ornaments, meaning you do not need to use an ornament to build them. For developer resources, consult [Toolbars](apple:SwiftUI/Toolbars) and [TabView](apple:SwiftUI/TabView).
