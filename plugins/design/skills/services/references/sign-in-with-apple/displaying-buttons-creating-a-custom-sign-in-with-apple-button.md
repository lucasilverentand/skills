# Creating a custom Sign in with Apple button
If your application requires it, you have the option to create a customized Sign in with Apple button for iOS, macOS, or web implementations. For instance, you might wish to align logos across several sign-in buttons, utilize buttons displaying only a logo, or modify the button’s font, bezel, or background to match your UI.

It is crucial that users can immediately recognize your custom button as a Sign in with Apple button. If your customization deviates too significantly from the standard version, users might hesitate to use it for account setup or sign-in. App Review scrutinizes all custom Sign in with Apple buttons.

[Apple Design Resources](https://developer.apple.com/design/resources/) offers downloadable Apple logo artwork that you can use to construct custom Sign in with Apple buttons displaying either a logo alone or a logo alongside text. The logo files are available in PNG, SVG, and PDF formats, and the artwork for both button types includes black and white versions. Examples of the black and white logo-only art files are provided below, each with a background added for visibility.

All downloadable logo files include padding to simplify the placement of the logo within a button. Logo-only files feature both horizontal and vertical padding, ensuring the logo maintains the correct proportion relative to the button. Additionally, logo files intended for buttons with text include horizontal padding that establishes a minimum margin between the logo and the button’s leading edge and title.

Only use the logo artwork downloaded from [Apple Design Resources](https://developer.apple.com/design/resources/); never generate a custom Apple logo. When creating your custom Sign in with Apple button, adhere to these guidelines regarding the use of the downloaded logo file:

- Utilize the logo file to place the Apple logo within a button; never use the Apple logo itself as a button.
- Match the height of the logo file to the height of the button.
- Do not crop the logo file.
- Do not add vertical padding.

To ensure your custom button maintains visual consistency with the system-provided Sign in with Apple button, do not alter these attributes:

- Titles. Use exclusively *Sign in with Apple*, *Sign up with Apple*, or *Continue with Apple*.
- General shape. Buttons combining the logo and text must always be rectangular; logo-only buttons may be circular or rectangular.
- Logo and title colors. Within the button, both elements must be either black or white; custom colors are prohibited.

You may modify the following attributes to coordinate with your app’s design:

- Title font. You are also permitted to adjust the font's weight and size.
- Title case. You may capitalize every letter in the title.
- Background appearance. The overall color must remain black or white. If needed, you may incorporate a subtle texture or gradient to help the button harmonize with your interface.
- Button corner radius. You can select a corner radius value that matches other buttons in your UI.
- Button bezel and shadow. For example, you can use a stroke to highlight the button bezel or apply a drop shadow.

##### Custom buttons with a logo and text
- **Select the logo file format based on your button's height.** Since both SVG and PDF are vector formats, they can be used in buttons of any dimension. PNG files should only be utilized for buttons that are 44 points high, which is the default and recommended iOS button height. Logos are available in small, medium, and large sizes to ensure consistency across all displayed sign-up buttons.
- **Use the system font for the title — such as Sign in with Apple, Sign up with Apple, or Continue with Apple.** Regardless of the font chosen, your custom button's title and height must maintain the same proportions as the system implementation. For instance, if you use the system font, the title's font size should account for 43% of the button's total height—meaning the button's height must be 233% of the title’s font size, rounded to the nearest whole number. The following examples illustrate these proportions using different system font sizes.
- **Generally, maintain the title's existing capitalization style.** By default, all button title variants capitalize the first word (*Sign* or *Continue*) and *Apple*; all other letters remain lowercase. Do not alter this style unless your interface exclusively uses uppercase text.
- **Ensure the title and logo are vertically aligned within the button.** To achieve this, center the title within the button's vertical axis and then add the logo image, ensuring its height matches the button's height. Since the logo image includes inherent top and bottom padding, vertically centering the title guarantees proper alignment among the title, logo, and button.
- **Inset the logo if required.** If horizontal alignment of the Apple logo with other authentication logos is necessary, you may adjust the spacing between the logo and the button's leading edge.
- **Maintain a minimum margin between the title and the right edge of the button.** This margin must be at least 8% of the button's total width.
- **Adhere to minimum button size and surrounding margins.** Keep in mind that the title length may vary based on the locale. Use these values as guidelines:

|Minimum width|Minimum height|Minimum margin|
|---|---|---|
|140 pt (140 px @1x, 280 px @2x)|30 pt (30 px @1x, 60 px @2x)|1/10 of the button’s height|

##### Custom logo-only buttons
- **Select the appropriate logo file format according to your button's dimensions.** The downloadable artwork for logo-only buttons is available in SVG, PDF, and PNG formats. For buttons of any size, utilize the vector formats (SVG or PDF); reserve the PNG format exclusively for buttons sized at 44x44 pt.
- **Do not introduce horizontal padding to a logo-only image.** A logo-only Sign in with Apple button maintains a 1:1 aspect ratio, and the supplied artwork already includes the correct padding on all sides.
- **Apply a mask if you wish to alter the default square shape of the logo-only image.** For example, you may choose a circular or rounded rectangular form to present all logo-only sign-in buttons. Never crop the Apple-provided artwork to decrease its inherent padding, nor should you use the logo by itself or include additional padding.
- **Preserve a minimum surrounding margin for the button.** Ensure this margin measures at least one-tenth (1/10) of the button’s height.
