# Language Specialists Reference

The platform employs **15 Deep Language Specialists**. These agents are designed to replace $300K/year senior engineers in their respective stacks. 

Unlike standard generic LLM wrappers, each specialist is loaded with a **4,000 to 6,000-word system prompt** that enforces strict rules regarding runtime internals, memory management, zero-day security patterns, testing paradigms, and advanced framework usage.

## The 15 Core Languages

### 1. Rust
- **Depth:** 6,000 words. Extreme focus on memory safety.
- **Key Capabilities:** Borrow checker nuances, lifetimes, concurrency (Tokio/async-std), macro development, zero-cost abstractions, unsafe blocks auditing, FFI, testing with Cargo.
- **Use Cases:** Systems programming, high-performance web servers, WASM.

### 2. Go
- **Depth:** 5,500 words. Idiomatic constraints.
- **Key Capabilities:** Goroutines, channels, interface composition, standard library mastery, zero-allocation optimization, pprof analysis, table-driven testing, contextual cancellation.
- **Use Cases:** Microservices, CLI tools, Kubernetes operators.

### 3. C++
- **Depth:** 6,000 words. Modern C++ (C++17/20/23).
- **Key Capabilities:** Smart pointers, template metaprogramming, STL deep dives, CMake configuration, memory leak hunting, RAII compliance, undefined behavior avoidance.
- **Use Cases:** Game engines, HFT algorithms, OS internals.

### 4. C
- **Depth:** 5,000 words. Posix compliance.
- **Key Capabilities:** Pointer arithmetic, manual memory management (malloc/free/valgrind), syscalls, socket programming, hardware interfacing, buffer overflow prevention.
- **Use Cases:** Embedded systems, drivers, legacy modernization.

### 5. Python
- **Depth:** 5,500 words. Data and async focus.
- **Key Capabilities:** CPython internals, GIL workarounds, asyncio, FastAPI/Django architecture, Pandas/NumPy optimization, Pytest fixtures, type hinting (mypy), poetry.
- **Use Cases:** AI/ML pipelines, data engineering, backend APIs.

### 6. TypeScript
- **Depth:** 5,000 words. Type gymnastics.
- **Key Capabilities:** Advanced generics, conditional types, AST manipulation, TS compiler API, React/Next.js/Vue integrations, strict mode compliance, ESLint rule writing.
- **Use Cases:** Enterprise frontends, BFFs, complex generic libraries.

### 7. JavaScript
- **Depth:** 4,500 words. Engine and DOM focus.
- **Key Capabilities:** V8 engine optimization (hidden classes), event loop mechanics, closure memory leaks, vanilla DOM manipulation, Web Workers, Node.js streams, Jest.
- **Use Cases:** Core web APIs, lightweight scripting, legacy migrations.

### 8. Java
- **Depth:** 5,500 words. JVM tuning.
- **Key Capabilities:** Garbage collector tuning (G1/ZGC), Spring Boot internals, Hibernate/JPA caching, concurrent data structures, Project Loom (virtual threads), JUnit 5.
- **Use Cases:** Enterprise backend architectures, Android, big data.

### 9. C#
- **Depth:** 5,500 words. .NET CLR mastery.
- **Key Capabilities:** ASP.NET Core pipelines, Entity Framework Core query optimization, LINQ internals, async/await state machines, Blazor, xUnit, memory span optimization.
- **Use Cases:** Enterprise apps, Azure integrations, Unity scripting.

### 10. Swift
- **Depth:** 4,500 words. Apple ecosystem.
- **Key Capabilities:** ARC memory management, SwiftUI state flows, Combine framework, Swift Concurrency (Actors), protocol-oriented programming, XCTest.
- **Use Cases:** Native iOS/macOS apps.

### 11. Kotlin
- **Depth:** 5,000 words. Coroutine mastery.
- **Key Capabilities:** Coroutine dispatchers, Flow/StateFlow, Android Jetpack, Ktor, multiplatform (KMP), null-safety idiomatics, DSL construction.
- **Use Cases:** Modern Android, backend services.

### 12. PHP
- **Depth:** 4,000 words. Modern PHP 8+.
- **Key Capabilities:** Laravel/Symfony deep internals, OPcache optimization, JIT compiler nuances, PDO security, Composer, Pest/PHPUnit.
- **Use Cases:** Web applications, WordPress core plugin development.

### 13. Ruby
- **Depth:** 4,500 words. Metaprogramming and Rails.
- **Key Capabilities:** Active Record query optimization, Ruby object model, Rack middleware, RSpec behavior-driven design, Sidekiq concurrency, YARV.
- **Use Cases:** Rapid startup development, monolithic apps.

### 14. SQL
- **Depth:** 5,000 words. Advanced RDBMS.
- **Key Capabilities:** Execution plan analysis, B-Tree/Hash indexing, Window functions, CTEs, transaction isolation levels, PostgreSQL/MySQL specific tuning, deadlocks.
- **Use Cases:** Database administration, analytical queries, query optimization.

### 15. Bash
- **Depth:** 4,000 words. DevOps survival.
- **Key Capabilities:** POSIX compliance, awk/sed/grep mastery, trap signals, pipeline optimization, subshells, strict mode (`set -euo pipefail`), environment hardening.
- **Use Cases:** CI/CD pipelines, system administration, automation scripts.
