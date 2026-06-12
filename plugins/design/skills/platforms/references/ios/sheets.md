# Sheets — full guidelines

### Anatomy
In macOS, tvOS, visionOS, and watchOS, a sheet is invariably *modal*. A modal sheet provides a focused experience that blocks interaction with the underlying view until the sheet is dismissed (for details on modal presentation, consult **Modality**).

For iOS and iPadOS, a sheet may be either modal or *nonmodal*. When a nonmodal sheet is displayed, users can utilize its functionality to influence the parent view without needing to dismiss the sheet. For instance, Notes on iPhone and iPad employs a nonmodal sheet allowing users to format text selections while editing.

Several standard buttons assist users in navigating and dismissing sheets.

- The **Cancel** (or Close) button dismisses the sheet without committing any modifications. This control is standard across most sheets.
- The **Done** button dismisses the sheet once a task is completed or changes have been explicitly saved.
- The **Back** button allows users to return to a prior step in a multi-step workflow or ascend to a parent view within a hierarchy. Its purpose is not to dismiss the sheet itself.

The positioning of these controls differs across platforms; refer to [Platform considerations](#Platform-considerations).

### Best practices
- **For complex or prolonged user flows, consider alternatives to sheets.** For instance, iOS and iPadOS support a full-screen modal presentation style that is effective for displaying media (videos, photos, camera feeds) or facilitating multi-step processes like editing documents or photos. (See [UIModalPresentationStyle.fullScreen](apple:UIKit/UIModalPresentationStyle/fullScreen) for developer guidance.) In a macOS environment, consider opening a new window or allowing the user to enter full-screen mode rather than relying on a sheet. For example, dedicated tasks like document editing suit a separate window, while [Going full screen](going-full-screen.md) is better suited for media viewing. In visionOS, you can transition the app into a Full Space to allow users deep immersion in content or tasks; refer to **Immersive experiences** for guidance.
- **Display only one sheet at a time from the main interface.** Users expect to return to the parent view or window when they dismiss a sheet. If closing a sheet leads them into another sheet, they may lose context regarding their location within the app. If an action taken inside a sheet triggers the appearance of a second sheet, you must dismiss the initial sheet before showing the new one. If necessary, the first sheet can be displayed again after the second has been dismissed.
- **Use a nonmodal view when you want to present supplementary items that affect the main task in the parent view.** To allow users access to information and actions needed while they continue interacting with the primary window, consider using [Split views](split-views.md) in visionOS or **Panels** in macOS; for iOS and iPadOS, a nonmodal sheet fits this workflow. See [iOS, iPadOS](#iOS-iPadOS) for more information.
- **Provide an alternative to the Done button.** If you include a Done button, always pair it with either a Cancel button—to allow dismissal without confirming or saving changes—or a Back button to navigate to the preceding step within the sheet. Relying exclusively on the Done button suggests that task completion is the only way to exit the sheet, which can feel restrictive or misleading. Do not display all three buttons—Cancel, Done, and Back—concurrently.

## Platform guidance — iOS & iPadOS
In iOS and iPadOS, when a sheet contains only one view, the Cancel button must be located on the leading edge of the top toolbar. If present, the Done button should occupy the trailing edge.

For sheets that involve a multi-step workflow, the placement of buttons may differ across different steps.

A resizable sheet expands when users scroll its contents or drag the *grabber*, which is a small horizontal indicator that may appear along the top edge of the sheet. Sheets adjust their size based on *detents*, which are specific heights at which a sheet naturally settles. Designed for iPhone, detents define particular resting heights for the sheet. The system provides two default detents: *large* corresponds to the fully expanded height, and *medium* is approximately half of the full expansion height. Sheets may utilize one or more custom detent values.

Sheets inherently support the large detent. Including the medium detent allows the sheet to rest at both heights, while specifying only the medium detent prevents expansion to full height. For implementation guidance, consult [detents](apple:UIKit/UISheetPresentationController/detents).

- **In an iPhone application, consider supporting the medium detent to enable progressive disclosure of the sheet's content.** For instance, a share sheet can display the most critical items within the medium detent, making them visible without requiring resizing. To view additional items, users can scroll or expand the sheet. Conversely, you might choose not to support the medium detent if the content is most effective when displayed at full height. For example, the compose sheets found in Messages and Mail only appear at full height to provide sufficient space for content creation.
- **Include a grabber in resizable sheets.** A grabber informs users that the sheet can be dragged to resize it; they can also tap it to cycle through available detents. Beyond signaling resizability, the grabber functions with VoiceOver, allowing users to resize the sheet without needing visual input. For implementation guidance, see [prefersGrabberVisible](apple:UIKit/UISheetPresentationController/prefersGrabberVisible).
- **Support swiping to dismiss a sheet.** Users expect vertical swiping to dismiss a sheet rather than needing to tap a dedicated dismiss button. If the user has unsaved changes in the sheet when they initiate the dismissal swipe, use an action sheet to confirm their intended action.
- **Prefer using the page or form sheet presentation styles in an iPadOS application.** Each style utilizes a default size for the sheet, centering its content over a dimmed background view and ensuring a consistent user experience. For implementation guidance, see [UIModalPresentationStyle](apple:UIKit/UIModalPresentationStyle).
