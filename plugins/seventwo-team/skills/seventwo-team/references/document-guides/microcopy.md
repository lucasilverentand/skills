# Microcopy and UI text
Use for: short in-product text: errors, empty states, onboarding, tooltips and contextual help, confirmation dialogs, buttons and labels, notifications and email templates, loading, progress and success states. Readers are mid-task and scanning, so each string does one job in its space.

## Gather first
- **UI context:** the design, screenshot or component, and the state that triggers each string (first use, no results, loading, each failure, success).
- **Space:** character or width limits and truncation or wrapping per platform.
- **Existing strings:** the project's string/i18n files and their syntax, glossary and tone guidance. Use existing string tooling; build none.
- **Real behavior:** what the system does, from code, specs or the lead. Never invent features, policy, timeframes or promises; return gaps to the lead.

## Patterns
|Type|Pattern|
|---|---|
|Error|What happened, why if it helps, what to do next: "Payment failed. Your card was declined. Try another card." No blame; never a bare error code.|
|Confirmation|Name the action, its consequence and whether it is reversible. Buttons repeat the verb: "Delete project" / "Cancel", not "OK" / "Yes".|
|Empty state|What will appear here and the first useful action.|
|Button, label|Verb + object ("Invite member"). Same action, same verb everywhere; don't mix Delete/Remove.|
|Tooltip, help|One sentence answering "what is this?"; never hide required information there.|
|Onboarding|One idea per step, framed as the user's benefit, ending in its action.|
|Loading, progress|Name what is loading; show progress or duration only from real data.|
|Success|Name what changed ("Project archived"); offer undo or a next step only if it exists.|
|Notification, email|Subject: the key fact. Body: why the user got it. One call to action naming the action.|

## Rules
- **Localization:** leave room for text expansion, avoid idioms, and write whole sentences with named variables, never concatenated fragments. Handle plurals and variables in the project's i18n format, not "item(s)".
- **Accessibility:** link and button text works out of context ("Download invoice", not "Click here"). Don't convey state by color or icon alone. Give fields and icon-only controls an accessible name; placeholders aren't labels. Deeper checks: [accessibility reviewer](../presets/accessibility-reviewer.md).
- **Tone:** only when unsettled, offer two or three options (neutral, warm, formal) with a recommendation; the lead decides.
- **Delivery:** a table of location/key, text and notes (state, limit, variables, current or proposed), or edits to the project's string files when assigned; source locale only unless translations are assigned. Return new terms and voice decisions to the lead for the [knowledge home](../knowledge-and-planning.md).

## Check before handing back
- Every trigger state has a string; none shows a raw error, blank area or key.
- Each string fits its limit with the longest variable value and expanded translations, verified in the rendered UI or flagged unverified.
- Verbs and terms match the glossary and existing strings.

## Boundaries
Flow, navigation and layout design, and long-form content (help articles, guides, API references), are out of scope; return flow problems to the lead.
