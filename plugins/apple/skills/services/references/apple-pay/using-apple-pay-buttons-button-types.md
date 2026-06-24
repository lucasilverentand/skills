# Button types
Apple offers different button types, allowing you to select the option that best aligns with your purchase or payment flow and terminology.

To generate Apple Pay buttons, you must utilize the APIs provided by Apple. By using these system-level APIs, your implementation gains:

*   A button guaranteed to feature an Apple-approved caption, font, color, and style.
*   Assurance that the button's content maintains optimal proportions regardless of scaling.
*   Automatic translation of the caption into the device's current language setting.
*   Support for configuring the button’s corner radius to match your UI's aesthetic.
*   A system-provided alternative text label enabling VoiceOver descriptions of the button.

|Payment button type|Example usage|
|---|---|
||An area in an app or website where people can make a purchase, such as a product detail page or shopping cart page.|
||An app or website that allows users to pay bills or invoices, such as those for a utility — like cable or electricity — or a service like plumbing or car repair.|
||An app or website offering a shopping cart or purchase experience that includes other payment buttons starting with the text *Check out*.|
||An app or website offering a shopping cart or purchase experience that includes other payment buttons starting with the text *Continue with*.|
||An app or website that facilitates booking flights, trips, or other experiences.|
||An app or website for an [Approved nonprofits](https://developer.apple.com/support/apple-pay-nonprofits/) that enables donations.|
||An app or website where users purchase a subscription, such as for a gym membership or meal-kit delivery service.|
||An app or website that uses the term *reload* to help users add funds to a card, account, or payment system associated with a service like transit or prepaid phone plans.|
||An app or website that uses the term *add money* to help users add funds to a card, account, or payment system associated with a service like transit or prepaid phone plans.|
||An app or website that uses the term *top up* to help users add funds to a card, account, or payment system associated with a service like transit or prepaid phone plans.|
||An app or website that allows users to place orders for items such as meals or flowers.|
||An app or website that enables rentals of items like cars or scooters.|
||An app or website that uses the term *support* to help users contribute money to projects, causes, organizations, or other entities.|
||An app or website that uses the term *contribute* to help users give money to projects, causes, organizations, or other entities.|
||An app or website that allows tipping for goods or services.|
||An app or website that has stylistic reasons to use a button with a smaller minimum width or without specifying a call to action. If you select a payment button type unsupported by the operating system version running your app or website, the system may substitute this button.|

If a device supports Apple Pay but has not yet been configured, you can use the Set up Apple Pay button to signal acceptance of Apple Pay and provide users with a clear opportunity to enroll.

The Set up Apple Pay button can be displayed on pages such as a Settings screen, a user profile view, or an interstitial page. Tapping this button in any of these locations must initiate the card addition process.
