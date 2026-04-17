# Best practices — overview
*   **Focus on core app purpose.** Select simple concepts relevant to your application's primary function. Include current and pertinent content and features. For instance, since users of the Weather app are most interested in high/low temperatures and current conditions, Weather widgets should prioritize this data.

*   **Enable quick content access.** Strive to build a widget that allows users rapid retrieval of desired information. Users value widgets that present meaningful content and offer actionable functions or deep links to critical parts of your app. Simply replicating the app icon adds minimal value, and users may be less inclined to keep it visible on their screens.

*   **Prioritize dynamic data.** Favor information that evolves throughout the day. If a widget's content remains static, users may not keep it prominently displayed. While widgets don't refresh every minute, you must find ways to keep their content current to encourage frequent checks.

*   **Seek opportunities for delight.** Look for chances to impress and surprise users. For example, you could use a unique visual style in your calendar widget for important dates like holidays or birthdays.

*   **Offer multiple sizes when beneficial.** Provide widgets across many dimensions if it adds value. Smaller widgets should use their limited space to display a single key piece of information, while larger sizes support extra data layers and actions. Do not expand a small widget's content merely to fill a larger frame. It is more important to create the correct size for the content than to offer all sizes.

*   **Maintain information balance.** Sparse displays can make a widget seem superfluous, whereas overly dense layouts are difficult to scan quickly. Design a layout that presents essential information at a glance, allowing users to delve into additional details upon closer inspection. If your layout is too packed, consider using a larger widget size or replacing text with graphics to improve clarity.

*   **Display only purpose-driven information.** Present information directly related to the widget's main function. While larger widgets allow for more data or detailed visualizations, you must not lose sight of the widget's primary goal. For example, all Calendar widgets show an individual’s upcoming events. In every size, the widget centers on events while expanding the scope of information as it grows larger.

*   **Use branding purposefully.** Integrate brand colors, fonts, and stylized glyphs to make your widget recognizable without overwhelming useful information or appearing out of place. When you include brand elements, users rarely need your logo or app icon to identify the widget. If a small logo is beneficial—for instance, if your widget aggregates content from multiple sources—a small logo in the top-right corner is sufficient.

*   **Determine automatic vs. customizable display.** Decide whether the widget should automatically present content or allow users to configure what is shown. In certain scenarios, users must customize a widget to ensure it displays the most relevant information for them. For instance, the Stocks widget allows users to select which stocks they wish to monitor. Conversely, some widgets, like the Podcasts widget, automatically display recent content, requiring no user customization. For guidance on implementation, see [Making a configurable widget](apple:WidgetKit/Making-a-Configurable-Widget).

*   **Avoid mirroring app appearance.** Do not include an element in your app that mimics the widget's look but behaves differently. Such elements can confuse users. Furthermore, users may be less likely to explore other ways to interact with that element in your app because they expect it to function like a widget.

*   **Indicate when authentication adds value.** If your widget unlocks extra functionality upon user sign-in, ensure users are aware of this. For example, an app showing upcoming reservations might display a message like “Sign in to view reservations” when the user is logged out.
