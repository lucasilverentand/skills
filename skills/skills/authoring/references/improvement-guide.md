# Improving a Skill

After running test cases and getting user feedback, improve the skill based on what you learned.

## How to think about improvements

1. **Generalize from feedback.** Skills get used across many different prompts — potentially millions of times. Rather than putting in fiddly, overfitty changes or constrictive MUSTs, try different framings and metaphors if something is stubborn. Branch out with a different approach rather than tightening the screws.

2. **Keep the prompt lean.** Remove things that aren't pulling their weight. Read the transcripts, not just final outputs — if the skill is making the model waste time on unproductive paths, cut those instructions.

3. **Explain the why.** Explain the reasoning behind everything. Today's LLMs have good theory of mind — when given a clear rationale, they handle novel situations well. If you find yourself writing ALWAYS or NEVER in all caps, reframe and explain the reasoning instead.

4. **Look for repeated work.** Read the test run transcripts and notice if subagents all independently wrote similar helper scripts or took the same multi-step approach. If all 3 test cases resulted in the subagent writing a similar helper, bundle that script in the skill. Write it once, put it in `scripts/` or `tools/`, and tell the skill to use it.

## The iteration loop

After improving the skill:

1. Apply improvements to the skill
2. Rerun all test cases into a new `iteration-<N+1>/` directory, including baseline runs
   - **New skill**: baseline is always `without_skill` (no skill) across all iterations
   - **Improving existing skill**: use your judgment — the original version the user started with, or the previous iteration
3. Launch the viewer with `--previous-workspace` pointing at the previous iteration
4. Wait for the user to review
5. Read new feedback, improve again, repeat

Keep going until:
- The user says they're happy
- Feedback is all empty (everything looks good)
- You're not making meaningful progress

## After each iteration: re-validate structure

Improvements may violate authoring structure. Check:
- SKILL.md still under 5000 tokens?
- Decision tree still intact and covering all responsibilities?
- No content duplicated between SKILL.md and references?
- New content placed correctly? (detailed docs -> references, automatable steps -> tools, workflow -> SKILL.md)
