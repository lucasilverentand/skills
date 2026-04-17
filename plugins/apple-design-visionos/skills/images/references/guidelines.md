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

## Platform guidance — visionOS
visionOS enables users to view images at a much wider range of sizes than in other platforms, with the system dynamically adjusting the image resolution to match its current display size. Since images can be positioned at specific angles within a user's environment, image pixels may not align perfectly 1:1 with screen pixels.

- **Create a layered app icon.** App icons in visionOS consist of two or three layers that create an appearance of depth by moving at slightly different rates when the icon is focused. Refer to [Layer design](app-icons.md#Layer-design) for implementation guidance.
- **Prefer vector-based art for 2D images.** Bitmap content should be avoided because it may render poorly when the system scales it up. If you utilize Core Animation layers, consult [Drawing sharp layer-based content in visionOS](apple:visionOS/drawing-sharp-layer-based-content) for developer instructions.
- **If you need to use rasterized images, balance quality with performance as you choose a resolution.** While an @2x image appears acceptable at typical viewing distances, its fixed resolution prevents dynamic scaling by the system and may appear unclear up close. To ensure a rasterized image maintains sharpness across varied viewing distances, you can employ a higher resolution; however, each increase in resolution contributes to a larger file size and may affect your app’s runtime performance, particularly for resolutions exceeding @6x. If you use images with resolutions higher than @2x, ensure that high-quality image filtering is also applied to help maintain the balance between quality and performance (see [filters](apple:QuartzCore/CALayer/filters) for developer guidance).

##### Spatial photos and spatial scenes
In addition to 2D and stereoscopic imagery, visionOS applications and games can utilize RealityKit to display spatial photos and spatial scenes. A *spatial photo* is a stereoscopic photograph enhanced with additional spatial metadata, captured using iPhone 15 Pro or later, Apple Vision Pro, or compatible hardware. A *spatial scene* is a 3D image derived from a 2D source, adding a parallax effect that reacts to head movement. For detailed developer instructions, refer to [ImagePresentationComponent](apple:RealityKit/ImagePresentationComponent).

- **Ensure that spatial photos are rendered accurately within your application.** To display a spatial photo in your app, use the stereo High-Efficiency Image Codec (HEIC) format. When spatial metadata is applied to a stereo HEIC, visionOS identifies the photo as spatial and incorporates visual treatments that help mitigate common sources of discomfort associated with stereo viewing.
- **Prefer the feathered glass background effect when displaying text over spatial photos.** If your app or game requires placing text on top of a spatial photo, utilize the feathered glass background effect. This effect enhances contrast for improved text readability and blurs details to reduce visual strain when viewing content over spatial photos. For guidance, see [GlassBackgroundEffect](apple:SwiftUI/GlassBackgroundEffect).
- **Consider visual comfort when creating spatial photos from existing 2D content.** When modifying a photo's spatial metadata for your app or game, consider the intended viewing experience. Metadata adjustments, such as disparity changes, can affect how users perceive the 3D environment and may induce visual discomfort depending on viewing angle. For guidance, see [Creating spatial photos and videos with spatial metadata](apple:ImageIO/Creating-spatial-photos-and-videos-with-spatial-metadata).
- **Display spatial photos and spatial scenes in standalone views.** Avoid presenting spatial photos integrated with other content, as this can lead to visual discomfort. Instead, present these images or scenes in a dedicated view, such as a sheet or window. If inline display of stereoscopic images is unavoidable, provide ample spacing between the image and any accompanying content to assist users in adjusting to depth changes.
- **Use spatial scenes for specific, impactful moments within your app.** Since generating a spatial scene from an existing image may require several seconds, design experiences accounting for this generation time. For example, the Photos app includes a dedicated action to create a spatial scene while viewing a single photo. Avoid presenting numerous spatial scenes simultaneously; instead, use scroll views, pagination, or explicit actions to transition between photos and maintain a clear visual information hierarchy.
- **When displaying immersively, favor minimal UI.** For instance, the Spatial Gallery app presents a single piece of content with a brief caption and one Back button, relying on swipe gestures for navigation.
- **Prefer displaying larger spatial scenes centered within the viewer's field of view.** Viewers may move their heads laterally to observe the parallax effect in a spatial scene. Smaller scenes offer less parallax and may not be as impactful for the viewer.
