---
name: ratings-and-reviews
description: "Potential users frequently consult ratings and reviews before downloading an application or game. Use when designing ratings and reviews for iOS and iPadOS, auditing ratings and reviews against Apple's iOS and iPadOS guidelines, or when the user says things like \"design ratings and reviews for iPhone\", \"ratings and reviews on iOS and iPadOS\", \"how should ratings and reviews work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Ratings and reviews
Potential users frequently consult ratings and reviews before downloading an application or game

## When to use
- User asks about **ratings and reviews** on iOS and iPadOS (e.g. `"how do I design ratings and reviews for iPhone"`).
- User is building an iPhone UI that needs ratings and reviews and wants to follow Apple's guidelines.
- User asks to audit or review ratings and reviews in an iOS and iPadOS design.
- User mentions ratings and reviews in the context of an iPhone app, game, or interface.

While providing a superior overall experience is the most effective way to elicit positive feedback, selecting the appropriate moment to solicit input remains crucial. Although each application differs, potential timing indicators include tracking launch frequency, the quantity of features explored, or the number of tasks successfully completed.

Users maintain the option to rate your app within the App Store at any time.

### Best practices
- **Solicit a rating only after users have shown engagement with your application or game.** For instance, prompt users upon completing a level or achieving a major milestone. Avoid requesting feedback during the initial launch or onboarding process, as users may not yet fully grasp your app's value or have formed an opinion. Asking too early might even increase the likelihood of negative feedback.
- **Do not interrupt users while they are actively engaged in a task or playing.** Requesting feedback can disrupt the user journey and feel like an imposition. Identify natural pauses or stopping points within your app or game where a rating request will be less intrusive.
- **Refrain from excessive prompting.** Repeated requests for ratings can become annoying and may negatively affect users' perception of your app. Consider allowing a gap of at least one to two weeks between prompts, and only prompt again after the user has demonstrated further usage of your experience.
- **Utilize the system-provided prompt.** iOS, iPadOS, and macOS offer a standardized, unobtrusive method for apps and games to solicit ratings and reviews. When you determine an appropriate time to ask for feedback, the system checks for prior submissions and—if none exist—displays an in-app prompt requesting a rating and offering the option for written review. Users can provide feedback or dismiss the prompt with a single tap or click, and they also have the option to opt out of these prompts for all installed apps. The system automatically limits prompt display to three instances per app within a 365-day period. For developer guidance, consult [RequestReviewAction](apple:StoreKit/RequestReviewAction).
- **Evaluate the advantages of resetting your summary rating against the potential drawback of displaying fewer ratings.** When you release a new version of your app or game, you have the option to reset the summary of individual ratings received since the last reset. While resetting ensures the ratings accurately reflect the current version, it also tends to reduce the overall number of visible ratings, which might discourage potential downloads. For developer guidance, see [Reset app summary rating](https://help.apple.com/app-store-connect/#/devfb7e87af8).
