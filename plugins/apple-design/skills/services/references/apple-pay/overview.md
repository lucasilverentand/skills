# Apple Pay — overview
> **Tip**
> It is crucial to distinguish between Apple Pay and **In-app purchase**. Utilize Apple Pay within your application for selling physical goods (e.g., groceries, apparel, appliances), services (e.g., club memberships, hotel bookings, event tickets), and donations. Use In-App Purchase in your application specifically for selling digital goods (such as premium content) and subscriptions related to digital content.

Apps and websites that accept Apple Pay must display it as a payment option and incorporate an Apple Pay button into the checkout process. Tapping this button invokes the payment sheet. During checkout, the payment sheet displays details like the linked credit or debit card, the total purchase amount (including taxes and fees), shipping choices, and contact information. Users can make any required modifications before authorizing the payment and finalizing the transaction. For developer instructions, refer to [Apple Pay](apple:PassKit/apple-pay).

All websites offering Apple Pay must maintain a privacy statement and comply with the [Acceptable use guidelines for Apple Pay on the web](https://developer.apple.com/apple-pay/acceptable-use-guidelines-for-websites/). For developer resources, consult [Apple Pay on the Web](apple:ApplePayontheWeb). A hands-on demonstration of Apple Pay on the web is available at [Apple Pay on the web interactive demo](https://applepaydemo.apple.com).

In most scenarios where device support exists, the transaction authentication occurs on the device itself using Face ID, Touch ID, or Optic ID. In certain situations, the system transfers payment authentication to a nearby iPhone, iPad, or Apple Watch via either a secure Bluetooth connection or a scannable code.
