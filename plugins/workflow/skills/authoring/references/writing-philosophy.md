# Writing Philosophy

## Explain the why
If you find yourself writing ALWAYS or NEVER in all caps, reframe and explain the reasoning instead. A model that understands _why_ something matters will handle edge cases better than one following rigid rules. Today's LLMs have good theory of mind — when given a clear rationale, they go beyond rote instruction-following and handle novel situations well.

## Keep the prompt lean
Every line should earn its place. If test runs show the skill sending the model down unproductive paths, cut those instructions. Read transcripts, not just outputs — notice where the skill wastes the model's time and remove those parts.

## Generalize, don't overfit
When improving a skill from test feedback, don't put in fiddly changes that only fix the case at hand. Skills get used across many different prompts — potentially millions of times. Try different framings and metaphors rather than adding constrictive rules. If something is stubbornly wrong, try branching out with a completely different approach rather than tightening the screws.

## Look for repeated work
If every test run independently wrote similar helper scripts, that's a signal to bundle that script in `scripts/` and reference it from the skill. This saves every future invocation from reinventing the wheel.

## Calibrate communication to the audience
Pay attention to context cues about the user's technical level. Some users are experienced developers; others are non-technical people exploring what agents can do. In the default case, terms like "evaluation" and "benchmark" are fine, but explain "JSON" or "assertion" if there's no signal the user knows them. A brief inline definition when in doubt costs nothing.

## Description writing
The `description` field determines whether agents activate the skill. It is the single most important line you write — a perfect skill with a bad description never fires. Descriptions tend to undertrigger, so lean slightly pushy.

- Prefer trigger phrasing: "Use this skill when..." or "Use when..." tells the agent when to act.
- Include BOTH what and when: "Use this skill when the user modifies Drizzle schema files or asks to create a migration."
- Include edge cases: "even if they don't explicitly ask for a 'migration'"
- Max 1024 characters

### Before/after examples
|Problem|Before|After|
|---|---|---|
|Too vague — matches everything, triggers on noise|"Helps with database tasks"|"Use this skill when the user changes Drizzle schema files, asks to create a migration, or says 'update the database'. Generates and applies Drizzle ORM migrations."|
|Too narrow — misses common phrasings|"Creates a PR when the user says 'open a pull request'"|"Use this skill when the user says 'open a PR', 'submit for review', 'send this upstream', or finishes a feature branch. Opens a pull request from the current branch."|
|Overlapping — competes with another skill|"Writes and runs tests for code" (collides with a general testing skill)|"Use this skill when the user asks for Playwright E2E tests, browser tests, or integration tests that need a real browser. Avoid for unit tests."|

### Common failure modes
- **Too short / abstract** — agents can't distinguish it from other skills. Add the "Use when..." clause.
- **Too long** — walls of text get skimmed. Front-load the key verb and domain, keep under ~200 characters for the "what", use the rest for "when".
- **Missing synonyms** — users say "deploy", "ship", "push to prod", "release". List the phrasings your audience actually uses.
