# Project Scripts Reference

<!-- AUTO-GENERATED -->

## Backend Scripts

| Command | Value |
|---------|-------|
| `npm run start` | `NODE_OPTIONS="--no-node-snapshot" node server.js` |
| `npm run start:dev` | `ulimit -n 4096 && NODE_OPTIONS="--no-node-snapshot" nodemon server.js` |
| `npm run dev` | `ulimit -n 4096 && NODE_OPTIONS="--no-node-snapshot" nodemon server.js` |
| `npm run postinstall` | `node scripts/patch-agentmemory.js && node scripts/patch-langgraph-sdk.js && node scripts/setup-git-hooks.js` |
| `npm run license-check` | `node ../scripts/license_compliance_check.js` |
| `npm run pretest` | `npm run license-check` |
| `npm run test` | `wireit` |
| `npm run lint` | `wireit` |
| `npm run agent-factory` | `node scripts/autonomous_agent_factory.js` |
| `npm run db:migrate` | `npx prisma migrate dev` |
| `npm run db:deploy` | `npx prisma migrate deploy` |
| `npm run db:seed` | `npx prisma db seed` |
| `npm run db:studio` | `npx prisma studio` |
| `npm run db:generate` | `npx prisma generate` |
| `npm run security:audit` | `npm audit --audit-level=high` |
| `npm run openwiki` | `openwiki` |
| `npm run openwiki:init` | `node scripts/init-openwiki.js` |
| `npm run openwiki:update` | `openwiki --update` |

## Frontend Scripts

| Command | Value |
|---------|-------|
| `npm run dev` | `ulimit -n 4096 && next dev -p 3001` |
| `npm run build` | `node scripts/copy-monaco.js && node scripts/check-build-safety.js && next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/` |
| `npm run start` | `node .next/standalone/server.js \|\| next start` |
| `npm run lint` | `eslint --fix` |
| `npm run postinstall` | `node scripts/copy-monaco.js` |
| `npm run test` | `vitest run` |
| `npm run test:watch` | `vitest` |
| `npm run test:coverage` | `vitest run --coverage` |
| `npm run test:e2e` | `playwright test` |

## Desktop Scripts

| Command | Value |
|---------|-------|
| `npm run dev` | `vite` |
| `npm run dev:desktop` | `bash ./start-dev.sh` |
| `npm run build` | `tsc && vite build` |
| `npm run preview` | `vite preview` |
| `npm run tauri` | `tauri` |

<!-- AUTO-GENERATED -->
