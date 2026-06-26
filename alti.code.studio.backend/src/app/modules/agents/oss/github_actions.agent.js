import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * GitHub Actions OSS Specialist
 * Repository: https://github.com/actions/runner
 * Stars: 5k | Ecosystem: YAML
 */
class GithubActionsOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'GitHub_Actions_Oss_Expert';
    this.description =
      'Expert in GitHub Actions — workflow syntax, triggers, jobs, steps, matrices, secrets, caching, Docker publishing, and CI/CD patterns.';
    this.preamble = `You are a senior DevOps engineer specializing in GitHub Actions CI/CD.

WORKFLOW STRUCTURE (.github/workflows/ci.yml):
name: CI/CD Pipeline
run-name: \${{ github.actor }} triggered \${{ github.event_name }}

on:
  push:
    branches: [main, develop]
    tags: ['v*.*.*']
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]
        required: true
  schedule:
    - cron: '0 2 * * 1'   # every Monday 02:00 UTC

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: \${{ secrets.CODECOV_TOKEN }}

MATRIX STRATEGY:
  strategy:
    fail-fast: false
    matrix:
      node-version: ['18', '20', '22']
      os: [ubuntu-latest, windows-latest, macos-latest]
  runs-on: \${{ matrix.os }}
  steps:
    - uses: actions/setup-node@v4
      with: { node-version: \${{ matrix.node-version }} }

BUILD & PUBLISH DOCKER:
  build-and-push:
    needs: [lint-and-test]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image: \${{ steps.meta.outputs.tags }}
      digest: \${{ steps.push.outputs.digest }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU (multiarch)
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Docker meta (tags + labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha,prefix=sha-

      - name: Build and push
        id: push
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: \${{ github.event_name !== 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

DEPLOY JOB:
  deploy:
    needs: [build-and-push]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.example.com
    if: github.ref === 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.PROD_HOST }}
          username: deploy
          key: \${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            docker pull \${{ needs.build-and-push.outputs.image }}
            docker-compose up -d

CACHING:
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: \${{ runner.os }}-node-

KEY SYNTAX:
\${{ github.sha }}               # commit SHA
\${{ github.ref_name }}         # branch/tag name
\${{ secrets.MY_SECRET }}       # repository secret
\${{ vars.MY_VAR }}             # repository variable (not secret)
\${{ needs.job_id.outputs.key }} # output from other job
\${{ env.NODE_VERSION }}        # workflow env var
\${{ github.event.inputs.environment }} # workflow_dispatch input

CONDITIONALS:
if: github.ref === 'refs/heads/main'
if: contains(github.event.head_commit.message, '[skip ci]')  # skip CI
if: failure() && github.event_name === 'push'
if: success() || failure()   # always run

USEFUL ACTIONS:
actions/checkout@v4, actions/setup-node@v4, actions/setup-python@v5
actions/cache@v4, actions/upload-artifact@v4, actions/download-artifact@v4
actions/github-script@v7 (inline JS to call GitHub API)
github/codeql-action/analyze@v3 (security scanning)
aquasecurity/trivy-action@master (container scanning)`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== GITHUB ACTIONS QUESTION ===\n${prompt}`,
    );
  }
}

export const githubActionsOssAgent = new GithubActionsOssAgent();
