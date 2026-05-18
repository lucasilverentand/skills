# Attribution
An attribution explains the foundational basis or reasoning behind a result without detailing the exact mechanics of how a model operates. Depending on your application's design, you may wish to employ attributions to enhance transparency and provide users with insight into the outcomes. For instance, if your app suggests books, you could use an attribution such as "Because you've read mysteries" when recommending a title in the "thrillers" genre.

To help determine if attributions should be included, consider how you want them to influence users. For example, you might intend for attributions to:

- Motivate users to adjust their behavior within your app.
- Reduce the negative impact of [mistakes](#Mistakes).
- Aid users in forming a mental model of the feature.
- Foster trust in your app over time.
- **Consider using attributions to assist users in differentiating between results.** For example, if you present a collection of outcomes as [multiple options](#Multiple-options), including attributions allows users to select an option based on their understanding of the underlying premise, such as "New books by authors you've read."
- **Avoid being excessively specific or overly general.** Attributions that are too detailed may require users to expend extra effort interpreting the results, whereas attributions that are too broad usually fail to convey meaningful information. In content recommendation applications, general attributions might lead users to feel they are not being treated as individuals, while overly specific ones may suggest the app is monitoring them too closely. The most effective attributions strike a balance between these two extremes.
- **Keep attributions factual and grounded in objective analysis.** To be functional, an attribution must enable users to reason about a result; it should not provoke emotional reactions. Do not provide an attribution that implies judgment or understanding of a user's emotions, preferences, or beliefs. For example, an app suggesting new content can use the attribution "Because you’ve read nonfiction" rather than "Because you love nonfiction."
- **In general, refrain from using technical or statistical jargon.** In most scenarios, employing percentages, statistics, and other specialized terminology does not assist users in evaluating the results provided. The exception is when the result itself is inherently statistical or technical, such as information related to weather, sports, polling/election outcomes, or scientific data.
