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

## Platform guidance — watchOS
In watchOS, video playback is managed by the system. While an app is active and running in the foreground, it can display short video clips. You may embed these clips using a movie element for inline playback or present them in a separate interface. For detailed developer guidance, refer to [VideoPlayer](apple:AVKit/VideoPlayer).

- **Keep video clips brief.** It is advisable to use shorter clips, ideally no longer than 30 seconds. Extended videos consume more storage and require users to hold up their wrists for prolonged periods, which can lead to fatigue.
- **Use the recommended sizes and encoding values for media assets.** Specifically, avoid scaling video clips, as this negatively impacts performance and compromises visual quality. The following table outlines the recommended encoding and resolution settings for video assets. These audio encoding values apply to both movies and standalone audio content.

|Attribute|Value|
|---|---|
|Video codec|H.264 High Profile|
|Video bit rate|160 kbps at up to 30 fps|
|Resolution (full screen)|208x260 px (portrait orientation)|
|Resolution (16:9)|320x180 px (landscape orientation)|
|Audio|64 kbps HE-AAC|

- **Avoid designing a poster image that resembles a system control.** Users must understand that tapping the movie element initiates playback; do not create confusion by making it appear as another type of control.
- **Consider creating a poster image that accurately reflects the video clip's content.** When users tap this poster, the system swaps the image for the video and begins inline playback. A relevant poster helps users decide whether they wish to view the content. In general, avoid using a poster image that is unrelated to the content or might be mistaken for an interactive control.
