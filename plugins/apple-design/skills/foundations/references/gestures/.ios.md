# Gestures — full guidelines
All platforms support fundamental gestures like tap, swipe, and drag. Although the specific movements required to perform these basic gestures may vary depending on the platform or input device, users are familiar with the underlying functionality and expect these gestures to be available universally. For a complete list of these gestures, consult [Standard gestures](#Standard-gestures).

### Best practices
- **Provide multiple methods for users to interact with your application.** Users often rely on alternative inputs—such as voice, keyboard, or Switch Control—to interact with their devices. Do not assume that a specific gesture is the only way to accomplish a task. Refer to [Accessibility](accessibility.md) for further guidance.
- **Ensure gestures respond in a manner consistent with user expectations.** Users anticipate that most gestures will function similarly regardless of the current context. For instance, users expect a tap to select or activate an item. Therefore, refrain from using common gestures like tap or swipe for actions unique to your app; conversely, do not invent a custom gesture for standard functions such as scrolling or button activation.
- **Ensure gestures are handled with maximum responsiveness.** Effective gestures improve the direct manipulation experience and offer immediate feedback. While a user is performing an action, provide feedback that allows them to anticipate the outcome and communicates the necessary movement or scope required to finalize the action.
- **Clearly communicate when a gesture is unavailable.** If you fail to clearly explain why a gesture fails, users may mistakenly believe the app has frozen or that they are executing the gesture incorrectly, leading to frustration. For example, if a user attempts to drag an object that is locked, the UI must indicate this lock; similarly, if they attempt to activate a button that is unavailable, its disabled state must be distinctly different from its enabled state.

### Custom gestures
**Implement custom gestures only when they are essential.** Custom gestures function optimally when they are designed for specialized, frequently performed tasks that existing interactions do not cover, such as in a drawing application or game. If you choose to implement a custom gesture, ensure it meets these criteria:

- Discoverable
- Simple to execute
- Distinct from other gestures
- Not the sole method for triggering a critical action within your application or game
- **Ensure custom gestures are intuitive to learn.** Provide opportunities within the app for users to quickly grasp and perform custom gestures, and rigorously test your interactions in realistic usage scenarios. If you find it challenging to describe a gesture using simple visuals and language, it may indicate that users will also struggle to learn and perform it.
- **Employ shortcut gestures to enhance standard gestures, not supersede them.** Although a custom gesture can provide quick access to parts of your application, users still require simple, familiar methods for navigation and action execution, even if it requires an additional tap or two. For instance, in an app that navigates through a view hierarchy, users expect a Back button in the top toolbar to return to the previous view with a single tap. Many apps also offer a shortcut gesture—such as swiping from the screen edge—to accelerate this action while still providing the Back button.
- **Prevent conflicts with gestures that invoke system UI.** different platforms include established gestures for accessing system behaviors, such as edge swiping in watchOS or rolling the hand to access overlays in visionOS. It is crucial to avoid defining custom gestures that might interfere with these interactions, as users rely on these controls for consistent behavior. In specific scenarios within immersive experiences or games, developers can mitigate this by deferring to the system gesture. For more details, consult the platform considerations for iOS, iPadOS, watchOS, and visionOS.

## Platform guidance — iOS & iPadOS
In addition to the [Standard gestures](#Standard-gestures) supported across all platforms, iOS and iPadOS offer several additional gestures that users commonly expect.

|Gesture|Common action|
|---|---|
|Three-finger swipe|Initiate undo (swipe left); initiate redo (swipe right).|
|Three-finger pinch|Copy selected text (pinch inward); paste copied text (pinch outward).|
|Four-finger swipe (iPadOS only)|Switch between applications.|
|Shake|Initiate undo; initiate redo.|

**Consider enabling the simultaneous recognition of multiple gestures if it improves the user experience.** While concurrent gestures are unlikely to be beneficial in non-game applications, a game may feature multiple on-screen controls—such as firing buttons and a joystick—that users operate at the same time. For guidance on integrating touchscreen input with Apple Pencil input within your iPadOS application, refer to [Apple Pencil and Scribble](apple-pencil-and-scribble.md).

### Specifications

#### Standard gestures
The system offers APIs that accommodate the gestures users employ across their devices, regardless of whether they are using a touchscreen, an indirect gesture in visionOS, or dedicated input hardware such as a trackpad, mouse, remote control, or game controller. For developer instructions, refer to [Gestures](apple:SwiftUI/Gestures).

|Gesture|Supported in|Common action|
|---|---|---|
|Tap|iOS, iPadOS, macOS, tvOS, visionOS, watchOS|To activate a control or select an item.|
|Swipe|iOS, iPadOS, macOS, tvOS, visionOS, watchOS|To dismiss views, reveal controls/actions, or scroll.|
|Drag|iOS, iPadOS, macOS, tvOS, visionOS, watchOS|To move a UI component.|
|Touch (or pinch) and hold|iOS, iPadOS, tvOS, visionOS, watchOS|To display extra controls or functionality.|
|Double tap|iOS, iPadOS, macOS, tvOS, visionOS, watchOS|To zoom in; to zoom out if already magnified; or to execute a primary action on Apple Watch Series 9 and Apple Watch Ultra 2.|
|Zoom|iOS, iPadOS, macOS, tvOS, visionOS|To magnify content or zoom a view.|
|Rotate|iOS, iPadOS, macOS, tvOS, visionOS|To change the orientation of a selected object.|

For detailed guidance on supporting additional button presses or gestures specific to certain input devices, consult [Pointing devices](pointing-devices.md), [Remotes](remotes.md), and [Game controls](game-controls.md).
