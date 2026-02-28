# README Structure Templates

Complete README templates for different project types.

## Library / CLI

```markdown
# project-name

One-line description of what it does and for whom.

![CI](badge) ![npm](badge) ![License](badge)

## Install

npm install project-name
# or
bun add project-name

## Quick Start

// The shortest working example — not just an import
import { doThing } from 'project-name'

const result = doThing({ input: 'hello' })
console.log(result) // { ok: true, data: '...' }

## Usage

### Feature A

Description and example.

### Feature B

Description and example.

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `5000` | Request timeout in ms |
| `retries` | `number` | `3` | Max retry attempts |

## API Reference

Link to generated API docs or inline the key exports.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
```

## Internal Service / App

```markdown
# service-name

What it does and how it fits in the system.

## Architecture

Brief description of the service's role, what it depends on, and what depends on it.

## Local Development

### Prerequisites
- Bun >= 1.2
- OrbStack (for local Postgres)

### Setup
git clone ...
cd service-name
bun install
cp .env.example .env
docker compose up -d

### Run
bun run dev

### Test
bun test

## Deployment

Deployed via [Railway / Cloudflare / Kubernetes]. See [runbook](link).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `API_KEY` | Yes | External service API key |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
```

## Workspace Package (monorepo)

```markdown
# @scope/package-name

What this package exports and which packages depend on it.

## Usage

Import from within the monorepo:

import { utility } from '@scope/package-name'

## Exports

- `utility()` — description
- `HelperType` — description

## Development

bun test --filter @scope/package-name
```

Keep workspace READMEs short — they are internal documentation, not marketing.

## Expo / React Native App

```markdown
# app-name

Short description of the app.

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)

## Screenshots

| Home | Profile | Settings |
|------|---------|----------|
| ![home](screenshots/home.png) | ![profile](screenshots/profile.png) | ![settings](screenshots/settings.png) |

## Development

### Prerequisites
- Bun >= 1.2
- Expo CLI: `bun add -g expo-cli`
- iOS: Xcode 16+ and iOS Simulator
- Android: Android Studio with an emulator

### Setup
git clone ...
cd app-name
bun install
cp .env.example .env

### Run
bun run ios       # iOS simulator
bun run android   # Android emulator
bun run start     # Expo dev server

### Test
bun test
bun run test:e2e  # Maestro E2E tests

## Project Structure

packages/
  app/            # Expo app
  api/            # Hono backend
  shared/         # Shared types and utils
  ui/             # Shared UI components

## Deployment

- iOS: EAS Build → TestFlight → App Store
- Android: EAS Build → Internal Testing → Play Store
- API: Cloudflare Workers via Wrangler

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | Yes | Backend API URL |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Sentry error tracking |
```

## Rust CLI Tool

```markdown
# tool-name

Short description of what the tool does.

![CI](badge) ![crates.io](badge) ![License](badge)

## Install

cargo install tool-name

### From source
git clone ...
cd tool-name
cargo build --release
cp target/release/tool-name ~/.local/bin/

### Homebrew (macOS)
brew tap org/tap
brew install tool-name

## Usage

tool-name <input> [options]

### Examples

# Basic usage
tool-name process input.txt

# With options
tool-name process input.txt --output json --verbose

# Pipe from stdin
cat data.txt | tool-name transform

## Commands

| Command | Description |
|---------|-------------|
| `process` | Process input files |
| `transform` | Transform data format |
| `validate` | Validate input against schema |

## Configuration

Config file at `~/.config/tool-name/config.toml`:

[defaults]
output = "json"
verbose = false

[processing]
threads = 4
buffer_size = 8192

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
```

## Swift / iOS App

```markdown
# AppName

Short description of the app.

![Platform](https://img.shields.io/badge/platform-iOS%2026-blue)
![Swift](https://img.shields.io/badge/Swift-6.2-orange)

## Requirements

- iOS 26+
- Xcode 26+
- Swift 6.2

## Setup

git clone ...
cd AppName

### Using Tuist
tuist install
tuist generate
open AppName.xcworkspace

### Using SPM (no Tuist)
open Package.swift

## Architecture

MVVM with SwiftUI and `@Observable`.

## Testing

# Run all tests
swift test

# Run specific test
swift test --filter AppNameTests.FeatureTests

## License

MIT
```
