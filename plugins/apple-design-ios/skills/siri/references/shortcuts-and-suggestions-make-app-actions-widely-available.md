# Make app actions widely available
Donating information regarding the actions your application supports enables the system to present these actions to users in multiple ways, including:

- In search results
- Within the Shortcuts app
- On the lock screen as a Siri Suggestion
- Within the Now Playing view (for recently played media content)
- During Wind Down

Donations also enable Automation Suggestions in the Shortcut app’s Gallery, making it simple for users to set up automations that allow hands-free interaction with your app.

You can also inform the system about shortcuts for actions users have not yet performed or make a shortcut available on the Siri watch face (for guidance, see [Suggest Shortcuts people might want to add to Siri](#Suggest-Shortcuts-people-might-want-to-add-to-Siri) and [Display shortcuts on the Siri watch face](#Display-shortcuts-on-the-Siri-watch-face)). For developer guidance, see [Donating Shortcuts](apple:SiriKit/donating-shortcuts).

- **Donate a shortcut every time the action occurs.** When you donate a shortcut each time users perform the associated action, you assist the system in more accurately predicting the optimal timing and location to offer that shortcut.
- **Only donate actions that users actually perform.** For instance, a coffee ordering application donates the *Order coffee* shortcut each time someone orders coffee, but not when they perform a different action, such as browsing the menu. Similarly, a media application donates information about a song—such as its title and album—only when users are actively listening to it. (For developer guidance, see [Improving Siri Media Interactions and App Selection](apple:SiriKit/improving-siri-media-interactions-and-app-selection).)
- **Remove donations for actions that rely on corresponding data.** If the information needed by a donated action is no longer available, your application must delete the donation so that the shortcut ceases to be suggested. For example, if users delete a contact in a messaging application, the app must remove donations related to that contact. When users create a shortcut themselves, only they possess the ability to delete it. For developer guidance, see [Deleting Donated Shortcuts](apple:SiriKit/deleting-donated-shortcuts).
- **If your app manages reservations, consider donating them to the system.** These items—such as ticketed events, travel plans, or reservations for restaurants, flights, or movies—automatically appear as suggestions in Calendar or Maps. By donating a reservation, it can surface on the lock screen with a prompt to check in via your app or serve as a reminder that uses current traffic data to advise users on when they should depart. For developer guidance, see [Donating Reservations](apple:SiriKit/donating-reservations).

##### Suggest Shortcuts people might want to add to Siri
If your application supports an action that users have not yet performed but may find beneficial, you can offer a *suggested* shortcut to allow for its discovery by the system. For example, if users of a coffee ordering app typically order their daily beverage but not a holiday special, the app may still wish to provide an *Order holiday coffee* shortcut.

Suggested shortcuts are displayed in both the Gallery and the shortcut editor within the Shortcuts app. For detailed developer guidance, consult [Offering Actions in the Shortcuts App](apple:SiriKit/offering-actions-in-the-shortcuts-app).

##### Display shortcuts on the Siri watch face
On Apple Watch, users have several methods for executing shortcuts. For instance, they can invoke Siri, tap a shortcut [complication](complications.md) on the watch face, or utilize the Shortcuts application available in watchOS 7 and later. Furthermore, you can enable shortcuts to appear on the Siri watch face.

To ensure a shortcut appears on the Siri watch face, you must define it as *relevant*. This involves including details such as the time constraints under which your shortcut is applicable and how it should be displayed on the Siri watch face. The information provided enables the Siri watch face to intelligently present your shortcut when the context is appropriate for the user.

For detailed developer instructions, consult [Defining Relevant Shortcuts for the Siri Watch Face](apple:SiriKit/defining-relevant-shortcuts-for-the-siri-watch-face).
