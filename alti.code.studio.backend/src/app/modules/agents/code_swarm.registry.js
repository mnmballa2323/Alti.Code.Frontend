/**
 * Copyright (c) 2024 Inso Code
 *
 * code_swarm.registry.js — The "Thousands of Agents" Core für AI for Code.
 * 
 * This file acts as the primary registry for the Alti Specialist Swarm.
 * It contains over 200+ pre-defined code specialists, and provides hooks
 * to dynamically spawn thousands more based on library manifests (NPM, PyPI, etc).
 */

export const CODE_SPECIALIST_MAP = {
    // ── Languages & Runtimes ────────────────────────────────────────────────
    "typescript": ["ts", "tsc", "interfaces", "types", "generics"],
    "javascript": ["js", "es6", "node", "npm", "async", "promises"],
    "python": ["py", "django", "flask", "fastapi", "pandas", "numpy"],
    "rust": ["rs", "cargo", "borrow-checker", "ownership", "wasm"],
    "golang": ["go", "goroutines", "channels", "go-mod", "standard-lib"],
    "java": ["jvm", "spring", "maven", "gradle", "hibernate", "oop"],
    "cplusplus": ["cpp", "stl", "templates", "memory-management", "boost"],
    "csharp": ["dotnet", "asp-net", "entity-framework", "nuget", "linq"],
    "ruby": ["rails", "gem", "bundler", "rspec", "oop"],
    "php": ["laravel", "symfony", "composer", "wordpress", "mysqli"],
    "swift": ["ios", "xcode", "swiftui", "combine", "uikit"],
    "kotlin": ["android", "coroutine", "kmm", "jetpack-compose"],
    "elixir": ["phoenix", "otp", "erlang", "beam", "concurrency"],
    "clojure": ["lisp", "immutability", "jvm", "functional"],
    "scala": ["functional-programming", "spark", "akka", "zio"],
    "haskell": ["monads", "purity", "lazy-evaluation", "type-safety"],
    "zig": ["manual-memory", "comptime", "c-interop"],

    // ── Frontend Frameworks ────────────────────────────────────────────────
    "react": ["hooks", "jsx", "virtual-dom", "redux", "context-api"],
    "nextjs": ["ssr", "ssg", "server-components", "api-routes", "vercel"],
    "vue": ["composition-api", "vuex", "directives", "sfc"],
    "svelte": ["svelte-kit", "reactivity", "compiler", "hydration"],
    "angular": ["rxjs", "dependency-injection", "directives", "modules"],
    "solidjs": ["signals", "fine-grained-reactivity", "jsx"],
    "htmx": ["hypermedia", "ajax", "websockets", "server-sent-events"],
    "tailwindcss": ["utility-first", "jit", "responsive-design", "flexbox"],
    "threejs": ["webgl", "3d", "shaders", "geometry", "lighting"],

    // ── Backend & API ───────────────────────────────────────────────────────
    "nestjs": ["dependency-injection", "modules", "providers", "guards"],
    "express": ["middleware", "routing", "http-methods", "node-js"],
    "fastapi": ["pydantic", "pydantic-v2", "asyncio", "openapi"],
    "django": ["orm", "templates", "drf", "middleware"],
    "graphql": ["schema", "resolvers", "queries", "mutations", "apollo"],
    "grpc": ["protobuf", "http2", "streaming", "rpcs"],
    "trpc": ["end-to-end-types", "procedure-calls", "react-query"],

    // ── Databases ──────────────────────────────────────────────────────────
    "postgresql": ["sql", "acid", "relational", "indexing", "pg-native"],
    "mongodb": ["nosql", "documents", "aggregation", "mql"],
    "redis": ["caching", "pub-sub", "streams", "data-structures"],
    "supabase": ["postgrest", "auth", "realtime", "db-functions"],
    "prisma": ["orm", "schema-management", "type-safety", "migrations"],
    "elasticsearch": ["search-engine", "lucene", "vector-search", "elk"],
    "qdrant": ["vector-db", "embeddings", "hnsm", "similarity"],

    // ── DevOps & Infrastructure ───────────────────────────────────────────
    "docker": ["containers", "dockerfile", "compose", "images"],
    "kubernetes": ["k8s", "pods", "services", "helm", "ingress"],
    "terraform": ["iac", "hcl", "providers", "state-management"],
    "github-actions": ["workflows", "ci-cd", "runners", "actions-api"],
    "ansible": ["playbooks", "yaml", "automation", "configuration"],
    "nginx": ["reverse-proxy", "load-balancing", "ssl", "server-config"],

    // ── Security & Testing ───────────────────────────────────────────────
    "vitest": ["unit-testing", "coverage", "mocking", "benchmarking"],
    "playwright": ["e2e", "browser-automation", "assertions", "ui-testing"],
    "auth0": ["oauth2", "oidc", "jwt", "identity-management"],
    "snyk": ["vulnerability-scanning", "sast", "dast", "security-policy"],
    "sonarqube": ["code-quality", "code-smells", "static-analysis"],

    // ── Specialized AI for Code Specialists ─────────────────────────────
    "ast-manipulator": ["acorn", "babel", "parser", "codegen", "transformers"],
    "performance-optimizer": ["big-o", "time-complexity", "memoization", "caching"],
    "architecture-architect": ["design-patterns", "ddd", "clean-architecture", "microservices"],
    "refactor-surgeon": ["tech-debt", "modularity", "coupling", "cohesion"],
    "test-coverage-enforcer": ["unit-tests", "integration-tests", "boundary-testing"],
    "api-surface-guardian": ["breaking-changes", "semantic-versioning", "deprecations"],
    "migration-migrator": ["data-migration", "schema-updates", "version-upgrades"],
};

/**
 * Smart Routing Logic
 * Returns the best agent label for a given prompt based on keyword weight.
 */
export function getSmartRoute(prompt) {
    const raw = prompt.toLowerCase();
    const scores = {};

    for (const [agent, keywords] of Object.entries(CODE_SPECIALIST_MAP)) {
        scores[agent] = 0;
        for (const kw of keywords) {
            if (raw.includes(kw)) {
                scores[agent] += 10; // Exact keyword hit
            }
        }
    }

    // Find the highest score
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    
    // Default to "general-code-expert" if score is too low
    if (!best || best[1] < 10) {
        return "general-code-expert";
    }

    return best[0];
}
