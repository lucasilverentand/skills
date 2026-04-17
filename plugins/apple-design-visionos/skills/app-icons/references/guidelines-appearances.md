# Appearances
In iOS, iPadOS, and macOS, users can select the appearance of their Home Screen app icons as default, dark, clear, or tinted. For instance, a user might wish to customize their app icon's look to match their wallpaper. You can provide design assets for every appearance variant, and the system will automatically generate any variants you do not supply.

- **Maintain consistency in your icon's features across all appearances.** To ensure a cohesive user experience, the fundamental visual elements of your icon must remain consistent across the default, dark, clear, and tinted appearances. Avoid creating custom icon variants that swap elements in or out for each appearance, as this may complicate users' ability to locate your app when they switch modes.
- **Develop dark and tinted icons that integrate seamlessly with system apps and widgets.** While you can maintain the color scheme of your default icon, remember that dark icons are inherently more subdued, and clear and tinted versions require even greater restraint. A successful app icon must be recognizable, legible, and visible regardless of its chosen appearance variant.
- **Base your dark icon on your light app icon.** Select complementary colors that reflect the original design, and refrain from using overly bright imagery. Generally, color backgrounds provide the most effective contrast in dark mode implementations. For detailed guidance, refer to [Dark Mode](dark-mode.md).
- **Evaluate the possibility of providing alternate app icons.** In iOS, iPadOS, tvOS, and compatible apps running in visionOS, users have the option to select an alternative version of your app icon within your application's settings. For example, a sports application might offer icons for different teams, allowing the user to select their preferred version. If you implement this feature, ensure that every icon design remains closely tied to your content and experience. Do not create an icon that could be mistaken for another application.

> **Note**
> Alternate app icons in iOS and iPadOS must also include their own dark, clear, and tinted variants. Just like your default app icon, all alternate and variant icons are subject to app review and must comply with the [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/#design).

## Platform guidance — visionOS
**Avoid including shapes that suggest a void or concave area in the background layer.** System-generated shadows and specular reflections may cause these features to appear prominent rather than recessed.
