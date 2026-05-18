# Eyes — full guidelines — overview
In certain situations, the system may automatically display an expanded view of a component after it has been viewed. For instance, if a user looks at a tab bar, the entire bar resizes to display text labels alongside each tab. In this scenario, an individual tab also highlights before the bar expands, allowing the user to select it before the labels are revealed. Another example is a button that displays a tooltip upon being viewed.

> **Important**
> To protect user privacy, visionOS does not track where users are looking before they tap. When you utilize system-provided components, visionOS informs you only when the user taps the component. For guidance on implementation, consult [Adopting best practices for privacy and user preferences](apple:visionOS/adopting-best-practices-for-privacy).

Additionally, visionOS supports *focus effects*, which assist users in navigating apps and the system using an external input device, such as a game controller or keyboard. Focus effects are distinct from the hover effect; for further details, refer to **Focus and selection**.
