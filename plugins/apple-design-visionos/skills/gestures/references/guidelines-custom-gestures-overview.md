# Custom gestures — overview
**Implement custom gestures only when they are essential.** Custom gestures function optimally when they are designed for specialized, frequently performed tasks that existing interactions do not cover, such as in a drawing application or game. If you choose to implement a custom gesture, ensure it meets these criteria:

- Discoverable
- Simple to execute
- Distinct from other gestures
- Not the sole method for triggering a critical action within your application or game
- **Ensure custom gestures are intuitive to learn.** Provide opportunities within the app for users to quickly grasp and perform custom gestures, and rigorously test your interactions in realistic usage scenarios. If you find it challenging to describe a gesture using simple visuals and language, it may indicate that users will also struggle to learn and perform it.
- **Employ shortcut gestures to enhance standard gestures, not supersede them.** Although a custom gesture can provide quick access to parts of your application, users still require simple, familiar methods for navigation and action execution, even if it requires an additional tap or two. For instance, in an app that navigates through a view hierarchy, users expect a Back button in the top toolbar to return to the previous view with a single tap. Many apps also offer a shortcut gesture—such as swiping from the screen edge—to accelerate this action while still providing the Back button.
- **Prevent conflicts with gestures that invoke system UI.** different platforms include established gestures for accessing system behaviors, such as edge swiping in watchOS or rolling the hand to access overlays in visionOS. It is crucial to avoid defining custom gestures that might interfere with these interactions, as users rely on these controls for consistent behavior. In specific scenarios within immersive experiences or games, developers can mitigate this by deferring to the system gesture. For more details, consult the platform considerations for iOS, iPadOS, watchOS, and visionOS.

## Platform guidance — visionOS
visionOS supports two types of gestures: indirect and direct.

Users employ an *indirect* gesture by focusing on a target object with their gaze, and then manipulating that object remotely using hand movements. For instance, a user can look at a button to focus it and select it by quickly bringing their finger and thumb together. Indirect gestures are comfortable for use at any distance, allowing users to quickly shift focus between different objects and select items with minimal physical movement.

A *direct* gesture involves physically touching an interactive element. For example, users can directly type on the visionOS keyboard by tapping the virtual keys. Direct gestures are most effective when the user is within easy reach. Since keeping arms raised for long periods can be tiring, direct gestures are best suited for infrequent use. visionOS also provides direct equivalents for all standard gestures, giving users the option to interact directly or indirectly with any standard component.

The following table lists the standard direct gestures used in visionOS; refer to [Specifications](#Specifications) for a list of all standard indirect gestures.

|Direct gesture|Common use|
|---|---|
|Touch|Select or activate an object directly.|
|Touch and hold|Display a contextual menu.|
|Touch and drag|Relocate an object to a new position.|
|Double touch|Preview an item or file; select a word during editing.|
|Swipe|Display actions and controls; dismiss views; scroll.|
|With two hands, pinch and drag together or apart|Zoom in or out.|
|With two hands, pinch and drag in a circular motion|Rotate an object.|

- **Support standard gestures wherever possible.** For example, as soon as a user focuses on an object in your application or game, tap is the initial gesture they are likely to use for selection or activation. Even if you also implement custom gestures, supporting standard actions like tap helps users quickly become accustomed to your app or game.
- **Offer both indirect and direct interactions when feasible.** Favor indirect gestures for UI elements and common components such as buttons. Reserve direct gestures and custom gestures for objects that require close-range interaction or specific motions within a game or interactive experience.
- **Do not mandate specific body movements or positions for input.** Not everyone can perform certain body movements or maintain particular positions at all times, due to factors like disability, spatial limitations, or environmental conditions. If your experience necessitates movement, consider supporting alternative inputs to allow users to select the interaction method that suits them best.
