---
name: sheets
description: "A sheet enables users to execute a focused task that is contextually linked to their current view. Use when designing sheets for watchOS, auditing sheets against Apple's watchOS guidelines, or when the user says things like \"design sheets for Apple Watch\", \"sheets on watchOS\", \"how should sheets work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Sheets
A sheet enables users to execute a focused task that is contextually linked to their current view

## When to use
- User asks about **sheets** on watchOS (e.g. `"how do I design sheets for Apple Watch"`).
- User is building an Apple Watch UI that needs sheets and wants to follow Apple's guidelines.
- User asks to audit or review sheets in a watchOS design.
- User mentions sheets in the context of an Apple Watch app, game, or interface.

Sheets serve the purpose of gathering particular information from users or presenting a straightforward task they can finish before returning to the main view. For instance, a sheet could allow users to provide details required for an action, such as selecting a save location or attaching a file.

### Anatomy
In macOS, tvOS, visionOS, and watchOS, a sheet is invariably *modal*. A modal sheet provides a focused experience that blocks interaction with the underlying view until the sheet is dismissed (for details on modal presentation, consult [Modality](modality.md)).

For iOS and iPadOS, a sheet may be either modal or *nonmodal*. When a nonmodal sheet is displayed, users can utilize its functionality to influence the parent view without needing to dismiss the sheet. For instance, Notes on iPhone and iPad employs a nonmodal sheet allowing users to format text selections while editing.

Several standard buttons assist users in navigating and dismissing sheets.

- The **Cancel** (or Close) button dismisses the sheet without committing any modifications. This control is standard across most sheets.
- The **Done** button dismisses the sheet once a task is completed or changes have been explicitly saved.
- The **Back** button allows users to return to a prior step in a multi-step workflow or ascend to a parent view within a hierarchy. Its purpose is not to dismiss the sheet itself.

The positioning of these controls differs across platforms; refer to [Platform considerations](#Platform-considerations).

### Best practices
- **For complex or prolonged user flows, consider alternatives to sheets.** For instance, iOS and iPadOS support a full-screen modal presentation style that is effective for displaying media (videos, photos, camera feeds) or facilitating multi-step processes like editing documents or photos. (See [UIModalPresentationStyle.fullScreen](apple:UIKit/UIModalPresentationStyle/fullScreen) for developer guidance.) In a macOS environment, consider opening a new window or allowing the user to enter full-screen mode rather than relying on a sheet. For example, dedicated tasks like document editing suit a separate window, while [Going full screen](going-full-screen.md) is better suited for media viewing. In visionOS, you can transition the app into a Full Space to allow users deep immersion in content or tasks; refer to [Immersive experiences](immersive-experiences.md) for guidance.
- **Display only one sheet at a time from the main interface.** Users expect to return to the parent view or window when they dismiss a sheet. If closing a sheet leads them into another sheet, they may lose context regarding their location within the app. If an action taken inside a sheet triggers the appearance of a second sheet, you must dismiss the initial sheet before showing the new one. If necessary, the first sheet can be displayed again after the second has been dismissed.
- **Use a nonmodal view when you want to present supplementary items that affect the main task in the parent view.** To allow users access to information and actions needed while they continue interacting with the primary window, consider using [Split views](split-views.md) in visionOS or [Panels](panels.md) in macOS; for iOS and iPadOS, a nonmodal sheet fits this workflow. See [iOS, iPadOS](#iOS-iPadOS) for more information.
- **Provide an alternative to the Done button.** If you include a Done button, always pair it with either a Cancel button—to allow dismissal without confirming or saving changes—or a Back button to navigate to the preceding step within the sheet. Relying exclusively on the Done button suggests that task completion is the only way to exit the sheet, which can feel restrictive or misleading. Do not display all three buttons—Cancel, Done, and Back—concurrently.

## Platform guidance — watchOS
In watchOS, a sheet manifests as a full-screen view sliding over the app's active content. While the sheet itself is semi-transparent to maintain context, the system applies a material effect to the background, blurring and desaturating the underlying content.

- **Use a sheet exclusively when your modal task necessitates custom content or title presentation.** If the goal is to convey crucial information or present options, consider employing [Alerts](alerts.md) or [Action sheets](action-sheets.md).
- **Keep sheet interactions brief and infrequent.** Employ a sheet solely as a temporary interruption to the ongoing workflow, dedicated only to facilitating a critical task. Do not use it for navigating through your app's content.
- **If you modify the default label, prioritize SF Symbols to represent the action.** Avoid labels that might suggest the sheet is part of a hierarchical navigation structure. Furthermore, if the top-leading corner text resembles a page or app title, users may not understand how to dismiss the sheet. Refer to [Standard icons](icons.md#Standard-icons) for guidance.
