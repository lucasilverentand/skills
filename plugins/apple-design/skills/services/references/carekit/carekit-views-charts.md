# Charts
Chart views allow you to present data and trends graphically, helping users visualize their progress within a care plan. CareKit chart views can display both current and historical information, automatically updating as new data arrives.

In CareKit 2.0, CareKit UI offers three chart types: bar, scatter, and line. For each type, you must provide a descriptive title and subtitle, define axis markers (such as days of the week), and specify the data set.

- **Consider highlighting narratives and trends to illustrate progress.** For instance, your application could use a bar chart correlating the frequency of medication intake with reported pain levels. Presenting such information encourages improved adherence to a care plan.
- **Label chart elements clearly and succinctly.** Overly long or detailed labels hinder readability and comprehension. Keep labels brief and avoid redundancy. For example, a heart rate chart might use *BPM* in an axis label rather than repeating it for every data point.
- **Use distinct colors.** Generally, avoid using different shades of the same color to convey differing meanings. Also, ensure that colors provide adequate contrast. For related guidance, consult **Accessibility**.
- **Consider providing a legend to add clarity.** If the colors you employ represent different data types that are not immediately obvious, include a legend that describes them clearly and concisely.
- **Clearly denote units of time.** Users must know whether time-based data is measured in seconds, minutes, hours, days, weeks, months, or years. If you choose not to include this information in individual data value labels, include it in an axis label or another location on the chart.
- **Consolidate large data sets for greater readability.** Presenting a vast amount of data can render a chart illegible due to the small size of individual data points or excessive visible information. Seek methods to group and organize data for maximum clarity and simplicity.
- **If necessary, offset data to keep charts proportional.** Very small data points can become lost or unreadable when presented alongside very large ones. If there is a significant difference between data points, find ways to offset or restructure the data so that all points remain readable.

For developer guidance, see [CareKit > Chart Interfaces](https://carekit-apple.github.io/CareKit/documentation/carekit/chart-interfaces). To learn about ResearchKit charts, see the [ResearchKit GitHub project](https://github.com/ResearchKit/ResearchKit).
