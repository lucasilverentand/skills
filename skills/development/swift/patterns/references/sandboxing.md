# Sandboxing, File Access, and Drag & Drop

## Entitlements

macOS apps distributed via the App Store must be sandboxed. Configure in `*.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

### Common entitlements

| Entitlement | Purpose |
|---|---|
| `com.apple.security.app-sandbox` | Enables sandboxing (required for App Store) |
| `com.apple.security.network.client` | Outgoing network requests |
| `com.apple.security.network.server` | Incoming network connections |
| `com.apple.security.files.user-selected.read-write` | Files the user explicitly picks |
| `com.apple.security.files.downloads.read-write` | Downloads folder access |
| `com.apple.security.files.bookmarks.app-scope` | Persist access to user-selected files |
| `com.apple.security.temporary-exception.files.absolute-path.read-only` | Escape hatch — avoid if possible |

### Principle of least privilege

Only request entitlements you actually need. Each one you add is a justification required during App Store review.

## File Access

### Document-based apps

Use `DocumentGroup` for apps that open/save files:

```swift
@main
struct MyApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: { TextDocument() }) { file in
            TextEditorView(document: file.$document)
        }
    }
}

struct TextDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.plainText] }

    var text: String

    init(text: String = "") {
        self.text = text
    }

    init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents else {
            throw CocoaError(.fileReadCorruptFile)
        }
        text = String(data: data, encoding: .utf8) ?? ""
    }

    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: Data(text.utf8))
    }
}
```

### File picker

```swift
.fileImporter(isPresented: $showImporter, allowedContentTypes: [.image]) { result in
    switch result {
    case .success(let url):
        guard url.startAccessingSecurityScopedResource() else { return }
        defer { url.stopAccessingSecurityScopedResource() }
        loadImage(from: url)
    case .failure(let error):
        self.error = error
    }
}
```

Always call `startAccessingSecurityScopedResource()` / `stopAccessingSecurityScopedResource()` when working with sandboxed file URLs.

## Drag and Drop

### Making views draggable

```swift
ItemView(item: item)
    .draggable(item)  // item must conform to Transferable
```

### Transferable conformance

```swift
struct ProjectItem: Transferable {
    let id: UUID
    let name: String

    static var transferRepresentation: some TransferRepresentation {
        CodableRepresentation(contentType: .data)
    }
}
```

### Drop targets

```swift
DestinationView()
    .dropDestination(for: ProjectItem.self) { items, location in
        handleDrop(items)
        return true
    }
```
