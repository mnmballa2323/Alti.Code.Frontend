# Environment Variables Reference

This document outlines the required and optional environment variables across the Inso Code platform.

## Frontend Environment Variables (`Inso.Code.Frontend`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | The URL for the backend API. | `http://localhost:5000/api/v1` |
| `NEXTAUTH_URL` | The base URL for NextAuth authentication. | `http://localhost:3005` |
| `NEXTAUTH_SECRET` | A random 32-character secret string for securing sessions. | `your-random-secret-here` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public key for Stripe payments (use test key for dev). | `pk_test_YOUR_STRIPE_KEY` |

## Backend Environment Variables (`Inso.Code.Backend`)

### Core Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | The port the backend server listens on. | `5000` |
| `NODE_ENV` | The environment mode (`development`, `production`). | `development` |
| `CLIENT_URL` | The allowed CORS origin for the frontend client. | `http://localhost:3005` |

### Database & Redis
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string. | `postgresql://user:pass@127.0.0.1:5432/mydb` |
| `REDIS_URL` | Redis connection string. | `redis://127.0.0.1:6379` |
| `DISABLE_REDIS` | Set to `true` to disable Redis cache (optional). | `true` |

### Authentication Secrets
| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_ACCESS_TOKEN` | Secret key for signing JWT access tokens. | `your-random-32-char-access-secret` |
| `JWT_ACCESS_EXPIRES_IN` | Expiration time for access tokens. | `7d` |
| `JWT_REFRESH_REFRESH_TOKEN` | Secret key for signing JWT refresh tokens. | `your-random-32-char-refresh-secret` |
| `JWT_REFRESH_EXPIRES_IN` | Expiration time for refresh tokens. | `30d` |

### AgentMemory Service
| Variable | Description | Example |
|----------|-------------|---------|
| `AGENTMEMORY_PORT` | Port for the AgentMemory service. | `3111` |
| `AGENTMEMORY_TOOLS` | Configures tool access (e.g., `all`). | `all` |
| `GRAPH_EXTRACTION_ENABLED` | Enables knowledge graph extraction. | `true` |
| `CONSOLIDATION_ENABLED` | Enables memory consolidation. | `true` |

### GCP & Sovereign Inference
| Variable | Description | Example |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID. | `your-gcp-project-id` |
| `GCP_LOCATION` | The GCP region for Vertex AI. | `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to the GCP service account JSON key. | `path/to/gcp-credentials.json` |
| `GCP_REGION` | General GCP region for services. | `us-central1` |
| `DEPLOYMENT_MODE` | The deployment security mode (`cloud`, `byoc`, `airgap`). | `cloud` |
| `GCP_REDIS_HOST` | Memorystore Redis host (auto-populated in prod). | |
| `GCP_DISCOVERY_ENGINE_DATASTORE_ID` | Datastore ID for Vertex AI Search. | |
| `GCP_DISCOVERY_ENGINE_COLLECTION_ID` | Collection ID for Vertex AI Search. | `default_collection` |
| `ENABLE_SENTINEL` | Enables the file system sentinel watcher. | `false` |

### GCP Observability & Security (Production Only)
| Variable | Description | Default |
|----------|-------------|---------|
| `GCP_ENABLE_TRACING` | Enable Cloud Trace. | `false` |
| `GCP_ENABLE_PROFILING` | Enable Cloud Profiler. | `false` |
| `GCP_ENABLE_ERROR_REPORTING` | Enable Cloud Error Reporting. | `false` |
| `GCP_ENABLE_DLP` | Enable Data Loss Prevention scanning. | `false` |
| `GCP_ENABLE_WEB_RISK` | Enable Web Risk URL checking. | `false` |
| `GCP_ENABLE_BINARY_AUTH` | Enable Binary Authorization. | `false` |

### MCP Integrations (Opt-in)
To activate any native MCP servers, set their corresponding flag to `true`.
*Warning: Enabling hundreds of MCPs simultaneously will consume significant system resources.*

Examples:
- `MCP_ENABLE_FILESYSTEM=false`
- `MCP_ENABLE_GITHUB=false`
- `MCP_ENABLE_POSTGRES=false`
- `MCP_ENABLE_PUPPETEER=false`
*(See `.env.example` in the backend for the complete list of 30+ supported MCP integrations)*

### Crabbox Remote Sandbox
| Variable | Description | Example |
|----------|-------------|---------|
| `SANDBOX_PROVIDER` | Execution environment (`local`, `docker`, `crabbox`). | `local` |
| `CRABBOX_COORDINATOR_URL` | URL for Crabbox Coordinator. | `http://localhost:8080` |
| `CRABBOX_DEFAULT_PROVIDER` | Cloud provider for the sandbox. | `cloudflare` |
| `CRABBOX_DEFAULT_CLASS` | Class of sandbox instance. | `standard` |
| `CRABBOX_DEFAULT_TTL` | Time-to-live for the sandbox in seconds. | `300` |
| `CRABBOX_API_KEY` | API key for the Crabbox coordinator. | `your-api-key` |
