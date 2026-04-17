# Requesting permission
Here are several examples of data or resources that require explicit permission to access:

- Personal information, including location, health details, financial records, contact data, and other identifiers.
- User-generated content such as emails, messages, calendar entries, contacts, gameplay metrics, Apple Music activity, HomeKit data, and audio, video, or photo files.
- Protected resources like Wi-Fi connections, local networks, Bluetooth peripherals, and home automation features.
- Device capabilities, specifically the camera and microphone.
- In a visionOS application running in Full Space, ARKit data, including world tracking, plane estimation, image anchoring, and hand tracking.
- The device’s advertising identifier, which enables app tracking.

The system presents a standard alert allowing users to review every access request your application makes. You must provide the text that explains why your app requires this access, and the system displays your explanation within that alert. Users can also view this description—and modify their consent—in Settings > Privacy.

- **Only request permission when your app genuinely requires access to the data or resource.** Users are naturally skeptical of requests for personal information or device capability access, especially if the need is not immediately apparent. Ideally, defer requesting permission until users engage with an app feature that necessitates the access. For instance, you can use the [Location button](#Location-button) to allow users to share their location after they express interest in the relevant feature.
- **Do not request permission upon launch unless the data or resource is essential for your app's core functionality.** Users are less likely to object to a launch-time request when the necessity is obvious. For example, users understand that a navigation application requires location access before it can provide value. Similarly, for users to play a visionOS game that involves bouncing virtual objects off real-world surfaces, they must first grant the application access to environmental information.
- **Provide copy that clearly explains how your app utilizes the ability, data, or resource being requested.** Your application's copy (known as a *purpose string* or *usage description string*) appears in the standard alert after your app's name and before the buttons allowing users to grant or deny permission. Aim for a brief, complete sentence that is straightforward, specific, and easily understood. Use sentence case, avoid passive voice, and conclude with a period. For developer guidance, consult [Requesting access to protected resources](apple:UIKit/requesting-access-to-protected-resources) and [App Tracking Transparency](apple:AppTrackingTransparency).

||Example purpose string|Notes|
|---|---|---|
|✓|The app records during the night to detect snoring sounds.|An active sentence that clearly describes how and why the app collects the data.|
|✗|Microphone access is needed for a better experience.|A passive sentence that provides a vague, undefined justification.|
|✗|Turn on microphone access.|An imperative sentence that doesn’t provide any justification.|

Here are several examples of the standard system alert:

#### Pre-alert screens, windows, or views
Ideally, the current context should help users understand why you are requesting permission. If additional details are necessary, display a custom screen or window before the system alert appears. The following guidelines apply to custom views presented before system alerts that seek permission to access protected data and resources, including the camera, microphone, location, contacts, calendar, or tracking.

**Include only one button and make it clear that it opens the system alert.** Users may feel manipulated if a custom screen or window contains buttons other than one that launches the alert, as this distracts them from making their choice. Furthermore, using a term like “Allow” to title the custom button is another form of manipulation. If the custom button appears visually or semantically similar to the allow button in the alert, users are more likely to select the alert’s allow option unintentionally. Use a term such as “Continue” or “Next” to title the single button on your custom screen or window, thereby clarifying that its action is to display the system alert. **Don’t include additional actions in your custom screen or window.** For instance, do not provide a way for users to exit the screen or window without viewing the system alert—such as offering an option to close or cancel.

#### Tracking requests
App tracking is a sensitive matter. While it may be appropriate to use a custom screen or window that details the benefits of tracking, if app tracking occurs immediately upon launch, you must present the system-provided alert before collecting any tracking data.

**Never precede the system-provided alert with a custom screen or window that could confuse or mislead people.** Users sometimes tap alerts to dismiss them without reading the content. Any custom messaging screen, window, or view that leverages this behavior to influence a choice will result in rejection during App Store review.

Several custom screen designs are prohibited and will lead to rejection. Examples include offering incentives, displaying a screen or window that resembles a request, showing an image of the alert, or annotating the background screen behind the alert (as shown below). For additional information, consult [App Review Guidelines: 5.1.1 (iv)](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage).
