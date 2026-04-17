---
name: segmented-controls
description: "A segmented control presents as a linear arrangement of two or more segments, each acting as a button. Use when designing segmented controls for macOS, auditing segmented controls against Apple's macOS guidelines, or when the user says things like \"design segmented controls for Mac\", \"segmented controls on macOS\", \"how should segmented controls work on Mac\"."
allowed-tools: Read Grep Glob
---

# Segmented controls
A segmented control presents as a linear arrangement of two or more segments, each acting as a button

## When to use
- User asks about **segmented controls** on macOS (e.g. `"how do I design segmented controls for Mac"`).
- User is building a Mac UI that needs segmented controls and wants to follow Apple's guidelines.
- User asks to audit or review segmented controls in a macOS design.
- User mentions segmented controls in the context of a Mac app, game, or interface.

Typically, all segments within a segmented control share equal width. Similar to [Buttons](buttons.md), these segments may display either text or images, and they can also feature associated text labels located beneath them (or beneath the control as a whole).

A segmented control serves to represent either a single selection from available options or, in the macOS environment, it may support multiple selections. For instance, within macOS Keynote, users might select only one segment in the alignment options control to align selected text. Conversely, the font attributes control allows users to select multiple segments to combine styles such as bold, italics, and underline. Furthermore, the toolbar in a Keynote window utilizes a segmented control to enable users to display or hide different editing panes within the main window area.

Beyond representing the state of a single-choice or multiple-choice selection, a segmented control can also operate as a collection of buttons that execute actions without needing to display a selection state. A prime example is the Reply, Reply all, and Forward buttons found in macOS Mail. For developer guidance on this behavior, refer to [isMomentary](apple:UIKit/UISegmentedControl/isMomentary) and [NSSegmentedControl.SwitchTracking.momentary](apple:AppKit/NSSegmentedControl/SwitchTracking/momentary).

### Best practices
- **Employ a segmented control when presenting closely related options that influence an object, its state, or the current view.** For instance, in a property inspector, it could allow users to select one or more attributes for a selection; similarly, in a toolbar, it might offer different actions applicable to the current view.
- **Select a segmented control when grouping functions is crucial, or when clearly indicating selection status is important.** Unlike other button styles, segmented controls maintain their grouping context regardless of the view size or placement. This inherent grouping also aids users in quickly grasping which controls are currently active.
- **Maintain uniformity regarding control types within a single segmented control.** Do not assign actions to segments in a control that primarily indicates selection state, nor should you display a selection state for segments whose primary function is performing actions.
- **Restrict the segment count in a control.** A large number of segments can impede comprehension and navigation. Aim for no more than five to seven segments in a wide interface, and limit usage to about five segments on iPhone.
- **Generally, ensure segment sizes are uniform.** When all segments share equal width, the segmented control appears balanced. Whenever feasible, strive to keep both icon and title widths consistent as well.

### Content
- **Choose either text or images, but avoid mixing them within a single segmented control.** While individual segments may contain text labels or imagery, combining both types in one control can result in a disconnected and confusing interface.
- **Ensure that the content size is comparable across all segments.** Given that all segments typically possess equal width, it appears poorly if some segments are filled while others are not.
- **Use nouns or noun phrases for segment labels.** The text should describe each segment and utilize [title-style capitalization](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web#apdca93e113f1d64). A segmented control displaying text labels does not require introductory phrasing.

## Platform guidance — macOS
- **Consider adding introductory text to explain the segmented control's function.** If the control relies on symbols or interface icons, include a label beneath each segment to clarify its meaning. Furthermore, if your application uses tooltips, ensure one is provided for every segment within the control.
- **For view switching within the main window area, use a tab view rather than a segmented control.** A [Tab views](tab-views.md) facilitates efficient switching and visually resembles a combination of [Boxes](boxes.md) and a segmented control. A segmented control is appropriate for view switching within a toolbar or inspector pane.
- **Consider implementing spring loading.** On macOS devices equipped with a Magic Trackpad, spring loading allows users to activate a segment by dragging selected items over it and force-clicking without dropping the selections. Users may also continue dragging the items after a segment has been activated.
