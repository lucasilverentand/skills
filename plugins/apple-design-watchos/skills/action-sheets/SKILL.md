---
name: action-sheets
description: "An action sheet serves as a modal view that displays options pertaining to an action the user has started. Use when designing action sheets for watchOS, auditing action sheets against Apple's watchOS guidelines, or when the user says things like \"design action sheets for Apple Watch\", \"action sheets on watchOS\", \"how should action sheets work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Action sheets
An action sheet serves as a modal view that displays options pertaining to an action the user has started

## When to use
- User asks about **action sheets** on watchOS (e.g. `"how do I design action sheets for Apple Watch"`).
- User is building an Apple Watch UI that needs action sheets and wants to follow Apple's guidelines.
- User asks to audit or review action sheets in a watchOS design.
- User mentions action sheets in the context of an Apple Watch app, game, or interface.

> **Developer note**
> When developing with SwiftUI, you can provide action sheet functionality across all platforms by applying a [presentation modifier](apple:swiftui/view-presentation) to the confirmation dialog. If you are using UIKit, utilize [UIAlertController.Style.actionSheet](apple:UIKit/UIAlertController/Style/actionSheet) to present the action sheet on iOS, iPadOS, and tvOS.

### Best practices
- **Employ an action sheet rather than an alert when presenting choices stemming from a deliberate user action.** For instance, if a user cancels editing a message in Mail on iPhone, an action sheet presents options like discarding the draft or saving it. While alerts can confirm or cancel actions with destructive outcomes, they do not offer additional choices related to the action itself. Furthermore, alerts are typically used for unexpected events—usually notifying users of a problem or a shift in the current situation that requires their attention. Refer to [Alerts](alerts.md) for further guidance.
- **Use action sheets judiciously.** Since action sheets deliver critical information and choices, they interrupt the user's current workflow. To ensure users remain attentive to them, refrain from using them unless absolutely necessary.
- **Ensure titles are brief enough to display on a single line.** A lengthy title hinders rapid comprehension and risks being truncated or forcing the user to scroll.
- **Supply a message only when required.** Generally, the title, combined with the context of the action being performed, provides sufficient information for users to understand their options.
- **Include a Cancel button if necessary, allowing users to reject an action that might destroy data.** Position this Cancel button at the base of the action sheet (or in the upper-left corner if on watchOS). A SwiftUI confirmation dialog includes a Cancel button by default.
- **Make destructive choices visually prominent.** Utilize the destructive style for buttons that execute destructive actions, and place these controls at the top of the action sheet where they are most noticeable. For developer reference, consult [destructive](apple:SwiftUI/ButtonRole/destructive) (SwiftUI) or [UIAlertAction.Style.destructive](apple:UIKit/UIAlertAction/Style-swift.enum/destructive) (UIKit).

## Platform guidance — watchOS
The system-defined style for action sheets comprises a title, an optional accompanying message, a Cancel button, and one or more supplementary buttons. The visual presentation of this interface differs based on the device being used.

Each button possesses an associated style that communicates information regarding its function. There are three predefined system styles for buttons:

|Style|Meaning|
|---|---|
|Default|The button carries no specific connotation.|
|Destructive|The button triggers the deletion of user data or executes a destructive operation within the application.|
|Cancel|The button dismisses the view without performing any action.|

**Do not display more than four buttons within an action sheet, including the Cancel button.** When fewer options are visible on screen, users can easily view all available choices simultaneously. Given that the Cancel button is mandatory, aim to offer no more than three additional options.
