---
name: offering-help
description: "While optimal experiences are inherently intuitive and accessible, you retain the ability to offer contextual assistance when required. Use when designing offering help for iOS and iPadOS, auditing offering help against Apple's iOS and iPadOS guidelines, or when the user says things like \"design offering help for iPhone\", \"offering help on iOS and iPadOS\", \"how should offering help work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Offering help
While optimal experiences are inherently intuitive and accessible, you retain the ability to offer contextual assistance when required

## When to use
- User asks about **offering help** on iOS and iPadOS (e.g. `"how do I design offering help for iPhone"`).
- User is building an iPhone UI that needs offering help and wants to follow Apple's guidelines.
- User asks to audit or review offering help in an iOS and iPadOS design.
- User mentions offering help in the context of an iPhone app, game, or interface.

### Best practices
- **Tailor your app’s assistance to the specific tasks users are performing.** For instance, if your application allows for simple, single- or double-step actions, display an inline view that briefly explains the task. Conversely, if your app or game supports complex, multi-step processes, consider offering a tutorial that guides users through achieving broader objectives. Generally, ensure the assistance provided directly correlates to the precise action or task currently underway and allow users easy ways to dismiss or bypass the help if it is unnecessary.
- **Maintain consistency in language and visuals within your help materials.** Always ensure the guidance matches the current usage context. For example, if a user is interacting with your tvOS experience using the Siri Remote, do not display tips or images that feature a game controller. Furthermore, ensure your terminology and descriptions align with the platform itself; for instance, avoid instructions that tell users to click a button on an iPhone while they are using a Mac.
- **Ensure all help content is universally accessible.** Refer to [Inclusion](inclusion.md) for guidance on this matter.
- **Do not overwhelm users with explanations of standard components or patterns.** Instead, detail the specific function or action that a standard element performs within your application or game. If your experience includes a unique control or requires users to use an input device unconventionally—such as holding the Siri Remote rotated 90 degrees—orient them quickly, favoring animation or graphics over lengthy textual descriptions.

### Creating tips
A tip is a brief, temporary view that explains how to use a feature within your application. Tips are excellent for introducing users to new or less obvious features, or for helping them discover quicker ways to complete a task. For guidance on implementing this feature, consult [TipKit](apple:TipKit).

- **Select the most suitable tip type for your app's interface.** Display a popover tip if you wish to maintain the current content flow, or use an inline tip when surrounding information must remain visible. You may employ an annotation-style inline tip to point out a specific UI element, or a hint-style tip if it is not tied to a particular piece of the UI.
- **Reserve tips for straightforward features.** Tips are most effective when applied to features that are simple to describe and can be completed using only a few basic steps. If a feature necessitates more than three actions, it is likely too complex for a tip format.
- **Keep tips concise, actionable, and engaging.** The objective of a tip is to encourage users to try new features. Use clear, action-oriented language to explain the feature's function and how to utilize it. Restrict your tips to one or two sentences, and refrain from including content that is promotional or pertains to a different feature or user journey. Promotional content refers to anything that advertises, sells, or deviates from the current context of the user's activity.
- **Establish rules to ensure your tips reach the intended audience.** Not every user benefits from every tip. For instance, users who have already utilized a feature may not appreciate seeing a tip describing it. Use eligibility rules based on parameters or events to govern when a tip appears, and only present it if the user stands to gain from its use. If your app includes multiple tips, manage the display frequency so that they appear at a sensible interval—for example, once every 24 hours.
- **If the feature has an associated image or symbol, consider including it in the tip, and favor the filled variant.** For example, a tip featuring a star can help users understand that it relates to favorites. If the feature is represented by an image that the tip links to directly, avoid duplicating that same image in both the tip and the UI. **Use buttons to guide users toward information or options.** If your feature includes customizable settings, or if you wish to redirect users to a section where they can learn more about the feature, consider adding a button. Buttons allow users to navigate directly to settings for adjustments. Alternatively, if there is supplementary information that might be helpful, add a button leading to additional resources, such as an initial setup flow.
