# Doc Type: Deployment (`docs/deployment.md`)

```markdown
# Deployment

## Environments
| Environment | URL | Branch | Auto-deploy? |
|---|---|---|---|
| Production | ... | main | ... |
| Staging | ... | develop | ... |
| Preview | ... | PR branches | ... |

## How to deploy
Step-by-step for each environment. Include manual steps if any exist.

## Configuration per environment
What differs between environments: env vars, feature flags, resource limits.

## Rollback
How to revert a bad deployment. Include the exact commands.

## Database migrations
How migrations are run during deployment. What happens if a migration fails.

## Monitoring after deploy
What to check after a deployment to confirm it succeeded. Key dashboards, logs, health endpoints.
```

**Guidance:**
- Rollback procedures are critical — write them before you need them
- Include who has deploy access and any approval requirements
- Migration strategy should cover both forward and backward compatibility
