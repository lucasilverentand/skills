# Corner
Corner layouts allow you to display full-color images, text, and gauges within the watch face corners, similar to Infograph displays. Certain templates also support multiple colors for text.

When designing images for a corner complication, adhere to the following dimensions:

|Image|40mm|41mm|44mm|45mm/49mm|
|---|---|---|---|---|
|Circular|32x32 pt (64x64 px @2x)|34x34 pt (68x68 px @2x)|36x36 pt (72x72 px @2x)|38x38 pt (76x76 px @2x )|
|Gauge|20x20 pt (40x40 px @2x)|21x21 pt (42x42 px @2x)|22x22 pt (44x44 px @2x)|24x24 pt (48x48 px @2x)|
|Text|20x20 pt (40x40 px @2x)|21x21 pt (42x42 px @2x)|22x22 pt (44x44 px @2x)|24x24 pt (48x48 px @2x)|

> **Note**
> The system applies a circular mask to every image.

Use the following dimensions when creating placeholder images that contain no content for your corner-family complications:

|38mm|40mm/42mm|41mm|44mm|45mm/49mm|
|---|---|---|---|---|
|–|20x20 pt (40x40 px @2x)|21x21 pt (42x42 px @2x)|22x22 pt (44x44 px @2x)|24x24 pt (48x48 px @2x)|

A SwiftUI view implementing a corner layout uses these default text settings:

- Style: Rounded
- Weight: Semibold
- Text size: 10 pt (40mm), 10.5 pt (41mm), 11 pt (44mm), 12 pt (45mm/49mm)
