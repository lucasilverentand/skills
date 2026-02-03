# CI/CD Skills

Skills for continuous integration, delivery, and automation pipelines.

## Skills

| Skill | Description |
|-------|-------------|
| [github-actions](./github-actions/) | Create and debug GitHub Actions workflows |
| [gitlab-ci](./gitlab-ci/) | GitLab CI/CD pipeline configuration |
| [release-automation](./release-automation/) | Semantic versioning and changelog generation |
| [pre-commit-hooks](./pre-commit-hooks/) | Git hooks for code quality automation |

## Usage

```
/github-actions test           # Create test workflow
/github-actions deploy         # Create deployment workflow
/release-automation            # Set up semantic release
/pre-commit-hooks              # Configure pre-commit hooks
```

## Workflow Types

- **Test Workflows** - Run tests on PR and push
- **Build Workflows** - Build and artifact creation
- **Deploy Workflows** - Staging and production deployment
- **Release Workflows** - Versioning and publishing

## Supported Platforms

- GitHub Actions
- GitLab CI
- CircleCI patterns
- Jenkins patterns
