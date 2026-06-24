# Remotes — full guidelines

### Best practices
- **Use standard gestures for common actions.** Users expect the remote control to operate conventionally across all applications unless they are actively engaged in a game. Deviating from or repurposing standard remote behaviors can introduce confusion and increase cognitive load for the user. Refer to [Gestures](#Gestures) for detailed guidance.
- **Maintain consistency with the tvOS focus experience.** The [Focus and selection](focus-and-selection.md) system establishes a strong link between the user and the content they are viewing. To reinforce this connection in your application, ensure that you combine gestures with the focus experience using patterns familiar to users, such as always moving focus in the same direction as the executed gesture.
- **Provide explicit feedback regarding what actions occur when users perform gestures in your app.** For instance, if a user lightly rests their thumb on the remote, visual feedback should indicate where they can swipe down to reveal an information area.
- **Introduce new gestures only when it enhances the specific context of your app.** Custom gestures are acceptable within gameplay, for example. In most other scenarios, users anticipate using standard gestures and may not appreciate having to learn or recall novel ones.
- **Distinguish between a press and a tap, and prevent responses to accidental taps.** A press signifies an intentional action and is suitable for selecting a button, confirming input, or initiating actions during gameplay. Tap gestures are appropriate for navigation or displaying supplementary information, but developers should be mindful that accidental taps can occur when a user rests their thumb on the remote, picks it up, moves it around, or passes it to someone else; therefore, avoiding tap responses during live video playback is often advisable.
- **Consider leveraging the location of a tap to assist with navigation or gameplay.** The remote supports differentiation between up, down, left, and right tap gestures on the touch surface. Only respond to these positional taps if it aligns with your app's context and if the behavior is both intuitive and easily discoverable.
- **In nearly all situations, open the parent screen when the Back button is pressed.** At the highest level of an app or game, the parent is the Apple TV Home Screen; within an application, the parent is defined by the app's hierarchy and may not necessarily be the immediately preceding screen. The primary exception to this standard is during active gameplay, where repeated presses of the Back button could inadvertently interrupt the experience. To prevent this disruption, respond to the Back button by opening an in-game pause menu that allows users to select a different interaction path back to the game's main menu. Once this in-game pause menu is displayed, a Back button press should close the menu and resume the game. Note that pressing and holding the Back button navigates to the Home Screen from any location. See [Buttons](#Buttons) for more information.
- **Respond accurately to the Play/Pause button during media playback.** When music or video is playing, users expect that pressing the Play/Pause button will control the playback (play, pause, or resume).

### Gestures
The clickpad's touch surface registers both swipes and presses.

- **Swipe.** Swiping enables users to seamlessly scroll through numerous items; the motion begins quickly and gradually slows down, depending on the swipe's intensity. When swiping up or down along the remote's boundary, users can rapidly traverse items.
- **Press.** Users press to engage a control or select an item. Additionally, pressing before swiping activates scrubbing mode.

### Buttons
Ensure your application or game provides the following responses for specific inputs:

|Button or area|Expected behavior in an app|Expected behavior in a game|
|---|---|---|
|Touch surface (swipe)|Facilitates navigation or changes the selected focus.|Acts as a directional input device.|
|Touch surface (press)|Activates an item or control. Allows deeper navigation into the content.|Executes the primary action command.|
|Back|Returns to the preceding screen. Exits to the Apple TV Home Screen.|Pauses or resumes gameplay. Returns to the previous screen, exits to the main game menu, or quits back to the Apple TV Home Screen.|
|Play/Pause|Initiates media playback. Pauses or resumes media playback.|Performs a secondary function. Skips the introductory video.|

### Compatible remotes
Some remotes compatible with Apple TV include controls for browsing live television or other channel-based material. For instance, a remote might feature a button to launch an electronic program guide (EPG) and additional controls for navigating the guide or changing channels. For guidance on implementation, refer to [Providing Channel Navigation](apple:TVServices/providing-channel-navigation); for design guidance, consult **EPG experience**.

- **If your live-viewing application provides an EPG, respond to the remote’s EPG browsing buttons in a manner users anticipate.** When a user presses a "guide" or "browse" button, your EPG must appear. While the EPG is being viewed, users expect to move through it using "page up" or "page down." You must avoid responding to these buttons in any other way while the EPG is being browsed. Furthermore, on Siri and compatible remotes, users can browse the EPG by tapping the upper or lower areas of the Touch surface. If your application does not support an EPG experience, the system routes these button presses to the default guide application on the viewer's device.
- **While your content is playing, respond to a compatible remote’s “page up” or “page down” button by changing the channel.** Users expect these buttons to function differently depending on whether they are viewing content or browsing an EPG.
