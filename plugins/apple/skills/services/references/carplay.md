# CarPlay — full guidelines
CarPlay is specifically engineered for drivers to use while operating a vehicle. Keep this usage context in mind when designing your CarPlay app, ensuring features allow users to complete tasks rapidly and with minimal required interaction.

To build your CarPlay app's interface, you must utilize the system-defined templates appropriate for your application type (e.g., audio, communication, navigation, or fueling). Your app supplies the content, and iOS renders it within CarPlay. Since the system manages UI components and handles vehicle interaction, you are not required to adjust your layout for varying screen resolutions or manage input from diverse hardware types such as touchscreens, knobs, or pads.

To understand how to develop different kinds of CarPlay apps and utilize the system-provided templates, consult [CarPlay App Programming Guide](https://developer.apple.com/carplay/documentation/CarPlay-App-Programming-Guide.pdf). The general design guidelines presented below apply universally to all CarPlay apps.

### iPhone interactions
CarPlay displays compatible applications from the connected iPhone on the vehicle's integrated screen, presenting simplified interfaces optimized for driving use.

- **Eliminate app interactions on iPhone when CarPlay is active.** All user interaction with your application must occur through the vehicle's controls and display. If setup on the iPhone is necessary, it must be completed before the vehicle moves.
- **Never lock people out of CarPlay because the connected iPhone requires input.** Your application must remain functional even if the iPhone is inaccessible—for instance, if it is placed in a bag or trunk while driving. If users need to resolve an issue on the connected iPhone, they must do so after the vehicle has stopped.
- **Make sure your app works without requiring people to unlock iPhone.** Since most users utilize CarPlay while their iPhone is locked, ensure that the features you provide in your CarPlay app operate as expected under this condition.

#### Audio
In CarPlay, your application shares the audio environment with other sources, such as the vehicle's built-in radio or navigation prompts. Regardless of whether audio is central to your app’s experience, you must understand how users expect audio behavior to function in this shared environment.

- **Allow users to initiate playback.** Generally, avoid beginning audio automatically unless your app is dedicated to a single audio source or is resuming previously paused content. Additionally, refrain from starting an audio session until you are ready to play sound, as initiating a session silences competing sources like the car’s radio.
- **Begin playback once audio is adequately buffered.** After a user makes a selection, it may take several seconds for sound to start due to network or buffering conditions. The system will keep the selection highlighted and display a spinning activity indicator until your app signals that the audio is ready.
- **Present the Now Playing screen upon playback readiness.** Do not delay playback while waiting for descriptive information to finish loading. If necessary, continue fetching this data in the background and display it once it becomes available.
- **Only resume audio playback after an interruption if it is appropriate.** For example, your app can restart audio following a temporary interruption like a phone call. Permanent interruptions, such as a music playlist started via Siri, are nonresumable. When a resumable interruption occurs, your app must restore playback when the interruption ends if audio was actively playing when it began.
- **Automatically adjust audio levels only when required, but never modify the master volume.** Although your app can manage relative, independent volume levels to achieve a balanced mix of audio, users must retain control over the final output volume.

### Layout
CarPlay accommodates different display resolutions, each with unique pixel densities and aspect ratios. The system automatically scales app icons and interfaces relative to the display resolution, ensuring they maintain a consistent visual size on screen. A few common screen sizes are detailed in the table below.

|Dimensions (pixels)|Aspect ratio|
|---|---|
|800x480|5:3|
|960x540|16:9|
|1280x720|16:9|
|1920x720|8:3|

- **Present valuable, high-impact information using a clear layout that is easily viewable from the driver's perspective.** Avoid cluttering the display with nonessential details or excessive visual ornamentation.
- **Maintain a consistent aesthetic across your entire application.** Generally, elements performing similar functions should share a uniform appearance.
- **Ensure that core content is prominent and immediately actionable.** Larger elements convey greater importance than smaller ones and are simpler for users to interact with. Generally, position the most critical content and controls in the upper half of the screen.

### Color
Color contributes to indicating interactivity, lending vitality, and maintaining visual consistency.

- **Generally, utilize a restricted color palette that complements your application's logo.** A subtle deployment of color is an excellent method for conveying brand identity.
- **Do not use identical colors for interactive and noninteractive components.** If these elements share the same color, users may struggle to determine which parts are tappable.
- **Validate your application's color scheme across different lighting scenarios within a physical vehicle.** Lighting conditions fluctuate greatly depending on the time of day, weather, window tinting, and other factors. Colors viewed on a computer screen during the design phase may not appear identically when the app is used in reality. Consider how color luminance might influence the driving experience at night, and how low-contrast hues can diminish in bright sunlight. If necessary, modify the scheme to ensure optimal viewing across most usage contexts.
- **Guarantee your application presents well in both dark and light modes.** CarPlay supports both light and dark themes, and it may automatically transition between appearances based on ambient lighting.
- **Select colors that facilitate clear communication for all users.** Individuals perceive and interpret colors differently. For guidance on color usage that promotes accessibility, consult **Inclusive color**.

### Icons and images
CarPlay accommodates both portrait and landscape orientations, along with @2x (lower resolution) and @3x (higher resolution) scale factors.

- **Provide high-resolution images with @2x and @3x scale factors for all CarPlay artwork within your application.** The system handles the automatic display and scaling of the appropriate images based on the car's screen resolution and dimensions.
- **Ensure your design mirrors your iPhone app icon.** A thoughtfully designed app icon functions effectively in both CarPlay and on the iPhone without requiring a separate visual identity.
- **Avoid using black as your icon's background.** To prevent the icon from blending into the display backdrop, either lighten a black background or incorporate a border.

Create your CarPlay app icon using the following dimensions:

|@2x (pixels)|@3x (pixels)|
|---|---|
|120x120|180x180|

### Error handling
**Address errors within CarPlay, not on the paired iPhone.** Should you need to alert users to an issue, ensure that notification is presented clearly within the CarPlay environment. Do not instruct drivers to pick up their iPhone to view or resolve an error.
