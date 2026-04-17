---
name: image-views
description: "An image view presents either a static image or an animated sequence against a background that may be transparent or opaque. Use when designing image views for tvOS, auditing image views against Apple's tvOS guidelines, or when the user says things like \"design image views for Apple TV\", \"image views on tvOS\", \"how should image views work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Image views
An image view presents either a static image or an animated sequence against a background that may be transparent or opaque

## When to use
- User asks about **image views** on tvOS (e.g. `"how do I design image views for Apple TV"`).
- User is building an Apple TV UI that needs image views and wants to follow Apple's guidelines.
- User asks to audit or review image views in a tvOS design.
- User mentions image views in the context of an Apple TV app, game, or interface.

Within this view, the image can be manipulated via stretching, scaling, fitting to size constraints, or pinning it to a defined location. Image views are generally not interactive elements.

### Best practices
- **Employ an image view when its sole function is to render a picture.** Should you need the image to be interactive in uncommon scenarios, configure a system-supplied [button](buttons.md) to display the image rather than applying button functionalities directly to an image view.
- **When presenting an icon within your application, consider utilizing a symbol or interface icon rather than an image view.** [SF Symbols](sf-symbols.md) offers a vast collection of streamlined, vector graphics that can be rendered with diverse colors and opacities. An [icon](icons.md) (also referred to as a glyph or template image) is usually a bitmap image where the nontransparent pixels are capable of accepting color. Both symbols and interface icons support the accent colors selected by the user.

### Content
An image view supports rich visual data in multiple formats, including PNG, JPEG, and PDF. For additional guidance, consult [Images](images.md).

- **Be cautious when placing text over images.** Combining text with an image can negatively affect both the picture's sharpness and the readability of the characters. To enhance outcomes, ensure strong contrast between the text and the image, and consider methods to make the text element prominent, such as applying a drop shadow or background layer.
- **Maintain uniform sizing for all images within an animated sequence.** If you pre-size the images to match the view, the system avoids scaling operations. When scaling is necessary, performance tends to be optimal if all images share identical dimensions and shapes.

## Platform guidance — tvOS
Many tvOS visuals achieve a sense of depth by merging multiple layers using transparency. Consult [Layered images](images.md#Layered-images) for detailed guidance.
