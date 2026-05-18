# VoiceOver
VoiceOver functions as a screen reader, allowing users to interact with your application's interface without needing to view the display

## Platform guidance — visionOS
**Be aware that custom gestures may not always be accessible.** When VoiceOver is enabled in visionOS, applications and games that define custom gestures will not receive touch input by default. This ensures users can explore the interface using voice without the app simultaneously responding to hand input. Users can bypass this behavior by enabling Direct Gesture mode, which disables standard VoiceOver gestures and allows apps to process hand input directly. For developer guidance, see [Improving accessibility support in your visionOS app](apple:visionOS/improving-accessibility-support-in-your-app).
