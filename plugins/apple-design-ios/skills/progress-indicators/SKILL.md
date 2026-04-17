---
name: progress-indicators
description: "Progress indicators inform users that your application is actively working, rather than being frozen, while it loads content or executes lengthy processes. Use when designing progress indicators for iOS and iPadOS, auditing progress indicators against Apple's iOS and iPadOS guidelines, or when the user says things like \"design progress indicators for iPhone\", \"progress indicators on iOS and iPadOS\", \"how should progress indicators work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Progress indicators
Progress indicators inform users that your application is actively working, rather than being frozen, while it loads content or executes lengthy processes

## When to use
- User asks about **progress indicators** on iOS and iPadOS (e.g. `"how do I design progress indicators for iPhone"`).
- User is building an iPhone UI that needs progress indicators and wants to follow Apple's guidelines.
- User asks to audit or review progress indicators in an iOS and iPadOS design.
- User mentions progress indicators in the context of an iPhone app, game, or interface.

Some progress indicators also allow users to estimate the remaining wait time for a task to finish. All progress indicators are temporary, appearing only during an operation and vanishing once it is complete.

Since the duration of an operation may be known or unknown, there are two categories of progress indicators:

- *Determinate*, used when the task has a predictable completion time, such as during file conversion.
- *Indeterminate*, used for tasks whose duration cannot be quantified, such as loading or synchronizing complex data.

Both determinate and indeterminate progress indicators may appear differently depending on the operating system platform. A determinate indicator displays task advancement by filling a linear or circular track as the operation progresses. *Progress bars* feature a track that fills from one end to the other. *Circular progress indicators* utilize a track that fills clockwise.

An indeterminate indicator—also referred to as an *activity indicator*—uses an animation to signal ongoing activity. While all platforms support a spinning circular image, macOS also supports an indeterminate progress bar.

For guidance intended for developers, refer to [ProgressView](apple:SwiftUI/ProgressView).

### Best practices
- **When possible, use a determinate progress indicator.** An indeterminate indicator signifies that an operation is underway but fails to provide users with an estimated completion time. A determinate indicator, conversely, allows users to make informed decisions regarding whether to wait, reschedule, or abandon the task.
- **Be as accurate as possible when reporting advancement in a determinate progress indicator.** To maintain user confidence regarding task completion time, consider maintaining a steady pace of advancement. Displaying 90 percent completion quickly and the final 10 percent slowly can lead users to question if the application is functioning or may feel misleading.
- **Keep progress indicators moving so people know something is continuing to happen.** Users often equate a static indicator with a frozen application or stalled process. If a process halts for any reason, provide feedback that clarifies the issue and suggests potential actions users can take.
- **When possible, switch a progress bar from indeterminate to determinate.** If an indefinite process reaches a point where its duration can be predicted, transition to a determinate progress bar. Users generally prefer the determinate indicator because it allows them to gauge both the current status and the expected completion time.
- **Don’t switch from the circular style to the bar style.** Activity indicators (also known as *spinners*) and progress bars differ in shape and size; transitioning between them can confuse users and disrupt the interface.
- **If it’s helpful, display a description that provides additional context for the task.** This description must be accurate and concise. Avoid vague terms such as *loading* or *authenticating*, as they rarely add meaningful value.
- **Display a progress indicator in a consistent location.** Establishing a predictable placement for the progress indicator helps users reliably locate the operation status, regardless of whether they are using different platforms or navigating within/between applications.
- **When it’s feasible, let people halt processing.** If a process can be interrupted without negative side effects, include a Cancel button. If interrupting the process carries potential negative consequences—such as losing partially downloaded file data—it is beneficial to include both a Cancel and a Pause button.
- **Let people know when halting a process has a negative consequence.** If canceling a process results in lost progress, provide an [alert](alerts.md) that includes options to either confirm the cancellation or resume the operation.

## Platform guidance — iOS & iPadOS

##### Refresh content controls
A refresh control allows users to instantly reload content, typically within a table view, without needing to wait for the next scheduled automatic update. This control is essentially an activity indicator that is hidden by default and becomes visible when users pull down on the view they wish to refresh. For instance, in Mail, dragging down the Inbox message list allows users to check for new messages.

- **Perform automatic content updates.** While immediate manual refreshing is appreciated, users also expect periodic background refreshes. Do not require the user to initiate every content update. Ensure data remains current by refreshing it on a regular basis.
- **Supply a short title only if it adds value.** Optionally, the refresh control can display a title. In most scenarios, this is redundant because the control's animation signifies that content loading is in progress. If you choose to include a title, do not use it to instruct users on how to refresh. Instead, provide meaningful information regarding the content being updated. For example, a refresh control in Podcasts might use a title to indicate when the last update occurred.

For guidance intended for developers, refer to [UIRefreshControl](apple:UIKit/UIRefreshControl).
