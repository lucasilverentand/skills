# Pointing devices — full guidelines — overview

### Best practices
- **Maintain consistency in how you respond to mouse and trackpad gestures.** Users anticipate that most gestures will function identically across the entire system, irrespective of whether they are using a specific application or game. For instance, Mac users rely on the "Swipe between pages" gesture to behave uniformly when navigating document pages, web pages, or images.
- **Do not redefine system-level trackpad gestures.** Even if your game utilizes app-specific gestures in a unique manner, users still expect systemwide gestures to be functional; for example, they assume familiar gestures will reveal the Dock or Mission Control in macOS. Keep in mind that Mac users have options to customize gestures for system actions.
- **Ensure a uniform experience within your application, regardless of whether users are interacting via gestures, gaze, a pointing device, or a keyboard.** Users expect to transition smoothly between different input types and should not have to learn different interactions depending on the mode or application they are using.
- **Allow users to employ the pointer to reveal and conceal controls that automatically minimize or fade.** For example, in iPadOS, users can bring up the minimized Safari toolbar by hovering the pointer over it (the toolbar minimizes again when the pointer moves away). Similarly, users can use the pointer to show or hide playback controls while viewing a full-screen video.
- **Deliver predictable behavior when users press and hold a modifier key while manipulating objects in your app.** For instance, if holding the Option key duplicates an object during a drag operation, ensure that this outcome is identical whether the user performs the drag using touch or the pointer.

## Platform guidance — macOS
macOS provides a wide array of standard mouse and trackpad interactions that users can configure. For instance, if a click or gesture is not the primary method for interacting with content, users may toggle its availability based on their current workflow. Additionally, users can designate specific regions of the mouse or trackpad to invoke secondary clicks and select particular finger combinations or movements for different gestures.

|Click or gesture|Expected behavior|Mouse|Trackpad|
|---|---|---|---|
|Primary click|Select or activate an item, such as a file or button.|●|●|
|Secondary click|Reveal contextual menus.|●|●|
|Scrolling|Move content up, down, left, or right within a view.|●|●|
|Smart zoom|Zoom in or out on content, such as a web page or PDF.|●|●|
|Swipe between pages|Navigate forward or backward between individually displayed pages.|●|●|
|Swipe between full-screen apps|Navigate forward or backward between full-screen apps and spaces.|●|●|
|Mission Control (double-tap the mouse with two fingers or swipe up on the trackpad with three or four fingers)|Activate Mission Control.|●|●|
|Lookup and data detectors (force click with one finger or tap with three fingers)|Display a lookup window above selected content.||●|
|Tap to click|Perform the primary click action using a tap rather than a click.||●|
|Force click|Click then press firmly to display a Quick Look window or lookup window above selected content. Apply a variable amount of pressure to affect pressure-sensitive controls, such as variable speed media controls.||●|
|Zoom in or out (pinch with two fingers)|Zoom in or out.||●|
|Rotate (move two fingers in a circular motion)|Rotate content, such as an image.||●|
|Notification Center (swipe from the edge of the trackpad)|Display Notification Center.||●|
|App Exposé (swipe down with three or four fingers)|Display the current app’s windows in Exposé.||●|
|Launchpad (pinch with thumb and three fingers)|Display the Launchpad.||●|
|Show Desktop (spread with thumb and three fingers)|Slide all windows out of the way to reveal the desktop.||●|
