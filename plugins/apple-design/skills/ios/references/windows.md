# Windows
A window displays the user interface views and components within your application or game

## Platform guidance — iOS & iPadOS
The application can appear in one of two modes, depending on the user's selection within Multitasking & Gestures settings.

- **Full screen.** The application fills the entire display, and users switch between it—or between different windows of the same app—using the application switcher.
- **Windowed.** Users have full control over resizing the application windows. Multiple windows can be visible simultaneously, and users can arrange or bring them to the foreground. The system retains the window's size and placement even after the app has been closed.
- **Ensure that window controls do not obscure toolbar elements.** When operating in windowed mode, app windows include window controls along the leading edge of the toolbar. If your application features buttons at this leading edge, they may become hidden when window controls appear. To prevent this issue, move these buttons inward rather than placing them directly on the leading edge where window controls reside.
- **Consider allowing users to open content in a new window via a gesture.** For instance, a user might use the pinch gesture to expand a Notes item into its own window. For developer guidance, refer to [collectionView(_:sceneActivationConfigurationForItemAt:point:)](apple:UIKit/UICollectionViewDelegate/collectionView(_:sceneActivationConfigurationForItemAt:point:)) (to handle the transition from a collection view item) or [UIWindowScene.ActivationInteraction](apple:UIKit/UIWindowScene/ActivationInteraction) (for transitions originating from any other view item).

> **Tip**
> If your application only needs to allow users to view a single file, you can present it without creating a dedicated window, provided that your app still supports multiple windows. For developer guidance on this approach, see [QLPreviewSceneActivationConfiguration](apple:QuickLook/QLPreviewSceneActivationConfiguration).
