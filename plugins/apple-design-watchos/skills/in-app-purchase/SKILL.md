---
name: in-app-purchase
description: "Users can utilize in-app purchases to securely facilitate payments for virtual items—such as digital goods, premium content, and subscriptions—within your application. Use when designing in app purchase for watchOS, auditing in app purchase against Apple's watchOS guidelines, or when the user says things like \"design in app purchase for Apple Watch\", \"in app purchase on watchOS\", \"how should in app purchase work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# In-app purchase
Users can utilize in-app purchases to securely facilitate payments for virtual items—such as digital goods, premium content, and subscriptions—within your application

## When to use
- User asks about **in app purchase** on watchOS (e.g. `"how do I design in app purchase for Apple Watch"`).
- User is building an Apple Watch UI that needs in app purchase and wants to follow Apple's guidelines.
- User asks to audit or review in app purchase in a watchOS design.
- User mentions in app purchase in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Allow users to experience your application before requiring a purchase** — Users are often more willing to commit financially to paid features or items after they have enjoyed the app and understood its…
- **Ensure a cohesive shopping journey** — Users should not feel like they have entered an entirely different application when browsing or buying your digital goods
- **Employ clear and brief product titles and descriptions** — Using straightforward language and titles that do not truncate or require wrapping assists users in locating products efficiently
- **Show the final billing cost for every in-app purchase you provide, regardless of its category** — All users must be aware of the total amount charged for any purchase they consider
- **Only present your store when payment is possible** — If a user cannot complete payments—for instance, due to parental controls—you should either conceal your store or display a user interface explaining…
- **Utilize the system's default confirmation sheet** — When a user begins an in-app purchase, the operating system presents a confirmation screen to mitigate accidental purchases
- **Ensure Family Sharing is prominently mentioned in locations where users learn about your content** — For instance, including terms like “Family” or “Shareable” in the subscription or item title, and referencing Family Sharing on your sign-up screen…
- **Assist users in grasping the advantages of Family Sharing and how to participate** — When you enable Family Sharing, individuals may receive notifications regarding the change, depending on their current settings
- **Strive to tailor your in-app messaging so that it resonates appropriately with both purchasers and family members** — For example, when a family member accesses shared content for the first time, you might greet them using phrasing such as “Your…
- **Provide assistance that customers can view prior to requesting a refund** — In addition to linking to the system's refund flow, your custom purchase support screen can offer app-specific help
- **Use a straightforward title for the refund action, such as “Refund” or “Request a Refund”** — Since the system-managed flow makes it explicit that the refund request is directed to Apple, there is no need to restate this…
- **Assist users in locating the specific purchase that requires attention** — For every recent transaction displayed, include contextual details to help users identify the correct item

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/auto-renewable-subscriptions-overview.md
- @references/auto-renewable-subscriptions-making-signup-effortless.md
- @references/auto-renewable-subscriptions-supporting-offer-codes.md
- @references/auto-renewable-subscriptions-helping-people-manage-their-subscriptions.md
- @references/platform-guidance-watchos.md
