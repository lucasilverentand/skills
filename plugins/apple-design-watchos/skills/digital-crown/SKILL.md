---
name: digital-crown
description: "The Digital Crown functions as a crucial hardware input mechanism for Apple Vision Pro and Apple Watch. Use when designing digital crown for watchOS, auditing digital crown against Apple's watchOS guidelines, or when the user says things like \"design digital crown for Apple Watch\", \"digital crown on watchOS\", \"how should digital crown work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Digital Crown
The Digital Crown functions as a crucial hardware input mechanism for Apple Vision Pro and Apple Watch

## When to use
- User asks about **digital crown** on watchOS (e.g. `"how do I design digital crown for Apple Watch"`).
- User is building an Apple Watch UI that needs digital crown and wants to follow Apple's guidelines.
- User asks to audit or review digital crown in a watchOS design.
- User mentions digital crown in the context of an Apple Watch app, game, or interface.

On both the Apple Vision Pro and Apple Watch, users can employ the Digital Crown to interact with the operating system; additionally, on Apple Watch, it enables interaction within specific applications.

### Apple Vision Pro
On Apple Vision Pro, users utilize the Digital Crown for the following actions:

- Modifying audio levels.
- Controlling the level of immersion within a portal, an Environment, or any application/game running in Full Space (refer to [Immersive experiences](immersive-experiences.md) for guidance).
- Repositioning content to bring it into the user's direct view.
- Accessing Accessibility configurations.
- Closing an application and returning to the Home View.

### Apple Watch
When users rotate the Digital Crown, it generates data that can enhance or facilitate interactions within your application, such as scrolling or operating standard or custom controls.

Starting with watchOS 10, the Digital Crown assumes a primary role in navigation. On the watch face, users rotate the Digital Crown to browse widgets within the Smart Stack, and on the Home Screen, they use it for vertical movement through their application collection. Inside apps, users turn the Digital Crown to switch between vertically paginated tabs and to scroll through list views or variable height pages.

Beyond navigation, rotating the Digital Crown produces information you can leverage to enhance or facilitate interactions in your app, such as inspecting data or operating standard or custom controls.

> **Note**
> Apps are unresponsive to presses on the Digital Crown because watchOS reserves these inputs for system functionality, such as revealing the Home Screen.

Most Apple Watch models provide haptic feedback for the Digital Crown, offering users a more tactile experience while scrolling through content. By default, the system provides linear haptic *detents*—or taps—as users rotate the Digital Crown a specific distance. Certain system controls, like table views, provide detents as new items scroll into view.

- **Anchor your app’s navigation to the Digital Crown.** Beginning with watchOS 10, turning the Digital Crown is the primary method for users to navigate within and between applications. List, tab, and scroll views should be vertically oriented, enabling users to use the Digital Crown to easily move between your app’s critical interface elements. When basing interactions on the Digital Crown, ensure they are also backed up by corresponding touch screen inputs.
- **Consider using the Digital Crown to inspect data in contexts where navigation is not required.** In scenarios where the Digital Crown does not need to navigate lists or switch pages, it serves as an excellent tool for inspecting data within your application. For instance, in World Clock, turning the Digital Crown advances the time of day at a selected location, allowing users to compare different times against their current local time.
- **Provide visual feedback in response to Digital Crown interactions.** For example, pickers update the currently displayed value as users rotate the Digital Crown. If you are tracking turns directly, use this data to programmatically update your interface. Without visual feedback, users may assume that turning the Digital Crown has no effect in your app.
- **Update your interface to match the speed with which users turn the Digital Crown.** Users expect turning the Digital Crown to provide precise control over an interface, so it is beneficial to match your update speed to the rotation speed. Avoid updating content at a rate that makes it difficult for users to select values.
- **Use the default haptic feedback when appropriate in your app.** If haptic feedback does not suit the context of your application—for example, if the default detents conflict with your app’s animation—disable the detents. You can also modify the haptic feedback behavior for tables, allowing them to use linear detents instead of row-based ones. For example, if your table contains rows of significantly varying heights, linear detents may provide a more consistent experience for users.
