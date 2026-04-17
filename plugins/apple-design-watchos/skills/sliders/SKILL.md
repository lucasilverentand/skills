---
name: sliders
description: "A slider consists of a horizontal track and a control, known as the thumb, which users manipulate to select a value between defined minimum and maximum points. Use when designing sliders for watchOS, auditing sliders against Apple's watchOS guidelines, or when the user says things like \"design sliders for Apple Watch\", \"sliders on watchOS\", \"how should sliders work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Sliders
A slider consists of a horizontal track and a control, known as the thumb, which users manipulate to select a value between defined minimum and maximum points

## When to use
- User asks about **sliders** on watchOS (e.g. `"how do I design sliders for Apple Watch"`).
- User is building an Apple Watch UI that needs sliders and wants to follow Apple's guidelines.
- User asks to audit or review sliders in a watchOS design.
- User mentions sliders in the context of an Apple Watch app, game, or interface.

As the slider's value is modified, the segment of the track between the minimum setting and the thumb becomes colored. Additionally, a slider may optionally include left and right icons to visually represent these minimum and maximum values.

### Best practices
- **Customize a slider’s appearance only when it enhances the user experience.** You have the option to modify different aspects of a slider—such as its track color, thumb image and tint, and associated left/right icons—to ensure visual harmony with your application and clearly convey its function. For instance, if the slider controls image dimensions, you might display a small image icon on the minimum side and a large image icon on the maximum side.
- **Maintain conventional slider orientation.** Users expect that sliders adhere to standard conventions across all applications: minimum values should reside on the leading side and maximum values on the trailing side for horizontal sliders, while vertical sliders place minimum values at the bottom and maximum values at the top. For example, a horizontal slider representing a percentage should conventionally range from 0 percent on the leading side to 100 percent on the trailing side.
- **Consider pairing a slider with a text field and stepper.** This is particularly important when the slider manages an extensive range of values. Providing a text field allows users to view the precise current value and input specific inputs, while adding a stepper offers a simple method for incrementing by whole units. For further guidance, refer to [Text fields](text-fields.md) and [Steppers](steppers.md).

## Platform guidance — watchOS
A slider is a horizontal track—which may appear as discrete steps or a continuous bar—that represents a finite range of values. Users can tap buttons on the slider's sides to increase or decrease its value by a predefined amount.

**If necessary, create custom glyphs to communicate what the slider does.** The system defaults to displaying plus and minus signs.
