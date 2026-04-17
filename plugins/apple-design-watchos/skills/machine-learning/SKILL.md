---
name: machine-learning
description: "Machine learning allows applications and games to learn from operational data and usage patterns, enabling both the refinement of current experiences and the development of novel, engaging ones. Use when designing machine learning for watchOS, auditing machine learning against Apple's watchOS guidelines, or when the user says things like \"design machine learning for Apple Watch\", \"machine learning on watchOS\", \"how should machine learning work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Machine learning
Machine learning allows applications and games to learn from operational data and usage patterns, enabling both the refinement of current experiences and the development of novel, engaging ones

## When to use
- User asks about **machine learning** on watchOS (e.g. `"how do I design machine learning for Apple Watch"`).
- User is building an Apple Watch UI that needs machine learning and wants to follow Apple's guidelines.
- User asks to audit or review machine learning in a watchOS design.
- User mentions machine learning in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Only request explicit feedback when it is truly necessary** — Since users must take action to provide explicit feedback, it is preferable to avoid requesting it unless required
- **Always ensure providing explicit feedback is a voluntary action** — You need to convey that while explicit feedback can aid in improving the experience, it is not mandatory for users
- **Use clear, straightforward language to describe each explicit feedback option and its resulting consequences** — Avoid vague terms like *dislike*, as such words fail to communicate consequences and can be difficult to translate
- **Include icons in an option description if they aid user understanding** — Icons can help clarify or emphasize a part of the option description
- **Consider offering multiple choices when soliciting explicit feedback** — Providing [multiple options](#Multiple-options) grants users a sense of control and assists them in identifying unwanted suggestions or removing them from your app
- **React immediately to explicit feedback and implement the resulting changes** — For instance, if users indicate they do not wish to see certain content, that content should instantly vanish from their view and…
- **Consider using explicit feedback to help refine when and where results are displayed** — For example, users might appreciate a result but wish to view it only at specific times or in certain contexts
- **Always secure people’s information** — Because implicit feedback may collect potentially sensitive user data, you must maintain rigorous controls regarding user privacy
- **Help people control their information** — As a developer, you understand that greater insight into user behavior—both within your app and across other applications—allows you to enhance the…
- **Don’t let implicit feedback decrease people’s opportunities to explore** — Implicit feedback tends to reinforce established user behavior, which can yield short-term improvements but may degrade the experience over time
- **When possible, use multiple feedback signals to improve suggestions and mitigate mistakes** — Implicit feedback is indirect, making it challenging to accurately determine a user’s true intent from the gathered data
- **Consider withholding private or sensitive suggestions** — Users frequently share accounts and devices, or transition from personal use to communal use

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/planning-your-design.md
- @references/the-role-of-machine-learning-in-your-app.md
- @references/explicit-feedback.md
- @references/implicit-feedback.md
- @references/calibration.md
- @references/corrections.md
- @references/mistakes.md
- @references/multiple-options.md
- @references/confidence.md
- @references/attribution.md
- @references/limitations.md
