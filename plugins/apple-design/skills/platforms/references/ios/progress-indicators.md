# Progress indicators
Progress indicators inform users that your application is actively working, rather than being frozen, while it loads content or executes lengthy processes

## Platform guidance — iOS & iPadOS

##### Refresh content controls
A refresh control allows users to instantly reload content, typically within a table view, without needing to wait for the next scheduled automatic update. This control is essentially an activity indicator that is hidden by default and becomes visible when users pull down on the view they wish to refresh. For instance, in Mail, dragging down the Inbox message list allows users to check for new messages.

- **Perform automatic content updates.** While immediate manual refreshing is appreciated, users also expect periodic background refreshes. Do not require the user to initiate every content update. Ensure data remains current by refreshing it on a regular basis.
- **Supply a short title only if it adds value.** Optionally, the refresh control can display a title. In most scenarios, this is redundant because the control's animation signifies that content loading is in progress. If you choose to include a title, do not use it to instruct users on how to refresh. Instead, provide meaningful information regarding the content being updated. For example, a refresh control in Podcasts might use a title to indicate when the last update occurred.

For guidance intended for developers, refer to [UIRefreshControl](apple:UIKit/UIRefreshControl).
