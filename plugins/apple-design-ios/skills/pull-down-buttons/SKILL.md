---
name: pull-down-buttons
description: "A pull-down button reveals a menu containing items or actions directly related to its function. Use when designing pull down buttons for iOS and iPadOS, auditing pull down buttons against Apple's iOS and iPadOS guidelines, or when the user says things like \"design pull down buttons for iPhone\", \"pull down buttons on iOS and iPadOS\", \"how should pull down buttons work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Pull-down buttons
A pull-down button reveals a menu containing items or actions directly related to its function

## When to use
- User asks about **pull down buttons** on iOS and iPadOS (e.g. `"how do I design pull down buttons for iPhone"`).
- User is building an iPhone UI that needs pull down buttons and wants to follow Apple's guidelines.
- User asks to audit or review pull down buttons in an iOS and iPadOS design.
- User mentions pull down buttons in the context of an iPhone app, game, or interface.

Upon selection of an item from the pull-down menu, the menu dismisses, and the application executes the chosen action.

### Best practices
**Use a pull-down button for commands or items that are directly related to the button’s action.** The menu allows users to refine the button's target or customize its behavior without needing extra interface elements. For instance:

- An Add button could present a menu allowing users to specify the item they wish to add.
- A Sort button could utilize a menu for selecting an attribute upon which to sort.
- A Back button could enable users to choose a specific location to return to rather than simply opening the previous view.

If you are presenting a list of mutually exclusive choices that are not commands, use [Pop-up buttons](pop-up-buttons.md) instead.

- **Avoid placing all of a view’s actions within one pull-down button.** A view's primary functions must be readily discoverable; therefore, you should not hide them inside a pull-down button that users must open to perform any action.
- **Balance the menu length with usability.** Since users must interact with a pull-down button before viewing its contents, including a minimum of three items makes the interaction feel worthwhile. If you only need to list one or two items, consider alternative components like action buttons or toggles/switches for selections. Conversely, including too many items in a pull-down menu can slow down the user because finding a specific item takes longer.
- **Only display a concise menu title if it adds meaning.** Generally, the pull-down button's content, combined with descriptive menu items, provides sufficient context, making a title redundant.
- **Signal when a pull-down button’s menu item is destructive, and require confirmation.** Menus should use red text to highlight actions you deem potentially destructive. When a user selects such an action, the system presents an [Action sheets](action-sheets.md) (iOS) or [Popovers](popovers.md) (iPadOS) where they can confirm or cancel the action. Because an action sheet appears in a different location from the menu and requires deliberate dismissal, this process helps prevent accidental data loss.
- **Include an interface icon with a menu item if it adds value.** If you need to clarify an item's meaning, display an [Icons](icons.md) or image following its label. Using [SF Symbols](sf-symbols.md) for this purpose helps provide a familiar experience while ensuring the symbol remains consistent with the text at all scales.

## Platform guidance — iOS & iPadOS
> **Note**
You may allow users to reveal a pull-down menu by executing a specific action on a button. For instance, in iOS 14 and subsequent versions, Safari displays a menu containing tab-related actions (such as New Tab or Close All Tabs) when the Tabs button receives a touch and hold gesture.

**Consider utilizing a More pull-down button when presenting options that do not require prominent placement within the primary interface.** A More button is useful for providing a variety of options when screen real estate is limited, but it carries the risk of reducing discoverability. While users typically grasp that a More button provides contextually relevant additional functions, the ellipsis icon does not inherently inform them about what items are contained within. Therefore, to successfully design a More button, you must balance the convenience gained from its compactness against any negative effect it has on users finding content in your application.
