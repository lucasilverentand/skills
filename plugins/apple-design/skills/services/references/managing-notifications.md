# Managing notifications — full guidelines

### Integrating with Focus
People value being informed about matters important to them, but they may not appreciate being interrupted unexpectedly. To help users manage this experience, the system allows them to define delivery times and establish a Focus.

- A Focus assists users in filtering notifications during periods they have reserved for specific activities, such as sleeping, working, reading, or driving.
- Delivery scheduling enables users to select whether notification alerts should arrive immediately or be included in a summary delivered at chosen times.

Users identify specific contacts and applications that are permitted to bypass a Focus and deliver notification alerts. For instance, in a Work Focus, users might wish to receive immediate alerts from work colleagues, family members, and work-related applications. They may also choose to receive all Time Sensitive notification alerts while a Focus is active. A *Time Sensitive* notification contains essential information that users appreciate receiving without delay.

> **Important**
> Although a Focus may postpone the delivery of a notification alert, the notification itself becomes available as soon as it is received.

To support these personalized behaviors, you must first identify the categories of notifications your app or game can transmit. If you support direct communications—such as phone calls and messages—you utilize *communication* notifications; for all other types of tasks, you use *noncommunication* notifications. To support communication notifications, you must adopt SiriKit intents, allowing users to customize notification behaviors via Siri. For developer guidance, refer to [INSendMessageIntent](apple:Intents/INSendMessageIntent) and [UNNotificationContentProviding](apple:UserNotifications/UNNotificationContentProviding).

You are required to specify a system-defined interruption level for every noncommunication notification you send. The operating system uses this interruption level to assist in determining the delivery timing; when a communication notification arrives, the system relies on the sender to determine the alert delivery time.

The system defines four interruption levels for noncommunication notifications:

- *Passive*. Information that users can review at their convenience, such as a restaurant suggestion.
- *Active* (the default). Information that users may want to know about upon arrival, like a score update for their preferred sports team.
- *Time Sensitive*. Information that directly affects the user and requires prompt attention, such as an account security issue or a package delivery status.
- *Critical*. Urgent information concerning health and safety that directly impacts the user and demands immediate attention. Critical notifications are exceedingly rare and typically originate from governmental/public agencies or applications assisting users with their health or home management.

Notification alerts within each system-defined interruption level can exhibit the following behaviors:

|Interruption level|Overrides scheduled delivery|Breaks through Focus|Overrides Ring/Silent switch on iPhone and iPad|
|---|---|---|---|
|Passive|No|No|No|
|Active|No|No|No|
|Time Sensitive|Yes|Yes|No|
|Critical|Yes|Yes|Yes|

> **Note**
> Since a Critical notification has the capability to override the Ring/Silent switch and bypass scheduled delivery and Focus, you must obtain the necessary entitlement to send one.

### Best practices
- **Build trust by accurately representing the urgency of each notification.** Since users have different ways to adjust their notification settings—including turning them off completely—it is crucial that you assign an interruption level as realistically as possible. You must prevent users from feeling that a notification is using high urgency to interrupt them with low-priority content.
- **Use the Time Sensitive interruption level only for notifications that are relevant in the moment.** To help users understand the advantages of allowing Time Sensitive alerts to override Focus or scheduled delivery, ensure the notification pertains to an event that is occurring now or will occur within the next hour. The first time a Time Sensitive notification arrives from your app, the system explains how this type of alert functions and provides users with a way to disable it if they do not agree that the information requires their immediate attention. Moving forward, the system periodically gives users additional chances to evaluate how your Time Sensitive notification is performing for them. For developer guidance, consult [UNNotificationInterruptionLevel](apple:UserNotifications/UNNotificationInterruptionLevel).

### Sending marketing notifications
Do not utilize notifications for promotional or marketing content unless users have explicitly consented to receive such messages. Users interested in updates regarding new features, content, or events related to your application or game can grant permission for marketing notifications. For instance, a subscriber app might offer an upgrade option, or game players may wish to receive a special promotion tied to a live in-game event.

- **Never use the Time Sensitive interruption level for marketing notifications.** Even if users have agreed to receive promotional alerts from your application, these messages must never bypass a Focus mode or scheduled delivery setting.
- **Obtain users' permission if you intend to send promotional or marketing notifications.** Before dispatching these alerts, you must secure explicit consent from the users. Implement an alert, modal view, or similar interface that details the content types and provides a clear mechanism for users to opt in or out.
- **Ensure users can manage their notification preferences within your app.** Beyond requesting permission to send informational or marketing alerts, you are required to provide an in-app settings screen enabling users to modify their choices. Refer to **Settings** for guidance.

## Platform guidance — watchOS
By default, notification settings configured for apps on an iPhone extend to those same apps on the Apple Watch. Users have two ways to manage these notifications: they can adjust settings within the dedicated Apple Watch app on the iPhone, or they can access per-notification controls—such as Mute 1 Hour or Turn off Time Sensitive—by swiping left when a notification is received on the Apple Watch.
