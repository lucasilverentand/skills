---
name: motion
description: "Dynamic, fluid animations bring your interface to life. They are essential for conveying status, providing user feedback and instructions, and elevating the visual quality of your application or game. Use when designing motion for watchOS, auditing motion against Apple's watchOS guidelines, or when the user says things like \"design motion for Apple Watch\", \"motion on watchOS\", \"how should motion work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Motion
Dynamic, fluid animations bring your interface to life. They are essential for conveying status, providing user feedback and instructions, and elevating the visual quality of your application or game

## When to use
- User asks about **motion** on watchOS (e.g. `"how do I design motion for Apple Watch"`).
- User is building an Apple Watch UI that needs motion and wants to follow Apple's guidelines.
- User asks to audit or review motion in a watchOS design.
- User mentions motion in the context of an Apple Watch app, game, or interface.

Many system components already include motion, allowing you to maintain a consistent and familiar experience throughout your product. Furthermore, system components may adjust their motion based on factors such as accessibility configurations or varied input methods. For example, the movement of [Liquid Glass](materials.md#Liquid-Glass) responds with greater emphasis to direct touch input, reinforcing a tactile sensation, while producing a more subtle effect when interacted with via trackpad.

When designing custom motion, please follow the guidelines provided below.

### Best practices
- **Introduce motion with intent, allowing it to enhance the experience without becoming overwhelming.** Do not add movement simply for aesthetic effect. Unnecessary or excessive animation can distract users and potentially lead to feelings of disconnection or physical unease.
- **Ensure motion is optional.** As not every user wishes to experience the movement within your application or game, it is critical that motion is never the exclusive means of communicating important information. To accommodate all users and enhance their experience, supplement visual feedback by also utilizing alternatives like [haptics](playing-haptics.md) and [audio](playing-audio.md).

### Providing feedback
- **Ensure feedback motion realistically matches user gestures and expectations.** In non-game applications, accurate and lifelike movement aids comprehension of functionality; conversely, confusing feedback motion can cause user disorientation. For instance, if a view is revealed by sliding it down from the top, users do not anticipate dismissing that same view by sliding it sideways.
- **Prioritize brevity and accuracy in feedback animations.** When animated responses are concise and precise, they feel unobtrusive and lightweight, often conveying information more efficiently than highly prominent animation. For example, a game's succinct animation tied to a successful action allows players to instantly grasp the message without losing focus on gameplay. Similarly, in visionOS, tapping a panorama in Photos causes it to smoothly and quickly expand into the viewing space, allowing users to track the transition without delay.
- **Generally refrain from adding motion to frequently used UI interactions within apps.** The system already includes subtle animations for standard interface elements. For custom components, you should generally prevent users from needing to dedicate extra attention to superfluous motion during repeated interactions.
- **Allow users to interrupt motion.** Whenever feasible, do not require users to wait for an animation sequence to finish before they can perform another action, particularly if the animation might need to be experienced more than once.
- **Evaluate the use of animated symbols when appropriate.** If you are utilizing SF Symbols 5 or later, you have the option to animate either SF Symbols or custom symbols. Refer to [Animations](sf-symbols.md#Animations) for detailed guidance.

### Leveraging platform capabilities
- **Ensure your game's motion presents high quality by default across all supported platforms.** A consistent frame rate between 30 and 60 fps generally provides a visually appealing and smooth experience in most titles. For every platform you support, leverage the device's graphics hardware to establish default settings that allow users to enjoy your game immediately without needing configuration changes.
- **Allow players to tailor the visual experience of your game for performance or battery optimization.** For instance, consider enabling a switch between power modes when the system detects an external power source is connected.

## Platform guidance — watchOS
SwiftUI offers a robust and efficient method for introducing motion into your application. If you require WatchKit to animate changes in layout or appearance, or if you are generating animated image sequences, consult [WKInterfaceImage](apple:WatchKit/WKInterfaceImage#1652345).

> **Note**
> All animations based on layout or appearance automatically incorporate integrated easing that activates during the beginning and conclusion of the animation. It is not possible to disable or modify this easing behavior.
