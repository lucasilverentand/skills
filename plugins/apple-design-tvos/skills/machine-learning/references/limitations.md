# Limitations
Every feature, regardless of whether it utilizes machine learning, possesses inherent constraints on its capabilities. Generally, these limitations fall into two categories: functional boundaries (what a feature cannot execute) and absolute limits (what a feature cannot do under any circumstances). When user expectations regarding a feature diverge from its actual capabilities, this mismatch can be perceived as a defect. For instance, users might expect:

- Photos to offer searches covering every conceivable category
- Siri to address vaguely defined queries, such as “What is the meaning of life?”
- FaceID to function reliably from all viewing angles

A crucial aspect of the design lifecycle is identifying scenarios where limitations affect the user experience and devising methods to help users navigate these constraints. For example:

- Define user expectations before they engage with the feature.
- Illustrate how to achieve optimal outcomes while using the feature.
- When suboptimal results occur, provide clarity regarding the cause so users gain a deeper understanding of the feature.
- **Help users establish realistic expectations.** If a limitation rarely occurs but has a significant impact on the user experience, consider making users aware of this constraint before they begin using your application or feature. You may detail the limitation in marketing materials or within the feature's context, allowing users to decide how much they wish to rely on it. If the effects of a limitation are minor, you can assist in setting expectations by providing [attribution](#Attribution).
- **Demonstrate how to achieve optimal results.** If you fail to provide usage guidance, users may assume the feature possesses universal capability. By proactively demonstrating how to achieve positive outcomes, you help users benefit from the feature and build a more accurate mental model of its functions. different methods exist to guide users toward successful usage, including:
- Utilizing placeholder text to suggest input. In Photos, the search bar displays “Photos, People, Places…” to inform users about searchable content before they begin typing. Photos also provides a description of how it scans the library to offer search suggestions.
- Providing feedback on user actions as they occur, guiding them toward a successful outcome without causing cognitive overload. For example, while using Animoji, the feature responds to current conditions and suggests adjustments—such as improving lighting or moving closer to the camera—to enhance results.
- Suggesting viable alternatives instead of displaying no results. Successfully implementing this requires a deep understanding of the user's goal to propose relevant alternatives. For example, if users ask Siri to set a timer on a Mac, Siri suggests setting a reminder instead because timers are unavailable in macOS. This suggestion is logical because the user's underlying goal is to receive an alert at a specific time.
- **Explain how limitations can lead to unsatisfactory outcomes.** Users become frustrated when your feature appears to operate inconsistently. Ideally, the feature should recognize and articulate the reasons behind poor performance, making users aware of the limitations and enabling them to adjust their expectations. For instance, Animoji informs users that it performs poorly in low light.
- **Consider notifying users when limitations are resolved.** When frequent use leads users to avoid interactions that fail due to a feature's constraints, it is beneficial to notify them when you update your app and remove that limitation. This allows users to adjust their mental model of the feature and revisit interactions they had previously avoided.
