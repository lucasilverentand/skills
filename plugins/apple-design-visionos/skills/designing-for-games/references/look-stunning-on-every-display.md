# Look stunning on every display
**Ensure text is always legible.** If game text is difficult to read, players may struggle to follow the narrative, grasp critical instructions or information, and remain engaged in the experience. To maintain comfortable legibility across all devices, ensure text contrasts adequately with the background and utilizes at least the minimum recommended font size for each platform. For detailed guidance, refer to [Typography](typography.md); developer instructions can be found at [Adapting your game interface for smaller screens](apple:Metal/adapting-your-game-interface-for-smaller-screens).

|Platform|Default text size|Minimum text size|
|---|---|---|
|iOS, iPadOS|17 pt|11 pt|
|macOS|13 pt|10 pt|
|tvOS|29 pt|23 pt|
|visionOS|17 pt|12 pt|
|watchOS|16 pt|12 pt|

**Ensure buttons are always easy to use.** Buttons that are either too small or placed too closely together can frustrate players and detract from the enjoyment of gameplay. Each platform specifies a minimum recommended button size based on its default interaction method. For instance, buttons on iOS must be at least 44x44 pt to properly accommodate touch input. Refer to [Buttons](buttons.md) for further guidance.

|Platform|Default button size|Minimum button size|
|---|---|---|
|iOS, iPadOS|44x44 pt|28x28 pt|
|macOS|28x28 pt|20x20 pt|
|tvOS|66x66 pt|56x56 pt|
|visionOS|60x60 pt|28x28 pt|
|watchOS|44x44 pt|28x28 pt|

- **Prefer resolution-independent textures and graphics.** If creating assets that are independent of resolution is not feasible, match your game's rendering resolution to the device's native resolution. In visionOS, vector-based art is preferred as it maintains visual quality when the system dynamically scales it for users viewing from varying distances and angles. See [Images](images.md) for guidance.
- **Integrate device features into your layout.** A device's physical characteristics, such as rounded corners or a camera housing, can influence parts of your interface. To ensure your game appears native to each device, accommodate these features during layout, utilizing platform-provided safe areas whenever possible (developer guidance is available at [Positioning content relative to the safe area](apple:UIKit/positioning-content-relative-to-the-safe-area)). For layout guidance, see [Layout](layout.md); templates including safe-area guides are available at [Apple Design Resources](https://developer.apple.com/design/resources/).
- **Ensure in-game menus adapt to different aspect ratios.** Games must render correctly and function properly across different aspect ratios, including 16:10, 19.5:9, and 4:3. Specifically, in-game menus must remain legible and fully usable on every device—and if supported, in both orientations on iPhone and iPad—without covering other content. To help guarantee your in-game menus render accurately, consider using dynamic layouts that rely on relative constraints to adjust to different contexts. Avoid fixed layouts whenever possible, and only create a custom, device-specific layout when absolutely necessary. See [In-game menus](menus.md#In-game-menus) for guidance.
- **Design for the full-screen experience.** Players often prefer playing a game in an immersive, distraction-free full-screen environment. On macOS, iOS, and iPadOS, full-screen mode allows users to hide other applications and parts of the system UI; in visionOS, a game running in Full Space can completely surround the user, providing deep immersion. See [Going full screen](going-full-screen.md) for details.
