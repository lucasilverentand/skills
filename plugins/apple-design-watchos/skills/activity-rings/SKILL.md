---
name: activity-rings
description: "Activity rings visually represent an individual's daily advancement toward their Move, Exercise, and Stand objectives. Use when designing activity rings for watchOS, auditing activity rings against Apple's watchOS guidelines, or when the user says things like \"design activity rings for Apple Watch\", \"activity rings on watchOS\", \"how should activity rings work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Activity rings
Activity rings visually represent an individual's daily advancement toward their Move, Exercise, and Stand objectives

## When to use
- User asks about **activity rings** on watchOS (e.g. `"how do I design activity rings for Apple Watch"`).
- User is building an Apple Watch UI that needs activity rings and wants to follow Apple's guidelines.
- User asks to audit or review activity rings in a watchOS design.
- User mentions activity rings in the context of an Apple Watch app, game, or interface.

In watchOS, the Activity ring element is always composed of three rings; their colors and significance correspond exactly to those provided by the Activity application. In iOS, the Activity ring element may display either a single Move ring (serving as an activity approximation) or all three rings, contingent upon pairing with an Apple Watch.

### Best practices
- **Display Activity rings when they are relevant to your app's purpose.** If your application pertains to health or fitness, and particularly if it contributes data to HealthKit, users generally expect to encounter Activity rings within your interface. For instance, if you structure a workout or health session around completing Activity rings, consider presenting the element on a workout metrics screen so users can monitor their advancement during the session. Similarly, if you offer a summary screen upon completing a workout, Activity rings can be displayed to assist users in reviewing their journey toward daily objectives.
- **Restrict the use of Activity rings solely to Move, Exercise, and Stand data.** Since Activity rings are specifically engineered to consistently represent progress in these particular domains, do not replicate or modify them for any other function. Never utilize Activity rings to convey different types of data. Furthermore, never display Move, Exercise, or Stand progress using any other ring-like component.
- **Utilize Activity rings to track the progress of a single individual.** Never employ Activity rings to represent data for more than one person, and ensure whose progress is being shown by including a label, photograph, or avatar.
- **Maintain the identical visual appearance of Activity rings wherever they are shown.** Adhere to these guidelines to ensure a consistent user experience:
- Never alter the rings' colors; for example, do not apply filters or modify opacity.
- Always present Activity rings against a black background.
- Prefer to contain the rings and their background within a circular shape. Achieve this by adjusting the corner radius of the container view rather than applying a circular mask.
- Ensure that the black background remains visible around the outermost ring. If necessary, add a thin, black stroke along the outer edge of the ring, and refrain from including gradients, shadows, or any other visual effects.
- Always scale the rings appropriately so they appear integrated and correctly sized.
- When necessary, design the surrounding interface to harmonize with the rings; never modify the rings to match the surrounding interface.

**When displaying a label or value directly linked to an Activity ring, use matching colors.** To display the ring-specific labels (*Move*, *Exercise*, and *Stand*), or to show a person's current and goal values for each ring, use the following colors, specified as RGB values.

|Move|Exercise|Stand|
|---|---|---|
||||

- **Observe Activity ring margins.** An Activity ring element requires a minimum outer margin equal to or greater than the distance between rings. Never permit any other elements to crop, block, or invade this margin or the rings themselves.
- **Distinguish other ring-like elements from Activity rings.** Mixing different ring styles can result in a visually confusing interface. If you must include other rings, use padding, lines, or labels to clearly separate them from Activity rings. Color and scale can also aid in providing visual distinction.
- **Do not send notifications that repeat information provided by the Activity app.** Since the system already delivers updates on Move, Exercise, and Stand progress, it is confusing for users to receive redundant information from your app. Furthermore, do not include an Activity ring element within your app’s notifications. While it is acceptable to reference Activity progress in a notification, do so in a manner unique to your app that does not duplicate the information provided by the system.
- **Do not use Activity rings purely for decoration.** Activity rings convey information to users; they are not merely decorative elements in your app's design. Never display Activity rings within labels or background graphics.
- **Do not use Activity rings for branding.** Reserve Activity rings strictly for displaying Activity progress within your app. Never incorporate Activity rings into your app’s icon or marketing materials.
