---
name: virtual-keyboards
description: "On devices lacking a physical keyboard, the operating system provides several virtual keyboard options for data input. Use when designing virtual keyboards for macOS, auditing virtual keyboards against Apple's macOS guidelines, or when the user says things like \"design virtual keyboards for Mac\", \"virtual keyboards on macOS\", \"how should virtual keyboards work on Mac\"."
allowed-tools: Read Grep Glob
---

# Virtual keyboards
On devices lacking a physical keyboard, the operating system provides several virtual keyboard options for data input

## When to use
- User asks about **virtual keyboards** on macOS (e.g. `"how do I design virtual keyboards for Mac"`).
- User is building a Mac UI that needs virtual keyboards and wants to follow Apple's guidelines.
- User asks to audit or review virtual keyboards in a macOS design.
- User mentions virtual keyboards in the context of a Mac app, game, or interface.

A virtual keyboard can present a specialized set of keys tailored to the current activity; for instance, one optimized for email entry might include the "@" symbol, a period, or even ".com." Note that virtual keyboards do not support keyboard shortcuts.

If appropriate for your application, you have the option to substitute the system-supplied keyboard with a custom view designed for app-specific data entry. Furthermore, on iOS, iPadOS, and tvOS, you can develop an app extension that provides a custom keyboard users can install and utilize instead of the default keyboard.

### Best practices
- **Select a keyboard that aligns with the content users are editing.** For instance, if you provide numbers and punctuation keyboards, you can assist users who need to enter numeric data. When you define a semantic meaning for a text input field, the system can automatically supply a matching keyboard, potentially leveraging this information to refine suggested keyboard corrections. For guidance intended for developers, refer to [keyboardType(_:)](apple:SwiftUI/View/keyboardType(_:)) (SwiftUI), [textContentType(_:)](apple:SwiftUI/View/textContentType(_:))(SwiftUI), [UIKeyboardType](apple:UIKit/UIKeyboardType) (UIKit), and [UITextContentType](apple:UIKit/UITextContentType) (UIKit).
- **Consider customizing the Return key type if it improves clarity during text entry.** The Return key's behavior is determined by the chosen keyboard type, but you have the option to modify it if appropriate for your application. For example, if your app facilitates a search function, you might employ a search Return key type instead of the default one to ensure consistency with how searching is initiated elsewhere. For developer guidance, consult [submitLabel(_:)](apple:SwiftUI/View/submitLabel(_:)) (SwiftUI) and [UIReturnKeyType](apple:UIKit/UIReturnKeyType) (UIKit).

### Custom input views
In certain scenarios, you may implement an *input view* if your application requires custom functionality to improve data entry workflows. For instance, Numbers uses a specialized input view for numerical entry while editing a spreadsheet. A custom input view substitutes the operating system's keyboard when users are within your application. For technical guidance, refer to [ToolbarItemPlacement](apple:SwiftUI/ToolbarItemPlacement) (SwiftUI) and [inputViewController](apple:UIKit/UIResponder/inputViewController) (UIKit).

- **Ensure your custom input view is appropriate for the context of your application.** Beyond making data entry straightforward and intuitive, users must understand why your custom input view is beneficial. Otherwise, they may question why they cannot revert to the system keyboard while using your app.
- **Reproduce the standard keyboard sound when users are typing.** Since the keyboard sound offers predictable feedback when a user taps a key on the system keyboard, they will likely anticipate hearing the same sound when interacting with keys in your custom input view. Users have the option to disable keyboard sounds for all interactions within Settings > Sounds. For developer guidance, consult [playInputClick()](apple:UIKit/UIDevice/playInputClick()) (UIKit).

### Custom keyboards
In iOS, iPadOS, and tvOS, you can allow users to replace the default system keyboard by implementing a custom keyboard through an app extension. An *app extension* is code you supply that allows users to install and utilize your application's functionality within a specific system area; for more details, refer to [App extensions](https://developer.apple.com/app-extensions/).

Once users select your custom keyboard in Settings, they can use it for text input across any application, with the exception of secure text fields and phone number inputs. Users have the ability to select multiple custom keyboards and switch between them at any time. For developer guidance on this process, consult [Creating a custom keyboard](apple:UIKit/creating-a-custom-keyboard).

Custom keyboards are most beneficial when you need to offer unique, system-wide input functionality, such as a novel method for text entry or support for an unsupported language. If your goal is simply to provide a custom keyboard experience only while the user is within your application, you should instead consider implementing a custom input view.

- **Ensure there is an obvious and simple method for users to switch between keyboards.** Users are accustomed to the Globe key on the standard keyboard—which serves as the dedicated Emoji key when multiple keyboards are available—and they expect a similarly intuitive switching mechanism in your keyboard.
- **Do not replicate features already provided by the system keyboard.** On certain devices, the Emoji/Globe key and Dictation key automatically appear below the keyboard, even when custom keyboards are in use. Since your app cannot control these keys, repeating them in your keyboard layout is likely to cause confusion.
- **Consider including a tutorial for the keyboard within your application.** Since users are accustomed to the standard keyboard, mastering a new input method requires time. You can ease this transition by providing usage instructions in your app—for instance, explaining how to select your keyboard, activate it during text entry, utilize its features, and revert to the standard keyboard. Avoid placing help content inside the keyboard itself.
