# Mobility
Ensure your interface provides a comfortable experience for individuals with limited dexterity or mobility.

**Provide adequately sized controls.** Controls that are too small present difficulty for many users to interact with or select. You must strive to meet the recommended minimum control size for each platform, ensuring that controls and menus are comfortable for all users when tapping or clicking.

|Platform|Default control size|Minimum control size|
|---|---|---|
|iOS, iPadOS|44x44 pt|28x28 pt|
|macOS|28x28 pt|20x20 pt|
|tvOS|66x66 pt|56x56 pt|
|visionOS|60x60 pt|28x28 pt|
|watchOS|44x44 pt|28x28 pt|

- **Consider the spacing between controls as crucial as their size.** Include sufficient padding between elements to minimize the possibility of users activating the incorrect control. Generally, adding approximately 12 points of padding around elements that include a bezel works well. For elements without a bezel, about 24 points of padding around the visible edges is effective. **Support simple gestures for common interactions.** Complex gestures can be challenging for many users, regardless of disability status. For actions that are frequently performed within your app or game, utilize the simplest possible gesture—avoid custom multi-finger and multi-hand gestures—making repetitive actions comfortable, easy to execute, and memorable.
- **Offer alternatives to gestures.** Ensure that the core functionality of your UI is achievable through more than one type of physical interaction. Since gestures can be difficult for users with limited dexterity, provide on-screen methods to achieve the same result. For instance, if a swipe gesture is used to dismiss a view, also include a button so users can tap it or utilize an assistive device.
- **Allow Voice Control to guide and accept information verbally.** With Voice Control, users can interact with their devices entirely through spoken commands. They gain the ability to perform gestures, engage with screen elements, dictate text, and edit content. To guarantee a smooth experience, label all interface components appropriately. For developer guidance, consult [Voice Control](apple:Accessibility/voice-control).
- **Integrate with Siri and Shortcuts to enable voice-only task completion.** When your app supports Siri and Shortcuts, users can automate important and routine tasks they perform regularly. They can initiate these tasks using Siri, the Action button on their iPhone or Apple Watch, or shortcuts located on their Home Screen or in Control Center. For guidance, see [Siri](siri.md).
- **Support mobility-related assistive technologies.** Features such as [VoiceOver](voiceover.md), AssistiveTouch, Full Keyboard Access, Pointer Control, and [Switch Control](apple:Accessibility/switch-control) provide alternative ways for users with low mobility to interact with their devices. Conduct testing and verify that your app or game supports these technologies, ensuring interface elements are correctly labeled to provide an optimal experience. For further details, see [Performing accessibility testing for your app](apple:Accessibility/performing-accessibility-testing-for-your-app).
