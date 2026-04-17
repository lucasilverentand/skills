# App Shortcuts — full guidelines
Since App Shortcuts are integral to your application, they become available immediately upon installation completion. For instance, a journaling app could offer an App Shortcut to create a new entry that is accessible even before the user launches the application. Once users begin interacting with your app, its App Shortcuts can adapt to their preferences, similar to how FaceTime uses them for recent contacts.

App Shortcuts utilize [App Intents](apple:AppIntents) to define actions within your app that are exposed to the system. Each App Shortcut incorporates one or more actions, which represent a sequence of steps users might execute to complete a task. For example, a home security application could merge the two common actions of turning off lights and locking exterior doors into a single App Shortcut when users go to bed. Each app may include up to 10 App Shortcuts.

> **Note**
> When you expose your app's actions to the system using App Intents, users can also create their own personalized shortcuts in addition to those provided by your app. These custom shortcuts offer users the flexibility to configure action behavior and enable workflows that span multiple applications. For further assistance, consult the [Shortcuts User Guide](https://support.apple.com/guide/shortcuts/welcome/ios).

### Best practices
- **Offer App Shortcuts for your app’s most common and important tasks.** The most effective shortcuts are those that allow users to complete straightforward actions without leaving their current context. However, you may also use them to facilitate multi-step tasks within your app.
- **Add flexibility by letting people choose from a set of options.** If appropriate, an App Shortcut may include a single optional parameter. For instance, a meditation application could offer shortcuts allowing users to begin specific types of meditations: “Start [morning, daily, sleep] meditation.” Include predictable and commonly used values as options, since users may not have the full list available for reference. For guidance intended for developers, refer to [Adding parameters to an app intent](apple:AppIntents/Adding-parameters-to-an-app-intent).
- **Ask for clarification in response to a request that’s missing optional information.** If a user says, "Start meditation" without specifying the type (morning, daily, or sleep), you can follow up by suggesting a recently used option or one relevant to the current time of day. If one choice is highly probable, consider presenting it as the default and offering a brief list of alternatives if the user declines the default.
- **Keep voice interactions simple.** If your phrase sounds overly complex when spoken aloud, it is likely difficult for users to remember or articulate correctly. For example, "Start [sleep] meditation with nature sounds" suggests two potential parameters: the meditation type and the accompanying sound. If additional information is absolutely necessary, request it in a subsequent interaction step. For further advice on crafting dialogue text for voice interactions, consult [Siri](siri.md).
- **Make App Shortcuts discoverable in your app.** Users are most likely to remember and utilize App Shortcuts for tasks they perform frequently, provided they know the shortcut exists. Consider providing occasional tips within your app when users perform common actions to inform them about the availability of an App Shortcut. For developer guidance, see [SiriTipUIView](apple:AppIntents/SiriTipUIView).

#### Responding to App Shortcuts
When a user interacts with an App Shortcut, your application has several ways to respond, including through Siri-spoken dialogue and custom visuals like Live Activities or snippets.

- Snippets are ideal for custom views that present static data or dialogue choices, such as displaying local weather or confirming a transaction. Refer to [ShowsSnippetView](apple:AppIntents/ShowsSnippetView) for developer guidance.
- [Live Activities](live-activities.md) provide ongoing access to information that is likely to remain relevant and evolve over time, making them suitable for timers or countdowns until an event concludes. See [LiveActivityIntent](apple:AppIntents/LiveActivityIntent) for developer guidance.

**Ensure sufficient detail is provided for interaction on audio-only devices.** Users may receive responses on audio-only hardware, like AirPods and HomePod, where visual content might not always be available. Therefore, include all essential information within the complete dialogue text of your App Shortcuts. For developer guidance, consult [init(full:supporting:systemImageName:)](apple:AppIntents/IntentDialog/init(full:supporting:systemImageName:)).

### Editorial guidelines
**Provide brief, memorable activation phrases and natural variants.** Since an App Shortcut phrase (or a defined variant) is how users invoke an App Shortcut via Siri, brevity is crucial for easy recall. While you must include your app's name, creativity is encouraged. For instance, Keynote accepts both “Create a Keynote” and “Add a new presentation in Keynote” as valid App Shortcut phrases for generating a new document. For developer guidance, refer to [AppShortcutPhrase](apple:AppIntents/AppShortcutPhrase).

**When referencing App Shortcuts or the Shortcuts app, always use title case and ensure that *Shortcuts* is plural.** For example, *MyApp integrates with Shortcuts to provide a quick way to accomplish tasks with just a tap or by asking Siri, and offers App Shortcuts you can place on the Action button.*

**When referring to individual shortcuts (not App Shortcuts or the Shortcuts app), use lowercase.** For example, *Run a shortcut by asking Siri or tapping a suggestion on the Lock Screen.*

## Platform guidance — iOS & iPadOS
App Shortcuts can appear in Spotlight's Top Hit section when users search for your app, or within the dedicated Shortcuts area. Each App Shortcut must contain either a symbol chosen from [SF Symbols](sf-symbols.md) to represent its functionality, or a preview image of the item it links to directly.

- **Order shortcuts based on importance.** The sequence you select determines how App Shortcuts initially appear in both Spotlight and the Shortcuts app, so it is beneficial to list the most generally useful ones first. Once users begin utilizing your App Shortcuts, the system updates its prioritization based on frequency of use.
- **Offer an App Shortcut that starts a Live Activity.** Live Activities allow users to monitor an event or track the progress of a task in glanceable locations across their devices. For example, a cooking application could offer a Live Activity showing the time remaining until a dish is ready to be taken from the oven. To facilitate starting a cooking timer, the app provides an App Shortcut that users can place on the Action button. For more information regarding Live Activities, consult [Live Activities](live-activities.md).
