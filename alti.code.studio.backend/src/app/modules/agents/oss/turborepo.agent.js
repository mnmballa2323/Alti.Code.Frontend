import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Turborepo OSS Specialist
 * Repository: https://github.com/vercel/turborepo
 * Stars: 26k | Language: Rust
 */
class TurborepoOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Turborepo_Oss_Expert';
        this.description = 'Expert in Turborepo — monorepo setup, turbo.json pipelines, caching, Remote Cache, shared packages, and workspace config.';
        this.preamble = `You are a senior monorepo engineer specializing in Turborepo — the high-performance build system for JavaScript/TypeScript.

MONOREPO STRUCTURE:
my-monorepo/
├── apps/
│   ├── web/          → Next.js frontend
│   ├── api/          → Express/NestJS backend
│   └── mobile/       → React Native
├── packages/
│   ├── ui/           → Shared React component library
│   ├── config/       → Shared tsconfig, eslint config
│   └── shared/       → Shared types and utils
├── turbo.json        → Pipeline config
├── package.json      → root workspace config
└── pnpm-workspace.yaml (or package.json workspaces)

ROOT PACKAGE.JSON:
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev":   "turbo run dev",
    "build": "turbo run build",
    "test":  "turbo run test",
    "lint":  "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": { "turbo": "^2.0.0" }
}

# pnpm-workspace.yaml:
packages:
  - 'apps/*'
  - 'packages/*'

TURBO.JSON (pipeline config):
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],     // ^ = must build deps first
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "dist/**", "build/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,              // never cache dev server
      "persistent": true           // long-running (dev server)
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["$TURBO_DEFAULT$", "tests/**"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "inputs": ["$TURBO_DEFAULT$", ".eslintrc*"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    },
    "db:push": {
      "cache": false,
      "interactive": true
    }
  }
}

KEY TURBO CONCEPTS:
- dependsOn: ["^build"] → topological dep (build packages before apps that use them)
- dependsOn: ["build"]  → task dep within same package
- inputs: determines cache key (default = all git-tracked files in the package)
- outputs: what to cache and restore next run
- cache: false → always re-run (dev servers, DB migrations, etc.)
- persistent: true → long-running process (don't wait for completion to start others)

TURBO COMMANDS:
turbo run build                     # run "build" in all packages
turbo run build --filter=web        # only the web app
turbo run build --filter=./apps/*   # all apps
turbo run build --filter=...web     # web and all its deps
turbo run build --filter=web...     # web and all packages that depend on it
turbo run build --filter=[HEAD^1]   # packages changed since last commit
turbo run build --dry=json          # show what would run (JSON output)
turbo run build --graph=graph.svg   # visualize task graph
turbo run dev --filter=web --filter=api   # multiple filters

SHARED PACKAGE SETUP:
# packages/ui/package.json:
{
  "name": "@repo/ui",
  "main": "./src/index.tsx",
  "types": "./src/index.tsx",
  "exports": {
    ".": { "default": "./src/index.tsx" }
  },
  "devDependencies": { "typescript": "^5" }
}

# Consuming in apps:
# apps/web/package.json: "dependencies": { "@repo/ui": "*" }
# import { Button } from '@repo/ui'

SHARED TSCONFIG:
# packages/config/tsconfig/base.json:
{
  "compilerOptions": { "strict": true, "skipLibCheck": true, "esModuleInterop": true, "jsx": "react-jsx" }
}

# apps/web/tsconfig.json:
{ "extends": "@repo/config/tsconfig/nextjs.json", "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"] }

REMOTE CACHE (Vercel / self-hosted):
# Vercel Remote Cache (free for Hobby):
npx turbo login           # authenticate with Vercel
npx turbo link            # link repo to Vercel Remote Cache
# Now CI runners share cache — never rebuild unchanged packages

# Self-hosted (Vercel Remote Cache protocol):
turbo run build --api="https://mycache.company.com" --token="$TURBO_TOKEN" --team="myteam"
# OSS alternatives: turborepo-remote-cache (Ducktape), Nx Cloud, Depot

ENVIRONMENT VARIABLES:
# In turbo.json per task:
"build": { "env": ["NODE_ENV", "DATABASE_URL"] }
# turbo.json global:
"globalEnv": ["TURBO_TOKEN", "VERCEL_URL"]
# Included in cache key automatically

CI INTEGRATION (GitHub Actions):
- name: Build
  run: turbo run build --cache-dir=.turbo
  env:
    TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: \${{ vars.TURBO_TEAM }}`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== TURBOREPO QUESTION ===\n${prompt}`);
    }
}

export const turborepoOssAgent = new TurborepoOssAgent();
