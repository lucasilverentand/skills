---
name: gitlab-ci
description: Creates GitLab CI/CD pipeline configurations. Use when setting up GitLab pipelines, configuring stages, or automating deployments on GitLab.
argument-hint: [pipeline-type]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# GitLab CI

Creates and configures GitLab CI/CD pipelines.

## Your Task

1. **Identify needs**: Determine pipeline requirements
2. **Check existing**: Review any existing .gitlab-ci.yml
3. **Create pipeline**: Write .gitlab-ci.yml configuration
4. **Configure stages**: Set up build, test, deploy stages
5. **Test**: Verify pipeline runs correctly

## Basic Pipeline

```yaml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "20"

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'

deploy:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run deploy
  only:
    - main
  environment:
    name: production
```

## Multi-Environment Pipeline

```yaml
deploy:staging:
  stage: deploy
  script:
    - npm run deploy:staging
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop

deploy:production:
  stage: deploy
  script:
    - npm run deploy:production
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
```

## Tips

- Use `cache` to speed up pipelines
- Use `artifacts` to share files between jobs
- Use `only/except` or `rules` for conditional jobs
- Configure environments for deployment tracking
