# Visual design
**Select a ring or gauge style based on the data you intend to display.** Many applications utilize a ring or gauge layout, offering consistent ways to represent numerical data that evolves over time. For instance:

- The closed style is suited for conveying a value as a percentage of a total, such as when tracking battery levels.
- The open style is effective when the minimum and maximum values are arbitrary—or do not represent a percentage of the whole—like in speed indicators.
- Similar to the open style, the segmented style also displays values within a defined app range and can effectively communicate rapid changes in value, such as seen in the Noise complication.

**Ensure visuals render correctly in tinted mode.** In tinted mode, the system applies a solid color to a complication’s text, gauges, and images, and desaturates full-color visuals unless tinted versions are provided. For developer guidance on this process, refer to [WidgetRenderingMode](apple:WidgetKit/WidgetRenderingMode). (If using legacy templates, tinted mode only affects graphic complications.) To optimize complication performance in tinted mode:

- Do not rely solely on color to convey critical information. The user must receive the same information in tinted mode as they do in full color.
- When required, supply an alternative tinted-mode version of a full-color image. If your original full-color image degrades when desaturated, you can provide a different version for the system to use in tinted mode.
- **Understand that users may prefer using tinted mode over viewing complications in full color.** When a user activates tinted mode, the system automatically converts your complication to grayscale and applies a single color tint to its images, gauges, and text, based on the wearer's selected color.
- **When creating complication content, generally use line widths of two points or greater.** Thinner lines can be difficult to discern quickly, particularly if the wearer is moving. Use line weights appropriate for the image's size and complexity.
- **Provide a set of static placeholder images for every complication you support.** The system displays these placeholder images when there is no other content available for your complication’s data. For example, upon initial app installation, the system may show a static placeholder while it checks if your app can generate a localized replacement. Placeholder images may also appear in the carousel from which users select complications. Note that complication image sizes vary depending on the layout (and legacy template), and a placeholder image size may not match the actual image size you supply for that complication. For developer guidance, see [placeholder(in:)](apple:WidgetKit/TimelineProvider/placeholder(in:)).
