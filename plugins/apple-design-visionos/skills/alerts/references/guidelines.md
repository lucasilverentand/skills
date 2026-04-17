# Alerts — full guidelines

### Best practices
- **Use alerts sparingly.** Alerts convey critical information but cause interruptions to the user's current task. To ensure users pay attention, each alert must contain only essential details and offer actionable steps.
- **Avoid using an alert merely to provide information.** Users dislike interruptions caused by alerts that are informative but not actionable. If you only need to convey information, use an alternative method within the relevant context. For instance, if a server connection is down, Mail uses an indicator allowing users to seek further details.
- **Avoid displaying alerts for common, undoable actions, even if they are destructive.** For example, you do not need to alert users about data loss every time they delete an email or file because the action is intentional and reversible. Conversely, if a rare destructive action cannot be undone, an alert is necessary in case the initiation was accidental.
- **Avoid showing an alert when your app starts.** If important or new information must be conveyed upon opening the application, design a method that makes this information easily discoverable. If your app detects an issue upon launch (such as no network connection), consider alternative notification methods. For example, you could display cached or placeholder data along with a non-intrusive label describing the issue.

### Anatomy
An alert is a modal view whose visual appearance must vary depending on the specific platform or device.

### Content
Across all platforms, alerts feature a title, optional supplementary information, and up to three action buttons. Certain platforms allow for additional alert components.

- On iOS, iPadOS, macOS, and visionOS, an alert may incorporate a text input field.
- Alerts displayed on macOS and visionOS can also include an icon and an accessory view.
- macOS alerts have the option to add suppression controls [Checkboxes](toggles.md#Checkboxes) and a link to [Help buttons](buttons.md#Help-buttons).
- **Maintain a direct and neutral, yet approachable tone in all alert copy.** Since alerts frequently communicate serious issues or problems, avoid language that is vague, accusatory, or minimizes the severity of the situation.
- **Craft a title that precisely and succinctly conveys the situation.** You must enable users to quickly grasp the context, so be thorough and specific without being overly wordy. Ideally, describe what occurred, the circumstances of the occurrence, and why it is relevant. Avoid titles that fail to convey necessary information (e.g., "Error" or "Error 329347 occurred"), but also avoid titles that are excessively long and wrap onto more than two lines. If the title forms a complete sentence, use [sentence-style capitalization](https://help.apple.com/applestyleguide/#/apsgb744e4a3?sub=apdca93e113f1d64) and include proper terminal punctuation. If the title is a sentence fragment, use title-style capitalization and omit terminal punctuation.
- **Include informative text only if it adds value.** If supplementary information is necessary, keep it as brief as possible. Use complete sentences, sentence-style capitalization, and appropriate punctuation.
- **Do not explain the alert buttons.** If your alert text and button labels are clear, there is no need to describe the function of the buttons. In uncommon scenarios where guidance on button selection is required, use a term like *choose* to accommodate users' device and interaction method, and refer to the button using its exact title without quotation marks. For guidance on this process, consult [Buttons](#Buttons).
- **If supported, include a text field only when user input is required to resolve the issue.** For instance, you might need to present a secure text field for receiving a password.

### Buttons
- **Titles must be brief and logical.** Aim for a one- or two-word title that communicates the outcome of selecting the button. Favor verbs and verb phrases that directly correspond to the alert text—for instance, "View All," "Reply," or "Ignore." In alerts that are purely informational, you may use "OK" for acceptance; however, in all other cases, this is discouraged. Always title a button that cancels the alert's action using "Cancel." As with all titles, employ [sentence-style capitalization](https://help.apple.com/applestyleguide/#/apsgb744e4a3?sub=apdca93e113f1d64) and omit terminal punctuation.
- **Avoid using OK as the default button title unless the alert is purely informational.** The term "OK" can be ambiguous, even when used in alerts requiring confirmation. For example, it is unclear whether "OK" signifies, "OK, I wish to proceed with the action," or "OK, I now understand the negative consequences my action would incur." A specific title such as "Erase," "Convert," "Clear," or "Delete" provides users with a clearer understanding of the action they are committing to.
- **Placement must be intuitive.** Generally, position the button that users are most likely to select on the trailing side in a horizontal arrangement or at the top in a vertical stack. Always ensure the default button occupies this trailing/top position. Cancel buttons are conventionally placed on the leading side of a row or at the bottom of a stack.
- **Use the destructive style to denote an unintended destructive action.** For instance, if users intentionally choose a destructive action (like Empty Trash), the resulting alert should not apply the destructive style to the Empty Trash button, as the action reflects the user's original intent. In this scenario, the convenience of confirming the deliberately chosen Empty Trash action via Return outweighs the benefit of visually reaffirming its destructive nature. Conversely, users appreciate an alert that highlights a button capable of performing a destructive action that was not the user's initial intent.
- **If a destructive action is possible, include a Cancel button to provide a clear, safe means of avoidance.** Always title the cancellation button "Cancel." Note that you must not make a Cancel button the default selection. If your goal is to ensure users read the alert rather than automatically dismissing it by pressing Return, refrain from making any button the default. Similarly, if an alert must display a single, default button, use "Done," not "Cancel."
- **Provide alternative cancellation methods when applicable.** In addition to selecting a Cancel button, users benefit from having keyboard shortcuts or other rapid ways to dismiss an onscreen alert. For example:

|Action|Platform|
|---|---|
|Exit to the Home Screen|iOS, iPadOS|
|Pressing Escape (Esc) or Command-Period (.) on an attached keyboard|iOS, iPadOS, macOS, visionOS|
|Pressing Menu on the remote|tvOS|

## Platform guidance — visionOS
When your application runs in Shared Space, visionOS displays an alert positioned ahead of the app's window along the z-axis.

If a user moves a window without dismissing its alert, the alert remains anchored to that window. Conversely, if your app operates in a Full Space, the system displays the alert centered within the wearer’s [Field of view](spatial-layout.md#Field-of-view).

Should you require an accessory view within a visionOS alert, ensure the view has a maximum height of 154 pt and utilizes a 16-pt corner radius.
