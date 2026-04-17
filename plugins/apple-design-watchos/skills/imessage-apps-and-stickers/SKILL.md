---
name: imessage-apps-and-stickers
description: "iMessage applications enable users to share content, collaborate, and play games within a conversation; stickers are images used to decorate chats. Use when designing imessage apps and stickers for watchOS, auditing imessage apps and stickers against Apple's watchOS guidelines, or when the user says things like \"design imessage apps and stickers for Apple Watch\", \"imessage apps and stickers on watchOS\", \"how should imessage apps and stickers work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# iMessage apps and stickers
iMessage applications enable users to share content, collaborate, and play games within a conversation; stickers are images used to decorate chats

## When to use
- User asks about **imessage apps and stickers** on watchOS (e.g. `"how do I design imessage apps and stickers for Apple Watch"`).
- User is building an Apple Watch UI that needs imessage apps and stickers and wants to follow Apple's guidelines.
- User asks to audit or review imessage apps and stickers in a watchOS design.
- User mentions imessage apps and stickers in the context of an Apple Watch app, game, or interface.

An iMessage app or sticker pack is available both within the context of a Messages conversation and as an effect in Messages and FaceTime. You may develop an iMessage app or sticker pack either as a standalone application or as an extension within your iOS or iPadOS app. For technical guidance, consult [Messages](apple:Messages) and [Adding Sticker packs and iMessage apps to the system Stickers app, Messages camera, and FaceTime](apple:Messages/adding-sticker-packs-and-imessage-apps-to-the-system-stickers-app-messages-camera-and-facetime).

### Best practices
- **Prioritize a single core experience within your iMessage application.** Users are engaged in a conversational context when they select your app, requiring that its functionality or content be immediately understandable and accessible. If you intend to offer multiple types of features or distinct collections of content, consider developing a separate iMessage app for each use case.
- **Consider integrating content from your iOS or iPadOS application.** For instance, your iMessage app might provide app-specific data that users wish to share—such as a shopping list or travel plan—or facilitate a simple, joint task, like selecting a dining location or choosing a film.
- **Display core functionalities within the compact view.** Users can interact with your iMessage app in a compact mode appearing beneath the message thread, or they may expand it to dominate the window. Ensure that the most frequently accessed elements are available in the compact view, reserving supplementary content and features for the expanded mode.
- **Generally, allow users to edit text exclusively in the expanded view.** Since the compact view occupies a space comparable to the keyboard, displaying the keyboard within the expanded view ensures that the iMessage app's content remains visible while users are making edits.
- **Develop stickers that are versatile, inclusive, and convey emotion.** Whether your stickers consist of detailed images, static graphics, or short animations, ensure that each one remains clearly legible against diverse backgrounds and when rotated or scaled. You may also utilize transparency to help users visually blend a sticker with text, photographs, or other stickers.
- **Supply a localized alternative description for every sticker.** This allows users to navigate your sticker pack using VoiceOver by speaking the sticker's alternative description.

### Specifications

#### Icon sizes
An iMessage app or sticker pack icon may appear across Messages, the App Store, notifications, and Settings. Following installation by users, its icon is also visible in the Messages app's drawer.

For every extension you provide, you must supply a square-cornered icon; the system will automatically apply a mask to round these corners.

**To ensure your icon displays correctly in all contexts and on different devices, create a square-cornered icon using the following sizes:**

|Usage|@2x (pixels)|@3x (pixels)|
|---|---|---|
|Messages, notifications|148x110|-|
||143x100|-|
||120x90|180x135|
||64x48|96x72|
||54x40|81x60|
|Settings|58x58|87x87|
|App Store|1024x1024|1024x1024|

#### Sticker sizes
Messages supports small, medium, and large stickers. Select the size that best suits your content and prepare all assets at that dimension; do not mix sizes within a single sticker pack. Messages renders stickers in a grid layout, with organization varying based on the chosen size.

Use the following `@3x` dimensions when creating your sticker images for the selected size. The system will generate `@2x` and `@1x` versions automatically by downscaling the images during runtime, if required. For developer reference, consult [MSStickerSize](apple:Messages/MSStickerSize).

|Sticker size|@3x dimensions (pixels)|
|---|---|
|Small|300x300|
|Regular|408x408|
|Large|618x618|

Each sticker file must not exceed 500 KB. The table below outlines guidance regarding transparency and animation for each supported file format.

|Format|Transparency|Animation|
|---|---|---|
|PNG|8-bit|No|
|APNG|8-bit|Yes|
|GIF|Single-color|Yes|
|JPEG|No|No|
