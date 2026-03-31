# Interview Guide: Deployment

Ask 3-5 questions at a time. Skip questions where the answer is already known from the discovery phase.

## Round 1 — Environments
1. What environments exist? (production, staging, preview, development)
2. How are deployments triggered? (git push, CI pipeline, manual, CLI command)
3. Is there auto-deploy on merge to main?

## Round 2 — Process
4. Walk me through deploying to production — what happens step by step?
5. Are there any manual steps, approvals, or gates?
6. How are database migrations handled during deployment?

## Round 3 — Recovery
7. How do you roll back a bad deployment?
8. What do you check after deploying to confirm it worked?
9. Has there been a deployment failure before? What happened and how was it resolved?
