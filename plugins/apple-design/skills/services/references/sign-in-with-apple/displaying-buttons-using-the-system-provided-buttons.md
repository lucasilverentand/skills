# Using the system-provided buttons
When utilizing the system-provided APIs to implement a Sign in with Apple button, you gain several benefits:

- A button whose appearance is guaranteed to meet Apple's standards
- Assurance that the button's content maintains proper proportions regardless of style changes
- Automatic translation of the button title into the language set by the device
- Support for configuring the corner radius to match your UI's style (iOS, macOS, and web)
- A system-supplied alternative text label enabling VoiceOver to describe the button

For developer guidance, refer to [ASAuthorizationAppleIDButton](apple:AuthenticationServices/ASAuthorizationAppleIDButton) (iOS, macOS, and tvOS), [WKInterfaceAuthorizationAppleIDButton](apple:WatchKit/WKInterfaceAuthorizationAppleIDButton) (watchOS), and [Displaying Sign in with Apple buttons on the web](apple:signinwithapple/displaying-sign-in-with-apple-buttons-on-the-web). You may also visit [Sign in with Apple button](https://appleid.apple.com/signinwithapple/button) to view and adjust live previews of web-based buttons and obtain the code.

The system offers multiple variations for the button title. Select the variant that aligns with your sign-in experience's terminology and maintain consistency across all interfaces, depending on the platform where your content runs.

The following button titles are available for iOS, macOS, tvOS, and the web:

For watchOS, the system provides a single title:  Sign in.

Depending on the platform, up to three appearances are available for the Sign in with Apple button: white, black, and white with an outline. Select the appearance that complements the background on which the button is displayed.

##### White
The white rendition supports all platforms and the web. Apply this style when placed on dark backgrounds that offer adequate contrast.

##### White with outline
The white outlined style is supported across iOS, macOS, and web platforms. Employ this style when placed on white or light backgrounds where the button's white fill does not provide adequate contrast. Conversely, refrain from using this style on dark or saturated backgrounds, as the black outline may create visual clutter; instead, utilize the [white](#White) style to achieve proper contrast against a dark background.

##### Black
The black style is supported across all platforms and the web. Apply this style only when placed on white or light backgrounds that offer sufficient contrast; do not use it against black or dark surfaces.

Unlike the standard black "Sign in with Apple" button found on other platforms, the watchOS button utilizes a fill color that is not pure black. To ensure proper contrast against the Apple Watch's solid black background, the watchOS button employs the system-defined dark gray appearance.

##### Button size and corner radius
- **Adjust the corner radius to match the appearance of other buttons in your app.** By default, the Sign in with Apple button features rounded corners. Across iOS, macOS, and the web platforms, you have the ability to modify the corner radius to achieve either sharp/square corners or a capsule shape. For detailed developer instructions, refer to [cornerRadius](apple:AuthenticationServices/ASAuthorizationAppleIDButton/cornerRadius) (iOS and macOS) or [Displaying Sign in with Apple buttons on the web](apple:signinwithapple/displaying-sign-in-with-apple-buttons-on-the-web).
- **Maintain the minimum button size and margin around the button in iOS, macOS, and the web.** Note that the length of the button title may differ based on the selected locale. Use these dimensions as a guideline:

|Minimum width|Minimum height|Minimum margin|
|---|---|---|
|140pt (140px @1x, 280px @2x)|30pt (30px @1x, 60px @2x)|1/10 of the button’s height|
