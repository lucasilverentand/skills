# Physical controllers
- **Ensure support for the platform's default interaction method.** While a game controller is an optional accessory, every iPhone and iPad features a touchscreen, Macs offer keyboard/trackpad or mouse input, Apple TV has a remote, and Apple Vision Pro responds to eye and hand gestures. If your application supports game controllers, you must ensure a fallback mechanism exists for using the platform's native input methods. For detailed developer guidance, consult [Adding virtual controls to games that support game controllers in iOS](apple:GameController/adding-virtual-controls-to-games-that-support-game-controllers-in-ios).
- **Inform users about game controller prerequisites.** In tvOS and visionOS, it is permissible to require the use of a physical game controller. The App Store provides a "Game Controller Required" badge to assist users in identifying such applications. Keep in mind that users may launch your game at any time, even without a connected controller. If your app mandates a game controller, you must verify its presence and gracefully guide users through connecting one. For developer guidance, see [GCRequiresControllerUserInteraction](apple:BundleResources/Information-Property-List/GCRequiresControllerUserInteraction).
- **Automatically detect controller pairing status.** Instead of requiring players to manually configure a physical game controller, you can automatically determine if a controller is paired and retrieve its profile. For developer documentation, refer to [Game Controller](apple:GameController).
- **Tailor onscreen content to the connected game controller.** To streamline your game's codebase, the Game Controller framework assigns standardized names to controller components based on their physical placement; however, the colors and symbols displayed on an actual game controller may vary. Always use the connected controller’s specific labeling scheme when referencing controls or displaying related information in your interface. For developer guidance, see [GCControllerElement](apple:GameController/GCControllerElement).
- **Map controller inputs to expected UI actions.** Outside of active gameplay, players anticipate navigating your game's interface using conventions familiar to the platform they are on. When not controlling gameplay, adhere to these established conventions across all Apple platforms:

|Button|Expected behavior for UI|
|---|---|
|A|Activates a control|
|B|Cancels an action or returns to previous screen|
|X|—|
|Y|—|
|Left shoulder|Navigates left to a different screen or section|
|Right shoulder|Navigates right to a different screen or section|
|Left trigger|—|
|Right trigger|—|
|Left/right thumbstick|Moves selection|
|Directional pad|Moves selection|
|Home/logo|Reserved for system controls|
|Menu|Opens game settings or pauses gameplay|

- **Support multiple connected controllers.** If several controllers are linked, use labels and glyphs that correspond to the controller currently being used by the player. If your game supports multiplayer, use appropriate labels and symbols when referencing a specific player’s controller. If you must refer to controls on multiple controllers, consider listing them collectively.
- **Prefer symbols over text when referring to game controller elements.** The Game Controller framework provides access to [SF Symbols](sf-symbols.md) for most elements, including the buttons found on different game controller brands. Utilizing symbols instead of textual descriptions is particularly beneficial for players unfamiliar with controllers, as it removes the need to search for a specific button label during gameplay.
