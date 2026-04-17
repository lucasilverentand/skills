---
name: camera-control
description: "The Camera Control grants immediate access to your application's camera functionality. Use when designing camera control for visionOS, auditing camera control against Apple's visionOS guidelines, or when the user says things like \"design camera control for Apple Vision Pro\", \"camera control on visionOS\", \"how should camera control work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Camera Control
The Camera Control grants immediate access to your application's camera functionality

## When to use
- User asks about **camera control** on visionOS (e.g. `"how do I design camera control for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs camera control and wants to follow Apple's guidelines.
- User asks to audit or review camera control in a visionOS design.
- User mentions camera control in the context of an Apple Vision Pro app, game, or interface.

On iPhone 16 and iPhone 16 Pro models, the Camera Control rapidly launches your app's camera interface, enabling users to capture events instantaneously. When a user lightly presses the Camera Control, the system presents an overlay extending from the device bezel.

This overlay enables users to rapidly modify different controls. Users can view all available controls by lightly double-pressing the Camera Control. Once a control is selected, sliding a finger across the Camera Control allows them to adjust values and capture their desired content.

### Anatomy
The Camera Control provides two types of controls for modifying values or selecting options:

- A *slider* allows users to select from a continuous range of values, such as determining the level of contrast applied to the content.
- A *picker* presents specific, discrete options, such as enabling or disabling a grid in the viewfinder.

In addition to custom controls you develop, the system includes a set of standard controls that can optionally be integrated into the overlay to allow users to adjust camera zoom and exposure.

### Best practices
- **Use SF Symbols to represent control functionality.** Since the system does not support custom symbols, select an SF Symbol that clearly conveys the control's function. iOS provides thousands of available symbols for representing controls within your app's overlay. Note that these symbols indicate the control itself, not its current state. Refer to the Camera & Photos section in the [SF Symbols app](https://developer.apple.com/sf-symbols/) to view available options.
- **Keep names of controls short.** Control labels must accommodate Dynamic Type sizes, and overly lengthy names risk obscuring the camera's viewfinder.
- **Include units or symbols with slider control values to provide context.** Displaying descriptive information in the overlay—such as EV, %, or a custom string—helps users understand what the slider controls. For developer guidance on this feature, consult [localizedValueFormat](apple:AVFoundation/AVCaptureSlider/localizedValueFormat). **Define prominent values for a slider control.** Prominent values are those chosen most often by users or those that represent even intervals, such as major zoom factor increments. When a user adjusts a slider control via the Camera Control, the system makes it easier for them to select these predefined prominent values. For developer guidance, see [prominentValues](apple:AVFoundation/AVCaptureSlider/prominentValues-199dz).
- **Make space for the overlay in the viewfinder.** The overlay and control labels occupy screen real estate adjacent to the Camera Control, regardless of whether the device is in portrait or landscape orientation. To prevent overlapping with your camera capture experience's interface elements, position your UI outside of these overlay areas. Maximize the viewfinder's height and width, allowing the overlay to appear over it or disappear entirely.
- **Minimize distractions in the viewfinder.** When capturing video or a photo, users prefer a large preview image with minimal visual clutter. Avoid duplicating controls (like toggles and sliders) between your UI and the overlay when the system displays the overlay. **Enable or disable controls depending on the camera mode.** For instance, video controls should be disabled when taking a photograph. While the overlay supports multiple controls, you cannot add or remove them during runtime.
- **Consider how to arrange your controls.** Place frequently used controls toward the center for easy access, and position less common controls on either side. When a user lightly taps the Camera Control to reopen the overlay, the system remembers the last control they interacted with in your application.
- **Allow people to use the Camera Control to launch your experience from anywhere.** Implement a locked camera capture extension that enables users to configure the Camera Control to launch your app's camera experience from a locked device, the Home Screen, or while using other applications. For instructions, see [Camera experiences on a locked device](controls.md#Camera-experiences-on-a-locked-device).
