# Cognitive
When you minimize complexity in your app or game, all people benefit.

- **Keep actions simple and intuitive.** Ensure that users can navigate your interface using interactions that are consistent and easy to recall. Prioritize system gestures and behaviors that users already understand over implementing custom gestures which require the user to learn and remember new actions.
- **Minimize use of time-boxed interface elements.** Views or controls that automatically dismiss after a set timer can pose difficulties for users who require more time to process information, or those utilizing assistive technologies that need extended traversal time. Instead, allow views to dismiss only through an explicit user action.
- **Consider offering difficulty accommodations in games.** Since everyone approaches and enjoys games differently, consider incorporating options to customize the game's difficulty to support different cognitive abilities. This could include allowing users to lower the requirements for completing a level, adjusting reaction time, or enabling control assistance.
- **Let people control audio and video playback.** Do not autoplay any audio or video content without also providing controls to initiate and halt playback. Ensure these controls are easily discoverable and actionable, and consider global settings that allow users to opt out of automatic playback for all audio and video. For developer guidance, refer to [Animated images](apple:Accessibility/animated-images) and [isVideoAutoplayEnabled](apple:UIKit/UIAccessibility/isVideoAutoplayEnabled).
- **Allow people to opt out of flashing lights in video playback.** Users may wish to avoid bright, rapid flashes within the media they consume. The Dim Flashing Lights setting enables the system to detect, mitigate, and inform users about flashing lights present in media. If your application supports video playback, it must respond appropriately to the Dim Flashing Lights setting. For developer guidance, see [Flashing lights](apple:MediaAccessibility/flashing-lights).
- **Be cautious with fast-moving and blinking animations.** Excessive use of these effects can be distracting, induce dizziness, or potentially trigger epileptic episodes. Individuals susceptible to these reactions can activate the Reduce Motion accessibility setting. When this setting is active, your app or game must respond by minimizing automatic and repetitive animations, including scaling, zooming, and peripheral movement. Other recommended practices for motion reduction include:
- Tightening animation springs to lessen bounce effects
- Tracking animations directly with user gestures
- Avoiding animating depth changes in z-axis layers
- Replacing transitions across x-, y-, and z-axes with fades to minimize motion
- Avoiding animating into or out of blur effects

**Optimize your app’s UI for Assistive Access.** Assistive Access is an iOS and iPadOS feature that provides users with cognitive disabilities a simplified version of your application. This mode establishes a default layout and control presentation designed to reduce cognitive load, similar to the Camera app's layout.

To optimize your application for this mode, follow these guidelines when Assistive Access is enabled:

- Identify the app's core functionality and consider removing nonessential workflows and UI components.
- Segment multi-step workflows so users can focus on a single interaction per screen.
- Always require double confirmation before performing any action that is difficult to undo, such as deleting a file.

For developer guidance, see [Assistive Access](apple:Accessibility/assistive-access).
