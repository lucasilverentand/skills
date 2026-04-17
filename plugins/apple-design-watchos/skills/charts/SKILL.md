---
name: charts
description: "Organize data in a chart to communicate information with clarity and visual appeal. Use when designing charts for watchOS, auditing charts against Apple's watchOS guidelines, or when the user says things like \"design charts for Apple Watch\", \"charts on watchOS\", \"how should charts work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Charts
Organize data in a chart to communicate information with clarity and visual appeal

## When to use
- User asks about **charts** on watchOS (e.g. `"how do I design charts for Apple Watch"`).
- User is building an Apple Watch UI that needs charts and wants to follow Apple's guidelines.
- User asks to audit or review charts in a watchOS design.
- User mentions charts in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Select a mark type based on the information you intend to convey about your data** — Bar, line, and point are among the most common mark types; for developer guidance on these and other options, refer to [Swift…
- **Consider combining mark types when it enhances your chart's clarity** — For instance, if you use a line chart to track change over time, adding point marks on top of the line can…
- **Select a fixed or dynamic axis range based on the chart's intended meaning** — In a *fixed* range, the upper and lower limits of the axis remain constant
- **Determine the lower bound value according to the mark type and how the chart is used** — For example, bar charts function effectively when zero is used for the Y axis lower bound, as this allows users to visually…
- **Favor common numerical sequences in the axis tick and grid-line labels** — For example, if a standard number sequence like 0, 5, 10 is used, users are likely to instantly understand that each tick…
- **Adjust the appearance of grid lines and labels to match the chart's specific use case** — Too many grid lines can overwhelm the visual field, distracting users from the data; conversely, too few may make it difficult to…
- **Provide descriptions that allow users to understand the chart's function prior to viewing it** — By including titles and labels rich with information that detail a chart’s purpose and functionality, you establish the necessary context before users…
- **Condense your chart’s main takeaway to enhance accessibility and usability for all users** — While a chart's primary role is presenting the data supporting its central message, it is crucial to summarize key findings so that…
- **Establish a consistent visual hierarchy that helps communicate the relative importance of different chart elements** — The data itself should typically be the most prominent element, while descriptions and axes provide secondary context without competing with the data
- **In a compact environment, maximize the width of the plot area to give people enough space to comfortably examine a chart** — To accommodate important data within a limited width, ensure vertical axis labels are as concise as possible while maintaining clarity
- **Make every chart in your app accessible** — Charts, like all visual infographics, must be fully accessible to users regardless of how they perceive content
- **Let people interact with the data when it makes sense, but don’t require interaction to reveal critical information** — In a Stocks application, for example, users are often most interested in performance trends over time

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/anatomy.md
- @references/marks.md
- @references/axes.md
- @references/descriptive-content.md
- @references/best-practices.md
- @references/color.md
- @references/enhancing-the-accessibility-of-a-chart.md
- @references/platform-guidance-watchos.md
