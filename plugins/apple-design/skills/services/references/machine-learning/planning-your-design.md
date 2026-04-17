# Planning your design
Machine learning applications utilize *models* to execute tasks such as image recognition or identifying patterns within numerical datasets. A successful machine learning application relies equally on the quality of its models and the effectiveness of its UI and user experience. For details on the model design process, consult [Create ML](apple:CreateML).

When developing your models, always keep the intended application experience in view. Since adjusting model behavior can be a lengthy process, be prepared to modify how you utilize data and metrics if the application experience requires changes.

Designing the UI and UX for an ML app presents unique difficulties. Because an ML application bases its behavior on incoming data—responding to dynamic information and conditions—you cannot design specific reactions for a fixed set of scenarios. Instead, you shape the experience by instructing the app how to interpret data and respond appropriately.

To address this challenge, begin by considering the specific function machine learning serves within your application. Defining the [role](#The-role-of-machine-learning-in-your-app) of machine learning will help you identify how it influences the overall user experience.

Leverage the identified ML role to determine how your app will receive and present data. different patterns, categorized as *inputs* and *outputs*, offer guidance on areas like collecting feedback, displaying results, managing errors, and supporting corrections. Apply these patterns to integrate machine learning into your app in a manner that users will value.
