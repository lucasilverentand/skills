---
name: text-fields
description: "A text field is a rectangular region where users input or modify brief, specific textual data. Use when designing text fields for tvOS, auditing text fields against Apple's tvOS guidelines, or when the user says things like \"design text fields for Apple TV\", \"text fields on tvOS\", \"how should text fields work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Text fields
A text field is a rectangular region where users input or modify brief, specific textual data

## When to use
- User asks about **text fields** on tvOS (e.g. `"how do I design text fields for Apple TV"`).
- User is building an Apple TV UI that needs text fields and wants to follow Apple's guidelines.
- User asks to audit or review text fields in a tvOS design.
- User mentions text fields in the context of an Apple TV app, game, or interface.

### Best practices
- **Use a text field when requesting a small amount of information, such as an email address or name.** For collecting larger bodies of text, utilize a [Text views](text-views.md) instead.
- **Display a hint within a text field to clarify its purpose.** A text field can include placeholder text—like "Email" or "Password"—when the field is otherwise empty. Since this placeholder disappears as users begin typing, it is also beneficial to include a separate label that describes the field's function.
- **Employ secure text fields to protect private data.** Always use a secure text field when your application collects sensitive information, such as passwords. For developer guidance, refer to [SecureField](apple:SwiftUI/SecureField).
- **Match the text field size to the expected volume of input.** The dimensions of a text field assist users in visually estimating how much information they need to provide.
- **Maintain consistent spacing between multiple text fields.** If your layout features several text fields, ensure sufficient visual separation between them so users can easily match each input field to its corresponding introductory label. When possible, stack multiple text fields vertically and use uniform widths for a more organized presentation. For instance, the first and last name inputs on an address form might share one width, while the address and city fields use another.
- **Ensure logical flow when tabbing between fields.** When navigating through fields using the Tab key, focus must move in a predictable sequence. While the system attempts to manage this automatically, you may occasionally need to customize this behavior.
- **Validate fields when appropriate.** For example, if a field must contain only numeric characters, your app must alert the user if non-digit characters are entered. The optimal timing for data checking depends on the context: when entering an email address, validation is best performed when the user moves to a subsequent field; conversely, for creating usernames or passwords, validation should occur before the user leaves the field.
- **Utilize a number formatter for numeric data.** A number formatter automatically configures the text field to accept only numerical values. It can also present the value in a specific manner, such as displaying it as currency, a percentage, or with a defined number of decimal places. However, do not assume the actual data presentation, as formatting can vary greatly depending on the user's locale.
- **Adjust line breaks based on the field’s requirements.** By default, the system truncates any text that exceeds a text field's boundaries. Alternatively, you can configure a text field to allow text wrapping onto a new line (at the character or word level) or to truncate (using an ellipsis) at the beginning, middle, or end.
- **Consider using an expansion tooltip to display the full version of clipped text.** An expansion tooltip functions like a standard [tooltip](offering-help.md#macOS-visionOS) and appears when the pointer hovers over the field.
- **Display the correct keyboard type on iOS, iPadOS, tvOS, and visionOS apps.** Several keyboard types are available, each suited to facilitating a specific input type (e.g., numbers or URLs). To optimize data entry, present the keyboard that matches the content type being entered. Refer to [Virtual keyboards](virtual-keyboards.md) for guidance.
- **Minimize text entry in tvOS and watchOS apps.** Entering lengthy passages or filling out many text fields is time-consuming on Apple TV and Apple Watch. Minimize the need for text input and explore more efficient information gathering methods, such as using buttons.
