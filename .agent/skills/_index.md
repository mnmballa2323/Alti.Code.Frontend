# Skill Registry

Read this file first. Full `SKILL.md` contents load only when a skill's
triggers match the current task. Machine-readable equivalent:
`skills/_manifest.jsonl`.

## skillforge
Creates new skills from observed patterns and recurring tasks.
Triggers: "create skill", "new skill", "I keep doing this manually"

## memory-manager
Reads, scores, and consolidates memory. Runs reflection cycles.
Triggers: "reflect", "what did I learn", "compress memory"

## git-proxy
All git operations with safety constraints.
Triggers: "commit", "push", "branch", "merge", "rebase"
Constraints: never force push to main; run tests before push.

## debug-investigator
Systematic debugging: reproduce, isolate, hypothesize, verify.
Triggers: "debug", "why is this failing", "investigate"

## deploy-checklist
Pre-deployment verification against a structured checklist.
Triggers: "deploy", "ship", "release", "go live"
Constraints: all tests passing, no unresolved TODOs in diff,
requires human approval for production.

## data-layer
Cross-harness activity monitoring and dashboard exports. Use it as the
injected dashboard surface when users ask naturally.
Triggers: "data layer", "dashboard", "show me the dashboard",
"what did my agents do", "agent analytics", "agent status", "resource usage",
"usage report", "cron monitoring", "daily report", "tokens",
"terminal dashboard", "TUI"
Constraints: local-only by default; no screenshot delivery without explicit user
approval; do not commit private `.agent/data-layer/` exports.

## data-flywheel
Turns approved, redacted runs into reusable local artifacts: trace records,
context cards, eval cases, training-ready JSONL, and flywheel metrics.
Triggers: "data flywheel", "trace to train", "training traces",
"context cards", "eval cases", "approved runs", "vertical intelligence"
Constraints: local-only by default; human-approved runs only; redaction required
before trainable; does not train models.

## design-md
Uses a root `DESIGN.md` as the portable visual system contract for
Google Stitch workflows. Loads only when `DESIGN.md` exists at the
project root.
Triggers: "DESIGN.md", "design.md", "Google Stitch", "design tokens",
"design system", "visual design"
Preconditions: DESIGN.md exists at project root.
Constraints: prefer DESIGN.md tokens over invented values, do not modify
DESIGN.md unless the user explicitly asks, preserve unknown sections when
an edit IS authorised, validate with `npx @google/design.md lint DESIGN.md`
when available.

## tldraw
Draw, diagram, sketch, or lay out ideas on a live tldraw canvas.
Worthwhile drawings snapshot into this skill's local store
(`skills/tldraw/store.py`) for recall across sessions.
Triggers: "draw", "diagram", "sketch", "wireframe", "flowchart",
"mind-map", "visualize", "whiteboard"
Constraints: get_canvas before edits; max 200 shapes per create_shape call.
Requires: tldraw MCP server wired in the harness's MCP config; user has
http://localhost:3030 open. Opt-in via `.features.json` (`tldraw: true`).


## distributed-systems-engineer
Specializes in building distributed systems using consensus protocols (Paxos, Raft), consistency models, replication, sharding, and fault-tolerant network architectures.
Triggers: "distributed systems", "paxos", "raft", "consistency", "sharding", "replication", "partitioning"


## sre-systems-operator
Specializes in site reliability, systems operations, observability pipelines, SLO/SLI definition, alerting strategies, and robust incident response playbooks.
Triggers: "sre", "observability", "metrics", "alerting", "slo", "sli", "incident response", "postmortem"


## cloud-native-architect
Specializes in designing highly scalable, resilient cloud-native systems using Kubernetes, service meshes, serverless constructs, and multi-region network topologies.
Triggers: "kubernetes", "cloud native", "docker", "serverless", "istio", "multi-region", "vpc", "aws", "gcp"


## secops-penetration-tester
Specializes in secure design, security auditing, binary exploit detection, threat modeling, and defensive vulnerability scanning based on OWASP Top 10.
Triggers: "security audit", "penetration testing", "exploit", "owasp", "vulnerability scan", "threat model", "xss", "csrf", "sql injection"


## compiler-optimization-engineer
Specializes in building parser/lexers, abstract syntax trees (AST), custom compilers, intermediate representations (IR), LLVM passes, and DSL design.
Triggers: "compiler", "lexer", "parser", "ast", "llvm", "dsl", "jit", "register allocation"


## database-performance-tuner
Specializes in query plan analysis, table partitioning, lock contention optimization, transaction isolation levels, and vacuum tuning.
Triggers: "database tuning", "query plan", "indexes", "partitioning", "lock contention", "vacuum", "postgresql", "mysql"


## mlops-platform-architect
Specializes in scalable machine learning infrastructure, Triton inference server, GPU virtualization, pipeline scheduling, and low-latency model caching.
Triggers: "mlops", "triton", "gpu virtualization", "model serving", "cuda", "model caching", "pipeline orchestration"


## frontend-rendering-specialist
Specializes in optimizing Core Web Vitals (LCP, INP, CLS), critical rendering path analysis, bundle size budgets, CSS transitions, and progressive hydration.
Triggers: "inp", "lcp", "cls", "core web vitals", "rendering path", "bundle optimization", "hydration", "nextjs", "react"


## embedded-systems-developer
Specializes in bare-metal programming, RTOS environments, C/Rust firmware, memory-mapped register configuration, and power management.
Triggers: "embedded", "rtos", "bare-metal", "firmware", "microcontroller", "low-power", "i2c", "spi", "uart"


## zero-knowledge-cryptographer
Specializes in zero-knowledge proofs (zk-SNARKs, zk-STARKs), post-quantum cryptography, homomorphic encryption, and secure key derivation.
Triggers: "zero-knowledge", "cryptography", "zk-snark", "zk-stark", "homomorphic encryption", "post-quantum", "key derivation"


## quantum-algorithm-designer
Specializes in quantum circuit compilation, Qiskit framework, quantum error correction, and implementing Shor's and Grover's quantum algorithms.
Triggers: "quantum computing", "quantum circuit", "qiskit", "quantum gate", "error correction", "qubit"


## bioinformatics-pipeline-developer
Specializes in genomic sequence alignment, BLAST queries, FASTA/FASTQ file processing, and deploying protein folding simulation structures.
Triggers: "bioinformatics", "genomics", "sequence alignment", "blast", "fasta", "fastq", "protein folding"


## blockchain-consensus-specialist
Specializes in decentralized consensus protocols, Proof of Stake validation, EVM smart contracts, gas optimizations, and MEV prevention.
Triggers: "blockchain", "consensus", "smart contract", "solidity", "gas optimization", "mev", "evm", "ethereum"


## game-engine-systems-architect
Specializes in entity component systems (ECS), memory layout optimization, Vulkan graphic pipelines, collision trees, and real-time game loops.
Triggers: "game engine", "ecs", "vulkan", "opengl", "collision detection", "game loop", "shader", "octree"


## iot-edge-computing-expert
Specializes in edge gateway analytics, low-power WAN protocols, sensor fusion, MQTT message brokerage, and real-time device location services.
Triggers: "iot", "edge computing", "mqtt", "sensor fusion", "lorawan", "gateway architecture", "firmware OTA"


## functional-purity-architect
Specializes in pure functional system design, Monadic composition, category theory, typed schemas, Haskell/Scala optimization, and algebraic data types.
Triggers: "functional programming", "monad", "category theory", "haskell", "scala", "adt", "pure function", "immutability"


## chaos-engineering-specialist
Specializes in proactive fault injection, Chaos Mesh, resilience auditing, network partition simulators, and blast radius limitation.
Triggers: "chaos engineering", "fault injection", "chaos mesh", "resilience", "blast radius", "gremlin", "network partition"


## api-gateway-architect
Specializes in federated API architecture, GraphQL gateway, gRPC routing, OAuth authorization policies, rate-limiting, and web caching.
Triggers: "api gateway", "graphql federated", "grpc routing", "oauth", "rate limiting", "api key", "caching", "openapi"


## stream-processing-engineer
Specializes in event stream processing, Apache Kafka architectures, Apache Flink streams, event sourcing systems, and CQRS synchronization.
Triggers: "kafka", "flink", "stream processing", "event sourcing", "cqrs", "spark streaming", "consumer group"


## search-engine-relevance-expert
Specializes in text search indexes, Elasticsearch configurations, Lucene query parses, BM25 metrics, vector search embeddings, and query rerankers.
Triggers: "elasticsearch", "lucene", "search relevance", "bm25", "vector search", "reranking", "search index"
