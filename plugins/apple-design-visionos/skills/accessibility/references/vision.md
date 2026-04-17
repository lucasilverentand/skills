# Vision
Users of your interface may have visual impairments, including blindness, color blindness, low vision, or light sensitivity. They might also be using the app in varying lighting conditions or with screen brightness settings that affect interaction ability.

- **Support larger text sizes.** Ensure users can modify the size of your text and icons to improve legibility, visibility, and reading comfort. Ideally, provide the option to enlarge text by at least 200 percent (or 140 percent for watchOS applications). Your interface can accommodate font size scaling either through custom UI implementation or by adopting Dynamic Type. Dynamic Type is a system-level setting that allows users to adjust text size for comfort and legibility. For further information, refer to [Supporting Dynamic Type](typography.md#Supporting-Dynamic-Type).
- **Use recommended defaults for custom type sizes.** Each platform maintains distinct default and minimum sizes for system-defined type styles to optimize readability. If you implement custom type styles, adhere to these recommended defaults.

|Platform|Default size|Minimum size|
|---|---|---|
|iOS, iPadOS|17 pt|11 pt|
|macOS|13 pt|10 pt|
|tvOS|29 pt|23 pt|
|visionOS|17 pt|12 pt|
|watchOS|16 pt|12 pt|

- **Consider that font weight also influences text readability.** If you utilize a custom font with a thin weight, aim for sizes larger than the recommended minimums to enhance legibility. For more details, consult [Typography](typography.md).
- **Strive to meet color contrast minimum standards.** To guarantee all information within your app is legible, sufficient contrast must exist between foreground elements (text and icons) and background colors. Two widely accepted standards for measuring color contrast are the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG/) and the Accessible Perceptual Contrast Algorithm (APCA). Use standard contrast calculation tools to verify your UI meets acceptable thresholds. [Accessibility Inspector](apple:Accessibility/accessibility-inspector) references the following WCAG Level AA values as guidance when determining if your app's colors provide adequate contrast.

|Text size|Text weight|Minimum contrast ratio|
|---|---|---|
|Up to 17 pts|All|4.5:1|
|18 pts|All|3:1|
|All|Bold|3:1|

If your app does not provide this minimum contrast by default, ensure it offers a higher contrast color scheme when the system setting Increase Contrast is enabled. If your app supports [Dark Mode](dark-mode.md), verify the minimum contrast in both light and dark appearances.
**Prefer system-defined colors.** These colors include accessible variations that automatically adjust when users modify their color preferences, such as activating Increase Contrast or switching between light and dark modes. See [Color](color.md) for guidance.

**Convey information using more than color alone.** Some users have difficulty distinguishing between specific colors and shades. For instance, individuals with color blindness may struggle particularly with pairings like red-green or blue-orange. Supplement color cues with visual indicators, such as unique shapes or icons, to assist users in perceiving functional differences and state changes. Consider allowing personalization of color schemes—such as chart colors or game characters—to suit the user's comfort. **Describe your app’s interface and content for VoiceOver.** VoiceOver is a screen reader that enables users to experience your app without needing visual input. For more information, refer to [VoiceOver](voiceover.md).
