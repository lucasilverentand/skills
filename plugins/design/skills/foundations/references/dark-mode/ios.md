# Dark Mode — full guidelines

### Best practices
- **Avoid offering an app-specific appearance setting.** Providing a mode unique to your application increases user cognitive load, as they must manage multiple settings to achieve their desired look. Furthermore, if the app does not respect the system-wide appearance choice, users may incorrectly conclude that your application is malfunctioning.
- **Ensure that your app looks good in both appearance modes.** Beyond selecting a single mode, users may utilize the Auto appearance setting. This feature dynamically switches between light and dark themes as conditions change throughout the day, which can occur even while your application is in use.
- **Test your content to make sure that it remains comfortably legible in both appearance modes.** For instance, when Dark Mode is combined with Increase Contrast and Reduce Transparency (used individually or together), you might encounter instances where dark text is difficult to read against a dark background. Additionally, enabling Increase Contrast within Dark Mode may inadvertently decrease the visual contrast between dark text and a dark background. While individuals with excellent vision might still manage lower-contrast text, this type of content could be unreadable for many users. For detailed guidance, consult **Accessibility**.
- **In rare cases, consider using only a dark appearance in the interface.** For example, an application supporting immersive media playback might benefit from maintaining a perpetually dark appearance. This allows the user interface to recede, enabling users to concentrate fully on the media content.

### Dark Mode colors
The color palette in Dark Mode includes dimmer background colors and brighter foreground colors. It’s important to realize that these colors aren’t necessarily inversions of their light counterparts: while many colors are inverted, some are not. For more information, see **Specifications**.

- **Embrace colors that adapt to the current appearance.** Semantic colors (like [labelColor](apple:AppKit/NSColor/labelColor) and [controlColor](apple:AppKit/NSColor/controlColor) in macOS or [separator](apple:UIKit/UIColor/separator) in iOS and iPadOS) automatically adjust to the current appearance. When you need a custom color, include a Color Set asset in your app’s Xcode catalog and specify the bright and dim variants of that color. Avoid using hard-coded color values or colors that do not adapt.
- **Aim for sufficient color contrast in all appearances.** Utilizing system-defined colors assists you in achieving a good contrast ratio between your foreground and background content. At minimum, ensure the color contrast is no lower than 4.5:1. For custom foreground and background colors, strive for a contrast ratio of 7:1, especially when dealing with small text. This ratio guarantees that your foreground content stands out from the background and helps meet recommended accessibility guidelines.
- **Soften the color of white backgrounds.** If you display a content image that features a white background, consider slightly darkening the image to prevent the background from glowing within the surrounding Dark Mode context.

#### Icons and images
The system leverages **SF Symbols** (which automatically adjust for Dark Mode) alongside full-color images optimized for both light and dark themes.

- **Utilize SF Symbols whenever feasible.** These symbols render effectively in either appearance mode when dynamic colors are applied for tinting or vibrancy is added. Refer to **Color** for detailed guidance.
- **Develop distinct interface icons for light and dark appearances if required.** For instance, an icon representing a full moon might require a subtle dark outline to achieve contrast against a light background but need no outline when displayed on a dark theme. Likewise, an oil drop icon might benefit from a slight border to ensure its edges are visible against a dark background.
- **Ensure that full-color images and icons appear correct in both appearances.** If an asset renders well across both light and dark modes, use a single version. Should an asset only appear successful in one mode, modify it or generate separate light and dark versions. Employ asset catalogs to consolidate these assets into a single named image.

#### Text
The operating system leverages vibrancy and elevated contrast to sustain text legibility when displayed against darker backgrounds.

- **Use the system-provided label colors for labels.** The primary, secondary, tertiary, and quaternary label hues automatically adjust depending on the light or dark appearance mode.
- **Use system views to draw text fields and text views.** System controls ensure your application's typography appears polished on any background, automatically accommodating the presence or absence of vibrancy. If possible, use a system-supplied view to render text rather than drawing it yourself.

## Platform guidance — iOS & iPadOS
In Dark Mode, the system utilizes two background color sets—referred to as *base* and *elevated*—to enhance the perception of depth when one dark interface is layered over another. The base colors are dimmer, causing background interfaces to appear recessed, while the elevated colors are brighter, making foreground interfaces seem advanced.

**Prefer the system background colors.** Dark Mode is dynamic; this means the background color automatically transitions from base to elevated when an interface gains focus, such as a popover or modal sheet. Additionally, the system employs the elevated background color to establish visual separation between applications in a multitasking scenario and between windows when multiple are open. Using a custom background color can hinder users' ability to perceive these system-driven visual cues.
