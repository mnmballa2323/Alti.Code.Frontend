
# Setting up The Engine (NVIDIA NeMo)

The Engine is a dedicated Python microservice running inside a Docker container, providing advanced AI capabilities (ASR, TTS, LLM Guardrails) via the NVIDIA NeMo Toolkit.

## Prerequisites

-   **Docker Desktop** (must be running)
-   **Docker Compose**

## Quick Start

The NeMo Engine is integrated into the main `docker-compose.yml` file.

1.  **Build and Start**:
    ```bash
    cd alti.code.studio.backend
    docker-compose up --build -d nemo_engine
    ```
    *Note: The first build may take a few minutes as it installs Python dependencies.*

2.  **Verify Status**:
    ```bash
    docker ps | grep nemo_engine
    # Status should be "Up"
    ```

3.  **Test API**:
    You can query the engine directly:
    ```bash
    curl http://localhost:8000/
    # Output: {"status": "active", "service": "NeMo Engine"}
    ```

## Architecture

-   **Service Name**: `nemo_engine`
-   **Port**: `8000`
-   **Network**: `inso_code_network` (Accessible to backend via `http://nemo_engine:8000`)
-   **Code Location**: `alti.code.studio.backend/alti.code.studio.engine/`

## Extending

To add more Python libraries:
1.  Edit `alti.code.studio.engine/requirements.txt`.
2.  Rebuild: `docker-compose up --build -d nemo_engine`.
