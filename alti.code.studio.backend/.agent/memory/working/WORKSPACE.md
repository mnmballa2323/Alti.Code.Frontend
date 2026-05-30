# Workspace (live task state)

## Current task
Design, implement, test, and verify the Workspace Rules (Instructions & Guardrails) System and resolve the Next.js/React 18 SSR hydration mismatch error.

## Active Checkpoints
- [x] Researched backend architecture, rules formatting, and dynamic router mounting pipelines.
- [x] Designed and built `rules.service.js` under `src/app/modules/rules` to read, parse, and write instructions/guardrails to `.altirules` or `.cursorrules`.
- [x] Built deterministic content-hash IDs (`generateStableId`) to prevent rules rendering key instability across page reloads.
- [x] Deployed `rules.controller.js` and `rules.route.js` routing express handlers mounted automatically under `/api/v1/rules`.
- [x] Configured the sovereign `LlmGatewayService.routeCompletion` gateway to dynamically parse codebase rules on each call and auto-prepend them to the completion prompt context.
- [x] Fixed the React 18 / Next.js server-client icon/rendering hydration mismatch by implementing client-side `mounted` checks and skeletons in `components/sidebar.tsx`.
- [x] Refactored `components/sidebar.tsx` rule lists to query endpoints using TanStack `useQuery` and autosave modifications via a debounced custom hook.
- [x] Wrote a complete integration test suite in `tests/integration/rules.test.js` validating rules parsing, writing, stable IDs, and endpoint routing. Verified 100% green test execution.
- [x] Successfully completed the version bump protocol: updated root `VERSION` to `39.11.0` and appended changes in `CHANGELOG.md`.
- [x] Staged, committed, and pushed version `39.11.0` successfully to the remote repository.

## Status
Completed. Workspace Rules are fully persistent, dynamic LLM prompt-ingested, and the Next.js hydration error is completely resolved.
