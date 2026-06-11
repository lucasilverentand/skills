# Gauges
A gauge displays a precise numerical value constrained by a defined range

## Platform guidance — macOS
Beyond supporting gauges, macOS also defines a level indicator that displays a specific numerical value within a defined range. This indicator can be configured to communicate capacity, rating, or, less frequently, relevance.

The capacity mode supports both discrete and continuous value depictions.

- **Continuous.** This uses a horizontal, translucent track that is filled by a solid bar to represent the current value.
- **Discrete.** This employs a horizontal arrangement of distinct, equally sized rectangular segments. The number of these segments corresponds to the total capacity, and they must fill entirely—never partially—with color to indicate the current value.
- **For large ranges, consider utilizing the continuous style.** A wide range of values may render the segments in a discrete capacity indicator too small to be functionally useful.
- **Consider altering the fill color to alert users about significant parts of the range.** By default, both capacity indicator styles use green for the fill color. If appropriate for your application, you may change the fill color when the current value reaches specific thresholds (such as very low, very high, or just past the midpoint). You can either change the fill color of the entire indicator or employ a tiered state to display a sequence of colors within one indicator, as illustrated below.

For guidance on using the rating style to help users rank items, refer to **Rating indicators**.

Although uncommon, the relevance style communicates relevancy using a shaded horizontal bar. For instance, in a list of search results, a relevance indicator can help users visualize the relevancy when sorting or comparing multiple entries.
