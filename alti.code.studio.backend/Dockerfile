# ═══════════════════════════════════════════════════════════════
# ALTI CODE STUDIO — Backend Production Dockerfile
# Multi-stage build for enterprise deployment
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app

# Install build tools for native modules (bcrypt, re2, etc.)
RUN apk add --no-cache python3 make g++ linux-headers

COPY alti.code.studio.backend/package.json alti.code.studio.backend/package-lock.json* ./

# Install all dependencies (need devDeps for prisma generate)
RUN npm ci --legacy-peer-deps

# ── Stage 2: Build & Prepare ──
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY alti.code.studio.backend/ .
COPY submodules/ ./submodules/

# Generate Prisma client
RUN npx prisma generate

# Remove dev dependencies for production
RUN npm prune --omit=dev --legacy-peer-deps

# ── Stage 3: Production Runner ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: run as non-root
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy application
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/config ./config
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/index.js ./index.js
COPY --from=builder --chown=appuser:appgroup /app/server.js ./server.js
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/users_mock.json ./users_mock.json
COPY --from=builder --chown=appuser:appgroup /app/submodules ./submodules

# Copy generated Prisma client
COPY --from=builder --chown=appuser:appgroup /app/node_modules/.prisma ./node_modules/.prisma

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/healthz || exit 1

CMD ["node", "server.js"]
