---
name: nearby-interactions
description: "Nearby interactions enable on-device experiences that incorporate the presence of individuals and objects in the immediate vicinity. Use when designing nearby interactions for watchOS, auditing nearby interactions against Apple's watchOS guidelines, or when the user says things like \"design nearby interactions for Apple Watch\", \"nearby interactions on watchOS\", \"how should nearby interactions work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Nearby interactions
Nearby interactions enable on-device experiences that incorporate the presence of individuals and objects in the immediate vicinity

## When to use
- User asks about **nearby interactions** on watchOS (e.g. `"how do I design nearby interactions for Apple Watch"`).
- User is building an Apple Watch UI that needs nearby interactions and wants to follow Apple's guidelines.
- User asks to audit or review nearby interactions in a watchOS design.
- User mentions nearby interactions in the context of an Apple Watch app, game, or interface.

A successful nearby interaction feels natural and intuitive because it leverages users' inherent understanding of their surroundings. For instance, if a user is playing music on their iPhone, they can seamlessly continue playback on their HomePod mini simply by bringing the devices into close proximity and transferring the audio output.

Nearby interactions require devices that support Ultra Wideband technology (for details, consult [Ultra Wideband availability](https://support.apple.com/en-us/HT212274)) and utilize the [Nearby Interaction](apple:NearbyInteraction) framework. Before engaging in these experiences, users must grant permission for their device to interact while using your application. The Nearby Interaction APIs assist in maintaining user privacy by depending on randomly generated device identifiers that are valid only for the duration of the interaction session initiated by your app.

### Best practices
- **Consider a task from the perspective of the physical world to find inspiration for a nearby interaction.** For instance, while users can easily transfer music using the app's UI on their iPhone to a HomePod mini, initiating this transfer by simply bringing the devices into proximity grounds the task in physical reality. Discovering physical actions that underpin a concept can help you build an engaging experience that feels both effortless and intuitive.
- **Use distance, direction, and context to inform an interaction.** Even if your application gathers data from diverse sources, prioritizing information that is nearby and contextually relevant helps deliver experiences that feel natural. For example, if users wish to share content with a friend in a crowded setting, the iOS share sheet can suggest a probable recipient by leveraging on-device knowledge regarding that person's most recent and frequent contacts. By combining this data with information from nearby devices equipped with the U1 chip, the share sheet can enhance the experience by suggesting the closest contact to the user.
- **Consider how changes in physical distance can guide a nearby interaction.** In the real world, people generally expect an object's perception to become clearer as they approach it. A nearby interaction can mirror this by offering feedback that evolves based on object proximity. For example, when using an iPhone to locate an AirTag, the display shifts from a directional arrow to a pulsing circle as the user draws nearer.
- **Provide continuous feedback.** Continuous feedback reflects the dynamism of the physical world and reinforces the connection between a nearby interaction and the task being executed. For instance, when searching for misplaced items in Find My, users receive ongoing updates regarding the item's direction and proximity. Keep users engaged by offering uninterrupted feedback that responds to their movements.
- **Consider using multiple feedback types to create a holistic experience.** Seamlessly shifting between visual, audible, and haptic feedback helps make the nearby interaction's task feel more immersive and genuine. Utilizing several types of feedback also allows you to vary the experience, coordinating with both the task requirements and the current context. For instance, visual feedback is appropriate when users are interacting with the device screen; however, audible and haptic feedback often prove more effective when users are interacting with their physical environment.
- **Avoid using a nearby interaction as the only way to perform a task.** Since you cannot assume every user will be able to experience a nearby interaction, it is crucial to provide alternative methods for completing tasks within your application.

### Device usage
- **Encourage users to maintain portrait orientation for the device.** Using the device in landscape mode can reduce the reliability and availability of data regarding the distance and relative direction of other devices. If your nearby interaction feature is exclusively designed for portrait mode, it is preferable to provide users with implicit visual cues regarding the optimal device orientation; explicit instructions should be avoided whenever possible.
- **Design your application around the hardware's directional field of view.** Nearby interaction utilizes a dedicated hardware sensor that possesses a specific field of view, comparable to the Ultra Wide camera found in iPhone 11 and subsequent models. If a participating device falls outside of this defined field of view, your application may receive distance data, but relative direction information will not be available.
- **Educate users on how physical obstructions impact the nearby interaction experience.** When intervening objects—such as other individuals, animals, or sufficiently massive items—are positioned between two participating devices, the accuracy or availability of distance and direction information may degrade. It is advisable to include guidance on mitigating this scenario within your onboarding or tutorial materials.

## Platform guidance — watchOS
On Apple Watch, Nearby Interaction APIs supply the distance measurement for a paired device. Additionally, any watchOS application participating in this nearby interaction experience must be running in the foreground.
