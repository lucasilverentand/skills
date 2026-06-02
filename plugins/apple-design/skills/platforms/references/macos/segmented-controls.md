# Segmented controls
A segmented control presents as a linear arrangement of two or more segments, each acting as a button

## Platform guidance — macOS
- **Consider adding introductory text to explain the segmented control's function.** If the control relies on symbols or interface icons, include a label beneath each segment to clarify its meaning. Furthermore, if your application uses tooltips, ensure one is provided for every segment within the control.
- **For view switching within the main window area, use a tab view rather than a segmented control.** A **Tab views** facilitates efficient switching and visually resembles a combination of [Boxes](boxes.md) and a segmented control. A segmented control is appropriate for view switching within a toolbar or inspector pane.
- **Consider implementing spring loading.** On macOS devices equipped with a Magic Trackpad, spring loading allows users to activate a segment by dragging selected items over it and force-clicking without dropping the selections. Users may also continue dragging the items after a segment has been activated.
