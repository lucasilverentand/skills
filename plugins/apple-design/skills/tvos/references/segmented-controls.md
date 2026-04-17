# Segmented controls
A segmented control presents as a linear arrangement of two or more segments, each acting as a button

## Platform guidance — tvOS
- **Use a split view instead of a segmented control on screens that handle content filtering.** A split view generally allows users to navigate between content and filtering options more intuitively. Conversely, the accessibility of a segmented control depends heavily on its placement.
- **Do not place other focusable elements near segmented controls.** Segments are selected when the interface gains focus on them, not solely upon a click. Therefore, carefully consider the segmented control's positioning relative to other UI components. If nearby elements are also focusable, users may inadvertently shift focus onto them while attempting to switch segments.
