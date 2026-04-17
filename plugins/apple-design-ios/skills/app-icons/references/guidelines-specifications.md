# Specifications
App icon dimensions, layout, style, and visual presentation differ depending on the operating system.

|Platform|Layout shape|Icon shape after system masking|Layout size|Style|Appearances|
|---|---|---|---|---|---|
|iOS, iPadOS, macOS|Square|Rounded rectangle (square)|1024x1024 px|Layered|Default, dark, clear light, clear dark, tinted light, tinted dark|
|tvOS|Rectangle (landscape)|Rounded rectangle (rectangular)|800x480 px|Layered (Parallax)|N/A|
|visionOS|Square|Circular|1024x1024 px|Layered (3D)|N/A|
|watchOS|Square|Circular|1088x1088 px|Layered|N/A|

The system automatically scales your icon to produce smaller variants that appear in certain locations, such as Settings and notifications.

App icons support the following color spaces:

- sRGB (color)
- Gray Gamma 2.2 (grayscale)
- Display P3 (wide-gamut color in iOS, iPadOS, macOS, tvOS, and watchOS only)
