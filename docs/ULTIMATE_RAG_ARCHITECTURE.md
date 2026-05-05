# 🔍 Ultimate RAG Architecture: The Sovereign Knowledge Pipeline

The **Alti Code Studio Search Engine** relies on a massive triple-threat Retrieval-Augmented Generation (RAG) pipeline designed for sovereign codebase ingestion, relationship mapping, and precise inline citations.

## 1. Architectural Overview

The Ultimate RAG pipeline (`ultimate_rag.service.js`) bridges the gap between static code search and highly contextual AI synthesis. It relies on three primary data pillars:

-   **Google Cloud Spanner Graph:** Manages deep semantic relationships between files, classes, and microservices (e.g., "Service A depends on Interface B").
-   **Vertex AI Discovery Engine:** Performs dense vector similarity search across the actual code text and implementation logic.
-   **Local Gemini CLI / OS Tools:** Executes rapid local filesystem scans and metadata aggregation.

These three sources are coalesced into a single monolithic context window and fed into **Gemini 3.1 Pro** for final synthesis.

## 2. Cryptographic Stabilization (Tink Crypto)

During the initialization of Google's security modules, the system relies on `@google/tink-crypto`. Because this dependency bundles a UMD (Universal Module Definition) that incorrectly assumes browser execution (`self is not defined`), a custom global polyfill is injected into the Node.js runtime:

```javascript
// polyfill.js
if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}
```

This ensures the backend boots securely across all environments without crashing.

## 3. Frontend UI/UX Parity (ChatGPT Style)

The RAG interface (`UltimateRagTerminal.tsx`) has been fundamentally overhauled to match the core conversational interface of the platform:

1.  **Empty State:** The prompt box and title are perfectly centered, enveloped by the `AgentCommandCenter` background topology.
2.  **Active State:** Upon submitting a query, the prompt box instantly pins to the bottom (`mt-auto z-10`), and a dynamic scroll container renders the results above it.
3.  **Result Transparency:** Gemini's response is formatted in high-fidelity markdown, while the raw retrieved context is encapsulated inside a minimal HeroUI Accordion, preserving UI cleanliness without sacrificing auditability.
4.  **Citations:** The backend strictly enforces that Gemini provides exact inline citations pointing to the files extracted from Vertex AI and Spanner.
