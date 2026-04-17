# Preserving privacy
App Clips operate under constraints designed to protect user privacy. For instance, App Clips are restricted from performing background tasks. Developers seeking guidance should consult [Choosing the right functionality for your App Clip](apple:AppClip/choosing-the-right-functionality-for-your-app-clip).

- **Limit the amount of data you store and handle yourself.** If your application needs to retain user information—such as login credentials—it must be stored securely. Furthermore, do not assume the availability of data previously saved on the device, as the system may have removed the App Clip between launches and subsequently deleted all its data. If you store login details, they must be kept securely off the device.
- **Consider offering Sign in with Apple.** This method allows login information to be securely maintained off the user's device, thereby preserving their privacy. For detailed instructions, refer to [Sign in with Apple](sign-in-with-apple.md).
- **Offer a secure way to pay for services or goods that also respects people’s privacy.** For example, you might integrate [Apple Pay](apple-pay.md).
