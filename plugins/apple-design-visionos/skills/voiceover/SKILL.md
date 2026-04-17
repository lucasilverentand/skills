---
name: voiceover
description: "VoiceOver functions as a screen reader, allowing users to interact with your application's interface without needing to view the display. Use when designing voiceover for visionOS, auditing voiceover against Apple's visionOS guidelines, or when the user says things like \"design voiceover for Apple Vision Pro\", \"voiceover on visionOS\", \"how should voiceover work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# VoiceOver
VoiceOver functions as a screen reader, allowing users to interact with your application's interface without needing to view the display

## When to use
- User asks about **voiceover** on visionOS (e.g. `"how do I design voiceover for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs voiceover and wants to follow Apple's guidelines.
- User asks to audit or review voiceover in a visionOS design.
- User mentions voiceover in the context of an Apple Vision Pro app, game, or interface.

By implementing VoiceOver support, you enable individuals who are blind or have low vision to access your app's information and navigate its content when visual display is not possible.

VoiceOver is supported in applications and games built for Apple platforms. It is also compatible with apps and games developed using Unity, provided they utilize [Apple’s Unity plug-ins](https://github.com/apple/unityplugins). For additional guidance, consult [Accessibility](accessibility.md).

### Descriptions
You inform VoiceOver about your app’s content by providing alternative text that explains your app’s interface and the content it displays.

- **Provide alternative labels for all key interface elements.** VoiceOver relies on these alternative labels (which are not visible on screen) to audibly convey your app’s interface. While system controls default to generic labels, you must supply more descriptive labels that accurately reflect your app’s functionality. Apply labels to any custom elements you implement. Ensure these descriptions remain current as your app’s interface or content evolves. For technical guidance, consult [Accessibility modifiers](apple:SwiftUI/View-Accessibility).
- **Describe meaningful images.** If key images within your app are not described, users cannot fully experience them using VoiceOver. Since VoiceOver aids in understanding the interface surrounding images (such as nearby captions), only describe the information contained within the image itself.
- **Make charts and other infographics fully accessible.** Provide a brief description for each infographic explaining its content. If the infographic allows interaction to retrieve additional or different information, ensure these interactions are also available to VoiceOver users. Accessibility APIs provide methods to represent custom interactive elements so assistive technologies can assist users. For guidance, see [Charts](https://developer.apple.com/design/Human-Interface-Guidelines/charts#Enhancing-the-accessibility-of-a-chart).
- **Exclude purely decorative images from VoiceOver.** Images that are decorative and convey no useful or actionable information do not require description. Omitting these images respects the user's time and minimizes cognitive load while using VoiceOver. For developer guidance, refer to [accessibilityHidden(_:)](apple:SwiftUI/View/accessibilityHidden(_:)), [accessibilityElement](apple:AppKit/NSAccessibility-c.protocol/accessibilityElement), and [isAccessibilityElement](apple:UIKit/UIAccessibilityElement/isAccessibilityElement).

### Navigation
- **Use titles and headings to help people navigate your information hierarchy.** The title is the first piece of information an assistive technology user receives upon arriving at a page or screen within your application. Provide unique titles that concisely summarize the content and function of each page. Similarly, employ precise section headings to assist users in building a mental model of the information structure on that page.
- **Specify how elements are grouped, ordered, or linked.** While proximity, alignment, and other visual cues help sighted users understand relationships between elements, you must also describe these relationships to VoiceOver. Review your application for instances where element relationships are visual only, and then articulate those connections to VoiceOver.

VoiceOver reads elements in the sequence users read content in their native language and locale. For instance, in US English, this means reading top-to-bottom, left-to-right. In the ungrouped example below, VoiceOver describes each image before proceeding to its caption. Conversely, in the grouped example, VoiceOver presents each image along with its corresponding caption. For developer guidance, refer to [shouldGroupAccessibilityChildren](apple:ObjectiveC/NSObject-swift.class/shouldGroupAccessibilityChildren).

- **Inform VoiceOver when visible content or layout changes occur.** Unexpected shifts in content or layout can confuse users, as it disrupts their established mental map of the information. It is vital to report these visual changes so that VoiceOver and other accessibility tools can help users update their understanding of the content. For developer guidance, see [AccessibilityNotification](apple:Accessibility/AccessibilityNotification).
- **Support the VoiceOver rotor when possible.** Users can employ an interface feature called the VoiceOver rotor to navigate a document or webpage using headings, links, and other content types. You can aid user navigation by identifying these elements to the rotor. The rotor can also activate the braille keyboard. For developer guidance, see [AccessibilityRotorEntry](apple:SwiftUI/AccessibilityRotorEntry) (SwiftUI), [UIAccessibilityCustomRotor](apple:UIKit/UIAccessibilityCustomRotor) (UIKit), and [NSAccessibilityCustomRotor](apple:AppKit/NSAccessibilityCustomRotor) (AppKit).

## Platform guidance — visionOS
**Be aware that custom gestures may not always be accessible.** When VoiceOver is enabled in visionOS, applications and games that define custom gestures will not receive touch input by default. This ensures users can explore the interface using voice without the app simultaneously responding to hand input. Users can bypass this behavior by enabling Direct Gesture mode, which disables standard VoiceOver gestures and allows apps to process hand input directly. For developer guidance, see [Improving accessibility support in your visionOS app](apple:visionOS/improving-accessibility-support-in-your-app).
