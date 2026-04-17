---
name: tab-views
description: "A tab view displays several distinct content areas within a single frame, allowing users to switch between them using a dedicated tab control. Use when designing tab views for watchOS, auditing tab views against Apple's watchOS guidelines, or when the user says things like \"design tab views for Apple Watch\", \"tab views on watchOS\", \"how should tab views work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Tab views
A tab view displays several distinct content areas within a single frame, allowing users to switch between them using a dedicated tab control

## When to use
- User asks about **tab views** on watchOS (e.g. `"how do I design tab views for Apple Watch"`).
- User is building an Apple Watch UI that needs tab views and wants to follow Apple's guidelines.
- User asks to audit or review tab views in a watchOS design.
- User mentions tab views in the context of an Apple Watch app, game, or interface.

### Best practices
- **Use a tab view when presenting closely related content areas.** The visual nature of a tab view strongly indicates that the contained elements are grouped. Users anticipate that each tab displays information similar to or connected with the other tabs.
- **Ensure that controls within a pane only affect content belonging to that same pane.** Since panes are mutually exclusive, they must be completely self-sufficient.
- **Label each tab to describe the contents of its respective pane.** A clear label allows users to predict what a pane contains before they click or tap the tab. Generally, use nouns or brief noun phrases for these labels; however, a verb or short verb phrase may be appropriate in certain situations. Apply title-style capitalization to all tab labels.
- **Do not use a pop-up button for switching between tabs.** A tabbed control is more efficient because selecting an option requires only one click or tap, whereas a pop-up button necessitates two actions. Furthermore, a tabbed control displays all options simultaneously, while users must click a pop-up button to reveal its choices. Note that using a pop-up button is acceptable if the sheer volume of content panes makes tab display impractical.
- **Do not include more than six tabs in a tab view.** Presenting more than six tabs can overwhelm the user and introduce layout problems. If you require six or more tabs, consider an alternative implementation method. For instance, you might present each tab as a view option within a pop-up button menu instead.

For developer guidance, see [NSTabView](apple:AppKit/NSTabView).

### Anatomy
The tabbed control is positioned along the top edge of the content area. You have the option to conceal this control, which is appropriate for applications that switch between panes programmatically.

When the tabbed control is hidden, the content area may be borderless, bezeled, or separated by a line. A borderless display can be rendered as either solid or transparent.

**Generally, inset a tab view by maintaining margins around the tab view within the window body area.** This layout provides a clean appearance and allows for additional controls that are not inherently part of the tab view's content. Although you may extend a tab view to match the window boundaries, this arrangement is uncommon.

## Platform guidance — watchOS
Tab views are rendered in watchOS using [page controls](components/presentation/page-controls.md). Developers seeking implementation guidance should consult [TabView](apple:SwiftUI/TabView) and [verticalPage](apple:SwiftUI/TabViewStyle/verticalPage).
