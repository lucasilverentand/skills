---
name: focus-and-selection
description: "Focus assists users in visually confirming the element they intend to interact with. Use when designing focus and selection for tvOS, auditing focus and selection against Apple's tvOS guidelines, or when the user says things like \"design focus and selection for Apple TV\", \"focus and selection on tvOS\", \"how should focus and selection work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Focus and selection
Focus assists users in visually confirming the element they intend to interact with

## When to use
- User asks about **focus and selection** on tvOS (e.g. `"how do I design focus and selection for Apple TV"`).
- User is building an Apple TV UI that needs focus and selection and wants to follow Apple's guidelines.
- User asks to audit or review focus and selection in a tvOS design.
- User mentions focus and selection in the context of an Apple TV app, game, or interface.

Focus enables streamlined, component-based navigation. When using input devices such as a game controller, keyboard, or remote, users direct focus toward the components they wish to engage with.

Often, bringing focus to an item also selects it. The sole exception is when automatic selection might introduce a distracting change in context, such as launching a new view. For instance, on tvOS, users navigate between items using the remote to locate their desired target; however, since selecting a focused item activates or opens it, selection necessitates a distinct action.

different platforms convey focus differently. For example, iPadOS and macOS indicate focus by outlining or highlighting an item with a ring; conversely, tvOS typically employs the [Parallax effect](images.md#Parallax-effect) to lend the focused item a sense of depth and dynamism. The combination of these focus visual cues and interactions is sometimes referred to as a *focus system* or *focus model*.

### Best practices
- **Leverage system-provided focus effects.** System-defined focus behaviors are meticulously calibrated to harmonize with Apple devices, delivering experiences that feel natural, fluid, and highly responsive. By incorporating the system's focus behaviors, your application achieves predictability and consistency, enabling users to grasp its operation quickly. Customizing focus effects should only be considered if it is strictly necessary.
- **Do not shift focus without user input.** Users depend on the focus system to maintain awareness of their location within your application. When you change focus without user action, users must spend time locating the newly focused element, interrupting their current task. An exception exists when users are navigating using an input device that allows discrete, directional movements—such as a keyboard, game controller, or remote—and the previously focused item vanishes. In this specific scenario, since only a small number of items are within one discrete step of the previous focus point, moving to one of these remaining items ensures the focus indicator remains in an easily locatable position. If users are not navigating with such a device, predicting the next target is difficult; therefore, it is generally best practice to simply hide the focus indicator when the focused object disappears.
- **Maintain platform consistency while guiding users to elements in your app.** For instance, on iPadOS and macOS, a full keyboard access mode allows users to reach every control via the keyboard. Consequently, you only need to ensure focus support for content elements like text fields, search fields, and list items, rather than controls such as toggles, sliders, or buttons. Conversely, tvOS users rely on directional gestures (or arrow keys on an attached keyboard) to reach every screen element, requiring you to ensure that all elements in your app are reachable via focus.
- **Use visual appearances consistent with the platform to indicate focus.** For example, consider a window displaying a list of items. In iPadOS and macOS, the system renders focused list items using white text combined with a background highlight matching the app's accent color, while unfocused items use standard text color and a gray background highlight (refer to [UICollectionView](apple:UIKit/UICollectionView) and [NSTableView](apple:AppKit/NSTableView) for developer guidance).
- **Generally, use a focus ring for text or search fields, but employ a highlight within lists or collections.** While you may use a focus ring to draw attention to an item that occupies an entire cell (such as a photograph), it is typically easier for users to view lists and collections when an entire row is highlighted.

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
