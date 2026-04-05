# Interview Guide: Configuration

Ask 3-5 questions at a time. Skip questions where the answer is already known from the discovery phase.

## Round 1 — Environment variables
1. What are the required environment variables to run the project?
2. For each: what does it control, and where does the value come from?
3. Is there a `.env.example` file? Is it up to date?

## Round 2 — Config files
4. What config files does the project use? (wrangler.toml, biome.json, tsconfig, etc.)
5. Which are committed to the repo and which are gitignored?
6. Are there config differences between environments?

## Round 3 — Secrets and flags
7. How are secrets managed? (environment variables, vault, encrypted files)
8. Are there feature flags? How are they toggled?
9. For local development, who do you ask for credentials?
