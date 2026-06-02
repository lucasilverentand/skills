# Images
To ensure optimal visual quality across all supported devices, familiarize yourself with how the system renders content and how to provide assets at the correct scale factors

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
