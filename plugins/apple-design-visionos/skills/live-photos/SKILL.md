---
name: live-photos
description: "Live Photos transforms cherished moments into a dynamic, interactive experience enriched with sound and motion, bringing life to conventional still photography. Use when designing live photos for visionOS, auditing live photos against Apple's visionOS guidelines, or when the user says things like \"design live photos for Apple Vision Pro\", \"live photos on visionOS\", \"how should live photos work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Live Photos
Live Photos transforms cherished moments into a dynamic, interactive experience enriched with sound and motion, bringing life to conventional still photography

## When to use
- User asks about **live photos** on visionOS (e.g. `"how do I design live photos for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs live photos and wants to follow Apple's guidelines.
- User asks to audit or review live photos in a visionOS design.
- User mentions live photos in the context of an Apple Vision Pro app, game, or interface.

When Live Photos is active, the Camera application records supplementary data—including audio and additional frames—both before and after the photograph is taken. Users activate this dynamic memory by tapping the Live Photo.

### Best practices
- **Apply adjustments to all frames.** If your application allows users to apply effects or modifications to a Live Photo, ensure these changes are applied across the entirety of the photo. If this functionality is not supported, provide users with the option to convert it into a static image.
- **Keep Live Photo content intact.** It is crucial that users encounter Live Photos in a consistent manner, utilizing the same visual treatment and interaction model across all applications. Do not dismantle a Live Photo by presenting its frames or audio components separately.
- **Implement a great photo sharing experience.** If your app supports the ability to share photos, allow users to preview the complete contents of Live Photos before committing to sharing. Always include the option to share Live Photos as standard, traditional photos.
- **Clearly indicate when a Live Photo is downloading and when the photo is playable.** Display a progress indicator while the download is underway, and provide clear notification once the download has finished.
- **Display Live Photos as traditional photos in environments that don’t support Live Photos.** Do not attempt to recreate the Live Photos experience found in a compatible environment. Instead, present a standard, still representation of the image.
- **Make Live Photos easily distinguishable from still photos.** The most effective way to identify a Live Photo is through the presence of subtle movement. Since there are no inherent Live Photo motion effects, such as those seen when swiping in the Photos app's full-screen browser, you must design and implement custom motion effects.

In situations where movement cannot be achieved, display a system-provided badge above the image, optionally including text. Never include a playback button that could be mistaken by the viewer for video controls.

**Keep badge placement consistent.** Should you use a badge, maintain its location across every photo. Generally, placing the badge in a corner of the photo yields the best visual result.

## Platform guidance — visionOS
Within visionOS, users have the ability to view a Live Photo, but they cannot capture a new one.
