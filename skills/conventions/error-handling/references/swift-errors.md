# Swift Error Handling Patterns

## Error Type Design

Always use enums with associated values. Each module defines its own error type:

```swift
enum NetworkError: Error, LocalizedError {
    case noConnection
    case timeout(after: TimeInterval)
    case httpError(statusCode: Int, body: Data?)
    case decodingFailed(type: String, underlying: Error)

    var errorDescription: String? {
        switch self {
        case .noConnection:
            "No network connection"
        case .timeout(let duration):
            "Request timed out after \(Int(duration))s"
        case .httpError(let code, _):
            "Server returned \(code)"
        case .decodingFailed(let type, _):
            "Failed to decode \(type)"
        }
    }
}
```

## Typed Throws (Swift 6.2)

Specify the exact error type a function can throw:

```swift
func fetchUser(id: String) async throws(NetworkError) -> User {
    guard Reachability.isConnected else {
        throw .noConnection
    }

    let (data, response) = try await URLSession.shared.data(from: userURL(id))
        .mapError { _ in NetworkError.timeout(after: 30) }

    guard let http = response as? HTTPURLResponse else {
        throw .httpError(statusCode: 0, body: nil)
    }

    guard http.statusCode == 200 else {
        throw .httpError(statusCode: http.statusCode, body: data)
    }

    do {
        return try JSONDecoder().decode(User.self, from: data)
    } catch {
        throw .decodingFailed(type: "User", underlying: error)
    }
}
```

## Error Translation Between Layers

Service layer wraps network errors in domain errors:

```swift
enum UserServiceError: Error {
    case notFound(id: String)
    case unauthorized
    case serverError(String)
    case validationFailed([FieldError])
}

struct UserService {
    let network: NetworkClient

    func getUser(id: String) async throws(UserServiceError) -> User {
        do {
            return try await network.fetchUser(id: id)
        } catch let error as NetworkError {
            switch error {
            case .httpError(404, _):
                throw .notFound(id: id)
            case .httpError(401, _):
                throw .unauthorized
            case .httpError(let code, _):
                throw .serverError("HTTP \(code)")
            default:
                throw .serverError(error.localizedDescription)
            }
        }
    }
}
```

## View Model Error Handling

View models catch service errors and expose user-facing state:

```swift
@Observable
@MainActor
final class UserProfileViewModel {
    var user: User?
    var errorMessage: String?
    var isLoading = false

    private let service: UserService

    init(service: UserService) {
        self.service = service
    }

    func load(id: String) async {
        isLoading = true
        errorMessage = nil

        do {
            user = try await service.getUser(id: id)
        } catch {
            errorMessage = switch error {
            case .notFound:
                "User not found"
            case .unauthorized:
                "Please sign in to view this profile"
            case .serverError(let msg):
                "Something went wrong: \(msg)"
            case .validationFailed:
                "Invalid request"
            }
        }

        isLoading = false
    }
}
```

## try? and try! Usage

```swift
// try? — discard the error, get nil instead. Use for optional lookups.
let cachedUser = try? cache.get(id)

// try! — crash if it throws. Only for:
// 1. Tests
// 2. Compile-time provable safety (decoding a bundled JSON file)
let config = try! JSONDecoder().decode(Config.self, from: bundledConfigData)
```

## Result Type (When Not Using Throws)

For callbacks and stored closures where `throws` doesn't work:

```swift
func fetchAsync(id: String, completion: @Sendable (Result<User, NetworkError>) -> Void) {
    Task {
        do {
            let user = try await fetchUser(id: id)
            completion(.success(user))
        } catch {
            completion(.failure(error))
        }
    }
}
```

Prefer `async throws` over callbacks with `Result` — use `Result` only when the API requires it.
