# Platform guidance — watchOS
When a Live Activity initiates on an iPhone, it appears in the Smart Stack on the paired Apple Watch. By default, the view presented in the Smart Stack merges the leading and trailing elements from the Live Activity's compact iPhone presentation.

If you provide a watchOS application and a user taps the Live Activity within the Smart Stack, your watchOS app launches. If no watchOS app is available, tapping presents a full-screen view that includes an option to open your application on the paired iPhone.

- **Consider creating a custom watchOS layout.** Although the system automatically supplies a default view, a tailored layout for Apple Watch allows you to display additional details and incorporate interactive features such as buttons or toggles.
- **Carefully consider including buttons or toggles in your custom layout.** This same custom watchOS layout applies to your Live Activity within CarPlay, where the system automatically disables interactive components. If users are likely to view or initiate your Live Activity while driving, refrain from including buttons or toggles in the custom watchOS layout. For developer guidance, consult [Creating custom views for Live Activities](apple:ActivityKit/creating-custom-views-for-live-activities).
- **Focus on essential information and significant updates.** Utilize the Smart Stack space as efficiently as possible, considering only the most valuable data a Live Activity can communicate:
- Progress indicators, such as an estimated delivery arrival time.
- Interactive components, like controls for a stopwatch or timer.
- Significant status changes, such as shifts in sports scores.
