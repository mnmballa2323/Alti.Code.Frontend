# 🌐 Open Source Specialists (Phase 11)

> **116 Hyper-Specialized Open Source AI Agents**
> Expert-level AI agents trained explicitly on the documentation, best practices, and patterns of the world's most popular open-source repositories.

---

## 🏗️ Architecture

The Open Source agent vertical is designed to provide best-in-class assistance for popular frameworks, databases, and tooling. Each agent is instantiated via the hardened `BaseSpecialistAgent` and hot-loads into the central `CapabilityRouter`.

All agents in this tier are stored in `src/app/modules/agents/oss/` and exported via `oss/index.js`.

---

## 📦 Agent Roster

The 116 open source agents are grouped logically by their domain:

### 1. Frontend Frameworks & Libraries
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **React** | `react`, `react hooks`, `useEffect`, `useMemo`, `react context` | Hooks lifecycle, context, performance |
| **Vue.js** | `vue 3`, `composition api`, `pinia`, `vue router` | Vue 3, Reactivity, Script Setup |
| **Angular** | `angular 17`, `nx workspace`, `rxjs`, `angular signals` | Signals, standalone components, DI |
| **Svelte** | `svelte 5`, `svelte runes`, `sveltekit`, `svelte store` | Runes, SvelteKit routing, reactivity |
| **Next.js** | `next.js 14`, `app router`, `server actions`, `rsc` | React Server Components, App Router |
| **Nuxt** | `nuxt 3`, `nitro`, `nuxt modules`, `nuxt server routes` | Vue SSR, Nitro server, auto-imports |
| **Remix** | `remix run`, `remix loader`, `remix action`, `remix form` | Web Fetch API, Loaders, Actions |
| **Vite** | `vitejs`, `vite config`, `vite plugin`, `hmr`, `rollup` | Fast bundling, plugins, config |
| **Astro** | `astro build`, `astro islands`, `astro content collections` | Partial hydration, islands architecture |
| **HTMX** | `htmx`, `hx-get`, `hx-target`, `hx-swap` | Hypermedia-driven dynamics |
| **Alpine.js** | `alpine.js`, `x-data`, `x-bind`, `x-on` | Lightweight declarative reactivity |
| **SolidJS** | `solidjs`, `createSignal`, `createEffect` | Fine-grained reactivity, no VDOM |
| **Qwik** | `qwik`, `useSignal`, `resumability`, `qwik city` | O(1) JavaScript resumability, optimizer, Qwik City routing |

### 2. Backend Frameworks (Node/Python)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **NestJS** | `nestjs`, `nest.js`, `nest guard`, `nest interceptor` | Dependency injection, modules, decorators |
| **Express** | `express.js`, `express middleware`, `express router` | Minimal web serving, middleware chains |
| **FastAPI** | `fastapi`, `pydantic v2`, `fastapi depends` | Async python APIs, dependency injection |
| **Django** | `django`, `django orm`, `django rest framework` | Full-stack Python, ORM, CBVs |
| **Flask** | `flask`, `flask sqlalchemy`, `flask blueprint` | Python microframework, blueprints |
| **Hono** | `hono`, `hono middleware`, `hono cloudflare workers` | Edge-first TypeScript frameworks |
| **Fastify** | `fastify`, `fastify plugin`, `fastify schema` | High-perf Node.js APIs, validation |

### 3. Enterprise Backend & Mobile
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Spring Boot** | `spring boot 3`, `spring data jpa`, `spring security` | Java enterprise, Actuator, JPA |
| **Laravel** | `laravel 11`, `laravel eloquent`, `laravel blade` | PHP elegance, Artisan, Eloquent ORM |
| **Rails** | `ruby on rails 7`, `rails hotwire`, `active record` | Ruby MVC, Turbo Frames, Stimulus |
| **.NET Core** | `asp.net core 8`, `ef core`, `minimal api`, `linq` | C# enterprise apis, Entity Framework |
| **React Native** | `react native`, `expo router`, `react native reanimated` | Mobile UI, FlatList, Expo workflows |
| **Flutter** | `flutter widget`, `flutter riverpod`, `flutter gorouter` | Dart mobile, Riverpod state, UI building |

### 4. Database & ORMs
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **PostgreSQL** | `postgresql`, `pl/pgsql`, `pgvector`, `jsonb` | Advanced SQL, JSONB, indexing |
| **Redis** | `redis`, `redis pubsub`, `redis streams` | In-memory cache, clustering, Lua |
| **MongoDB** | `mongodb`, `mongoose schema`, `mongodb aggregation` | Document DBs, pipelines, indexing |
| **Prisma** | `prisma orm`, `prisma schema`, `prisma migrate` | Modern TS ORM, schema generation |
| **Drizzle** | `drizzle orm`, `drizzle schema`, `drizzle kit` | Serverless-ready SQL TS ORM |
| **TypeORM** | `typeorm entity`, `typeorm migration`, `createquerybuilder` | Decorator-based TS ORM |
| **SQLAlchemy** | `sqlalchemy model`, `sqlalchemy async`, `alembic` | Python mapping, async sessions |
| **Supabase** | `supabase rls`, `supabase edge functions` | Postgres BaaS, Row Level Security |

### 5. Infrastructure, Observability & Cloud IaC
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Docker** | `dockerfile`, `docker compose`, `multi-stage build` | Containerization, image sizing |
| **Kubernetes**| `kubernetes`, `kubectl`, `helm chart`, `k8s ingress` | Orchestration, deployments, CRDs |
| **Helm** | `helm chart`, `helm template`, `values.yaml` | K8s package management |
| **Terraform** | `terraform plan`, `terraform state`, `hcl` | Provider configuration, IaC |
| **AWS CDK** | `aws cdk`, `cdk stack`, `aws construct` | Imperative IaC via TypeScript/Python |
| **Ansible** | `ansible playbook`, `ansible inventory`, `ansible galaxy`| Configuration management |
| **GitHubActions**| `github actions yaml`, `github actions matrix` | CI/CD pipelines, custom runners |
| **Nginx** | `nginx conf`, `nginx reverse proxy`, `let's encrypt` | Ingress routing, SSL termination |
| **Prometheus** | `prometheus query`, `promql`, `alertmanager` | Metrics scraping, Grafana queries |

### 6. AI, Data Science & APIs
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **TensorFlow** | `tensorflow`, `tf.keras`, `tf.data`, `tensorboard` | Deep learning models, training loops |
| **PyTorch** | `pytorch`, `torch.nn`, `torchvision`, `torch dataloader` | Tensors, autograd, vision models |

| **LangChain** | `langchain`, `langchain rag`, `lcel`, `langgraph` | Agentic workflows, LCEL, Chains |
| **LlamaIndex** | `llamaindex`, `llamaindex query engine` | RAG nodes, retrievers, parsers |
| **OpenAI SDK** | `openai api`, `chat completions`, `gpt-4o` | Structured outputs, tool calling |
| **Pandas** | `pandas dataframe`, `pandas groupby`, `pandas merge` | Tabular data wrangling |
| **SciPy** | `scipy optimize`, `scipy signal`, `numpy array` | Scientific computing |
| **GraphQL** | `graphql schema`, `graphql resolver`, `apollo server` | Schemas, N+1 solutions |
| **Socket.IO** | `socket.io rooms`, `socket.io namespace` | Websockets, scaling adapters |
| **Passport** | `passport local`, `passport google oauth`, `oauth2` | Node.js authentication strategies |

### 7. Core Languages (Extended)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Rust** | `rust cargo`, `rust borrow checker`, `tokio` | Lifetimes, safe concurrency |
| **Go** | `golang`, `goroutine`, `go mod`, `go channel` | Fast backend, channels |
| **Deno** | `deno run`, `deno deploy`, `deno test`, `deno.json` | Secure V8 runtime, modern TS |
| **Bun** | `bun run`, `bun test`, `bun sqlite`, `bun serve` | Ultra-fast TS runtime and test runner |
| **Kotlin** | `kotlin coroutines`, `kotlin flow`, `ktor server` | JVM elegance, multiplatform |
| **Swift** | `swift swiftui`, `swift async await`, `swift actor` | iOS dev, structured concurrency |

### 8. Testing & Tooling
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Jest** | `jest.mock`, `jest expect`, `jest setupfiles` | Universal JS component testing |
| **Cypress** | `cypress.io`, `cy.intercept`, `cy.get` | Browser-based E2E |
| **Playwright** | `playwright test`, `playwright page object` | Multi-browser parallel E2E |
| **Vitest** | `vitest`, `vi.mock`, `vi.spyOn`, `vi.advanceTimers` | Vite-native unit testing |
| **TailwindCSS** | `tailwind config`, `tailwind arbitrary values` | Utility-first CSS generation |
| **tRPC** | `trpc router`, `trpc procedure`, `trpc react query` | End-to-end typesafe IPC |
| **Zod** | `zod schema`, `z.object`, `z.infer`, `z.parse` | Schema validation |
| **shadcn/ui** | `shadcn ui`, `radix ui primitive` | Accessible component blocks |
| **Turborepo** | `turborepo`, `turbo.json`, `turbo build` | Monorepo caching/orchestration |
| **RxJS** | `rxjs observable`, `rxjs map`, `rxjs behavior subject` | Reactive programming |
| **Celery** | `celery worker`, `celery beat`, `celery task` | Async python task queues |
| **Electron** | `electron ipc`, `electron main process`, `contextbridge` | Cross-platform desktop apps |
| **Tauri** | `tauri command`, `tauri.conf.json`, `tauri invoke` | Rust-based tiny desktop apps |

---

### 9. Extended Frontend Frameworks (Batch 15/16)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **SolidJS** | `solidjs`, `createSignal` | Fine-grained reactivity, signals |
| **Qwik** | `qwik`, `useSignal`, `resumability` | O(1) JavaScript resumability, optimizer |
| **Nuxt.js** | `nuxtjs`, `nitro`, `usefetch` | Intuitive Vue framework, auto-imports |

### 10. Hypermedia & Lightweight Reactivity (Batch 15)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **HTMX** | `htmx`, `hx-get`, `hx-target` | Hypermedia-driven dynamics |
| **Alpine.js** | `alpine.js`, `x-data`, `x-bind` | Lightweight declarative reactivity |

### 11. Extended Backend Frameworks (Batch 15/17)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Fastify** | `fastify`, `reply.send` | High-performance Node.js APIs |
| **AdonisJS** | `adonisjs`, `lucid orm` | Fully featured web framework for Node.js |

### 12. Edge Frameworks & Tooling (Batch 16/17)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **ElysiaJS** | `elysiajs`, `bun`, `eden rpc` | Ergonomic backend framework for Bun |
| **Appwrite** | `appwrite`, `appwrite cloud` | Secure open-source Backend-as-a-Service |

### 13. Search, State & Workflows (Batch 16)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **XState** | `xstate`, `state machine` | State machines, actors, context |
| **Meilisearch** | `meilisearch`, `faceted search` | Blazing fast, typo-tolerant search engine |

### 14. 3D, Automation, CMS & High-Perf Go (Batch 18)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Three.js** | `three.js`, `webglrenderer` | Industry standard WebGL 3D library |
| **Puppeteer** | `puppeteer`, `page.evaluate` | Headless Chrome Node.js automation API |
| **Strapi** | `strapi`, `headless cms` | Leading open-source Headless CMS |
| **Gin** | `gin`, `gin framework` | Fastest web framework for Go |

### 15. Foundational & Ubiquitous Tooling (Batch 19)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Vite** | `vite`, `vite.config.js` | Next Generation Frontend Tooling |

### 16. Frontend UI & Data Visualization (Batch 20)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Bootstrap** | `bootstrap`, `bootstrap 5` | World's most popular HTML, CSS, and JS library |
| **D3.js** | `d3`, `d3.js` | Industry standard for Data-Driven Documents |
| **MUI** | `mui`, `material-ui` | Leading React UI component library |
| **Ant Design** | `antd`, `ant design` | Enterprise-class UI design language and library |

### Category Overview
| Category | Batch | Name | Count | Agents |
|----------|-------|------------------------------------|-------|------------------------------------------|
| 17 | 20 | 3D, Automation, CMS & High-Perf Go | 4 | Three.js, Puppeteer, Strapi, Gin |
| 18 | 21 | Foundational & Ubiquitous Tooling | 1 | Vite |
| 19 | 22 | Frontend UI & Data Visualization | 4 | Bootstrap, D3.js, MUI, Ant Design |
| 20 | 23 | Vector Databases & Real-Time Analytics | 4 | Chroma, Milvus, Qdrant, ClickHouse |
| 21 | 21 | Database ORMs & Tooling | 4 | Prisma, Drizzle, TypeORM, SQLAlchemy |
| 22 | 22 | Testing & State Management | 2 | Zustand, Cypress |
| 23 | 26 | Static Sites & Headless CMS | 4 | Docusaurus, Gatsby, Hugo, Ghost |
| 24 | Data Engineering & AI Scaling | 4 | OpenCV, Ray, Apache Spark, Airflow |
| 25 | Cloud Native & IaC | 4 | Terraform, Pulumi, Crossplane, Helm |
| 26 | 27 | Messaging, Event Streaming & RPC | 4 | Kafka, RabbitMQ, gRPC, NATS |

### 17. Vector Databases & Real-Time Analytics (Batch 21)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Chroma** | `chroma`, `chromadb` | AI-native open-source embedding database |
| **Milvus** | `milvus`, `pymilvus` | Massive-scale open-source vector database |
| **Qdrant** | `qdrant`, `qdrant client` | High-performance Rust Vector Search Engine |
| **ClickHouse** | `clickhouse`, `columnar database` | Incredibly fast columnar database for real-time analytics |

### 18. Database ORMs & Tooling (Batch 22)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Prisma** | `prisma`, `prisma migrate` | Next-generation Node.js and TypeScript ORM |
| **Drizzle** | `drizzle`, `drizzle kit` | Headless, lightweight, serverless-ready TS ORM |
| **TypeORM** | `typeorm`, `querybuilder` | Decorator-based enterprise TypeScript ORM |
| **SQLAlchemy**| `sqlalchemy`, `alembic` | The undisputed Python SQL toolkit and ORM |

### 19. Testing & State Management (Batch 23 - Final 100)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Zustand** | `zustand`, `react store` | Small, fast and scalable bearbones state-management |
| **Cypress** | `cypress`, `e2e testing` | Fast, easy and reliable testing for anything in a browser |

### 20. Static Sites & Headless CMS (Batch 24)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Docusaurus** | `docusaurus`, `mdx docs` | Meta's incredibly fast, MDX-powered documentation SSG |
| **Gatsby** | `gatsby`, `gatsby graphql` | The blazing fast, GraphQL-powered React static site generator |
| **Hugo** | `hugo theme`, `hugo shortcode` | The world's fastest framework for building websites, written in Go |
| **Ghost** | `ghost cms`, `ghost headless` | The most popular open-source headless publishing platform |

### 21. Data Engineering & AI Scaling (Batch 25)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **OpenCV** | `opencv`, `computer vision` | The industry standard open-source computer vision library |
| **Ray** | `ray core`, `ray serve` | A unified framework for scaling AI and Python applications |
| **Spark** | `apache spark`, `pyspark` | The unified engine for large-scale data analytics |
| **Airflow** | `apache airflow`, `airflow dag` | The platform to programmatically author and monitor workflows |

### 22. Cloud Native & IaC (Batch 26)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Terraform** | `terraform`, `hashicorp hcl` | The industry standard declarative infrastructure automation tool |
| **Pulumi** | `pulumi`, `infrastructure as code typescript` | Modern IaC allowing infrastructure definition in real programming languages |
| **Crossplane** | `crossplane`, `xrd` | The cloud native control plane framework |
| **Helm** | `helm chart`, `helm upgrade` | The package manager for Kubernetes |

### 23. Messaging, Event Streaming & RPC (Batch 27)
| Agent | Keywords | Expertise |
|-------|----------|-----------|
| **Kafka** | `apache kafka`, `kafka stream` | The undisputed leader in high-throughput distributed event streaming |
| **RabbitMQ** | `rabbitmq`, `message broker` | The most widely deployed open-source AMQP message broker |
| **gRPC** | `grpc`, `protocol buffers` | Google's high-performance, strictly typed universal RPC framework |
| **NATS** | `nats server`, `pub sub nats` | The blazing-fast, lightweight connective technology for distributed edge systems |

---

## 🚀 How to Add More Agents

To manually create new open source specialist agents:

1. Create a new subclass of `BaseSpecialistAgent` in `src/app/modules/agents/oss/`
2. Provide a rich preamble listing code examples and best practices
3. Export it in `src/app/modules/agents/oss/index.js`
4. Register the keyword route in `src/app/modules/agents/capability.router.js`

---

### Category 17: Vector Databases & Real-Time Analytics (Batch 21)

| Agent Instance | Name & Keywords | Description |
|----------------|-----------------|-------------|
| `chromaOssAgent` | Chroma (`chroma`, `chromadb`) | Expert in Chroma embedding DBs, Persistent clients, default embedding wrappers, and semantic search. |
| `milvusOssAgent` | Milvus (`milvus`, `pymilvus`) | Expert in Milvus clusters, PyMilvus schema strictness, IndexParams (HNSW, IVF_FLAT), and exact scalar matching vs vector search. |
| `qdrantOssAgent` | Qdrant (`qdrant`, `qdrant client`) | Expert in Qdrant Rust engine, gRPC vs REST connection tuning, HNSW graph mechanics, and JSON payload filtering alongside Cosine search. |
| `clickhouseOssAgent` | ClickHouse (`clickhouse`, `mergetree`) | Expert in ClickHouse columnar storage architecture, heavy analytical GROUP BY aggregation functions, and MergeTree batch ingestion best practices. |
