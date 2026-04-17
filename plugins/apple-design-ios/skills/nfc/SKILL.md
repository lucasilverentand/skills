---
name: nfc
description: "Near-field communication (NFC) enables devices located within a few centimeters of one another to exchange data wirelessly. Use when designing nfc for iOS and iPadOS, auditing nfc against Apple's iOS and iPadOS guidelines, or when the user says things like \"design nfc for iPhone\", \"nfc on iOS and iPadOS\", \"how should nfc work on iPhone\"."
allowed-tools: Read Grep Glob
---

# NFC
Near-field communication (NFC) enables devices located within a few centimeters of one another to exchange data wirelessly

## When to use
- User asks about **nfc** on iOS and iPadOS (e.g. `"how do I design nfc for iPhone"`).
- User is building an iPhone UI that needs nfc and wants to follow Apple's guidelines.
- User asks to audit or review nfc in an iOS and iPadOS design.
- User mentions nfc in the context of an iPhone app, game, or interface.

Supported iOS applications on compatible hardware can employ NFC scanning to retrieve information from electronic tags attached to physical objects. For instance, a user might scan a toy to link it with a video game, a shopper could scan an in-store sign to obtain coupons, or a retail worker might scan products for inventory tracking.

### In-app tag reading
An application must support scanning of either a single or multiple objects while active, and it should display a dedicated scanning screen when users are about to initiate a scan.

- **Do not prompt physical contact with objects.** For an iOS device to successfully read a tag, it only needs to be in close proximity; physical contact is unnecessary. When instructing users to scan objects, use phrases such as *scan* and *hold near*, rather than *tap* or *touch*.
- **Use language that is easily understood.** Since near-field communication may be unfamiliar to some users, avoid technical or developer jargon like *NFC*, *Core NFC*, *Near-field communication*, and *tag*. Instead, employ friendly, conversational terms that the majority of users will grasp.

|Use|Avoid using|
|---|---|
|Scan the [*object name*].|Scan the NFC tag.|
|Hold your iPhone near the [*object name*] to learn more about it.|To use NFC scanning, tap your phone to the [*object*].|

**Provide brief instructions on the scanning screen.** The text must be a complete sentence, written in sentence case and including terminal punctuation. It should identify the object being scanned and be revised appropriately for subsequent scans. Keep the text brief to prevent truncation.

|First scan|Subsequent scans|
|---|---|
|Hold your iPhone near the [*object name*] to learn more about it.|Now hold your iPhone near another [*object name*].|

### Background tag reading
Background tag reading allows users to scan tags quickly at any time, without needing to first launch the app or start a scanning session. On devices that support this feature, the system automatically searches for nearby compatible tags whenever the screen is illuminated. After successfully detecting and matching a tag with an app, the system displays a notification that users can tap to send the tag data for processing within the application. Note that background reading is unavailable if an NFC scanning interface is visible, while Wallet or Apple Pay are in use, when cameras are active, if the device is in Airplane Mode, or if the device has been locked following a restart.

**Support both background and in-app tag reading.** Your application must still provide an in-app mechanism to scan tags for users whose devices do not support background tag reading.
