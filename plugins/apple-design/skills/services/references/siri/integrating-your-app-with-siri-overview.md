# Integrating your app with Siri — overview
Tasks are central to how your application integrates with Siri. SiriKit is founded on the concept of a user's goal, using the term *intent* to denote a task your app supports. The communication between your application and Siri revolves around these intents—that is, the tasks your app assists users in completing.

SiriKit establishes *system intents* for common actions, such as initiating a call, sending a message, or starting exercise. These related intents are grouped into *domains*. A *domain* is a specific category of tasks that Siri understands, such as messaging, calling, or workouts. For a comprehensive list of supported domains and actions on iOS and watchOS, refer to [System intents](#System-intents).

Whenever possible, utilize the intents defined by SiriKit. Leveraging system-provided intents simplifies development while still allowing opportunities to tailor the user experience. However, if your application offers tasks not covered by system-defined intents—for example, ordering food or browsing groceries—you can create a *custom intent* (guidance is available at [Custom intents](#Custom-intents)).
