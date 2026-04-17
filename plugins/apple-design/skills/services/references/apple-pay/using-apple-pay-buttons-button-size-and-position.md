# Button size and position
- **Ensure high visibility for the Apple Pay button.** The button must be no smaller than other payment buttons, and users should not need to scroll to see it. **Place the Apple Pay button logically relative to an Add to Cart button.** If using a side-by-side arrangement, position the Apple Pay button to the right of the Add to Cart button. If using a stacked arrangement, place the Apple Pay button above the Add to Cart button. **Match the corner radius to match other buttons.** By default, an Apple Pay button features rounded corners. You have the option to adjust the corner radius to achieve either square or capsule-shaped button appearances. For detailed developer guidance, refer to [cornerRadius](apple:PassKit/PKPaymentButton/cornerRadius).
- **Maintain the minimum button size and surrounding margins.** Keep in mind that the button title length may vary depending on the localized language.

> **Note**
> If the dimensions you specify are insufficient to display the translated title for your chosen payment button type, the system will automatically substitute it with the plain Apple Pay button shown on the left. This automatic replacement does not apply to the Set up Apple Pay button.

Use these values for guidance:

|Button|Minimum width|Minimum height|Minimum margins|
|---|---|---|---|
|Apple Pay|100pt (100px @1x, 200px @2x)|30pt (30px @1x, 60px @2x)|1/10 of the button’s height|
|Book with Apple Pay|140pt (140px @1x, 280px @2x)|30pt (30px @1x, 60px @2x)|1/10 of the button’s height|
|Buy with Apple Pay||||
|Check out with Apple Pay||||
|Donate with Apple Pay||||
|Set up Apple Pay||||
|Subscribe with Apple Pay||||
