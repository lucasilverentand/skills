---
name: workouts
description: "A high-quality fitness or workout experience motivates users to engage with their activity and allows them to track their progress using their devices. Use when designing workouts for watchOS, auditing workouts against Apple's watchOS guidelines, or when the user says things like \"design workouts for Apple Watch\", \"workouts on watchOS\", \"how should workouts work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Workouts
A high-quality fitness or workout experience motivates users to engage with their activity and allows them to track their progress using their devices

## When to use
- User asks about **workouts** on watchOS (e.g. `"how do I design workouts for Apple Watch"`).
- User is building an Apple Watch UI that needs workouts and wants to follow Apple's guidelines.
- User asks to audit or review workouts in a watchOS design.
- User mentions workouts in the context of an Apple Watch app, game, or interface.

Users may wear the Apple Watch during different workouts, or they might carry an iPhone or iPad while performing activities like running, walking, or wheelchair pushing. In contrast, larger or stationary devices such as the iPad Pro, Mac, and Apple TV are typically used for participating in live or recorded workout sessions, whether individually or with others.

You can develop a fitness experience for the Apple Watch, iPhone, or iPad that assists users in reaching their goals by leveraging activity data from the device and displaying fitness metrics using familiar components.

### Best practices
- **In a watchOS fitness app, use workout sessions to provide useful data and relevant controls.** During an active workout session within a fitness app, watchOS maintains the app display between wrist raises. Therefore, it is crucial to present the workout data users are most likely to need. For instance, display elapsed or remaining time, calories burned, or distance covered, and offer pertinent controls such as lap or interval markers.
- **Avoid distracting people from a workout with information that’s not relevant.** While exercising, users should not be prompted to review the list of available workouts or navigate to other parts of your application. The following arrangement is common among many watchOS workout applications, including Workout:
- **Use a distinct visual appearance to indicate an active workout.** Users appreciate being able to recognize an ongoing session immediately during a workout. The metrics page serves as an effective way to signal activity because its values update in real time. In addition to displaying these dynamic values, you can further differentiate the metrics screen through a unique layout.
- **Provide workout controls that are easy to find and tap.** Beyond making it simple to pause, resume, or terminate a workout, ensure you provide clear feedback indicating when a session begins or ends.
- **Help people understand the health information your app records if sensor data is unavailable during a workout.** For example, water may prevent heart-rate measurement, but your app can still log data such as the distance swam and calories burned. If your app supports the *Swimming* or *Other* workout types, explain this situation using language consistent with the system-provided Workout app, as shown below:

||Example text from the Workout app|||
|---|---|---|---|
|✓|GPS is not used during a Pool Swim, and water may prevent a heart-rate measurement, but Apple Watch will still track your calories, laps, and distance using the built-in accelerometer.|||
|✓|In this type of workout, you earn the calorie equivalent of a brisk walk anytime sensor readings are unavailable.|||
|✓|GPS will only provide distance when you do a freestyle stroke. Water might prevent a heart-rate measurement, but calories will still be tracked using the built-in accelerometer.|||

- **Provide a summary at the end of a session.** A summary screen confirms workout completion and displays all recorded information. Consider enhancing this summary by including Activity rings, allowing users to quickly review their current progress.
- **Discard extremely brief workout sessions.** If a session concludes shortly after it began, either automatically discard the data or prompt users regarding whether they wish to save it as a workout.
- **Make sure text is legible for when people are in motion.** When movement is required during a session, utilize large font sizes, high-contrast colors, and arrange text so that the most critical information is easily readable.
- **Use Activity rings correctly.** The Activity rings view is an Apple-designed component featuring one or more rings whose colors and meanings align with those in the Activity app. Use them strictly for their documented purpose.
