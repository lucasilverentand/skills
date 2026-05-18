# Anatomy
A chart integrates different graphical components that depict dataset values and communicate information derived from them.

A *mark* is a visual representation of a data value. You construct a chart by providing one or more series of data values, assigning each value to a mark. To specify the desired chart visualization—such as bar chart, line chart, or scatter plot—you select a mark type (bar, line, or point) (refer to [Marks](#Marks) for guidance). The overall process of representing individual data values in a chart is called *plotting*, and the region containing these marks is referred to as the *plot area*.

To represent a value, each mark type employs visual attributes determined by a scale. This scale maps data values (like numbers, dates, or categories) to visual characteristics (such as position, color, or height). For example, a bar mark might use its specific height to represent the magnitude of a value and its position to denote when that value occurred.

To provide users with the context needed to interpret a chart’s visual characteristics, you must supply descriptive content across many formats.

You can utilize an *axis* to establish a frame of reference for the data represented by a set of marks. Many charts display a pair of axes at the plot area's edges—one horizontal and one vertical—where each axis represents a variable like amount, category, or time.

An axis may include *ticks*, which serve as reference points helping users visually locate important values along the axis (e.g., 0, 50%, and 100%). Many charts also display *grid lines* that extend from a tick across the plot area, allowing users to visually estimate a data value when its mark is not adjacent to an axis.

Furthermore, there are multiple ways to describe chart elements to assist interpretation and highlight key information. For instance, you can include *labels* that name components such as axes, grid lines, ticks, or marks, and *accessibility labels* that describe chart elements for users of assistive technologies. To offer context and additional detail, you can create descriptive titles, subtitles, and annotations. When necessary, a legend can also be included to describe chart properties that are independent of a mark's position, such as using color or shape to denote different value categories.

Clear and accurate descriptions improve a chart's approachability and accessibility; consult [Enhancing the accessibility of a chart](#Enhancing-the-accessibility-of-a-chart) for additional ways to enhance accessibility.
