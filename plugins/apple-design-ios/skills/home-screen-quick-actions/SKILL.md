---
name: home-screen-quick-actions
description: "Home Screen quick actions allow users to execute app-specific functions directly from the Home Screen. Use when designing home screen quick actions for iOS and iPadOS, auditing home screen quick actions against Apple's iOS and iPadOS guidelines, or when the user says things like \"design home screen quick actions for iPhone\", \"home screen quick actions on iOS and iPadOS\", \"how should home screen quick actions work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Home Screen quick actions
Home Screen quick actions allow users to execute app-specific functions directly from the Home Screen

## When to use
- User asks about **home screen quick actions** on iOS and iPadOS (e.g. `"how do I design home screen quick actions for iPhone"`).
- User is building an iPhone UI that needs home screen quick actions and wants to follow Apple's guidelines.
- User asks to audit or review home screen quick actions in an iOS and iPadOS design.
- User mentions home screen quick actions in the context of an iPhone app, game, or interface.

Users access a menu of available quick actions by long-pressing an app icon (or, on 3D Touch devices, pressing the icon with increased pressure). For instance, Mail offers quick actions such as accessing the Inbox or VIP mailbox, starting a search, and composing a new message. Beyond these app-specific functions, the Home Screen quick action menu also contains options for deleting the application and modifying the Home Screen layout.

Every Home Screen quick action must include a title, an interface icon positioned either on the left or right (depending on where your app resides on the Home Screen), and an optional subtitle. When using left-to-right languages, both the title and subtitle must maintain left alignment. Furthermore, your application has the capability to dynamically refresh its quick actions as new information becomes available. For example, Messages offers quick actions that allow users to open their most recent conversations.

### Best practices
- **Develop quick actions for high-value, compelling tasks.** For instance, Maps allows users to search near their current location or navigate home without launching the full application. Users generally expect an app to offer at least one useful quick action; you may include up to four.
- **Ensure that changes to quick actions are predictable.** Dynamic quick actions can maintain relevance; for example, updating actions based on the current location, recent in-app activity, time of day, or setting changes is appropriate. However, any modifications must occur in a manner that users can anticipate.
- **For every quick action, supply a concise title that immediately conveys the outcome.** Titles such as “Directions Home,” “Create New Contact,” and “New Message” help users understand the action's result. If additional detail is necessary, include a subtitle. Mail utilizes subtitles to denote the presence of unread messages in the Inbox and VIP folder. Do not include your app's name or any irrelevant details in either the title or subtitle; keep the text brief to prevent truncation, and ensure you consider localization during composition.
- **Use a recognizable interface icon for each quick action.** We recommend using [SF Symbols](sf-symbols.md) to represent these actions. For a collection of icons representing common functions, refer to [Standard icons](icons.md#Standard-icons); for further guidance, consult [Menus](menus.md).

If you create a custom interface icon, utilize the Quick Action Icon Template found within [Apple Design Resources for iOS and iPadOS](https://developer.apple.com/design/resources/#ios-apps).

**Do not substitute a symbol or interface icon with an emoji.** Emojis are rendered in full color, whereas quick action symbols are monochromatic and adjust their appearance in Dark Mode to ensure contrast.
