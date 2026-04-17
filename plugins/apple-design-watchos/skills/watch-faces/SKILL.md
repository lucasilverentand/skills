---
name: watch-faces
description: "A watch face serves as the primary view selected by users within watchOS. Use when designing watch faces for watchOS, auditing watch faces against Apple's watchOS guidelines, or when the user says things like \"design watch faces for Apple Watch\", \"watch faces on watchOS\", \"how should watch faces work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Watch faces
A watch face serves as the primary view selected by users within watchOS

## When to use
- User asks about **watch faces** on watchOS (e.g. `"how do I design watch faces for Apple Watch"`).
- User is building an Apple Watch UI that needs watch faces and wants to follow Apple's guidelines.
- User asks to audit or review watch faces in a watchOS design.
- User mentions watch faces in the context of an Apple Watch app, game, or interface.

The watch face is central to the entire watchOS experience. Users select a watch face they view every time they raise their wrist, and they personalize it using their preferred complications. Furthermore, users have the ability to tailor different watch faces for different activities, allowing them to switch to a face that matches their current context.

Starting with watchOS 7 and subsequent versions, users have the capability to share the watch faces they have configured. For instance, a fitness instructor might configure and then share a watch face with their students by selecting the Gradient watch face, customizing its color, and adding relevant health and fitness complications. When students add this shared watch face to their Apple Watch or the Watch app on their iPhone, they gain a customized experience without needing to configure it themselves.

Additionally, you can enable watch face sharing from within your application, on your website, or through platforms like Messages, Mail, or social media. Offering shareable watch faces assists in introducing your complications and your app to a wider audience.

### Best practices
- **Facilitate app discovery by enabling users to share watch faces that feature your complications.** Ideally, you should support multiple complications to showcase them within a shareable watch face and provide a curated user experience. For certain watch faces, you also have the option to specify system accent colors, images, or styles. If a user adds your watch face but has not installed your application, the system will prompt them to do so.
- **Present a preview of every watch face you share.** Displaying a preview that emphasizes the benefits of your watch face assists users in visualizing its advantages. You can generate this preview by emailing the watch face to yourself using the iOS Watch app. This preview includes an illustrated device bezel that frames the face and is suitable for display in websites or within watchOS and iOS applications. Alternatively, you may substitute the illustrated bezel with a high-fidelity hardware bezel downloaded from [Apple Design Resources](https://developer.apple.com/design/resources/#product-bezels) and composite it onto the preview. For detailed developer instructions, refer to [Sharing an Apple Watch face](apple:ClockKit/sharing-an-apple-watch-face).
- **Strive to offer shareable watch faces compatible with all Apple Watch devices.** Some watch faces, including California, Chronograph Pro, Gradient, Infograph, Infograph Modular, Meridian, Modular Compact, and Solar Dial, are available on Series 4 and later. Explorer is supported starting with Series 3 (with cellular) and newer models. If you utilize one of these faces in your configuration, consider providing a similar configuration using a face available on Series 3 and earlier. To assist users in making a selection, clearly label each shareable watch face with the devices it supports.
- **Handle incompatibility gracefully if a user selects an unsupported watch face.** When users attempt to use an incompatible watch face on Series 3 or earlier, the system sends your app an error notification. In this situation, consider immediately offering a compatible alternative configuration rather than displaying an error message. Additionally, alongside the previews you provide, help users understand that they may receive an alternative watch face if their chosen face is not compatible with their Apple Watch.
