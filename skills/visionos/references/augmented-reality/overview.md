# Augmented reality — overview
**Only offer AR features on devices that support them.** If your app's core function is AR, restrict its availability solely to hardware compatible with ARKit. If your app incorporates features that require specific AR functionalities, or if AR is merely an optional component of the app, do not present an error message when a user attempts to access these features on unsupported hardware; instead, simply ensure the feature is not offered on incompatible devices. For developer guidance, see [Verifying Device Support and User Permission](apple:ARKit/verifying-device-support-and-user-permission).

> **Note**
> This guidance applies to applications running on iOS and iPadOS. To learn how to utilize ARKit for creating immersive augmented reality experiences in visionOS, refer to [ARKit](apple:ARKit).
