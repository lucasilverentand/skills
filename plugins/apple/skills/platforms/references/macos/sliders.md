# Sliders
A slider consists of a horizontal track and a control, known as the thumb, which users manipulate to select a value between defined minimum and maximum points

## Platform guidance — macOS
Sliders in macOS can incorporate tick marks, which aids users in precisely identifying a value within the range.

In a linear slider, whether tick marks are included or not, the thumb is a narrow lozenge. The portion of the track between the minimum value and the thumb displays color fill. Linear sliders often include supplementary icons that clarify the meaning of the minimum and maximum values.

For a circular slider, the thumb is represented by a small circle. If present, tick marks appear as equally spaced dots around the slider's circumference.

- **Provide immediate feedback while a slider value is being adjusted.** Live feedback displays results to users as they occur. For instance, when adjusting the Size slider in Dock settings, your Dock icons scale dynamically.
- **Select a slider style appropriate to user expectations.** A horizontal slider is best suited for transitions between defined start and end points. For example, a graphics application might use a horizontal slider to set an object's opacity between 0 and 100 percent. Circular sliders should be used when values are cyclical or unbounded. For example, a graphics application might use a circular slider to adjust an object's rotation between 0 and 360 degrees. An animation application might use a circular slider to control how many times an object spins during animation—four complete rotations equate to four spins, or 1440 degrees of rotation.
- **Use a label to introduce the slider.** Labels generally follow [sentence-style capitalization](https://help.apple.com/applestyleguide/#/apsgb744e4a3?sub=apdca93e113f1d64) and conclude with a colon. Refer to [Labels](labels.md) for guidance.
- **Employ tick marks to enhance clarity and accuracy.** Tick marks assist users in understanding the scale of measurements and locating specific values.
- **Consider adding labels to tick marks for even greater clarity.** Labels can be numerical or textual, depending on the slider's values. Labeling every tick mark is unnecessary unless required to prevent confusion; often, labeling only the minimum and maximum values suffices. When slider values are nonlinear, such as in the Energy Saver settings pane, periodic labels provide necessary context. Additionally, providing a **tooltip** that displays the thumb's value when a pointer hovers over it is advisable.
