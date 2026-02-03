# GitHub Skills Recommendations Report

> **Date:** February 2026
> **Status:** Proposal
> **Author:** Claude Code Analysis

---

## Executive Summary

This report analyzes the current skills repository and provides recommendations for expanding GitHub-specific capabilities. The existing **issues** plugin (3 skills) focuses on issue management. This proposal outlines **20 new skills** organized into **6 plugins** to provide comprehensive GitHub workflow coverage.

---

## Current State

### Existing GitHub-Related Skills

| Plugin | Skill | Purpose |
|--------|-------|---------|
| issues | `create-issue` | Create well-structured issues on GitHub/GitLab |
| issues | `analyze-issue` | Deep analysis of issues against codebase |
| issues | `cleanup-issue` | Format and organize issues with labels and metadata |

### Gap Analysis

| Workflow Area | Current Coverage | Gap |
|---------------|------------------|-----|
| Issues | ✅ Full | — |
| Pull Requests | ❌ None | High priority |
| CI/CD (Actions) | ❌ None | High priority |
| Releases | ❌ None | Medium priority |
| Repository Setup | ❌ None | Medium priority |
| Security | ❌ None | Medium priority |
| Project Management | ❌ None | Lower priority |

---

## Recommended Skills

### 1. Pull Requests Plugin

**Priority:** 🔴 High
**Rationale:** PRs are central to GitHub workflows and complement the existing issues plugin.

| Skill | Description | Key Features |
|-------|-------------|--------------|
| `pr-create` | Creates well-structured pull requests with proper descriptions, linked issues, and context. Use when opening PRs, drafting PR descriptions, or preparing code for review. | • Conventional PR titles<br>• Auto-link related issues<br>• Template detection<br>• Draft PR support |
| `pr-review` | Reviews pull request diffs for bugs, security issues, and best practices. Use when reviewing PRs, providing feedback, or checking code quality before merge. | • Diff analysis<br>• Security scanning<br>• Style consistency<br>• Inline suggestions |
| `pr-update` | Updates PR descriptions, titles, and metadata to match repository standards. Use when cleaning up PRs, adding missing context, or improving reviewability. | • Description enhancement<br>• Label application<br>• Reviewer suggestions<br>• Checklist completion |
| `pr-conflict` | Guides resolution of merge conflicts with context-aware suggestions. Use when handling merge conflicts, rebasing branches, or resolving competing changes. | • Conflict explanation<br>• Resolution strategies<br>• Rebase guidance<br>• History preservation |

---

### 2. GitHub Actions Plugin

**Priority:** 🔴 High
**Rationale:** CI/CD is essential for modern development; Actions debugging is a common pain point.

| Skill | Description | Key Features |
|-------|-------------|--------------|
| `actions-init` | Creates GitHub Actions workflows for CI/CD pipelines. Use when setting up CI, adding automated testing, or configuring deployment workflows. | • Language detection<br>• Workflow templates<br>• Matrix builds<br>• Caching setup |
| `actions-debug` | Debugs failing GitHub Actions workflows by analyzing logs and configurations. Use when CI is failing, workflows timeout, or actions produce unexpected results. | • Log analysis<br>• Common error patterns<br>• Permission issues<br>• Secret troubleshooting |
| `actions-optimize` | Optimizes GitHub Actions for speed and cost reduction. Use when workflows are slow, hitting rate limits, or consuming excessive minutes. | • Cache optimization<br>• Job parallelization<br>• Conditional execution<br>• Runner selection |

---

### 3. Releases Plugin

**Priority:** 🟡 Medium
**Rationale:** Release management is a natural extension of the development workflow.

| Skill | Description | Key Features |
|-------|-------------|--------------|
| `release-notes` | Generates release notes from commits, PRs, and issues between versions. Use when preparing releases, writing changelogs, or summarizing changes. | • Commit categorization<br>• PR extraction<br>• Breaking change detection<br>• Contributor credits |
| `changelog-update` | Maintains CHANGELOG.md following Keep a Changelog format. Use when updating changelogs, documenting breaking changes, or preparing version bumps. | • Keep a Changelog format<br>• Version sections<br>• Link generation<br>• Unreleased tracking |
| `version-bump` | Manages semantic versioning based on commit history and breaking changes. Use when determining version numbers, tagging releases, or following semver. | • Conventional commits parsing<br>• Semver calculation<br>• Tag creation<br>• Package.json updates |

---

### 4. Repository Setup Plugin

**Priority:** 🟡 Medium
**Rationale:** Streamlines new project setup and ensures best practices from the start.

| Skill | Description | Key Features |
|-------|-------------|--------------|
| `repo-init` | Initializes GitHub repositories with best-practice configurations. Use when creating new repos, setting up branch protection, or configuring repository settings. | • Branch protection rules<br>• Default labels<br>• Repository settings<br>• Team permissions |
| `templates-setup` | Creates issue and PR templates for consistent contributions. Use when standardizing issues, improving PR quality, or onboarding contributors. | • Issue templates<br>• PR templates<br>• Config.yml forms<br>• Template chooser |
| `codeowners-manage` | Manages CODEOWNERS files for automated review assignments. Use when setting up code ownership, distributing review load, or protecting critical paths. | • Path patterns<br>• Team assignments<br>• Validation<br>• Coverage analysis |
| `contributing-guide` | Creates CONTRIBUTING.md with development setup and guidelines. Use when onboarding contributors, documenting workflows, or establishing contribution standards. | • Setup instructions<br>• Code style guide<br>• PR process<br>• Issue guidelines |

---

### 5. Security Plugin

**Priority:** 🟡 Medium
**Rationale:** Security is increasingly critical; GitHub has robust security features that need configuration.

| Skill | Description | Key Features |
|-------|-------------|--------------|
| `dependabot-config` | Configures Dependabot for automated dependency updates. Use when setting up security updates, managing dependency freshness, or configuring update schedules. | • Ecosystem detection<br>• Update schedules<br>• Grouping rules<br>• Ignore patterns |
| `security-advisory` | Creates and manages GitHub security advisories for vulnerabilities. Use when disclosing vulnerabilities, requesting CVEs, or coordinating security fixes. | • Advisory creation<br>• CVSS scoring<br>• CVE requests<br>• Coordinated disclosure |
| `secrets-audit` | Audits repository for exposed secrets and configures secret scanning. Use when checking for leaked credentials, setting up secret protection, or rotating exposed secrets. | • Pattern detection<br>• Push protection<br>• Alert management<br>• Rotation guidance |

---

### 6. Project Management Plugin

**Priority:** 🟢 Lower
**Rationale:** Useful but less frequently needed than core development workflows.

| Skill | Description | Key Features |
|-------|-------------|--------------|
| `projects-manage` | Manages GitHub Projects boards, automations, and views. Use when organizing work, setting up project boards, or configuring project automations. | • Board creation<br>• Custom fields<br>• Automations<br>• View configuration |
| `labels-sync` | Synchronizes and manages repository labels across projects. Use when standardizing labels, creating label schemes, or migrating label configurations. | • Label schemes<br>• Color coding<br>• Cross-repo sync<br>• Naming conventions |
| `milestones-track` | Manages milestones and tracks progress toward releases. Use when planning releases, tracking milestone completion, or organizing issues by version. | • Milestone creation<br>• Progress tracking<br>• Due date management<br>• Issue association |

---

## Implementation Roadmap

```
Phase 1 (Immediate)          Phase 2 (Short-term)         Phase 3 (Medium-term)
─────────────────────        ────────────────────         ─────────────────────
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   Pull Requests     │      │   GitHub Actions    │      │     Releases        │
│   ───────────────   │      │   ──────────────    │      │     ────────        │
│   • pr-create       │      │   • actions-init    │      │   • release-notes   │
│   • pr-review       │      │   • actions-debug   │      │   • changelog-update│
│   • pr-update       │      │   • actions-optimize│      │   • version-bump    │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
         │                            │                            │
         ▼                            ▼                            ▼
   Complements                  High developer               Natural workflow
   existing issues              demand area                  extension
   plugin

Phase 4 (Longer-term)
─────────────────────
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   Repository Setup  │      │      Security       │      │ Project Management  │
│   ────────────────  │      │      ────────       │      │ ──────────────────  │
│   • repo-init       │      │   • dependabot-conf │      │   • projects-manage │
│   • templates-setup │      │   • security-advis  │      │   • labels-sync     │
│   • codeowners-mgmt │      │   • secrets-audit   │      │   • milestones-track│
│   • contributing    │      │                     │      │                     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

---

## Skill Distribution Summary

| Plugin | Skills | Priority | Est. Complexity |
|--------|--------|----------|-----------------|
| pull-requests | 4 | High | Medium |
| github-actions | 3 | High | High |
| releases | 3 | Medium | Low |
| repo-setup | 4 | Medium | Low |
| security | 3 | Medium | Medium |
| project-management | 3 | Lower | Low |
| **Total** | **20** | — | — |

---

## Technical Considerations

### CLI Dependencies

All recommended skills leverage the `gh` CLI which is already used by existing issues skills:

```bash
# Pull Requests
gh pr create, gh pr view, gh pr review, gh pr merge

# Actions
gh run list, gh run view, gh workflow list, gh workflow run

# Releases
gh release create, gh release list, gh release view

# Repository
gh repo edit, gh label list, gh api

# Security
gh api /repos/{owner}/{repo}/security-advisories
```

### Skill Architecture Alignment

All proposed skills follow the established patterns:
- **Progressive disclosure** with Level 1/2/3 content separation
- **YAML frontmatter** with name, description, argument-hint, allowed-tools
- **Markdown body** with task steps, examples, templates, and validation checklists
- **References directory** for extended documentation

---

## Conclusion

Implementing these 20 skills across 6 plugins would transform the repository from issue-focused to providing **comprehensive GitHub workflow coverage**. The phased approach prioritizes high-impact skills (Pull Requests, Actions) while building toward complete GitHub platform support.

### Recommended First Steps

1. Create the `pull-requests` plugin with `pr-create` and `pr-review`
2. Update `marketplace.json` with new plugin definitions
3. Validate against existing skill patterns using `skill-validate`
