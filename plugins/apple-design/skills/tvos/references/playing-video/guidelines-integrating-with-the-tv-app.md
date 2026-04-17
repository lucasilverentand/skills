# Integrating with the TV app
The TV app offers users global access to their favorite, recently viewed, and suggested video content across the entire system. When a user starts playback in your app via the TV app, the TV app handles launching and transitioning to your application. Follow these guidelines to ensure the experience feels seamlessly integrated with the TV app.

- **Ensure a seamless transition into your application.** The TV app transitions to black when moving to your app and bypasses displaying your app's launch screen. To maintain visual consistency during this transition, immediately present your own black screen before beginning playback or resuming content.
- **Display the intended content without delay.** Users expect chosen content to begin playing immediately once the transition into your app is complete, particularly when resuming playback. Move directly from your app's black screen into the content, eliminating splash screens, detail views, intro animations, or any other barriers that delay access to the media. In rare instances where an interstitial element must appear before playback, users should have the option to select "Select" to advance through it or choose "Play" to skip the interstitial and start viewing.
- **Do not prompt users about resuming playback.** If content can be resumed, do so automatically without requiring explicit confirmation from the user.
- **Control playback using the Space bar on a connected Bluetooth keyboard.** Users expect that pressing Space controls media playback, regardless of the specific keyboard hardware being used.
- **Ensure content plays for the correct viewer.** If your app supports multiple user profiles, the TV app can specify a profile when initiating playback. Your app must automatically switch to this specified profile before starting the video. If a playback request lacks a profile specification, prompt the viewer to select one before playback begins so this information is available for future requests.
- **Utilize the previous end time when resuming a lengthy video.** Resuming playback at the point where it was previously stopped allows users to quickly pick up exactly where they left off.

#### Loading content
- **Avoid displaying loading screens when possible.** A dedicated loading screen is unnecessary if content loads quickly. However, if the load time exceeds two seconds, consider presenting a black screen with a centered activity spinner and no other visual elements.
- **Start playback immediately.** Should a loading screen be necessary, it must only display until enough content is loaded to begin playback. The remaining assets should continue loading in the background.
- **Minimize loading screen content.** If you include branding or imagery on the loading screen, it must be done minimally. Maintaining a black background is essential for providing a seamless transition into playback.

#### Exiting playback
- **Show a contextually appropriate screen.** When playback concludes, display a detail view corresponding to the content that was just viewed, and include an option allowing users to resume playback. If a dedicated detail view is unavailable, present either a menu listing the content or your application's primary menu.
- **Be prepared for an immediate exit.** Prepare the necessary exit view as soon as the playback notification is received, ensuring it is ready to display if users close the app immediately after playback begins.

## Platform guidance — tvOS
- **Defer to content when displaying logos or noninteractive overlays above video.** While a small, unobtrusive logo or countdown timer may be suitable for your video, avoid large overlays that detract from the viewing experience. Furthermore, given that certain devices are susceptible to image retention, it is generally advisable to keep overlays brief and utilize translucent graphics in Standard Dynamic Range (SDR) rather than bright, opaque content.
- **Show interactive overlays gracefully.** If your video includes interactive elements such as quizzes, surveys, or progress check-ins, ensure a positive user experience. To achieve this, implement a minimum 0.5-second delay before pausing the media to display an interactive layer. Provide users with a clear mechanism to dismiss the overlay and resume video playback once they have completed their interaction.
