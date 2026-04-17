# Managing accounts — full guidelines

### Best practices
- **Explain the benefits of creating an account and how to sign up.** If your application or game necessitates user accounts, provide a brief, friendly description explaining the requirement and its benefits. This message must be displayed within your sign-in view.
- **Delay sign-in for as long as possible.** Users often drop off when they are forced to authenticate before experiencing the core value of an application. To mitigate this, allow users to understand your app or game before requiring them to commit. For instance, a shopping application could allow browsing without restriction, only prompting sign-in when the user is ready to purchase.
- **If you don’t use Sign in with Apple in your iOS, iPadOS, macOS, or visionOS app, prefer using a passkey.** Passkeys streamline account setup and authentication by removing the need for users to create or manage passwords. When an app supports passkeys, users only need to provide their username during initial account creation or subsequent sign-ins. For developer guidance, consult [Supporting passkeys](apple:AuthenticationServices/supporting-passkeys). If you must continue using passwords for authentication, enhance security by implementing two-factor authentication (developer guidance available at [Securing Logins with iCloud Keychain Verification Codes](apple:AuthenticationServices/securing-logins-with-icloud-keychain-verification-codes)).
- **Always identify the authentication method you offer.** For example, if your app uses Face ID for sign-in, title the button using a phrase such as “Sign In with Face ID,” rather than a generic prompt like “Sign In.”
- **Refer only to authentication methods that are available in the current context.** Do not mention Face ID on a device that does not support it. Verify the device's capabilities and use precise terminology. For developer guidance, see [LABiometryType](apple:LocalAuthentication/LABiometryType).
- **In general, avoid offering an app-specific setting for opting in to biometric authentication.** Since users enable biometric authentication at the system level, providing an in-app setting is redundant and may cause confusion.

**Avoid using the term *passcode* to refer to account authentication.** Users establish a passcode to unlock their device or authenticate with Apple services. If you use this term in your interface, users might mistakenly believe they are being asked to reuse their device passcode within your app or game.

### Deleting accounts
If you facilitate account creation within your application or game, you must also provide assistance with its deletion, not merely deactivation. Beyond adhering to the guidelines below, ensure you are aware of and compliant with your region’s legal mandates concerning account removal and the right to erasure.

> **Important**
> If regulatory requirements necessitate that your app maintains accounts or data—such as digital health records—or follows a specific account deletion protocol, you must clearly detail this situation so users understand the information or accounts that must be retained and the procedure followed.

**Provide a straightforward mechanism for users to initiate account deletion within your app or game.** If users cannot perform the account deletion inside your application, you must supply a direct link to the webpage where this action can be completed. Ensure this link is easily discoverable; for instance, do not bury it within your Privacy Policy or Terms of Service documents.

> **Developer note**
> If users utilized [Sign in with Apple](sign-in-with-apple.md) to establish an account within your app, you must revoke the associated tokens when they delete their account. Refer to [Token revocation](apple:SigninwithAppleRESTAPI/Revoke-tokens).

- **Ensure a uniform account deletion experience, whether users initiate it within your app/game or on the website.** For example, avoid making one deletion flow significantly longer or more complex than the other.
- **Consider allowing users to schedule account deletion for a future date.** Users may appreciate the ability to utilize remaining services or wait until their subscription auto-renews before proceeding with deletion. If you offer a scheduling option, also provide the choice for immediate deletion.
- **Inform users when account deletion will be complete, and notify them upon its conclusion.** Since the full deletion process can sometimes require time, it is crucial to keep users updated on the status of the deletion so they know what to expect.
- **If you support in-app purchases, help users understand how billing and cancellation function upon account deletion.** For instance, you may need to clarify the following scenarios:
- Billing for an auto-renewable subscription continues through Apple until the user cancels the subscription, regardless of whether they delete their account.
- After the account is deleted, users must cancel their subscription or request a refund.

In addition to clarifying these scenarios, provide information detailing how to cancel subscriptions and manage purchases. For guidance, consult [Helping people manage their subscriptions](in-app-purchase.md#Helping-people-manage-their-subscriptions) and [Providing help with in-app purchases](in-app-purchase.md#Providing-help-with-in-app-purchases).

> **Note**
> Even if users did not use your app to purchase the subscription, you are still responsible for supporting account deletion.

### TV provider accounts
Many major TV providers allow users to sign in to their accounts at the system level, which removes the need for authentication on an application-by-application basis. Should your TV provider app require users to sign in, employ TV Provider Authentication to deliver the most efficient onboarding experience.

- **Do not display a sign-out option when users are logged in at the system level.** If your application must include a sign-out feature, triggering it should prompt users to navigate to Settings > TV Provider to log out of their account.
- **Never instruct users to sign out by adjusting privacy controls.** The TV provider settings located in Settings > Privacy are not a sign-out mechanism. These configurations assist users in managing which applications can access their TV provider account.

## Platform guidance — tvOS
Since most users interact with Apple TV via remote control rather than keyboard, request only the absolute minimum amount of information required.

- **Prefer letting people use another device to sign up or authenticate.** When setting up your app’s associated domains, Apple TV can collaborate with other devices to securely suggest sign-in credentials, including [Sign in with Apple](sign-in-with-apple.md). For detailed developer instructions, consult [Configuring an associated domain](apple:Xcode/configuring-an-associated-domain).
- **When people are signed in to a shared account, avoid asking them to choose their profile every time they become the current user.** In tvOS 16 and later, your app has the capability to share its credentials across all users while maintaining separate storage for each individual’s profile and data. If you support this type of shared access, your application can automatically utilize the current user’s profile without requiring each person to individually sign into a shared account. For developer guidance, refer to [kSecUseUserIndependentKeychain](apple:Security/kSecUseUserIndependentKeychain) and [User Management Entitlement](apple:BundleResources/Entitlements/com.apple.developer.user-management).
- **Minimize data entry.** If gathering a substantial amount of information is necessary, direct users to complete the process on a website using another device. If you require an email address, display the email keyboard screen, which includes a list of previously entered addresses.
