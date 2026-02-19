# Xcode

Project configuration, scheme and target setup, and signing and provisioning.

## Responsibilities

- Configure Xcode projects
- Manage schemes and targets
- Set up code signing and provisioning
- Manage build settings and configurations across targets
- Detect and fix common Xcode project file issues
- Automate provisioning profile renewal

## Tools

- `tools/xcodeproj-lint.ts` — detect common issues in .xcodeproj files like missing file refs or duplicate targets
- `tools/xcode-signing-check.ts` — verify code signing and provisioning profiles are valid and not expired
- `tools/xcode-build-settings-diff.ts` — compare build settings between two schemes or targets
