---
name: services
description: "Apple framework and service integrations: Apple Pay, HealthKit, HomeKit, Siri, CarPlay, Sign in with Apple, App Clips, widgets, Camera, Control Center, sensors, and more. Use when integrating an Apple framework or designing UI that surfaces one. User says: \"add Apple Pay\", \"Sign in with Apple\", \"HealthKit UI\", \"design a widget\"."
allowed-tools: Read Grep Glob
---

# Apple Services & Frameworks
Apple framework/service integration guidance — design rules and constraints for surfacing services like Pay, HealthKit, Siri, Wallet, App Clips, widgets, and hardware framework features (camera, sensors, Control Center). Pair with the platform skill when the service has device-specific UI.

## How to use
1. **Identify the framework or service** the user wants to integrate, find it in the glossary.
2. **Read the topic's references**. Directory topics typically split overview, design, privacy, and platform notes.
3. **Combine with the platform skill** when the service surfaces UI on a specific device (e.g., Apple Pay button on iOS).
4. **Honor service-mandated rules strictly** — many services (Pay, Sign in with Apple, Wallet) carry legal/branding requirements.

## Glossary
|Topic|Reference|Summary|
|---|---|---|
|`airplay`|`airplay.md`|Prefer the system-provided media player|
|`app-clips`|`app-clips/`|Users encounter and initiate App Clips across many scenarios and contexts|
|`app-shortcuts`|`app-shortcuts/`|Since App Shortcuts are integral to your application, they become available…|
|`apple-pay`|`apple-pay/`|Apps and websites that accept Apple Pay must display it as a payment option and…|
|`apple-pencil-and-scribble`|`apple-pencil-and-scribble/`|For comprehensive information regarding Apple Pencil features and…|
|`camera-control`|`camera-control.md`|Camera Control grants immediate access to your application's camera…|
|`carekit`|`carekit/`|CareKit 2.0 comprises two distinct projects: CareKit UI and CareKit Store|
|`carplay`|`carplay.md`|CarPlay is specifically engineered for drivers to use while operating a vehicle|
|`controls`|`controls.md`|Users can add controls to Control Center by pressing and holding in an empty…|
|`game-center`|`game-center/`|Find new games that their friends are playing|
|`generative-ai`|`generative-ai/`|Design your experience responsibly|
|`gyro-and-accelerometer`|`gyro-and-accelerometer.md`|On-device gyroscopes and accelerometers provide information regarding a…|
|`healthkit`|`healthkit/`|For instance, a nutrition application may need permission to retrieve users'…|
|`home-screen-quick-actions`|`home-screen-quick-actions.md`|Home Screen quick actions allow users to execute app-specific functions…|
|`homekit`|`homekit/`|Your application (iOS, tvOS, or watchOS) can integrate with HomeKit—and…|
|`icloud`|`icloud.md`|iCloud is a service that allows users to access their important…|
|`id-verifier`|`id-verifier.md`|ID Verifier allows your iPhone application to read mobile IDs in person without…|
|`imessage-apps-and-stickers`|`imessage-apps-and-stickers.md`|iMessage applications enable users to share content, collaborate, and play…|
|`in-app-purchase`|`in-app-purchase/`|When implementing in-app purchases, you have four content models available:|
|`live-activities`|`live-activities/`|For instance, a Live Activity could display the estimated arrival time for a…|
|`live-photos`|`live-photos.md`|Live Photos transforms cherished moments into a dynamic, interactive experience…|
|`live-viewing-apps`|`live-viewing-apps.md`|When developing a live-viewing application, the content must be elevated and…|
|`machine-learning`|`machine-learning/`|For related guidance on utilizing machine learning models to facilitate…|
|`managing-accounts`|`managing-accounts/`|Explain the benefits of creating an account and how to sign up|
|`managing-notifications`|`managing-notifications.md`|People value being informed about matters important to them, but they may not…|
|`maps`|`maps/`|In general, ensure your map is interactive|
|`nearby-interactions`|`nearby-interactions/`|Nearby interactions enable on-device experiences that incorporate the presence…|
|`nfc`|`nfc.md`|Near-field communication (NFC) enables devices located within a few centimeters…|
|`notifications`|`notifications/`|Notifications may utilize different styles depending on the platform, including:|
|`photo-editing`|`photo-editing.md`|Photo-editing extensions enable users to modify photos and videos within the…|
|`ratings-and-reviews`|`ratings-and-reviews.md`|Potential users frequently consult ratings and reviews before downloading an…|
|`researchkit`|`researchkit.md`|When a user launches a research application for the first time, they encounter…|
|`shareplay`|`shareplay/`|When content is being shared during a FaceTime call, the system prompts each…|
|`shazamkit`|`shazamkit.md`|ShazamKit enables audio recognition by comparing an audio sample against either…|
|`sign-in-with-apple`|`sign-in-with-apple/`|You are able to implement Sign in with Apple across any version of your website…|
|`siri`|`siri/`|Ask Siri to execute a system-defined task that your application supports, such…|
|`tap-to-pay-on-iphone`|`tap-to-pay-on-iphone/`|To integrate Tap to Pay on iPhone into your iOS application, you must…|
|`wallet`|`wallet/`|When you integrate Apple Wallet into your application, you can generate custom…|
|`widgets`|`widgets/`|On the Home Screen and Lock Screen of their iPhone and iPad|
