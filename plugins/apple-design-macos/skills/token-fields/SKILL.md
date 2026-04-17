---
name: token-fields
description: "A token field is a specialized text input that transforms entered text into *tokens*, which are readily selectable and manageable. Use when designing token fields for macOS, auditing token fields against Apple's macOS guidelines, or when the user says things like \"design token fields for Mac\", \"token fields on macOS\", \"how should token fields work on Mac\"."
allowed-tools: Read Grep Glob
---

# Token fields
A token field is a specialized text input that transforms entered text into *tokens*, which are readily selectable and manageable

## When to use
- User asks about **token fields** on macOS (e.g. `"how do I design token fields for Mac"`).
- User is building a Mac UI that needs token fields and wants to follow Apple's guidelines.
- User asks to audit or review token fields in a macOS design.
- User mentions token fields in the context of a Mac app, game, or interface.

For instance, Mail utilizes token fields within the compose window's address fields. As users type potential recipients, Mail converts the entered text representing each recipient into a token. These recipient tokens can then be selected, dragged to change order, or moved into another field.

You have the option to configure a token field to display suggested options while users are typing. Mail, for example, suggests recipients as they type in an address field; selecting a suggestion inserts the recipient into the field as a token.

Furthermore, each individual token may include a contextual menu providing details about the token or offering editing capabilities. A recipient token in Mail, for example, includes a menu with commands such as modifying the recipient's name, designating them as a VIP, or viewing their contact card.

In certain scenarios, tokens may also function as search terms; please consult [Search fields](search-fields.md) for detailed guidance.

### Best practices
- **Add value with a context menu.** Users often benefit from a [context menu](context-menus.md) that offers additional options or information pertaining to a token.
- **Consider providing alternative methods for converting text into tokens.** By default, input text is converted into a token when a comma is typed. You can define extra shortcuts, such as pressing Return, that also initiate this action.
- **Consider customizing the delay the system uses before showing suggested tokens.** Suggestions appear immediately by default. However, if suggestions display too quickly, they may distract users while they are typing. If your application suggests tokens, consider adjusting the delay to a comfortable timing.
