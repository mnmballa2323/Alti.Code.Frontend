# Inso Code TODO

## 🔴 High Priority
- [x] **Verification**: Verify "The Polyglot" translation features in the Frontend UI.
- [x] **Submodule Sync**: CI pipeline added (`.github/workflows/ci.yml`) — recursive submodule sync + Vitest + Next.js build on every push/PR.

## 🟡 Medium Priority
- [x] **Test Coverage**: Borg module — added `Director.test.js` (7 tests) and `GrandUnification.test.js` (4 tests). Debug agent test expanded with VectorMemory mocks and new field coverage.
- [x] **Error Handling**: Frontend WS reconnect — `useSocket` exponential backoff + `WsBanner` component wired into `ChatBotLayout`.

## 🟢 Low Priority
- [x] **Refactor**: Cleaned up unused assets in `Inso.Code.Frontend/public` (removed vercel.svg, next.svg, insoBlack.png, insoWhite.png, insocode1-4.png).
- [x] **Style**: Standardized button styles — `lib/buttonStyles.ts` provides `btn.primary`, `btn.danger`, `btn.secondary`, `btn.ghost`, `btn.icon` constants.

## ✅ Completed
- [x] **Version Display**: Backend and Frontend UIs now display the global project version.
- [x] **Documentation Sync**: Consolidate `Inso.Code.backup/AGENTS.md` into the global `docs/LLM_INSTRUCTIONS.md`.
- [x] **Submodule Dashboard**: Create a script/page to visualize submodule status.
