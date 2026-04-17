---
name: branding
description: "Applications and games should convey their distinct brand identity in ways that ensure immediate recognition, feel native to the platform, and provide users with a cohesive experience. Use when designing branding for iOS and iPadOS, auditing branding against Apple's iOS and iPadOS guidelines, or when the user says things like \"design branding for iPhone\", \"branding on iOS and iPadOS\", \"how should branding work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Branding
Applications and games should convey their distinct brand identity in ways that ensure immediate recognition, feel native to the platform, and provide users with a cohesive experience

## When to use
- User asks about **branding** on iOS and iPadOS (e.g. `"how do I design branding for iPhone"`).
- User is building an iPhone UI that needs branding and wants to follow Apple's guidelines.
- User asks to audit or review branding in an iOS and iPadOS design.
- User mentions branding in the context of an iPhone app, game, or interface.

Beyond establishing your brand through your [app icon](app-icons.md) and throughout the application experience, you have several opportunities to highlight it within the App Store itself. For detailed instructions, consult [App Store Marketing Guidelines](https://developer.apple.com/app-store/marketing/guidelines/).

### Best practices
- **Maintain your brand’s unique voice and tone in all written communication.** For instance, your brand might use simple language, occasional exclamation marks, emoji, and straightforward sentence structures to convey feelings of optimism and encouragement.
- **Consider implementing an accent color.** On most platforms, you can designate a color that the system applies to app elements such as buttons, interface icons, and text. On macOS specifically, users also have the option to select their own accent color for system use in place of the app-specified color. Refer to [Color](color.md) for guidance.
- **Consider utilizing a custom font.** If your brand is strongly linked to a specific typeface, ensure that it remains legible across all sizes and supports accessibility features like bolding and increased type size. It is often effective to use a custom font for titles and subheadings while relying on the system font for body copy and captions, as system fonts are optimized for small-size legibility. See [Typography](typography.md) for guidance.
- **Ensure branding always supports the content.** Using screen real estate solely to display a brand asset reduces the available space for the content users are interested in. Aim to integrate branding in refined, subtle ways that do not distract from the user experience.
- **Help users feel comfortable by consistently using standard patterns.** Even a highly stylized interface remains approachable if it adheres to familiar behaviors. For example, placing UI elements in expected locations and using standard symbols for common actions contributes to this familiarity.
- **Refrain from displaying your logo throughout the app or game unless it is essential for providing context.** Users rarely need constant reminders of which application they are using; reserving space for valuable information and controls is usually preferable.
- **Avoid treating a launch screen as a branding opportunity.** Some platforms use the launch screen to minimize startup time while simultaneously allowing resources to load (see [Launch screens](launching.md#Launch-screens) for guidance). A launch screen disappears too rapidly to convey meaningful information, but you might consider using a welcome or onboarding screen that introduces your branding content at the beginning of the experience. See [Onboarding](onboarding.md).
- **Comply with Apple’s trademark guidelines.** Your app name or images must not include Apple trademarks. Consult [Apple Trademark List](https://www.apple.com/legal/intellectual-property/trademark/appletmlist.html) and [Guidelines for Using Apple Trademarks](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html).
