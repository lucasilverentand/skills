# The role of machine learning in your app
Machine learning systems are highly diverse, and consequently, the methods an application employs to utilize machine learning also vary significantly. As you begin designing your app, consider how its features integrate machine learning within each of the following domains.

#### Critical or complementary
If an application remains functional without the feature that machine learning supports, ML is complementary to the app; otherwise, it constitutes a critical dependency. For example:

- The keyboard uses machine learning to provide QuickType suggestions. Because the keyboard still works without these suggestions, machine learning plays a complementary role in the app.
- Face ID relies on machine learning to perform accurate face recognition. Without machine learning, Face ID would not work.

In general, the more critical an app feature is, the higher the expectation for accurate and reliable results. Conversely, users may be more forgiving if a complementary feature delivers results that are not always of the highest quality.

#### Private or public
Machine learning outcomes are dependent on the input data. To ensure sound design decisions, it is essential to possess a deep understanding of the specific types of data your app feature requires. Generally, the higher the sensitivity of the data, the more severe the potential consequences if results are inaccurate or unreliable. For instance:

- If a health application misinterprets data and incorrectly recommends seeing a doctor, users may experience anxiety or lose trust in the app.
- If a music application misinterprets data and suggests an artist users dislike, they are likely to view the result as a minor mistake.

As is required for all critical app features, those utilizing sensitive data must prioritize both accuracy and reliability. Furthermore, irrespective of the data's sensitivity level, all applications must maintain user privacy protection at all times.

#### Proactive or reactive
A *proactive* app feature delivers outcomes without being explicitly requested by the user. These features can initiate new interactions or tasks by offering unexpected, sometimes serendipitous information. Conversely, a *reactive* app feature provides results only when the user requests them or performs specific actions. Reactive features are typically designed to assist users while they are completing their current task. For instance:

- QuickType offers word suggestions based on user input.
- Siri Suggestions may proactively recommend a shortcut informed by the user's recent habits.

Because users do not solicit the results from a proactive feature, they may have less patience for low-quality information. To minimize the chance that proactive results feel irrelevant or intrusive, you might need to incorporate additional data into the feature.

#### Visible or invisible
Applications can leverage machine learning to underpin features that are either visible or hidden. Users typically recognize visible app functions because they present suggestions or options that users view and engage with. For instance, a predictive keyboard feature attempts to anticipate the word being typed and displays the most probable candidates in a list for user selection.

As its name implies, an invisible feature delivers outcomes that are not immediately apparent to the user. For example, a keyboard learns typing patterns over time to optimize the touch target area for each key and reduce input errors. Since this app enhancement improves the typing experience without requiring user decisions, many users remain unaware that the feature is active.

Users' assessment of result dependability varies depending on whether a function is visible or hidden. With a visible feature, users establish an opinion regarding its reliability as they select from the presented outcomes. It is more challenging for an invisible feature to convey its dependability—and consequently, receive user feedback—because users might not be aware of the feature's existence.

#### Dynamic or static
Machine learning models possess the capacity for enhancement; however, some improve dynamically as users engage with an app feature, while others undergo improvement offline and only impact the feature upon application updates. For instance:

- Face ID enhances dynamically as individuals' facial features naturally evolve over time.
- Photos refines its object recognition abilities with each subsequent iOS release.

Beyond the cadence of application updates, whether improvements are static or dynamic can influence different aspects of the user experience. For example, dynamic features frequently integrate mechanisms for [calibration](#Calibration) and feedback (either [implicit](#Implicit-feedback) or [explicit](#Explicit-feedback)), whereas static features may not require these.
