---
name: action-sheets
description: "An action sheet serves as a modal view that displays options pertaining to an action the user has started. Use when designing action sheets for iOS and iPadOS, auditing action sheets against Apple's iOS and iPadOS guidelines, or when the user says things like \"design action sheets for iPhone\", \"action sheets on iOS and iPadOS\", \"how should action sheets work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Action sheets
An action sheet serves as a modal view that displays options pertaining to an action the user has started

## When to use
- User asks about **action sheets** on iOS and iPadOS (e.g. `"how do I design action sheets for iPhone"`).
- User is building an iPhone UI that needs action sheets and wants to follow Apple's guidelines.
- User asks to audit or review action sheets in an iOS and iPadOS design.
- User mentions action sheets in the context of an iPhone app, game, or interface.

> **Developer note**
> When developing with SwiftUI, you can provide action sheet functionality across all platforms by applying a [presentation modifier](apple:swiftui/view-presentation) to the confirmation dialog. If you are using UIKit, utilize [UIAlertController.Style.actionSheet](apple:UIKit/UIAlertController/Style/actionSheet) to present the action sheet on iOS, iPadOS, and tvOS.

### Best practices
- **Employ an action sheet rather than an alert when presenting choices stemming from a deliberate user action.** For instance, if a user cancels editing a message in Mail on iPhone, an action sheet presents options like discarding the draft or saving it. While alerts can confirm or cancel actions with destructive outcomes, they do not offer additional choices related to the action itself. Furthermore, alerts are typically used for unexpected events—usually notifying users of a problem or a shift in the current situation that requires their attention. Refer to [Alerts](alerts.md) for further guidance.
- **Use action sheets judiciously.** Since action sheets deliver critical information and choices, they interrupt the user's current workflow. To ensure users remain attentive to them, refrain from using them unless absolutely necessary.
- **Ensure titles are brief enough to display on a single line.** A lengthy title hinders rapid comprehension and risks being truncated or forcing the user to scroll.
- **Supply a message only when required.** Generally, the title, combined with the context of the action being performed, provides sufficient information for users to understand their options.
- **Include a Cancel button if necessary, allowing users to reject an action that might destroy data.** Position this Cancel button at the base of the action sheet (or in the upper-left corner if on watchOS). A SwiftUI confirmation dialog includes a Cancel button by default.
- **Make destructive choices visually prominent.** Utilize the destructive style for buttons that execute destructive actions, and place these controls at the top of the action sheet where they are most noticeable. For developer reference, consult [destructive](apple:SwiftUI/ButtonRole/destructive) (SwiftUI) or [UIAlertAction.Style.destructive](apple:UIKit/UIAlertAction/Style-swift.enum/destructive) (UIKit).

## Platform guidance — iOS & iPadOS
- **When choices are tied to an action, use an action sheet instead of a menu.** Users expect an action sheet to appear when performing an action that necessitates clarifying choices. Conversely, they anticipate a menu when they intentionally choose to reveal options.
- **Prevent an action sheet from scrolling.** The greater the number of buttons in an action sheet, the more time and effort users must expend making a decision. Additionally, scrolling through an action sheet makes it difficult to avoid inadvertently selecting a button.
