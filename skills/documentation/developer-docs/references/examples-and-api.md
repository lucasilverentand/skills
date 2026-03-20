# Examples and API Documentation in READMEs

## Writing Good Examples

### Principles

- Every example must be copy-pasteable and runnable
- Show the output in a comment: `// { ok: true, data: '...' }`
- Start with the simplest use case, then show advanced patterns
- Run `tools/example-validator.ts` to verify examples compile

### Progression pattern

Start simple, add complexity:

```markdown
## Quick Start

// Simplest possible usage
const result = doThing('hello')
console.log(result) // 'HELLO'

## Advanced Usage

### With options
const result = doThing('hello', { format: 'json', validate: true })
// { ok: true, data: { value: 'HELLO', length: 5 } }

### Error handling
const result = doThing('')
// { ok: false, error: 'Input cannot be empty' }

### Streaming
for await (const chunk of doThingStream('hello')) {
  process.stdout.write(chunk)
}
```

### Common mistakes

- Showing only the import without a working example
- Using placeholder values that do not demonstrate the output
- Examples that require setup not shown in the README
- Missing error case examples

## Inline API Documentation

For small libraries, document the API inline in the README.

### Function documentation pattern

```markdown
### `doThing(input, options?)`

Process the input and return a result.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `input` | `string` | Yes | The input to process |
| `format` | `'json' \| 'text'` | No | Output format (default: `'json'`) |
| `validate` | `boolean` | No | Validate input before processing (default: `false`) |

**Returns:** `{ ok: true, data: string } | { ok: false, error: string }`

**Example:**

const result = doThing('hello', { format: 'text' })
// 'HELLO'
```

### Type documentation pattern

```markdown
### `Config`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `timeout` | `number` | `5000` | Request timeout in ms |
| `retries` | `number` | `3` | Max retry attempts |
| `baseUrl` | `string` | — | API base URL (required) |
| `headers` | `Record<string, string>` | `{}` | Custom request headers |
```

## Generated API Docs

For larger libraries, link to generated documentation.

```markdown
## API Reference

Full API documentation is available at [docs.example.com](https://docs.example.com) or in the [`/docs`](./docs) directory.

Generated from source with [TypeDoc](https://typedoc.org).
```

### Generation tools by language

| Language | Tool | Command |
|---|---|---|
| TypeScript | TypeDoc | `bunx typedoc --out docs src/index.ts` |
| Rust | rustdoc | `cargo doc --open` |
| Python | pdoc / Sphinx | `pdoc --html src/` |
| Swift | DocC | Xcode builds docs automatically |
| Go | godoc | `godoc -http=:6060` |

## Install Instructions by Platform

Choose the right install pattern for the project type.

### npm package

```markdown
npm install package-name
# or
bun add package-name
# or
pnpm add package-name
```

### CLI tool (global)

```markdown
npm install -g package-name
# or
bun add -g package-name
# or
brew install package-name
```

### Rust crate

```markdown
cargo add crate-name
# or
cargo install crate-name  # for CLI tools
```

### Swift package

```markdown
Add to `Package.swift`:
.package(url: "https://github.com/org/repo.git", from: "1.0.0")
```

### Homebrew

```markdown
brew tap org/tap
brew install tool-name
```

### From source

```markdown
git clone https://github.com/org/repo.git
cd repo
bun install  # or cargo build --release
```

## Changelog Section

For projects that maintain a changelog in the README:

```markdown
## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full list of changes.

### Recent

#### 2.1.0
- Added batch processing support
- Improved error messages

#### 2.0.0
- **Breaking**: Changed `process()` return type to Result
- Migrated to Bun runtime
- Dropped Node 18 support
```

For most projects, link to a separate `CHANGELOG.md` or GitHub Releases rather than inlining in the README.
