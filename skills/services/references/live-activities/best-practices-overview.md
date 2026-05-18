# Best practices — overview
- **Offer Live Activities for tasks and events that have a defined beginning and end.** These activities are most effective when tracking short-to-medium duration events that do not exceed eight hours.
- **Focus on important information that people need to see at a glance.** Your Live Activity does not need to present all details. Determine the most useful information and convey it concisely. Users can tap the Live Activity to open your app for further details.

**Don’t use a Live Activity to display ads or promotions**. Since Live Activities serve to keep users informed about ongoing tasks and events, only information directly related to those items should be shown.

- **Avoid displaying sensitive information.** Given that Live Activities are highly visible and may be viewed by casual observers (such as on the Lock Screen or in Always-On display), present only a non-sensitive summary for private content. Users can then tap the Live Activity to view the sensitive details within your app. Alternatively, you may redact views containing private data and allow users to configure the visibility of sensitive information. For developer guidance, see [Creating a widget extension](apple:WidgetKit/Creating-a-Widget-Extension#Hide-sensitive-content).
- **Create a Live Activity that matches your app’s visual aesthetic and personality in both dark and light appearances.** This consistency helps users quickly identify your Live Activity and maintains a visual connection to your application.
- **If you include a logo mark, display it without a container.** This allows the logo to integrate seamlessly into your Live Activity layout. Do not use the entire app icon.
- **Don’t add elements to your app that draw attention to the Dynamic Island.** Your Live Activity appears in the Dynamic Island when your app is backgrounded, while other content may appear there when your app is active.
- **Ensure text is easy to read.** Utilize large, bolded typography—a medium weight or heavier is recommended. Use smaller text sparingly and ensure all critical information is immediately legible.
