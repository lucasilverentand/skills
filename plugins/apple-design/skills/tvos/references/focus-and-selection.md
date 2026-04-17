# Focus and selection
Focus assists users in visually confirming the element they intend to interact with

## Platform guidance — tvOS
- **When operating in full screen, allow users to use gestures to manipulate the content, not to shift focus.** When an item is displayed full screen, it does not display focus, so users naturally assume that their gestures will affect the object itself, rather than its focused state.
- **Do not display a pointer.** Users expect to navigate through a fixed sequence of items by changing focus, not by attempting to drag a small pointer across a large screen. While free-form movement may be appropriate during gameplay (e.g., searching for a hidden object or piloting a vehicle), the focus model must be used when users are navigating menus and other interface components. If your application requires a pointer, ensure it is highly visible and feels seamlessly integrated into the overall experience.
- **Design your interface to support components across different focus states.** In tvOS, focusable items can possess up to five distinct visual states. Since focusing an item often increases its scale, you must provide assets for this larger, focused size to guarantee visual sharpness, and you must ensure the enlarged item does not overwhelm the surrounding interface.

|State|Description|
|---|---|
||The viewer has not yet focused on the item. Unfocused items appear less prominent than those that are focused.|
||The viewer has brought focus to the item. A focused item visually differentiates itself from other on-screen content through elevation, illumination, and animation.|
||The viewer selects the focused item. A focused item provides immediate visual confirmation when it is chosen. For instance, a button might briefly invert its colors and animate before transitioning into its selected appearance.|
||The viewer has chosen or activated the item in some manner. For example, a heart-shaped button used to favorite a photograph might appear filled in the selected state and empty in the deselected state.|
||The viewer cannot bring focus to or select the item. An unavailable item appears inactive.|

For technical guidance, refer to [Adding user-focusable elements to a tvOS app](apple:UIKit/adding-user-focusable-elements-to-a-tvos-app).
