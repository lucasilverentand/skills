# Anatomy
Widgets are available across many dimensions, scaling from small accessory widgets used across iPhone, iPad, and Apple Watch to system family widgets that include an extra-large option on iPad, Mac, and Apple Vision Pro. Furthermore, widgets must adjust their visual presentation to match the specific context of display and accommodate user device customizations. When designing widgets, you must account for these elements:

- The supported widget sizes
- The context—the devices and system experiences—in which the widget may be displayed
- The rendering modes and color schemes applied to the widget based on its size and context

The WidgetKit framework supplies default appearances and treatments for every widget dimension to align with the system or device environment. Nevertheless, it is crucial to consider developing a custom widget design that delivers the optimal user experience for your content within each specific context.

#### System family widgets
System family widgets are available in a wide range of sizes and may incorporate one or more interactive components.

The following table outlines the supported deployment contexts for each system family widget dimension:

|Widget size|iPhone|iPad|Mac|Apple Vision Pro|
|---|---|---|---|---|
|System small|Home Screen, Today View, StandBy, and CarPlay|Home Screen, Today View, and Lock Screen|Desktop and Notification Center|Horizontal and vertical surfaces|
|System medium|Home Screen and Today View|Home Screen and Today View|Desktop and Notification Center|Horizontal and vertical surfaces|
|System large|Home Screen and Today View|Home Screen and Today View|Desktop and Notification Center|Horizontal and vertical surfaces|
|System extra large|Not supported|Home Screen and Today View|Desktop and Notification Center|Horizontal and vertical surfaces|
|System extra large portrait|Not supported|Not supported|Not supported|Horizontal and vertical surfaces|

#### Accessory widgets
Accessory widgets are constrained in the amount of information they can display due to their physical dimensions.

They appear on the following devices:

|Widget size|iPhone|iPad|Apple Watch|
|---|---|---|---|
|Accessory circular|Lock Screen|Lock Screen|Watch complications and in the Smart Stack|
|Accessory corner|Not supported|Not supported|Watch complications|
|Accessory inline|Lock Screen|Lock Screen|Watch complications|
|Accessory rectangular|Lock Screen|Lock Screen|Watch complications and in the Smart Stack|

#### Appearances
A widget can display in full color, monochrome with a tint, or in a clear, translucent style. Depending on the context—including location, device, and user customization—the system may apply a tinted or clear appearance to the widget itself and its contained full-color imagery, symbols, and glyphs.

For instance, a small system widget renders differently based on the device and location:

- On iPhone and iPad Home Screens, users select from different appearances for widgets: light, dark, clear, or tinted. In the light and dark appearances, widgets utilize a full-color design. For a clear appearance, the system desaturates the widget and introduces translucency, highlights, and the Liquid Glass material. In a tinted appearance, the system desaturates the widget and its content, then applies the user's chosen tint color.
- On Apple Vision Pro, the widget appears as a 3D object contained within a frame. It adopts a full-color appearance with a glass or paper-like coating that reacts to ambient lighting. Additionally, users can select a tinted appearance that applies a color from predefined system palettes.
- On the iPad Lock Screen, the widget adopts a monochromatic appearance without any tint color.
- On iPhone in StandBy mode on the Lock Screen, the widget scales up and removes its background. When ambient light drops below a specific threshold, the system renders the widget with a monochromatic red tint.

Similarly, a rectangular accessory widget behaves as follows:

- On the iPhone and iPad Lock Screens, it displays in a monochromatic appearance without a tint color.
- On Apple Watch, the widget can appear as a watch complication in both full-color and tinted modes, or it may appear within the Smart Stack.

Each appearance described above incorporates a [Rendering modes](#Rendering-modes) that is determined by the platform and the user's appearance settings:

- The system utilizes the [fullColor](apple:WidgetKit/WidgetRenderingMode/fullColor) rendering mode for system family widgets across all platforms to display the widget in its full-color state. This does not alter the color of your views.
- The system uses the [accented](apple:WidgetKit/WidgetRenderingMode/accented) rendering mode for system family widgets across all platforms and for accessory widgets on Apple Watch. In accented mode, the background is removed and replaced with either a tinted color effect for a tinted appearance or a Liquid Glass background for a clear appearance. Furthermore, it divides the widget’s views into an accent group and a primary group, applying a solid color to each group.
- The system uses the [vibrant](apple:WidgetKit/WidgetRenderingMode/vibrant) rendering mode for widgets on the iPhone and iPad Lock Screens, and on iPhone in StandBy during low-light conditions. This mode desaturates text, images, and gauges while creating a vibrant effect by coloring the content appropriately for the Lock Screen background or a macOS desktop. Note that users can customize the Lock Screen with a tint color, and the system applies a red tint for widgets displayed on iPhone in StandBy during low-light conditions.

The following table details the usage of each rendering mode per platform:

|Platform|Full-color|Accented|Vibrant|
|---|---|---|---|
|iPhone|Home Screen, Today view, StandBy and CarPlay (with the background removed)|Home Screen and Today view|Lock Screen, StandBy in low-light conditions|
|iPad|Home Screen and Today view|Home Screen and Today view|Lock Screen|
|Apple Watch|Smart Stack, complications|Smart Stack, complications|Not supported|
|Mac|Desktop and Notification Center|Not supported|Desktop|
|Apple Vision Pro|Horizontal and vertical surfaces|Horizontal and vertical surfaces|Not supported|

For additional design guidance, refer to [Rendering modes](#Rendering-modes). For developer instructions, consult [Preparing widgets for additional platforms, contexts, and appearances](apple:WidgetKit/Preparing-widgets-for-additional-contexts-and-appearances) and [WidgetRenderingMode](apple:WidgetKit/WidgetRenderingMode).
