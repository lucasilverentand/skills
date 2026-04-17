# Provide information about actions and support suggestions
While most applications handle a wide array of actions, users typically engage with only a small subset on a routine basis. When you inform the system about these habitual actions and describe potential future actions, Siri gains the ability to *propose* shortcuts for both types of activities when users are likely interested.

For instance, consider a coffee application where ordering a cup might be the most frequent action, while buying beans or finding a new cafe are less common activities. In this scenario, the coffee app would share details regarding the *order coffee* action so that Siri can suggest a shortcut for it during typical usage times, such as weekday mornings. Furthermore, the app could inform Siri about an action users haven't performed yet but might consider—like ordering a new seasonal blend of their preferred coffee—allowing Siri to potentially suggest a shortcut for this action.

Siri can leverage signals such as location, time of day, and movement type (e.g., walking, running, or driving) to intelligently predict the optimal time and place to suggest actions from your application. Depending on the data provided by your app and the user's current context, Siri can present shortcut *suggestions* on the lock screen, within search results, or on the [Siri watch face](https://support.apple.com/guide/watch/faces-and-features-apde9218b440/watchos#apdcc88df92c). Siri may also utilize certain types of information to suggest actions supported by system apps, such as using Calendar to schedule an event shared through your app. Example scenarios include:

- Shortly before 7:30 a.m., Siri might suggest the *order coffee* action to users who utilize the coffee app every morning.
- After a user employs a box office application to purchase movie tickets, Siri might prompt them regarding Do Not Disturb shortly before the screening begins.
- Siri could propose an automation that initiates a workout in a user's preferred fitness app and plays their favorite playlist as they arrive at their usual gym.
- When users enter an airport following a domestic flight, Siri might suggest requesting a ride home through their favored ride-sharing application.

By supplying information about your actions to the system, users can also employ the Shortcuts app to create shortcuts for both the system and custom intents you support. Refer to [Shortcuts and suggestions](#Shortcuts-and-suggestions) for detailed guidance.
