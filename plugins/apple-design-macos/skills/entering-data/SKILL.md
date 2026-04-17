---
name: entering-data
description: "When collecting information from users, design processes that facilitate effortless and accurate submission. Use when designing entering data for macOS, auditing entering data against Apple's macOS guidelines, or when the user says things like \"design entering data for Mac\", \"entering data on macOS\", \"how should entering data work on Mac\"."
allowed-tools: Read Grep Glob
---

# Entering data
When collecting information from users, design processes that facilitate effortless and accurate submission

## When to use
- User asks about **entering data** on macOS (e.g. `"how do I design entering data for Mac"`).
- User is building a Mac UI that needs entering data and wants to follow Apple's guidelines.
- User asks to audit or review entering data in a macOS design.
- User mentions entering data in the context of a Mac app, game, or interface.

Data entry remains a laborious task regardless of the interaction method employed. Optimize this experience by:

- Minimizing required input by gathering and validating as much information upfront.
- Supporting diverse input methods, allowing users to select the most suitable submission path.

### Best practices
- **Acquire information from the system whenever feasible.** Avoid prompting users for data that can be automatically collected (e.g., from settings) or obtained with explicit permission (e.g., location or calendar data).
- **Clearly define the required data.** For instance, display prompts within a text field (e.g., “username@company.com”) or use descriptive introductory labels such as “Email.” Additionally, prefilling fields with sensible default values can accelerate data input and reduce cognitive load.
- **Employ a secure text entry field when necessary.** If your application or game handles sensitive information, utilize a field that masks user input during entry, typically by showing a filled circle for each character. For developer guidance, see [SecureField](apple:SwiftUI/SecureField). In tvOS, you may also configure a [digit entry view](digit-entry-views.md) to hide entered numerals (developer guidance: [isSecureDigitEntry](apple:TVUIKit/TVDigitEntryViewController/isSecureDigitEntry)). When using the system text field in visionOS, the entered data is visible only to the wearer; for example, a secure text field automatically blurs when content is streamed via AirPlay.
- **Do not prefill a password field.** Users must always enter their password or utilize biometric or keychain authentication. See [Managing accounts](managing-accounts.md) for guidance.
- **Whenever possible, provide choices rather than demanding text input.** Selecting from a list is typically more efficient and easier than typing, even if a keyboard is readily available. If appropriate, consider using a picker, menu, or other selection control to simplify how users provide the required information.
- **Allow users to provide data via drag-and-drop or paste whenever feasible.** Supporting these interactions improves data entry and enhances the feeling of system integration.
- **Implement dynamic validation of field values.** Users become frustrated when they must review and correct errors after completing a lengthy form. By verifying inputs immediately upon entry—and providing feedback as soon as an issue is detected—you allow users to correct mistakes instantly. For numeric data specifically, consider using a number formatter, which automatically configures the text field to accept only numerical values. You can also configure this formatter to display data in specific formats, such as currency, percentage, or a defined number of decimal places.
- **If data entry is required, ensure users understand that all necessary information must be provided before they can advance.** For example, if a set of text fields precedes a Next or Continue button, only enable that button once the required data has been entered.

## Platform guidance — macOS
**Consider using an expansion tooltip to display the complete version of text that has been clipped or truncated within a field.** An *expansion tooltip* functions similarly to a standard tooltip, appearing when the cursor hovers over the field. For applications running on macOS—including those developed for iOS and iPadOS but executed on a Mac—this feature allows users to view all the data they entered if the text field size prevents full display. For detailed guidance, refer to [Offering help > macOS, visionOS](offering-help.md#macOS-visionOS).
