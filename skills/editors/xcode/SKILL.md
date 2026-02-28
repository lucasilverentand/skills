---
name: xcode
description: Configures Xcode projects, manages schemes and targets, sets up code signing and provisioning profiles, and detects common project file issues. Use when the user is working on an iOS/macOS Swift project in Xcode, needs to configure build settings, set up signing, add a target or scheme, or fix .xcodeproj issues. Trigger phrases: "Xcode", "xcodeproj", "scheme", "target", "signing", "provisioning profile", "build settings", "Swift package", "iOS project".
allowed-tools: Read Grep Glob Bash
---

# Xcode

## Decision Tree

- What do you need to do?
  - **Configure a target or scheme** → follow "Targets and schemes" below
  - **Set up code signing** → follow "Code signing" below
  - **Inspect or fix build settings** → run `tools/xcode-build-settings-diff.ts <scheme1> <scheme2>`
  - **Detect .xcodeproj issues** → run `tools/xcodeproj-lint.ts`
  - **Check signing and provisioning** → run `tools/xcode-signing-check.ts`
  - **Add a Swift Package dependency** → follow "Swift packages" below

## Targets and schemes

Xcode project structure:
- **Target** — a build product (app, framework, test bundle, extension)
- **Scheme** — defines build/run/test/archive actions and which target they apply to

When adding a new target:
1. File → New → Target in Xcode
2. Set the bundle identifier, deployment target, and Swift version consistently
3. Verify build settings with `tools/xcode-build-settings-diff.ts` against an existing target
4. Add the target to a scheme if it needs its own run/test action

When to add a scheme:
- Different build configurations for the same target (e.g. staging vs production)
- A separate target that needs its own run configuration

## Code signing

Signing requires: a certificate, a provisioning profile, and a matching bundle ID.

1. Check current state: `tools/xcode-signing-check.ts` — verifies profiles are valid and not expired
2. For development: use "Automatically manage signing" in Xcode (team account required)
3. For CI/distribution: use manual signing
   - Certificate: install in keychain or use `CERTIFICATE_BASE64` env var in CI
   - Profile: download from developer.apple.com or use `fastlane match`
4. Common signing errors:
   - **"No profiles for bundle ID"** → bundle ID mismatch or profile not downloaded
   - **"Certificate has expired"** → renew on developer.apple.com and re-download
   - **"Entitlements do not match"** → capabilities in the app and profile are out of sync

## Build settings

Build settings cascade: project defaults → target overrides → configuration overrides.

- Keep configuration-specific settings (API URLs, feature flags) in `.xcconfig` files, not hardcoded
- Example: `Config/Debug.xcconfig`, `Config/Release.xcconfig`
- Reference xcconfig values: `$(API_BASE_URL)`
- Diff settings between targets or schemes: `tools/xcode-build-settings-diff.ts`

Key settings to standardize across targets:
- `SWIFT_VERSION` — set to `6.2` for new projects
- `IPHONEOS_DEPLOYMENT_TARGET` — align with the minimum iOS version
- `ENABLE_STRICT_CONCURRENCY_CHECKING` — set to `complete` for Swift 6

## Swift packages

Add via File → Add Package Dependencies (Xcode) or by editing `Package.swift` (for Swift package projects).

For Xcode projects (not SPM-first):
- Dependencies are stored in `project.xcworkspace/xcshareddata/swiftpm/`
- Commit this directory — it records resolved versions
- For zero-dependency philosophy: prefer in-tree code over packages where practical

## Key references

| File | What it covers |
|---|---|
| `tools/xcodeproj-lint.ts` | Detect common issues in .xcodeproj files like missing file refs or duplicate targets |
| `tools/xcode-signing-check.ts` | Verify code signing and provisioning profiles are valid and not expired |
| `tools/xcode-build-settings-diff.ts` | Compare build settings between two schemes or targets |
