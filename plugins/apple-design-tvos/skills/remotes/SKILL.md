---
name: remotes
description: "The Siri Remote functions as the principal input method for Apple TV, enabling users to remain connected to on-screen content regardless of their viewing distance. Use when designing remotes for tvOS, auditing remotes against Apple's tvOS guidelines, or when the user says things like \"design remotes for Apple TV\", \"remotes on tvOS\", \"how should remotes work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Remotes
The Siri Remote functions as the principal input method for Apple TV, enabling users to remain connected to on-screen content regardless of their viewing distance

## When to use
- User asks about **remotes** on tvOS (e.g. `"how do I design remotes for Apple TV"`).
- User is building an Apple TV UI that needs remotes and wants to follow Apple's guidelines.
- User asks to audit or review remotes in a tvOS design.
- User mentions remotes in the context of an Apple TV app, game, or interface.

## Quick principles
- **Use standard gestures for common actions** — Users expect the remote control to operate conventionally across all applications unless they are actively engaged in a game
- **Maintain consistency with the tvOS focus experience** — The [Focus and selection](focus-and-selection.md) system establishes a strong link between the user and the content they are viewing
- **Provide explicit feedback regarding what actions occur when users perform gestures in your app** — For instance, if a user lightly rests their thumb on the remote, visual feedback should indicate where they can swipe down to…
- **Introduce new gestures only when it enhances the specific context of your app** — Custom gestures are acceptable within gameplay, for example
- **Distinguish between a press and a tap, and prevent responses to accidental taps** — A press signifies an intentional action and is suitable for selecting a button, confirming input, or initiating actions during gameplay
- **Consider leveraging the location of a tap to assist with navigation or gameplay** — The remote supports differentiation between up, down, left, and right tap gestures on the touch surface
- **In nearly all situations, open the parent screen when the Back button is pressed** — At the highest level of an app or game, the parent is the Apple TV Home Screen; within an application, the parent…
- **Respond accurately to the Play/Pause button during media playback** — When music or video is playing, users expect that pressing the Play/Pause button will control the playback (play, pause, or resume)
- **Swipe** — Swiping enables users to seamlessly scroll through numerous items; the motion begins quickly and gradually slows down, depending on the swipe's intensity
- **Press** — Users press to engage a control or select an item
- **If your live-viewing application provides an EPG, respond to the remote’s EPG browsing buttons in a manner users anticipate** — When a user presses a "guide" or "browse" button, your EPG must appear
- **While your content is playing, respond to a compatible remote’s “page up” or “page down” button by changing the channel** — Users expect these buttons to function differently depending on whether they are viewing content or browsing an EPG

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
