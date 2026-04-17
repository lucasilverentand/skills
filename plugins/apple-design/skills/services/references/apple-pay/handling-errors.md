# Handling errors
When issues arise during checkout or payment processing, provide users with unambiguous and actionable guidance. This approach ensures rapid problem resolution and successful transaction completion.

#### Data validation
Your application or website has opportunities to respond to user input when the payment sheet appears, during changes made to specific fields on the payment sheet, and after transaction authentication. Utilize these moments to verify data entry accuracy and deliver clear, consistent communications.

When data is incorrect, system-provided error messages draw attention to the relevant fields on the payment sheet. Users can select a field to view further details and resolve the issue. For this detail view, provide tailored error messages that correspond to the problematic field selected by the user.

For developer guidance, consult [PKPaymentAuthorizationViewControllerDelegate](apple:PassKit/PKPaymentAuthorizationViewControllerDelegate) (iOS, watchOS) and [Apple Pay on the Web](apple:ApplePayontheWeb) (web).

> **Note**
> Due to privacy considerations, your app or website has restricted access to data until a transaction is attempted. Prior to authorization, only the card type and a redacted shipping address are viewable. While it is crucial to display errors when authorization fails, you must also attempt to validate available information and report issues before seeking authorization whenever possible.

- **Do not enforce your business logic compliance.** Design a data validation process that is sophisticated enough to disregard extraneous information and deduce missing details whenever feasible. For instance, if your application requires a five-digit zip code but the user enters a Zip+4 code, disregard the extra digits instead of requesting a correction. Allow users to input phone numbers across many formats—such as with or without dashes, and with or without a country code—without triggering an error.
- **Provide precise status updates to the system.** When an issue arises, your app or website must accurately communicate the nature of the problem so the system can display the most appropriate error message on the payment sheet. This requires pairing your custom error message with the correct status code. For developer guidance, refer to [PKPaymentError](apple:PassKit/PKPaymentError) (iOS, watchOS) and [Apple Pay Status Codes](apple:ApplePayontheWeb/apple-pay-status-codes) (web).
- **Describe the problem succinctly and specifically when data is invalid or improperly formatted.** Reference the specific field and clearly state what was expected. For example, if a user enters an incorrect zip code, display a specific message like “Zip code doesn’t match city,” rather than simply stating “Address is invalid.” If the shipping address cannot be serviced, explain why with a message such as “Shipping not available for this state.” Use noun phrases with sentence-style capitalization and omit end punctuation. Aim to keep these messages at 128 characters or less to prevent truncation.

#### Payment processing
**Handle interruptions correctly.** Interruptions in the payment flow—whether caused by a user action like cancellation or a system event like timeout—will lead to the dismissal of the payment sheet. When this happens, you must cancel any payment that is currently in progress. After the payment sheet closes, users can restart the entire process by selecting the Apple Pay button once more. For developer guidance, refer to [PKPaymentAuthorizationViewControllerDelegate] (apple:PassKit/PKPaymentAuthorizationViewControllerDelegate) (iOS, watchOS) and [oncancel] (apple:ApplePayontheWeb/ApplePaySession/oncancel) (web).
