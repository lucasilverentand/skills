# Item groupings
Toolbar items can be placed in three locations: the leading edge, center area, or trailing edge. These areas serve as predictable homes for navigation elements, window/document titles, frequently used actions, and search functionality.

- **Leading edge.** The far leading edge holds elements that allow users to return to the previous document or toggle a sidebar, followed by the view title. Adjacent to the title, the toolbar may include a document menu offering standard and application-specific commands affecting the entire document (e.g., Duplicate, Rename, Move, Export). To guarantee availability, items placed on the toolbar’s leading edge cannot be customized.
- **Center area.** Common, high-utility controls belong in the center area; if not on the leading edge, the view title may also reside here. In macOS and iPadOS, users can add, remove, and reorganize items if the toolbar is customizable. Furthermore, this section's contents automatically transition into the system-managed overflow menu when the window reaches a certain minimum size.
- **Trailing edge.** The trailing edge houses critical items that must remain accessible, buttons for nearby inspectors, an optional search field, and the More menu, which contains additional options and supports toolbar customization. It also includes a primary action button (such as Done) if one exists. Items on the trailing edge remain visible regardless of the window size.

To arrange items into your desired groupings, pin them to the leading edge, center, or trailing edge, and insert appropriate spacing between buttons or other elements.

- **Group toolbar items logically by function and frequency of use.** For instance, Keynote utilizes several sections based on functionality, including one for presentation commands, one for playback commands, and one for object insertion.
- **Group navigation controls and critical actions like Done, Close, or Save in dedicated, familiar, and visually distinct sections.** This reflects their importance and aids user discovery and comprehension of these actions. **Maintain consistent groupings and placement across platforms.** This helps users become accustomed to your application and trust that its behavior is uniform regardless of the usage environment.
- **Minimize the number of groups.** An excessive number of control groups can lead to a cluttered and confusing toolbar appearance, even with the added screen real estate available on iPad and Mac. Generally, aim for a maximum of three groups.
- **Keep actions with text labels separate.** Placing an action labeled with text immediately next to an action represented by a symbol can create the impression of a single combined action, causing confusion and misinterpretation. If your toolbar features multiple text-labeled buttons, the button text may appear merged, making them indistinguishable. Insert fixed spacing between these buttons to provide separation. For developer guidance, consult [UIBarButtonItem.SystemItem.fixedSpace](apple:UIKit/UIBarButtonItem/SystemItem/fixedSpace).

## Platform guidance — watchOS
A toolbar button allows you to present crucial application features within a view that displays associated content. These buttons can be positioned in the upper corners or along the base of the view. When these buttons are situated above scrolling content, they remain perpetually visible as the content scrolls beneath them.

For developer instructions, consult [topBarLeading](apple:SwiftUI/ToolbarItemPlacement/topBarLeading), [topBarTrailing](apple:SwiftUI/ToolbarItemPlacement/topBarTrailing), or [bottomBar](apple:SwiftUI/ToolbarItemPlacement/bottomBar).

You also have the option to include a button within a scrolling view. By default, a scrolling toolbar button remains concealed until the user scrolls up to reveal it. Since users often navigate to the top of a scrolling view, discovering this toolbar button is intuitive.

For developer instructions, see [primaryAction](apple:SwiftUI/ToolbarItemPlacement/primaryAction).

**Employ a scrolling toolbar button for an important action that is secondary to the primary app function.** A toolbar button offers you the adaptability to provide critical functionality within a view whose main objective relates to, but may differ from, that functionality. For instance, the Mail app includes the essential "New Message" action in a toolbar button within the Inbox view. The primary function of the Inbox is to display a scrollable list of emails, making it logical to offer the closely related compose action via a toolbar button at the view's top.
