# Shortcuts and suggestions — overview
When implementing support for Shortcuts, users have multiple avenues to discover and utilize the custom and system intents your application offers. For instance:

- Siri may propose a shortcut for an action if the user has performed it previously, offering it within search results, on the lock screen, and inside the Shortcuts application.
- Your app can introduce a shortcut for an action that users have not yet performed but might wish to execute later, allowing the Shortcuts app to suggest it or display it on the [Siri watch face](https://support.apple.com/guide/watch/faces-and-features-apde9218b440/watchos#apdcc88df92c).
- Users can utilize the Shortcuts app to review all their shortcuts and even chain actions from different applications into complex, multi-step workflows.
- Users can also employ the Shortcuts app to automate a shortcut by setting specific conditions for execution, such as time of day or current location.

The Shortcuts app is also accessible in macOS 12 and subsequent versions, as well as watchOS 7 and later. For guidance intended for developers, consult [SiriKit](apple:SiriKit).

> **Developer note**
> The Add to Siri method for adding shortcuts is no longer supported. Refer to [App Shortcuts](app-shortcuts.md) regarding methods for integrating your app with Siri and the system.
