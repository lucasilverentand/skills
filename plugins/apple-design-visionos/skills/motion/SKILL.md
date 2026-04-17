---
name: motion
description: "Dynamic, fluid animations bring your interface to life. They are essential for conveying status, providing user feedback and instructions, and elevating the visual quality of your application or game. Use when designing motion for visionOS, auditing motion against Apple's visionOS guidelines, or when the user says things like \"design motion for Apple Vision Pro\", \"motion on visionOS\", \"how should motion work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Motion
Dynamic, fluid animations bring your interface to life. They are essential for conveying status, providing user feedback and instructions, and elevating the visual quality of your application or game

## When to use
- User asks about **motion** on visionOS (e.g. `"how do I design motion for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs motion and wants to follow Apple's guidelines.
- User asks to audit or review motion in a visionOS design.
- User mentions motion in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Introduce motion with intent, allowing it to enhance the experience without becoming overwhelming** — Do not add movement simply for aesthetic effect
- **Ensure motion is optional** — As not every user wishes to experience the movement within your application or game, it is critical that motion is never the…
- **Ensure feedback motion realistically matches user gestures and expectations** — In non-game applications, accurate and lifelike movement aids comprehension of functionality; conversely, confusing feedback motion can cause user disorientation
- **Prioritize brevity and accuracy in feedback animations** — When animated responses are concise and precise, they feel unobtrusive and lightweight, often conveying information more efficiently than highly prominent animation
- **Generally refrain from adding motion to frequently used UI interactions within apps** — The system already includes subtle animations for standard interface elements
- **Allow users to interrupt motion** — Whenever feasible, do not require users to wait for an animation sequence to finish before they can perform another action, particularly if…
- **Evaluate the use of animated symbols when appropriate** — If you are utilizing SF Symbols 5 or later, you have the option to animate either SF Symbols or custom symbols
- **Ensure your game's motion presents high quality by default across all supported platforms** — A consistent frame rate between 30 and 60 fps generally provides a visually appealing and smooth experience in most titles
- **Allow players to tailor the visual experience of your game for performance or battery optimization** — For instance, consider enabling a switch between power modes when the system detects an external power source is connected
- **Whenever possible, keep motion away from the edges of a user’s field of view** — Individuals can be highly sensitive to movement occurring in their periphery
- **Assist users in maintaining comfort when displaying large virtual object movements** — If an object is sizable enough to occupy much of the [Field of view](spatial-layout.md#Field-of-view) and blocks most or all of [Immersion and…
- **Utilize fades when you need to transition an object between locations** — When an object shifts from one position to another, users naturally track this movement

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
