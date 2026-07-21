# Contributing to Inso Code

Welcome! This document outlines the available scripts across the frontend and backend of the Inso Code monorepo.

## Frontend Scripts (`Inso.Code.Frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js development server with an increased file descriptor limit. |
| `npm run build` | Builds the production Next.js application, checks build safety, and prepares the standalone server output. |
| `npm run start` | Starts the production server from the standalone build output. |
| `npm run lint` | Runs ESLint and automatically fixes fixable issues. |
| `npm run test` | Runs the Vitest test suite. |
| `npm run test:watch` | Runs the Vitest test suite in watch mode. |
| `npm run test:coverage` | Runs the Vitest test suite and generates a coverage report. |
| `npm run test:e2e` | Runs end-to-end tests using Playwright. |

## Backend Scripts (`Inso.Code.Backend`)

| Command | Description |
|---------|-------------|
| `npm run start` | Starts the production Node.js backend server. |
| `npm run start:dev` / `dev` | Starts the backend development server using nodemon for hot-reloading. |
| `npm run license-check` | Runs the license compliance checking script. |
| `npm run test` | Runs tests using Wireit and Vitest. |
| `npm run lint` | Lints the backend codebase using ESLint via Wireit. |
| `npm run agent-factory` | Executes the autonomous agent factory script. |
| `npm run db:migrate` | Applies Prisma migrations in a development environment. |
| `npm run db:deploy` | Deploys Prisma migrations (for production). |
| `npm run db:seed` | Seeds the database using Prisma. |
| `npm run db:studio` | Opens Prisma Studio to view and edit database records. |
| `npm run db:generate` | Generates the Prisma Client. |
| `npm run security:audit` | Runs an npm security audit for high-level vulnerabilities. |
| `npm run openwiki:init` | Initializes the OpenWiki service. |
| `npm run openwiki:update` | Updates the OpenWiki service. |

## Desktop App Scripts (`Inso.Code.Desktop`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Runs the Vite dev server for the desktop UI. |
| `npm run dev:desktop` | Executes the `start-dev.sh` script to spin up the backend, frontend, and Tauri app. |
| `npm run build` | Compiles TypeScript and builds the Vite application. |
| `npm run tauri` | Runs Tauri CLI commands. |
