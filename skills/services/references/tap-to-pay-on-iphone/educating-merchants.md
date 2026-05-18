# Educating merchants
Since some merchants may be new to Tap to Pay on iPhone, providing a swift and straightforward onboarding process is crucial.

**Provide a tutorial that outlines the supported payment methods and demonstrates how to accept each type using Tap to Pay on iPhone.** You may deploy this tutorial by:

- Including it within a "Learn More" option in your application messaging
- Automatically displaying it once merchants agree to the Tap to Pay on iPhone terms and conditions
- Presenting it automatically to users new to your application
- Ensuring it is easily locatable in a consistent area, such as your app's help section or settings

You have two options for building this tutorial: you can utilize Apple-approved assets found in the [Tap to Pay on iPhone marketing guidelines](https://developer.apple.com/tap-to-pay/marketing-guidelines/), or you can leverage the [ProximityReaderDiscovery](apple:ProximityReader/ProximityReaderDiscovery) API to offer a ready-made merchant education experience. Apple guarantees that the API is current and localized for the merchant's region.

If you choose to develop your own tutorial, ensure it demonstrates how to:

- Initiate a checkout sequence for every payment type
- Guide a customer on positioning their contactless card or digital wallet onto the merchant's device for payment
- Manage PIN entry for a card, including support for accessibility mode

Finally, include an opportunity at the conclusion of the tutorial allowing merchants who have not yet accepted the Tap to Pay on iPhone terms and conditions to do so.
