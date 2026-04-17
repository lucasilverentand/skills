# Images — full guidelines

### Resolution
Different devices render visuals at varying resolutions. For instance, a 2D device displays images based on its screen's specific resolution.

A *point* serves as an abstract measurement unit, ensuring visual consistency regardless of display method. On 2D platforms, a point translates to a specific number of pixels dependent on the display resolution; conversely, in visionOS, a point represents an angular value that allows visual content to scale based on the viewer's distance.

When creating bitmap images, you define a *scale factor* that dictates the image's resolution. You can conceptualize this scale factor by considering the pixel density per point across many 2D display resolutions. For example, a scale factor of 1 (also known as @1x) signifies a 1:1 pixel density, meaning one pixel equals one point. High-resolution 2D displays possess greater pixel densities, such as 2:1 or 3:1. A density of 2:1 (labeled @2x) corresponds to a scale factor of 2, while a 3:1 density (labeled @3x) uses a scale factor of 3. Due to these higher pixel densities, high-resolution displays require images with a greater number of pixels.

**Provide high-resolution assets for all bitmap images in your app, for every device you support.** As you incorporate each image into your project’s asset catalog, identify its scale factor by appending “@1x,” “@2x,” or “@3x” to its filename. Use the following values as a guide; for additional scale factors, refer to [Layout](layout.md).

|Platform|Scale factors|
|---|---|
|iPadOS, watchOS|@2x|
|iOS|@2x and @3x|
|visionOS|@2x or higher (see [visionOS](#visionOS))|
|macOS, tvOS|@1x and @2x|

**In general, design images at the lowest resolution and scale them up to generate high-resolution assets.** When utilizing resizable vectorized shapes, you may wish to place control points at integer values to ensure clean alignment at 1x. This placement allows the points to maintain crisp alignment with the raster grid even at higher resolutions, since 2x and 3x are multiples of 1x.

### Formats
|Image type|Format|
|---|---|
|Bitmap or raster content|De-interlaced PNG files|
|PNG graphics not requiring full 24-bit color|An 8-bit color palette|
|Photographs|JPEG files, optimized as needed, or HEIC files|
|Stereo or spatial imagery|Stereo HEIC|
|Flat icons, interface elements, and other flat artwork needing high-resolution scaling|PDF or SVG files|

### Best practices
- **Include a color profile with each image.** These profiles guarantee that your application's colors render as intended across diverse displays. For detailed instructions, consult [Color management](color.md#Color-management).
- **Always test images on a range of actual devices.** An image that appears flawless during the design phase may display as pixelated, stretched, or compressed when viewed on different hardware.

## Platform guidance — tvOS
Layered imagery forms the core of the Apple TV user experience. The system combines layered images, transparency, scaling, and motion to generate a sense of realism and vitality, fostering a personal connection as users interact with the onscreen content.

##### Parallax effect
Parallax is a subtle visual effect employed by the system to convey dynamism and depth when an element gains focus. As an element achieves focus, the system brings it forward into the foreground, applying gentle movement and illumination to make its surface appear vibrant. Following a period of inactivity, the unfocused content dims while the focused element expands.

To support this parallax effect, layered images are required.

##### Layered images
A *layered image* comprises two to five distinct layers combined into a single visual output. The use of transparency and the separation between these layers creates a sense of depth. When a user interacts with an image, layers nearer the surface elevate and scale, overlapping deeper layers and producing a three-dimensional effect.

> **Important**
> Your tvOS [tvOS](app-icons.md#tvOS) must utilize a layered image. For other focusable images within your application, including [Top Shelf](top-shelf.md) visuals, layered images are highly recommended but not mandatory.

Layered images can be included within your app or retrieved from a content server during runtime. For instructions on integrating layered images into your application, consult the [Parallax Previewer User Guide](https://help.apple.com/itc/parallaxpreviewer/).

> **Developer note**
> If your application fetches layered images from a content server at runtime, you must supply runtime layered images (`.lcr`). These can be generated from LSR or Photoshop files using the `layerutil` command-line tool provided by Xcode. Runtime layered images are intended for download—do not embed them in your application bundle.

- **Use standard interface elements to display layered images.** When you employ standard views and system-provided focus APIs—such as [FocusState](apple:SwiftUI/FocusState)—layered images will automatically receive the parallax treatment when brought into focus.
- **Identify logical foreground, middle, and background elements.** Foreground layers should display primary content, such as a game character or text on an album cover or movie poster. Middle layers are suitable for secondary content and effects like shadows. Background layers serve as opaque backdrops that showcase the foreground and middle layers without dominating them.
- **Generally, keep text in the foreground.** Unless you intend to obscure it, place text in the foreground layer for optimal legibility.
- **Keep the background layer opaque.** While using varying levels of opacity to allow higher layers to show through is acceptable, your background layer must remain opaque—an error will occur if it is not. An opaque background layer guarantees your artwork displays correctly with parallax, drop shadows, and system backgrounds.
- **Keep layering simple and subtle.** Parallax is intended to be nearly imperceptible. Overly complex 3D effects can appear unrealistic and jarring. Maintain simple depth to bring your content to life and enhance the user experience.
- **Leave a safe zone around the foreground layers of your image.** When focused, content on certain layers may be cropped as the layered image scales and moves. To ensure essential information remains visible at all times, keep it within a safe zone. Refer to [App icons](app-icons.md) for guidance.
- **Always preview layered images.** To ensure your layered images render correctly on Apple TV, preview them throughout the design process using Xcode, the Parallax Previewer app for macOS, or the Parallax Exporter plug-in for Adobe Photoshop. Pay close attention to scaling and clipping, and adjust your images as necessary to keep important content safe. Once your layered images are finalized, preview them on an actual TV for the most accurate representation of what users will see. To download Parallax Previewer and Parallax Exporter, visit [Resources](https://developer.apple.com/design/resources/#parallax-previewer).
