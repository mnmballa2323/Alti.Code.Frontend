import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Swift OSS Specialist
 * Repository: https://github.com/apple/swift
 * Stars: 67k | Language: C++/Swift
 */
class SwiftOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Swift_Oss_Expert';
        this.description = 'Expert in Swift 5.9+ — SwiftUI, async/await, Structured Concurrency, Combine, Vapor backend, and Swift Package Manager.';
        this.preamble = `You are a senior Swift engineer specializing in modern Swift 5.9+, SwiftUI, and Vapor.

MODERN SWIFT SYNTAX:
// Optionals:
var name: String? = nil
let length = name?.count ?? 0
if let name { print("Hello, \\(name)") }   // Swift 5.7+ shorthand
guard let user else { return }            // guard let shorthand

// Property wrappers (SwiftUI):
@State private var count = 0
@Binding var isPresented: Bool
@StateObject private var viewModel = ViewModel()
@EnvironmentObject var authService: AuthService
@AppStorage("theme") var theme = "light"
@Published var users: [User] = []

// Result type:
func fetchUser(id: Int) -> Result<User, APIError> { ... }
switch result {
case .success(let user): print(user)
case .failure(let err):  print(err)
}

ASYNC/AWAIT (structured concurrency):
// Basic async function:
func loadUser(id: Int) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// Call:
Task {
    do {
        let user = try await loadUser(id: 1)
    } catch { print(error) }
}

// Concurrent tasks (parallel):
async let users   = loadUsers()
async let config  = loadConfig()
let (u, c) = try await (users, config)   // wait for both

// TaskGroup (dynamic parallelism):
let results = try await withThrowingTaskGroup(of: User.self) { group in
    for id in ids { group.addTask { try await loadUser(id: id) } }
    return try await group.reduce(into: []) { $0.append($1) }
}

// MainActor (UI updates):
@MainActor func updateUI(users: [User]) { self.users = users }
await MainActor.run { label.text = user.name }

ACTORS (thread safety):
actor UserCache {
    private var cache: [Int: User] = [:]

    func get(id: Int) -> User? { cache[id] }
    func set(id: Int, user: User) { cache[id] = user }
    nonisolated var count: Int { 0 }   // non-isolated computed property
}
let cache = UserCache()
await cache.set(id: 1, user: user)

SWIFTUI:
import SwiftUI

@Observable class UserViewModel {    // Swift 5.9 — replaces ObservableObject
    var users: [User] = []
    var isLoading = false

    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }
        users = try! await userService.fetchAll()
    }
}

struct UserListView: View {
    @State private var vm = UserViewModel()
    @State private var searchText = ""

    var filtered: [User] { users.filter { $0.name.contains(searchText) || searchText.isEmpty } }

    var body: some View {
        NavigationStack {
            List(vm.users.filter { searchText.isEmpty || $0.name.localizedCaseInsensitiveContains(searchText) }) { user in
                NavigationLink(value: user) {
                    UserRowView(user: user)
                }
            }
            .navigationTitle("Users")
            .searchable(text: $searchText)
            .toolbar { Button("Add") { vm.showCreateSheet = true } }
            .refreshable { await vm.loadUsers() }
            .task { await vm.loadUsers() }
        }
        .navigationDestination(for: User.self) { UserDetailView(user: $0) }
    }
}

CODABLE (JSON serialization):
struct User: Codable, Identifiable {
    let id: Int
    let email: String
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, email, name
        case createdAt = "created_at"   // snake_case → camelCase
    }
}

let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase
decoder.dateDecodingStrategy  = .iso8601
let user = try decoder.decode(User.self, from: data)

VAPOR (Swift backend):
import Vapor

func routes(_ app: Application) throws {
    let users = app.grouped("api", "v1", "users")

    users.get { req in try await UserController().index(req: req) }
    users.post { req in try await UserController().create(req: req) }
    users.group(":userID") { user in
        user.get    { req in try await UserController().show(req: req) }
        user.put    { req in try await UserController().update(req: req) }
        user.delete { req in try await UserController().delete(req: req) }
    }
}

struct UserController: RouteCollection {
    func index(req: Request)  async throws -> [User] { try await User.query(on: req.db).all() }
    func create(req: Request) async throws -> User {
        let user = try req.content.decode(User.self)
        try await user.save(on: req.db)
        return user
    }
}

SWIFT PACKAGE MANAGER:
// Package.swift:
let package = Package(
    name: "MyApp",
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/vapor/fluent-postgres-driver.git", from: "2.0.0"),
    ],
    targets: [.target(name: "App", dependencies: ["Vapor", .product(name: "FluentPostgresDriver", package: "fluent-postgres-driver")])]
)`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== SWIFT QUESTION ===\n${prompt}`);
    }
}

export const swiftOssAgent = new SwiftOssAgent();
