# Custom intent categories and responses
Although your custom intent does not belong to a SiriKit domain, you must model it against a system-defined *intent category* relevant to your application's action. SiriKit includes several categories representing generic tasks, such as create, order, share, and search. Since these definitions are system-level, Siri understands how to discuss common actions associated with each category—like placing an order or sharing content—in a natural manner.

It is crucial to select the category that most accurately reflects your action because this choice influences how Siri discusses it and what controls users may encounter in the interface. For instance, a coffee application would likely select the `Order` category to represent its custom *order coffee* intent. Consequently, Siri can provide default responses appropriate for this action, such as “Ready to order?” and “OK. Ordering.” Category selection also has other implications: because the `Order` category involves actions with financial consequences, using it for the *order coffee* intent requires user authentication before completion.

For several categories, the system provides supplementary verbs related to the category's default action. You may utilize these alternative verbs to ensure that the Siri dialogue and the button labels displayed in the interface align with how your app presents its actions. For example, besides the default verb *order*, the `Order` category also includes the verbs *buy* and *book*.

SiriKit defines the following custom intent categories and their associated verbs.

|Category|Default verb|Additional verbs|
|---|---|---|
|Generic|Do|Run, go|
|Information|View|Open|
|Order|Order|Book, buy|
|Start|Start|Navigate|
|Share|Share|Post, send|
|Create|Create|Add|
|Search|Search|Find, filter|
|Download|Download|Get|
|Other|Set|Request, toggle, check in|

SiriKit also defines three response types:

- Confirmation. Confirms the user's intent to proceed with the action.
- Success. Indicates that the action has been successfully initiated.
- Error. Informs the user that the requested action cannot be completed.

In several custom intent categories, SiriKit provides default dialogue for each response type. For example, the default confirmation phrase for the `Order` category is, “Ready to order?”, and the default success phrase for the `Share` category is, “OK. Shared.”

To customize a response, you develop a template that merges your custom dialogue with placeholders for information your app provides while processing the intent. For example, a coffee application might enhance the default order confirmation dialogue by including custom content that includes a placeholder for the total cost of the order.

Depending on the response type, your custom dialogue will appear either before or after the default dialogue. For example, confirmation responses present the default dialogue following any custom dialogue. In the coffee application scenario, the customized confirmation response would begin with content such as, “Your large coffee with cream comes to $2.50” and conclude with the default dialogue, “Ready to order?”
