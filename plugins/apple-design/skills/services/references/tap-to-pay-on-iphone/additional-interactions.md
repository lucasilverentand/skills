# Additional interactions
Tap to Pay on iPhone enables merchants to scan a payment card even when there is no transaction amount, supporting scenarios like retrieving past transactions, saving card details for future payments, processing refunds, or confirming customer data.

**Use a generic label in the button that launches the Tap to Pay on iPhone screen when scanning a payment card without an associated transaction amount.** Do not use "Tap to Pay on iPhone" or "Tap to Pay" in such a label; instead, employ a general term like “Look Up,” “Store Card,” “Verify,” or “Refund.”

If your application supports loyalty cards or passes compatible with NFC in Apple Wallet (such as those for discounts, points, or rewards), Tap to Pay on iPhone allows merchants to read these items concurrently with a payment card scan, or separately.

**If your app supports an independent loyalty card transaction, differentiate this process from a payment acceptance flow utilizing Tap to Pay on iPhone.** It is beneficial to provide merchants with a distinct, clearly labeled button to start a loyalty card transaction. To prevent merchants from accidentally selecting the incorrect option, refrain from including "Tap to Pay on iPhone," "Tap to Pay," or any other payment-related terminology in the loyalty transaction button's label.
