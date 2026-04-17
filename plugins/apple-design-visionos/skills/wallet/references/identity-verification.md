# Identity verification
On iPhone running iOS 16 or later, users can store an ID card in Wallet and subsequently allow an application or App Clip to access the card's information for identity verification without disrupting their current activity. For instance, a user might need to confirm their identity while applying for a credit card within their banking application. To learn how to support in-person mobile ID verification, consult [ID Verifier](id-verifier.md).

> **Developer note**
> Apple does not create or view the ID documents users add to Wallet. When users consent to share identifying information with your app, you receive only encrypted data that cannot be read on the device. For developer guidance, refer to [Requesting identity data from a Wallet pass](apple:PassKit/requesting-identity-data-from-a-wallet-pass).

To help you provide a consistent and trustworthy experience, Apple offers a Verify with Wallet button that you can use in your app when requesting identity verification. This button displays a sheet detailing your request, allowing users to agree to share their information or cancel.

- **Present a Wallet verification option only when the device supports it.** If the current hardware cannot return the requested identity information, do not display a Verify with Apple Wallet button. You must be prepared to present a fallback view offering an alternative verification method if Verify with Apple Wallet is unavailable; for developer guidance, see [VerifyIdentityWithWalletButton](apple:PassKit/VerifyIdentityWithWalletButton).
- **Ask for identity information only at the precise moment you need it.** Users may be suspicious of a request for personal data if it appears unrelated to their present action. If your app requires identity verification, for example, wait until users are completing the process or transaction that necessitates it; do not request verification before they are ready to begin the process or while they are merely creating an account.
- **Clearly and succinctly describe the reason you need the information you’re requesting.** You must provide text explaining why users need to share identity information with your app (this text is known as a *purpose string* or *usage description string*). The system displays your purpose string in the verification sheet, enabling users to make an informed choice. Examples include:

|To verify…|To support…|Example purpose string|
|---|---|---|
|Identity|Opening an account for which proof of identity is legally required to prevent fraud|Federal law requires this information to verify your identity and also to help [App Name] prevent fraud.|
|Driving privilege|Renting a vehicle that requires legal driving privileges|Applicable state law requires [App Name] to verify your driving privileges.|

For each purpose string, strive for a brief, complete sentence that is direct, specific, and easily understood by everyone. Use sentence case, avoid passive voice, and conclude with a period.

- **Ask only for the data you actually need.** Users may lose faith in your app if you request more data than is necessary to complete the current task or action. For instance, if your goal is merely to confirm a customer's minimum age, use a request that specifies an age threshold; avoid asking for the customer’s current age or date of birth. For developer guidance, see [age(atLeast:)](apple:PassKit/PKIdentityElement/age(atLeast:)).
- **Clearly indicate whether you will keep the data and — if you need to keep it — specify how long you’ll do so.** To build user trust, it is crucial to explain how long you might need to retain the personal information they consent to sharing with you. When you utilize PassKit APIs to define a duration—such as a specific period, indefinitely, or only until the current verification is complete—the system automatically displays explanatory content in the verification sheet. For developer guidance, see [PKIdentityIntentToStore](apple:PassKit/PKIdentityIntentToStore).
- **Choose the system-provided verification button that matches your use case and the visual design of your app.** The system offers the following button labels to accommodate different scenarios:

|Button type|Consider using when…|
|---|---|
||Your app can finalize the current transaction after verifying a person’s age. An example is making a car available for lease.|
||Your app can finalize the current transaction after verifying a person’s identity. An example is a car rental.|
||Verify with Wallet forms part of a verification process that also requires users to provide additional information not supplied by Verify with Wallet, such as a Social Security number or phone number. Examples include opening a financial account or conducting a background check.|
||Your app can complete the current verification flow without extra steps, but the “Verify Age,” “Verify Identity,” and “Continue” button labels are unsuitable for your specific use case. An example is an app assisting with government service sign-ups.|

All button labels are also available in a multiline variant that the system automatically employs when horizontal space is limited. For developer guidance, see [PKIdentityButton.Label](apple:PassKit/PKIdentityButton/Label).

The verification button consistently uses white text on a black background. You have the option to select a style that includes a light outline if you need to ensure good contrast against a dark background within your app. Additionally, you can use the [cornerRadius](apple:PassKit/PKIdentityButton/cornerRadius) property to adjust the verification button’s corners, matching other related buttons in your interface. For developer guidance, see [PKIdentityButton.Style.blackOutline](apple:PassKit/PKIdentityButton/Style/blackOutline).
