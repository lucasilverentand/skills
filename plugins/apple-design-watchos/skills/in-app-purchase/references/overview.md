# In-app purchase — overview
> **Tip**
> In-app purchase and [Apple Pay](apple-pay.md) are distinct technologies designed for different scenarios. Use in-app purchase when selling virtual items within your app, like premium content or digital subscriptions. Conversely, use Apple Pay in your application to sell physical goods (e.g., groceries, apparel, appliances), services (e.g., club memberships, hotel bookings, event tickets), or handle donations.

When implementing in-app purchases, you have four content models available:

- *Consumable* items are virtual goods like gems or lives in a game. Once purchased, these items are depleted as the user utilizes them and can be bought again.
- *Non-consumable* items are premium features within an app that, once purchased, do not expire.
- *Auto-renewable subscriptions* provide ongoing access to virtual content, services, or premium features in your app. An auto-renewable subscription automatically renews at the end of each billing cycle until the user cancels it.
- *Non-renewing subscriptions* grant access to a service or content for a defined period, such as an in-game battle pass. Users must purchase this non-renewing subscription each time they wish to extend their access.

For marketing and business strategy guidance, consult [In-app purchase](https://developer.apple.com/in-app-purchase/) and [Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/). To understand the requirements and limitations regarding what you can sell in your app, including IAP usage constraints, see [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

> **Note**
> If your app features exceptionally large, frequently updated catalogs of one-time purchases or subscription content from multiple creators, or if your app offers subscriptions with optional add-on content as a single purchase, the Advanced Commerce API enables direct management of your In-App Purchase catalog. Refer to the Advanced Commerce API [App Store support page](https://developer.apple.com/in-app-purchase/advanced-commerce-api/) for an overview, and consult [Advanced Commerce API](apple:AdvancedCommerceAPI) for developer instructions.
