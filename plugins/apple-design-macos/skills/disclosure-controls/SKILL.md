---
name: disclosure-controls
description: "Disclosure controls determine the visibility of information and functionality associated with particular views or controls. Use when designing disclosure controls for macOS, auditing disclosure controls against Apple's macOS guidelines, or when the user says things like \"design disclosure controls for Mac\", \"disclosure controls on macOS\", \"how should disclosure controls work on Mac\"."
allowed-tools: Read Grep Glob
---

# Disclosure controls
Disclosure controls determine the visibility of information and functionality associated with particular views or controls

## When to use
- User asks about **disclosure controls** on macOS (e.g. `"how do I design disclosure controls for Mac"`).
- User is building a Mac UI that needs disclosure controls and wants to follow Apple's guidelines.
- User asks to audit or review disclosure controls in a macOS design.
- User mentions disclosure controls in the context of a Mac app, game, or interface.

### Best practices
Employ a disclosure control to conceal specifics until they become relevant. Position controls that users are most likely to utilize at the forefront of the disclosure structure, maintaining constant visibility, while advanced features remain hidden by default. This arrangement enables users to locate the most crucial information efficiently without being overwhelmed by numerous detailed choices.

### Disclosure triangles
A disclosure triangle controls the visibility of information and functionality associated with a view or a list. For instance, Keynote employs this control to reveal advanced options during presentation export, while the Finder uses it to progressively display folder hierarchy when navigating in list view.

When its content is concealed, the disclosure triangle points inward from the leading edge; when the content is visible, it points down. Clicking or tapping this triangle switches between these two states, causing the view to expand or collapse as needed to accommodate its content.

**Provide a descriptive label when using a disclosure triangle.** Your labels must clearly indicate whether the content is being disclosed or hidden, such as "Advanced Options."

For developer guidance, see [NSButton.BezelStyle.disclosure](apple:AppKit/NSButton/BezelStyle-swift.enum/disclosure).

### Disclosure buttons
A disclosure button toggles the visibility of functionality linked to a particular control. For instance, in the macOS Save sheet, a disclosure button appears adjacent to the "Save As" text field. When this button is clicked or tapped, the Save dialog expands, offering advanced navigation options for choosing a document output location.

The disclosure button should point down when its content is concealed and up when it is displayed. Tapping or clicking the button shifts between these two states, causing the view to expand or contract as needed to display the content.

- **Position a disclosure button close to the content it controls.** Ensure a distinct association exists between the control and the expanded options revealed upon interaction.
- **Limit to one disclosure button per view.** Using multiple such buttons introduces unnecessary complexity and potential user confusion.

For implementation details, consult [NSButton.BezelStyle.pushDisclosure](apple:AppKit/NSButton/BezelStyle-swift.enum/pushDisclosure).
