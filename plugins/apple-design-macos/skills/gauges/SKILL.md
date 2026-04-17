---
name: gauges
description: "A gauge displays a precise numerical value constrained by a defined range. Use when designing gauges for macOS, auditing gauges against Apple's macOS guidelines, or when the user says things like \"design gauges for Mac\", \"gauges on macOS\", \"how should gauges work on Mac\"."
allowed-tools: Read Grep Glob
---

# Gauges
A gauge displays a precise numerical value constrained by a defined range

## When to use
- User asks about **gauges** on macOS (e.g. `"how do I design gauges for Mac"`).
- User is building a Mac UI that needs gauges and wants to follow Apple's guidelines.
- User asks to audit or review gauges in a macOS design.
- User mentions gauges in the context of a Mac app, game, or interface.

In addition to indicating the current reading within its bounds, a gauge has the capability to offer supplementary context about the range itself. For example, a temperature gauge may use text labels to identify the highest and lowest temperatures in the range while simultaneously employing a color spectrum to visually reinforce shifts in value.

### Anatomy
A gauge represents a range of values by mapping them to a specific point along either a circular or linear path. A standard gauge displays the current value's location via an indicator, whereas a capacity-style gauge uses a fill that reaches the corresponding point on the path.

Circular and linear gauges, available in both standard and capacity configurations, also include an accessory variant. This version visually resembles watchOS complications and is ideal for iOS Lock Screen widgets or any context requiring a complication-like appearance.

> **Note**
> Besides gauges, macOS also supports level indicators, some of which share visual characteristics with gauges. Refer to [macOS](#macOS) for detailed guidance.

### Best practices
- **Provide brief labels indicating the current reading and both extremes of the scale.** While not every gauge style displays all labels, VoiceOver reads the visible ones to assist users in understanding the gauge without needing visual confirmation.
- **Consider filling the path with a gradient to help communicate the gauge's purpose.** For example, a temperature display could use colors that shift from red to blue to represent temperatures spanning hot to cold.

## Platform guidance — macOS
Beyond supporting gauges, macOS also defines a level indicator that displays a specific numerical value within a defined range. This indicator can be configured to communicate capacity, rating, or, less frequently, relevance.

The capacity mode supports both discrete and continuous value depictions.

- **Continuous.** This uses a horizontal, translucent track that is filled by a solid bar to represent the current value.
- **Discrete.** This employs a horizontal arrangement of distinct, equally sized rectangular segments. The number of these segments corresponds to the total capacity, and they must fill entirely—never partially—with color to indicate the current value.
- **For large ranges, consider utilizing the continuous style.** A wide range of values may render the segments in a discrete capacity indicator too small to be functionally useful.
- **Consider altering the fill color to alert users about significant parts of the range.** By default, both capacity indicator styles use green for the fill color. If appropriate for your application, you may change the fill color when the current value reaches specific thresholds (such as very low, very high, or just past the midpoint). You can either change the fill color of the entire indicator or employ a tiered state to display a sequence of colors within one indicator, as illustrated below.

For guidance on using the rating style to help users rank items, refer to [Rating indicators](rating-indicators.md).

Although uncommon, the relevance style communicates relevancy using a shaded horizontal bar. For instance, in a list of search results, a relevance indicator can help users visualize the relevancy when sorting or comparing multiple entries.
