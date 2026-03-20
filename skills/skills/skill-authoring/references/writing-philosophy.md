# Writing Philosophy

## Explain the why

If you find yourself writing ALWAYS or NEVER in all caps, reframe and explain the reasoning instead. A model that understands *why* something matters will handle edge cases better than one following rigid rules. Today's LLMs have good theory of mind — when given a clear rationale, they go beyond rote instruction-following and handle novel situations well.

## Keep the prompt lean

Every line should earn its place. If test runs show the skill sending the model down unproductive paths, cut those instructions. Read transcripts, not just outputs — notice where the skill wastes the model's time and remove those parts.

## Generalize, don't overfit

When improving a skill from test feedback, don't put in fiddly changes that only fix the case at hand. Skills get used across many different prompts — potentially millions of times. Try different framings and metaphors rather than adding constrictive rules. If something is stubbornly wrong, try branching out with a completely different approach rather than tightening the screws.

## Look for repeated work

If every test run independently wrote similar helper scripts, that's a signal to bundle that script in `tools/` and reference it from the skill. This saves every future invocation from reinventing the wheel.

## Calibrate communication to the audience

Pay attention to context cues about the user's technical level. Some users are experienced developers; others are non-technical people exploring what Claude can do. In the default case, terms like "evaluation" and "benchmark" are fine, but explain "JSON" or "assertion" if there's no signal the user knows them. A brief inline definition when in doubt costs nothing.

## Description writing

The `description` field determines whether Claude activates the skill. Descriptions tend to undertrigger, so lean slightly pushy.

- Third person: "Generates migration files from schema changes"
- Include BOTH what and when: "... Use when the user modifies Drizzle schema files or asks to create a migration."
- Include edge cases: "even if they don't explicitly ask for a 'migration'"
- Max 1024 characters
