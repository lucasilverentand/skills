# Supporting subscriptions
Your app or website can utilize Apple Pay to request authorization for recurring charges. A recurring fee may be a fixed sum, such as a monthly movie ticket pass, or—where permitted by local regulations—a variable amount like a weekly grocery order. Initial authorization may also encompass discounts and supplementary charges.

- **Clarify subscription details before showing the payment sheet.** Before requesting authorization for a recurring charge, confirm that users fully understand the billing cadence and all associated terms of service. The payment sheet may be used to restate this billing frequency.
- **Include line items that reiterate billing frequency, discounts, and additional upfront fees.** These line items serve to remind the user of what they are authorizing. If payment is not due at the time of authorization, clearly disclose when billing will occur.
- **Clarify the current payment amount in the total line.** Users must be informed of the specific amount they are being charged during the authorization process.
- **Only show the payment sheet when a subscription change results in additional fees.** If a user modifies their subscription and the cost either decreases or remains constant, authorization is unnecessary.

#### Supporting donations
[Approved nonprofits](https://developer.apple.com/support/apple-pay-nonprofits/) are able to accept donations using Apple Pay.

- **Include a line item to specify the donation.** Display a line item on the payment sheet that serves as a reminder of the donation authorization; for instance, display "Donation $50.00."
- **Simplify checkout by providing suggested donation amounts.** You can decrease the number of steps in the donation flow by offering recommended, one-step donations, such as $25, $50, or $100. Additionally, make sure to include an "Other Amount" option so users can customize their donation if desired.
