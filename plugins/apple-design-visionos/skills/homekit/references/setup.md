# Setup
- **Utilize the system-provided setup flow to ensure a familiar user experience.** The HomeKit setup process is faster than traditional methods because it allows users to name accessories, join networks, pair with HomeKit, assign room and service categories, and mark favorites in minimal steps. By leveraging the system flow, developers can focus on promoting the custom functionality that makes their accessory unique. For developer guidance regarding this process, refer to [performAccessorySetup(using:completionHandler:)](apple:HomeKit/HMAccessorySetupManager/performAccessorySetup(using:completionHandler:)).
- **Provide context explaining why your application requires access to users' Home data.** You must create a purpose string that includes a phrase detailing why permission is being requested, such as: “Lets you control this accessory with the Apple Home app and Siri across your Apple devices.”
- **Do not require users to create an account or supply personal information.** Instead, defer any necessary information gathering to HomeKit. If your application offers additional services requiring an account (e.g., cloud services), make that account setup optional and present it only after the initial HomeKit configuration is complete.
- **Respect users' setup decisions.** If users select HomeKit to configure your accessory, do not compel them to set up other platforms during the HomeKit setup flow. A cross-platform setup experience can impede immediate accessory use and confuse users by presenting multiple control methods simultaneously.
- **Carefully consider the timing and method for offering a custom accessory setup experience.** Always initiate with the system-provided setup flow. Subsequently, once the accessory's core functionality is operational, offer a custom post-setup experience that highlights your accessory’s unique features and helps users maximize its potential. For instance, a light manufacturer's app might assist users in creating personalized light scenes using key colors scanned from photos in their library.

#### Help people choose useful names
- **Propose service names appropriate for your accessory.** If your application identifies that a user has chosen an unsuitable name for Siri voice commands, suggest viable alternatives that are likely to work well for most users. Do not propose company names or product model numbers as service names.
- **Validate that the provided names adhere to HomeKit naming conventions.** If your application allows users to modify service names, ensure the new names comply with these rules. (The initial setup flow handles validation of original names automatically.) If a user enters a name that violates one or more rules, briefly describe the issue and offer suggested alternatives. The rules are as follows:
- Only alphanumeric characters, spaces, and apostrophes may be used.
- The name must begin and end with an alphabetic or numeric character.
- Emojis are prohibited.

||Example service names|
|---|---|
|✓|Reading lamp|
|✗|📚 lamp|
|✓|2nd garage door|
|✗|#2 garage door|

**Assist users in avoiding names that contain location details.** While using a name like "kitchen light" is intuitive for naming a fixture in the kitchen, including the room designation within the service name can cause inconsistent behavior when controlling the accessory via voice. Your application should be able to detect service names that contain redundant location data and guide users toward a correction. For instance, you could offer a post-setup experience that allows the removal of the room or zone from the service name and prompts users to assign the accessory to that specific room or zone instead.
