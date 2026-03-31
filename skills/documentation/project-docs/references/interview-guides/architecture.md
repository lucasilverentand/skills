# Interview Guide: Architecture

Ask 3-5 questions at a time. Skip questions where the answer is already known from the discovery phase.

## Round 1 — High-level shape
1. How would you describe the system to a new team member in 2-3 sentences?
2. What are the major components or services? (Just names and one-liners for now)
3. Is this a monolith, monorepo with multiple services, microservices, or something else?

## Round 2 — Component deep-dive
For each component identified:
4. What technology does it use? (language, framework, runtime)
5. How does it communicate with other components? (HTTP, events, shared database, message queue)
6. Where does it run? (Cloudflare Workers, Railway, Kubernetes, Vercel, local only)

## Round 3 — Data and decisions
7. How does data flow through the system for the most common operation? Walk me through it.
8. What are the non-obvious design decisions — things that might surprise someone reading the code?
9. Are there any external dependencies or third-party services the system relies on?
10. What are the known constraints or bottlenecks?
