# Working with system overlays in visionOS
In visionOS 2 and later versions, users can utilize gestures on a hand's palm to quickly access system overlays for Home and Control Center. These interactions are available across the entire system and are exclusively designated for accessing these system overlays.

> **Note**
> The default method for invoking Control Center in visionOS 2 and later is via the system overlay. The behavior from visionOS 1 (looking upward) remains available as an accessibility option.

When developing applications and games that employ custom gestures or anchor content to a user's hands, it is crucial to account for the system overlays.

- **Dedicate the area around a person’s hand to system overlays and their associated gestures.** If feasible, avoid anchoring content to the hands or wrists. Should you be developing a game featuring hand-anchored elements, position them outside the immediate vicinity of the user's hand to prevent collision with the Home indicator.
- **Consider delaying the system overlay behavior when designing an immersive application or game.** In specific scenarios, you may wish to prevent the Home indicator from appearing when a user views their own palm. For instance, a game utilizing virtual hands or gloves might want to maintain the user's presence within the narrative world, even if they view their hands from different angles. In such instances, when your app runs in a Full Space, you have the option to require a tap before revealing the Home indicator. For developer guidance, consult [persistentSystemOverlays(_:)](apple:SwiftUI/View/persistentSystemOverlays(_:)).

> **Note**
> Apps and games built for visionOS 1 defer the system overlay behavior by default. When a user views their palm with your app running in a Full Space, the Home indicator will not appear unless they tap first.

**Exercise caution when designing custom gestures that involve a rolling motion of the hand, wrist, and forearm.** This particular movement is reserved for triggering system overlays. Because system overlays are always displayed above app content, and your application has no awareness of their visibility, it is vital to thoroughly test any custom gestures or content that might conflict.
