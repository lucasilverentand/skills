# Data and privacy
Protecting user privacy and securing the highly sensitive data gathered by your CareKit application is paramount.

**Provide a comprehensive privacy policy.** When submitting the app, you are required to supply a URL leading to a clearly defined privacy policy. This allows users to review the policy when they select the link provided on the App Store page for your application. For guidance specific to developers, refer to [App information > App Store Connect help](https://help.apple.com/app-store-connect/#/dev219b53a88).

Beyond the information users input into your CareKit app, you may also access data via different iOS features and capabilities. You must obtain explicit user authorization before accessing any data through these system features, and you are responsible for protecting all users' data, regardless of whether it originated from user input or was retrieved from the device or system. For developer guidance, consult [Protecting user privacy](apple:HealthKit/protecting-user-privacy).

#### HealthKit integration
HealthKit serves as the central repository for health and fitness data across iOS and watchOS. When integrating HealthKit into your CareKit application, you gain the ability to request permission from users to access and share their health and fitness data with designated caregivers.

- **Request access to health data only when you need it.** It is logical to request weight information when a user logs their weight, for instance, rather than immediately upon app launch. When your request is clearly tied to the current usage context, you help users understand your application's purpose. Furthermore, since individuals retain the ability to modify their granted permissions, it is advisable to issue a request whenever your app requires access. For technical guidance, refer to [requestAuthorization(toShare:read:completion:)](apple:HealthKit/HKHealthStore/requestAuthorization(toShare:read:completion:)).
- **Clarify your app’s intent by adding descriptive messages to the standard permission screen.** Users anticipate encountering the system-provided permission prompt when asked for health data approval. Include a few brief statements explaining why you require the information and how sharing it benefits them within your application. Do not introduce custom screens that mimic the standard permission screen's functionality or content.
- **Manage health data sharing solely through the system’s privacy settings.** Users expect to globally control their health information access within Settings > Privacy. Avoid causing confusion by creating additional screens within your app that influence the health data flow.

For related design guidance, see [HealthKit](healthkit.md). For developer guidance, see [HealthKit](apple:HealthKit).

#### Motion data
If motion data is intended for treatment and users have granted permission, your application can access device movement information to determine if the user is stationary, walking, running, cycling, or driving. When a person is engaged in walking or running, the app can additionally provide step count, pace, and the number of flights of stairs ascended or descended.

Motion data may also encompass custom metrics collected during physical therapy sessions. For example, certain ResearchKit tasks leverage device sensors to evaluate flexibility, range of motion, and ambulatory ability.

For developer information, consult [Core Motion](apple:CoreMotion).

#### Photos
Images are an effective method for documenting treatment advancements. Upon receiving user authorization, your application can access the device's camera and photo library to transmit images to a care team. For example, a medical protocol may require patients to submit periodic photographs of an injury so that the physician can track the healing progression.

For technical guidance, consult [UIImagePickerController](apple:UIKit/UIImagePickerController).

#### ResearchKit integration
ResearchKit applications facilitate involvement in important medical research studies. Your CareKit application may integrate ResearchKit features, if appropriate, to present associated surveys, tasks, and charts. Furthermore, ResearchKit includes an informed consent module that your CareKit app can employ to request user permission for collecting and sharing data.

For guidance on the design, consult [ResearchKit](researchkit.md). For developer instructions, refer to [Research & Care > Developers](https://www.researchandcare.org/developers/).
