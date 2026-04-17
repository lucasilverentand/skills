# ResearchKit — full guidelines

### Creating the onboarding experience
When a user launches a research application for the first time, they encounter a sequence of screens. These pages introduce the study, verify participation eligibility, solicit permission to continue the research, and, if applicable, secure consent for personal data access. Because these screens are rarely revisited once successfully navigated, absolute clarity is crucial.

**Always display the onboarding screens in the correct order.**

#### 1. Introduction
The introduction must inform users and include a clear call to action. Define the study's subject and purpose explicitly. Additionally, provide functionality allowing existing participants to quickly log in and resume their ongoing study.

#### 2. Determine eligibility
Establish participant eligibility as early in the process as possible. If a person does not meet the study requirements, they should not proceed to the consent section. Only include eligibility criteria that are strictly necessary for your research protocol. Ensure the language used to describe these requirements is simple and direct, making data entry effortless for the user.

#### 3. Get informed consent
- **Ensure participants fully grasp your study before obtaining their consent.** ResearchKit assists in creating a consent process that is both friendly and concise, while still allowing you to incorporate all necessary legal or institutional review board/ethics committee requirements. Your application must comply with the relevant App Store Guidelines, including those pertaining to consent. Generally, this section details the study methodology, confirms participant comprehension of their roles and the study itself, and secures their agreement.
- **Divide extensive consent documents into easily digestible segments.** Each segment should address a specific aspect of the research, such as data collection methods, how data will be utilized, potential benefits, possible risks, time investment required, and withdrawal procedures. For every segment, use clear, simple language to provide a high-level summary. If necessary, offer a more detailed explanation accessible via a "Learn More" button. Participants must be able to review the complete consent form before agreeing to participate.
- **If relevant, include a quiz to assess participant comprehension.** This feature can be used to address questions that would typically arise during an in-person consent process.
- **Obtain the participant’s agreement and, if necessary, contact details.** Once they agree to participate, participants are presented with a confirmation dialog, followed by screens where they provide their signature and contact information. Most research applications email participants a PDF copy of the consent form for their records.

#### 4. Request permission to access data
Secure authorization for accessing the participant’s device or data, as well as permission to send notifications. You must clearly articulate why your research application requires access to location, Health, or other data, and refrain from requesting any data that is not essential to your study. Furthermore, if the app utilizes notifications, you must also obtain permission from the participant’s device to send them.

### Conducting research
To gather input from participants, your study may employ surveys, active tasks, or a combination of both. Depending on the structure of your research, participants might interact with each section once or multiple times.

**Develop surveys that maintain participant engagement.** ResearchKit offers numerous customizable screens for your surveys, simplifying the presentation of questions requiring different response types, including true/false, multiple choice, dates and times, sliding scales, and free-form text. When utilizing ResearchKit screens to design a survey, adhere to these guidelines to ensure an optimal experience:

- Inform participants of the total number of questions and the estimated time required for completion.
- Dedicate a single screen to each question.
- Provide participants with visibility into their current progress within the survey.
- Keep the survey as brief as possible. Multiple short surveys generally yield better results than a single lengthy one.
- For questions needing supplementary detail, use the standard font for the main question and a slightly reduced font size for any explanatory text.
- Signal to participants when the survey has concluded.

**Ensure active tasks are easily understood.** An active task necessitates participant involvement in an activity, such as speaking into a microphone, tapping the screen, walking, or completing a memory assessment. Follow these guidelines to maximize the likelihood of successful completion and encourage participation in an active task:

- Describe how to execute the task using straightforward, unambiguous language.
- Detail any prerequisites, such as specific timing or environmental conditions under which the task must occur.
- Confirm that participants know precisely when the activity is finished.

### Managing personal information and providing encouragement
ResearchKit provides a profile screen that enables participants to manage their personal information within your research application. Additionally, designing a custom screen is beneficial for motivating users and allowing them to monitor their study progress. Ideally, both screens should be available within your app at all times.

- **Utilize a profile to assist participants in managing study-related personal data.** A profile screen allows individuals to modify information that may evolve throughout the research period—such as weight or sleep patterns—and serves as a reminder for forthcoming activities. Furthermore, it offers simple access to withdraw from the study and review critical materials like the consent form and privacy policy.
- **Employ a dashboard to display progress and encourage continued participation.** If suitable for your research, use a dashboard to offer positive reinforcement, including daily advancement metrics, weekly evaluations, outcomes from specific tasks, and even comparative results against aggregated data from other participants.
