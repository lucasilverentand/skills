---
name: images
description: "To ensure optimal visual quality across all supported devices, familiarize yourself with how the system renders content and how to provide assets at the correct scale factors. Use when designing images for watchOS, auditing images against Apple's watchOS guidelines, or when the user says things like \"design images for Apple Watch\", \"images on watchOS\", \"how should images work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Images
To ensure optimal visual quality across all supported devices, familiarize yourself with how the system renders content and how to provide assets at the correct scale factors

## When to use
- User asks about **images** on watchOS (e.g. `"how do I design images for Apple Watch"`).
- User is building an Apple Watch UI that needs images and wants to follow Apple's guidelines.
- User asks to audit or review images in a watchOS design.
- User mentions images in the context of an Apple Watch app, game, or interface.

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

## Platform guidance — watchOS
- **Generally, omit transparency to minimize image file size.** If the image is always composited onto a uniform solid background, it is more efficient to include that background within the image itself. Nevertheless, transparency remains required for complication images, menu icons, and other template interface icons because the operating system relies on it to determine color application areas.
- **Employ autoscaling PDFs to utilize a single asset across all screen dimensions.** Design your image targeting the 40mm and 42mm screens at 2x resolution. Upon loading the PDF, WatchKit automatically adjusts the image scale according to the device's screen size, utilizing the following values:

|Screen size|Image scale|
|---|---|
|38mm|90%|
|40mm|100%|
|41mm|106%|
|42mm|100%|
|44mm|110%|
|45mm|119%|
|49mm|119%|
