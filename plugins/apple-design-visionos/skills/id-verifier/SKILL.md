---
name: id-verifier
description: "ID Verifier allows your iPhone application to read mobile IDs in person without needing external hardware. Use when designing id verifier for visionOS, auditing id verifier against Apple's visionOS guidelines, or when the user says things like \"design id verifier for Apple Vision Pro\", \"id verifier on visionOS\", \"how should id verifier work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# ID Verifier
ID Verifier allows your iPhone application to read mobile IDs in person without needing external hardware

## When to use
- User asks about **id verifier** on visionOS (e.g. `"how do I design id verifier for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs id verifier and wants to follow Apple's guidelines.
- User asks to audit or review id verifier in a visionOS design.
- User mentions id verifier in the context of an Apple Vision Pro app, game, or interface.

Starting with iOS 17, you can integrate ID Verifier into your app, enabling iPhones to read ISO18013-5 compliant mobile IDs and supporting in-person ID verification. For instance, staff at a concert venue could use your app on an iPhone to verify customer ages.

Using ID Verifier offers benefits for both the organization and the customers.

- Customers only provide the minimum necessary data to prove their age or identity, without needing to hand over their physical ID card or display their device.
- Apple supplies the core components for certificate issuance, management, and validation, streamlining app development and ensuring a consistent, trusted ID verification experience.

Depending on your application's requirements, you can use ID Verifier to handle the following types of requests:

- **Display Only request.** Utilize a Display Only request when you need to present data—such as a person’s name or age alongside their photo portrait—within the system-provided UI on the requester’s iPhone, allowing the requester to visually confirm the person's identity. When a Display Only request is made, the customer’s data remains within the system-provided UI and is not transmitted to your app. For guidance on developers, refer to [MobileDriversLicenseDisplayRequest](apple:ProximityReader/MobileDriversLicenseDisplayRequest).
- **Data Transfer request.** A Data Transfer request should only be used when you have a legal requirement for verification and need to store or process information like a person’s address or date of birth. You must request an additional entitlement to make a Data Transfer request. To learn more, see [Get started with ID Verifier](https://developer.apple.com/wallet/id-verifier/); for developer guidance, see [MobileDriversLicenseDataRequest](apple:ProximityReader/MobileDriversLicenseDataRequest) and [MobileDriversLicenseRawDataRequest](apple:ProximityReader/MobileDriversLicenseRawDataRequest).

### Best practices
- **Request only the necessary data.** Users may lose confidence in the experience if your request asks for more information than is required to complete the current verification. For instance, if you only need to confirm a minimum age, use a request that specifies an age threshold; do not ask for the customer’s current age or birth date. For developer guidance, refer to [ageAtLeast(_:)](apple:ProximityReader/MobileDriversLicenseDataRequest/Element/ageAtLeast(_:)).
- **If your application qualifies for Apple Business Register, register for ID Verifier to allow users to view essential information about your organization when you make a request.** Registering for ID Verifier through Apple Business Register enables you to supply your official organization name and logo, which the system will display on customers’ devices as part of the ID verification user interface. To determine eligibility and registration procedures, consult [Apple Business Register](https://register.apple.com/services/login?returnTo=/signin/tap-to-present-id-on-iphone).
- **Provide a button to start the verification process.** Use labels such as "Verify Age" for a simple age check or "Verify Identity" for a more comprehensive identity data request. Do not include symbols that denote a specific communication method, such as NFC or QR codes. Never include the Apple logo in any button label.

|Button type|Example usage|
|---|---|
||An application checking if individuals meet the age requirement for an event or venue, such as a concert hall.|
||An application verifying if specific identity details match expected values, like name and birth date when collecting a rental car.|

**In a Display Only request, assist the user in your app by providing feedback on the visual confirmation they are performing.** For example, when the reader displays the customer’s portrait, you could offer buttons labeled "Matches Person" and "Doesn't Match Person," allowing your app to receive an approved or rejected value as part of the response.
