# Playing haptics — full guidelines
Beyond inherent haptic capabilities, certain external input devices can also provide tactile feedback. For example:

- In an app or game running on iPadOS, macOS, tvOS, or visionOS, **Game controls** can supply haptic feedback (refer to [Playing Haptics on Game Controllers] for developer guidance).
- When connected to specific iPad models, **Apple Pencil and Scribble** and certain trackpads can offer haptic feedback. (For comprehensive information regarding Apple Pencil features and compatibility, consult [Apple Pencil](https://www.apple.com/apple-pencil/).)

### Best practices
- **Use system-provided haptic patterns according to their documented meanings.** Users recognize standard haptics because the operating system deploys them consistently when interacting with default controls. If a pattern's documented use case does not fit your application or game, do not repurpose it. Instead, utilize a generic pattern or develop a custom one, if supported. For guidance on this process, consult [Custom haptics](#Custom-haptics).
- **Use haptics consistently throughout your app or game.** It is crucial to establish a clear, causal link between each haptic event and the action that triggers it, allowing users to reliably associate specific patterns with particular experiences. If a haptic fails to reinforce this cause-and-effect relationship, it can appear gratuitous or confusing. For instance, if a game uses one pattern for mission failure (a negative outcome), applying that same pattern to level completion (a positive outcome) will cause user confusion.
- **Prefer using haptics to complement other feedback in your app or game.** When visual, auditory, and tactile cues are synchronized—mirroring how physical reality operates—the user experience becomes more natural and cohesive. For example, the intensity and sharpness of a haptic should generally match those of its accompanying animation. You may also synchronize sound with haptics; developer instructions for this are available at [Delivering Rich App Experiences with Haptics](apple:CoreHaptics/delivering-rich-app-experiences-with-haptics).
- **Avoid overusing haptics.** A haptic can feel perfectly timed when used sparingly, but overuse leads to user fatigue. Conducting user testing is recommended to find a balance that most users will appreciate. Often, the most effective haptic experience is one that goes unnoticed until it is disabled.
- **In most apps, prefer playing short haptics that complement discrete events.** While long-running haptics can enhance a gameplay flow, they risk diluting feedback meaning and distracting users in an application environment. For example, on Apple Pencil Pro, continuous or prolonged haptics do not enhance the writing or drawing experience and may even make holding the pencil uncomfortable.
- **Make haptics optional.** Allow users to mute or disable haptic feedback, ensuring they can still enjoy your app or game without them.
- **Be aware that playing haptics might impact other user experiences.** Since haptics generate physical vibrations detectable by users, ensure these vibrations do not interfere with device features such as the camera, gyroscope, or microphone.

### Custom haptics
While games frequently employ custom haptics to enhance gameplay, non-game applications may also utilize them to deliver a richer and more enjoyable user experience.

Custom haptic patterns can be designed to vary dynamically based on context or user input. For instance, the impact felt when a game character jumps from a tree can be significantly stronger than if the jump occurs in place. Furthermore, major events—such as a collision or being struck—can feel distinctly different from subtle occurrences like approaching footsteps or impending danger.

Two fundamental building blocks are available for generating custom haptic patterns:

- *Transient* events are brief and concise, often mimicking taps or impulses. An example of a transient event is tapping the Flashlight button on the Home Screen.
- *Continuous* events simulate sustained vibrations, such as the effect produced by lasers in a message.

Regardless of whether you use a transient or continuous event to generate custom haptics, you maintain control over its *sharpness* and *intensity*. Sharpness can be conceptualized as mapping a haptic experience to the specific waveform that generates the corresponding physical sensation. Specifying sharpness allows you to communicate your intended feel to the system; for example, you might use it to convey a soft, organic sensation or a crisp, mechanical one. As the term suggests, intensity refers to the strength of the haptic feedback.

By combining transient and continuous events, adjusting sharpness and intensity, and optionally including audio content, you can achieve a wide array of haptic experiences. For developer guidance, consult [Core Haptics](apple:CoreHaptics).

## Platform guidance — iOS & iPadOS
On supported iPhone models, you can incorporate haptics into your experience using the following methods:

- Utilize standard UI controls, such as [toggles](toggles.md), [sliders](sliders.md), and [pickers](pickers.md), which natively trigger Apple's system haptics.
- When contextually appropriate, use a feedback generator to play one of several predefined haptic patterns across the [notification](#Notification), [impact](#Impact), and [selection](#Selection) categories (consult [UIFeedbackGenerator](apple:UIKit/UIFeedbackGenerator) for developer guidance).

##### Notification
Haptic feedback delivered via notifications confirms the result of a task or action, such as successfully depositing a check or unlocking a vehicle.

##### Impact
Impact haptics offer a physical analogy that can enhance the visual experience. For instance, users might feel a tap when a view transitions into its final position or a thud upon the collision of two substantial objects.

##### Selection
Selection haptics deliver confirmation as a UI element's value undergoes modification.
