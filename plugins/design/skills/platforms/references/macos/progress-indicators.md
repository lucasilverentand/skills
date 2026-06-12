# Progress indicators
Progress indicators inform users that your application is actively working, rather than being frozen, while it loads content or executes lengthy processes

## Platform guidance — macOS
In macOS, indeterminate progress indicators can appear as either a bar or a circular animation. Both styles utilize an animated image to signal that the application is currently executing a task.

- **Prefer an activity indicator (spinner) when communicating the status of a background operation or when screen space is limited.** Spinners are small and subtle, making them ideal for asynchronous background tasks, such as fetching messages from a server. They are also suitable for conveying progress within small areas, like inside a text field or adjacent to a specific control such as a button.
- **Avoid labeling a spinning progress indicator.** Since the spinner typically appears after the user initiates a process, a label is usually redundant.
