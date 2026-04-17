---
name: sliders
description: "A slider consists of a horizontal track and a control, known as the thumb, which users manipulate to select a value between defined minimum and maximum points. Use when designing sliders for macOS, auditing sliders against Apple's macOS guidelines, or when the user says things like \"design sliders for Mac\", \"sliders on macOS\", \"how should sliders work on Mac\"."
allowed-tools: Read Grep Glob
---

# Sliders
A slider consists of a horizontal track and a control, known as the thumb, which users manipulate to select a value between defined minimum and maximum points

## When to use
- User asks about **sliders** on macOS (e.g. `"how do I design sliders for Mac"`).
- User is building a Mac UI that needs sliders and wants to follow Apple's guidelines.
- User asks to audit or review sliders in a macOS design.
- User mentions sliders in the context of a Mac app, game, or interface.

As the slider's value is modified, the segment of the track between the minimum setting and the thumb becomes colored. Additionally, a slider may optionally include left and right icons to visually represent these minimum and maximum values.

### Best practices
- **Customize a slider’s appearance only when it enhances the user experience.** You have the option to modify different aspects of a slider—such as its track color, thumb image and tint, and associated left/right icons—to ensure visual harmony with your application and clearly convey its function. For instance, if the slider controls image dimensions, you might display a small image icon on the minimum side and a large image icon on the maximum side.
- **Maintain conventional slider orientation.** Users expect that sliders adhere to standard conventions across all applications: minimum values should reside on the leading side and maximum values on the trailing side for horizontal sliders, while vertical sliders place minimum values at the bottom and maximum values at the top. For example, a horizontal slider representing a percentage should conventionally range from 0 percent on the leading side to 100 percent on the trailing side.
- **Consider pairing a slider with a text field and stepper.** This is particularly important when the slider manages an extensive range of values. Providing a text field allows users to view the precise current value and input specific inputs, while adding a stepper offers a simple method for incrementing by whole units. For further guidance, refer to [Text fields](text-fields.md) and [Steppers](steppers.md).

## Platform guidance — macOS
Sliders in macOS can incorporate tick marks, which aids users in precisely identifying a value within the range.

In a linear slider, whether tick marks are included or not, the thumb is a narrow lozenge. The portion of the track between the minimum value and the thumb displays color fill. Linear sliders often include supplementary icons that clarify the meaning of the minimum and maximum values.

For a circular slider, the thumb is represented by a small circle. If present, tick marks appear as equally spaced dots around the slider's circumference.

- **Provide immediate feedback while a slider value is being adjusted.** Live feedback displays results to users as they occur. For instance, when adjusting the Size slider in Dock settings, your Dock icons scale dynamically.
- **Select a slider style appropriate to user expectations.** A horizontal slider is best suited for transitions between defined start and end points. For example, a graphics application might use a horizontal slider to set an object's opacity between 0 and 100 percent. Circular sliders should be used when values are cyclical or unbounded. For example, a graphics application might use a circular slider to adjust an object's rotation between 0 and 360 degrees. An animation application might use a circular slider to control how many times an object spins during animation—four complete rotations equate to four spins, or 1440 degrees of rotation.
- **Use a label to introduce the slider.** Labels generally follow [sentence-style capitalization](https://help.apple.com/applestyleguide/#/apsgb744e4a3?sub=apdca93e113f1d64) and conclude with a colon. Refer to [Labels](labels.md) for guidance.
- **Employ tick marks to enhance clarity and accuracy.** Tick marks assist users in understanding the scale of measurements and locating specific values.
- **Consider adding labels to tick marks for even greater clarity.** Labels can be numerical or textual, depending on the slider's values. Labeling every tick mark is unnecessary unless required to prevent confusion; often, labeling only the minimum and maximum values suffices. When slider values are nonlinear, such as in the Energy Saver settings pane, periodic labels provide necessary context. Additionally, providing a [tooltip](offering-help.md#macOS-visionOS) that displays the thumb's value when a pointer hovers over it is advisable.
