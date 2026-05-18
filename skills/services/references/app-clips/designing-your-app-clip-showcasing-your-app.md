# Showcasing your app
Users do not manage App Clips, nor are they placed on the Home screen. Instead, the system removes an App Clip after a period of inactivity.

Since the main application is superior for sustained user engagement, the system assists users in finding and installing the full app:

- The App Clip card allows users to either launch the App Clip or navigate to the full application page in the App Store.
- Upon initial launch of the App Clip, the system presents an app banner at the top of the screen. Similar to the App Clip card, this banner enables users to visit the app's page on the App Store.

Additionally, you can display an overlay in your App Clip that allows users to download the complete application while they are using the App Clip.

- **Do not degrade the user experience by prompting installation of the full app.** If your App Clip provides a transient, on-the-go experience, evaluate whether the App Clip card and the system-provided app banner offer sufficient incentive for users to download the full application. If your App Clip offers a demonstration, allow users to fully experience the demo before asking them to install the full app.
- **Select the appropriate moment to suggest your application.** When a user finishes a task or reaches a natural pause, display an [SKOverlay](apple:StoreKit/SKOverlay) enabling them to initiate a download of your full app or game from within the App Clip context.
- **Recommend your application in a manner that is polite and nonintrusive.** Do not repeatedly ask users to install the full app or interrupt them during a task. Push notifications are also ineffective for prompting installation. Clearly communicate the additional features your app possesses.

For developer guidance, see [Recommending your app to App Clip users](apple:AppClip/recommending-your-app-to-app-clip-users).
