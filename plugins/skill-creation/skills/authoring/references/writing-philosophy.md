# Writing Philosophy

## Explain the why
If you find yourself writing ALWAYS or NEVER in all caps, reframe and explain the reasoning instead. A model that understands _why_ something matters will handle edge cases better than one following rigid rules. Today's LLMs have good theory of mind — when given a clear rationale, they go beyond rote instruction-following and handle novel situations well.

## Keep the prompt lean
Every line should earn its place. If test runs show the skill sending the model down unproductive paths, cut those instructions. Read transcripts, not just outputs — notice where the skill wastes the model's time and remove those parts.

## Generalize, don't overfit
When improving a skill from test feedback, don't put in fiddly changes that only fix the case at hand. Skills get used across many different prompts — potentially millions of times. Try different framings and metaphors rather than adding constrictive rules. If something is stubbornly wrong, try branching out with a completely different approach rather than tightening the screws.

## Look for repeated work
If every test run independently wrote similar helper scripts, that's a signal to bundle that script in `tools/` and reference it from the skill. This saves every future invocation from reinventing the wheel.

## Calibrate communication to the audience
Pay attention to context cues about the user's technical level. Some users are experienced developers; others are non-technical people exploring what Claude can do. In the default case, terms like "evaluation" and "benchmark" are fine, but explain "JSON" or "assertion" if there's no signal the user knows them. A brief inline definition when in doubt costs nothing.

## Description writing
The `description` field determines whether Claude activates the skill. It is the single most important line you write — a perfect skill with a bad description never fires. Descriptions tend to undertrigger, so lean slightly pushy.

- Third person: "Generates migration files from schema changes"
- Include BOTH what and when: "... Use when the user modifies Drizzle schema files or asks to create a migration."
- Include edge cases: "even if they don't explicitly ask for a 'migration'"
- Max 1024 characters

### Before/after examples

|Problem|Before|After|
|---|---|---|
|Too vague — matches everything, triggers on noise|"Helps with database tasks"|"Generates and applies Drizzle ORM migration files. Use when the user changes a schema file, asks to migrate, or says 'update the database'."|
|Too narrow — misses common phrasings|"Creates a PR when the user says 'open a pull request'"|"Opens a pull request for the current branch — rebases, writes a description from commits, and creates via gh CLI. Use when the user says 'open a PR', 'submit for review', 'send this upstream', or finishes a feature branch."|
|Overlapping — competes with another skill|"Writes and runs tests for code" (collides with a general testing skill)|"Writes Playwright end-to-end tests for browser flows. Use when the user asks for E2E tests, browser tests, or integration tests that need a real browser."|

### Common failure modes
- **Too short / abstract** — Claude can't distinguish it from other skills. Add the "Use when..." clause.
- **Too long** — walls of text get skimmed. Front-load the key verb and domain, keep under ~200 characters for the "what", use the rest for "when".
- **Missing synonyms** — users say "deploy", "ship", "push to prod", "release". List the phrasings your audience actually uses.
