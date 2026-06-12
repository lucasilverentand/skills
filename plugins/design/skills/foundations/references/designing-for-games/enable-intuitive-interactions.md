# Enable intuitive interactions
**Support each platform’s default interaction method.** For instance, mobile games are typically played using touch on iPhone; Mac players usually expect keyboard, mouse, or trackpad support; and visionOS games require users to interact using eye tracking and hands through indirect and direct gestures. As you ensure your game supports each platform's native interaction method, pay close attention to control sizing and menu behavior, especially when transitioning from a pointer-based environment to a touch-based one.

|Platform|Default interaction methods|Additional interaction methods|
|---|---|---|
|iOS|Touch|Game controller|
|iPadOS|Touch|Game controller, keyboard, mouse, trackpad, Apple Pencil|
|macOS|Keyboard, mouse, trackpad|Game controller|
|tvOS|Remote|Game controller, keyboard, mouse, trackpad|
|visionOS|Touch|Game controller, keyboard, mouse, trackpad, spatial game controller|
|watchOS|Touch|–|

- **Support physical game controllers, while also giving people alternatives.** All platforms except watchOS support dedicated game controllers. While a controller simplifies porting controls from an existing title and managing complex mappings, remember that not all players utilize physical controllers. To maximize accessibility for your game, also provide alternative ways to interact with it. Refer to **Physical controllers** for guidance.
- **Offer touch-based game controls that embrace the touchscreen experience on iPhone and iPad.** In iOS and iPadOS, your game can allow players to interact directly with in-game elements or control the action using virtual controls overlaid on your game content. For design advice, consult **Touch controls**.
