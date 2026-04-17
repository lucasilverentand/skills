---
name: gyro-and-accelerometer
description: "On-device gyroscopes and accelerometers provide information regarding a device's physical movement. Use when designing gyro and accelerometer for watchOS, auditing gyro and accelerometer against Apple's watchOS guidelines, or when the user says things like \"design gyro and accelerometer for Apple Watch\", \"gyro and accelerometer on watchOS\", \"how should gyro and accelerometer work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Gyroscope and accelerometer
On-device gyroscopes and accelerometers provide information regarding a device's physical movement

## When to use
- User asks about **gyro and accelerometer** on watchOS (e.g. `"how do I design gyro and accelerometer for Apple Watch"`).
- User is building an Apple Watch UI that needs gyro and accelerometer and wants to follow Apple's guidelines.
- User asks to audit or review gyro and accelerometer in a watchOS design.
- User mentions gyro and accelerometer in the context of an Apple Watch app, game, or interface.

You can leverage accelerometer and gyroscope data to offer experiences in iOS, iPadOS, and watchOS applications and games that are driven by real-time motion information. tvOS apps may utilize gyroscope data sourced from the Siri Remote. For detailed developer instructions, consult [Core Motion](apple:CoreMotion).

### Best practices
**Only utilize motion data when it provides a clear, practical advantage to the user.** For example, a fitness application could use this information to offer insights into activity levels and overall well-being, or a game might leverage it to improve the playing experience. Do not collect this data merely for accumulation.

> **Important**
> If your application requires access to the device's motion data, you are obligated to supply explanatory text. When your app or game attempts to access this data type for the first time, the system incorporates your text into a permission prompt, allowing users to approve or decline access.

**Do not use accelerometers or gyroscopes to directly manipulate the interface outside of active gameplay.** Certain motion-based gestures might be challenging to reproduce accurately, could pose physical difficulties for some users, and may negatively impact battery life.
