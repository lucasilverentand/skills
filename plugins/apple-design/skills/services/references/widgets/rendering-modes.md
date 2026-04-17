# Rendering modes

#### Full-color
**Implement support for both light and dark appearances.** When implementing, prioritize using light backgrounds for the light appearance and dark backgrounds for the dark appearance. It is recommended to utilize semantic system colors for text and background elements, allowing these colors to adjust dynamically based on the current appearance setting. Alternatively, you may support different appearances by including color variants within your asset catalog. For additional information, consult **Dark Mode**; for developer resources, refer to [Asset management](apple:Xcode/asset-management) and [Supporting Dark Mode in your interface](apple:UIKit/supporting-dark-mode-in-your-interface).

#### Accented
**Organize widget elements into a primary and an accent group.** When using accented rendering mode, the widget's view hierarchy is segmented into a primary group and an accent group. On iPhone, iPad, and Mac, the system applies a white tint to both primary and accented content. Conversely, on Apple Watch, the system tints the primary content white while applying the watch face color to the accented content.

For implementation details, consult [widgetAccentable(_:)](apple:SwiftUI/View/widgetAccentable(_:)) and [Optimizing your widget for accented rendering mode and Liquid Glass](apple:WidgetKit/optimizing-your-widget-for-accented-rendering-mode-and-liquid-glass).

#### Vibrant
- **Offer sufficient contrast to maintain legibility.** In vibrant rendering mode, pixel opacity controls the intensity of the blurred background material effect. Fully transparent pixels allow the background material to pass through without alteration. The brightness of these pixels dictates their vibrancy on the Lock Screen. Brighter gray values offer greater contrast, whereas darker values provide less.
- **Develop optimized assets for the best vibrant effect.** Render content—including images, numbers, and text—at maximum opacity. Establish hierarchy by using white or light gray for the most important content and darker grayscale values for secondary elements. Confirm that image content has enough contrast in grayscale, and use opaque grayscale values rather than simply setting white opacity to achieve the optimal vibrant material effect.
