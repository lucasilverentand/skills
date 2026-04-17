# Materials — full guidelines
Apple platforms utilize two types of materials: Liquid Glass and standard materials. [Liquid Glass](#Liquid-Glass) is a dynamic material designed to unify the design language across Apple platforms, enabling controls and navigation presentation without covering underlying content. Conversely, [Standard materials](#Standard-materials) assist in achieving visual differentiation within the content layer.

### Liquid Glass
Liquid Glass creates a distinct functional layer for controls and navigation elements—such as tab bars and sidebars—that overlays the content layer, establishing a clear visual hierarchy between functional components and content. Liquid Glass allows content to scroll beneath these elements, providing a sense of dynamism and depth while maintaining legibility for controls and navigation.

- **Do not apply Liquid Glass to the content layer.** Liquid Glass functions optimally when it clearly separates interactive elements from content; including it in the content layer can introduce unnecessary complexity and a confusing visual hierarchy. Instead, use [Standard materials](#Standard-materials) for content layer elements like app backgrounds. An exception applies to controls within the content layer that include a transient interactive element, such as **Sliders** and **Toggles**; in these instances, the element adopts a Liquid Glass appearance to emphasize its activity upon user interaction.
- **Use Liquid Glass effects judiciously.** Standard system framework components automatically adopt the appearance and behavior of this material. If you apply Liquid Glass effects to a custom control, do so sparingly. Since Liquid Glass draws attention to the underlying content, overuse across multiple custom controls can detract from the user experience by distracting from that content. Limit these effects to your app's most critical functional elements. For implementation guidance, refer to [Applying Liquid Glass to custom views](apple:SwiftUI/Applying-Liquid-Glass-to-custom-views).
- **Only use clear Liquid Glass for components layered over visually rich backgrounds.** Liquid Glass offers two variants—[regular](apple:SwiftUI/Glass/regular) and [clear](apple:SwiftUI/Glass/clear)—which you select when building custom components or styling system components. The appearance of these variants may vary based on certain system settings, such as the user's preferred Liquid Glass look in display settings or accessibility options that adjust transparency or contrast.

The *regular* variant blurs and adjusts the luminosity of background content to ensure legibility for text and foreground elements. Scroll edge effects further improve readability by blurring and reducing the opacity of background content. Most system components utilize this variant. Use the regular variant when background content may cause legibility issues, or when components contain substantial text, such as alerts, sidebars, or popovers.

The *clear* variant is highly translucent, making it ideal for prioritizing the visibility of underlying content and allowing visually rich backgrounds to remain prominent. Use this variant for components floating above media backgrounds—like photos and videos—to achieve a more immersive content experience.

To ensure optimal contrast and legibility, determine whether to add a dimming layer behind components using clear Liquid Glass:

- If the underlying content is bright, consider adding a dark dimming layer with 35% opacity. For developer guidance, see [clear](apple:SwiftUI/Glass/clear).
- If the underlying content is sufficiently dark, or if you are using standard media playback controls from AVKit that include their own dimming layer, a separate dimming layer is unnecessary.

For guidance regarding color usage, consult **Liquid Glass color**.

### Standard materials
Use standard materials and visual effects—such as [UIBlurEffect](apple:UIKit/UIBlurEffect), [UIVibrancyEffect](apple:UIKit/UIVibrancyEffect), and [NSVisualEffectView.BlendingMode](apple:AppKit/NSVisualEffectView/BlendingMode-swift.enum)—to establish structure for content situated beneath Liquid Glass.

- **Select materials and effects based on their semantic meaning and intended application.** Do not choose a material or effect based on the apparent color it imparts to your interface, as system settings can alter its appearance and behavior. Instead, align the material or vibrancy style with your specific use case.
- **Ensure readability by applying vibrant colors over materials.** When utilizing system-defined vibrant colors, you do not need to concern yourself with whether the color appears too dark, bright, saturated, or low contrast across different contexts. Regardless of the material selected, apply vibrant colors on top of it. For guidance, refer to **System colors**. **When selecting a material to pair with blur and vibrancy effects, consider contrast and visual separation.** For instance:
- More opaque materials (thicker) can offer superior contrast for text and other elements requiring fine detail.
- More translucent materials (thinner) can aid users in maintaining context by providing a visible reference to the background content.

For developer guidance, see [Material](apple:SwiftUI/Material).

## Platform guidance — iOS & iPadOS
In addition to Liquid Glass, iOS and iPadOS offer four standard materials—ultra-thin, thin, regular (default), and thick—which can be utilized in the content layer to establish visual differentiation.

iOS and iPadOS also define vibrant colors for labels, fills, and separators that are specifically engineered to complement each material. Both labels and fills have multiple vibrancy levels; separators maintain a single level. The name of a level denotes the relative contrast between an element and its background: the default setting provides the highest contrast, while quaternary (if present) offers the lowest.

Except for quaternary, you may apply the following vibrancy values to labels across any material. Generally, avoid using quaternary on top of the [thin](apple:SwiftUI/Material/thin) and [ultraThin](apple:SwiftUI/Material/ultraThin) materials due to insufficient contrast.

- [UIVibrancyEffectStyle.label](apple:UIKit/UIVibrancyEffectStyle/label) (default)
- [UIVibrancyEffectStyle.secondaryLabel](apple:UIKit/UIVibrancyEffectStyle/secondaryLabel)
- [UIVibrancyEffectStyle.tertiaryLabel](apple:UIKit/UIVibrancyEffectStyle/tertiaryLabel)
- [UIVibrancyEffectStyle.quaternaryLabel](apple:UIKit/UIVibrancyEffectStyle/quaternaryLabel)

The following vibrancy values are available for fills on all materials.

- [UIVibrancyEffectStyle.fill](apple:UIKit/UIVibrancyEffectStyle/fill) (default)
- [UIVibrancyEffectStyle.secondaryFill](apple:UIKit/UIVibrancyEffectStyle/secondaryFill)
- [UIVibrancyEffectStyle.tertiaryFill](apple:UIKit/UIVibrancyEffectStyle/tertiaryFill)

The system provides one default vibrancy value for a [UIVibrancyEffectStyle.separator](apple:UIKit/UIVibrancyEffectStyle/separator), which performs adequately on all materials.
