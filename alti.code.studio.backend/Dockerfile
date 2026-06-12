# Optimized for GCP GKE Autopilot & AWS Fargate
# Implements multi-stage build, minimal footprint, and non-root execution
FROM node:20.18.1-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
# Clean install to ensure deterministic builds
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Prune dev dependencies for production
RUN npm prune --production

# --- Stage 2: Production Runtime ---
FROM node:20.18.1-alpine AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy pruned node_modules and built code from builder
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/config ./config
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/server.js ./server.js
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

# Change to non-root user for security (Confidential Computing/Zero-Trust)
USER appuser

EXPOSE 5000

# Start the Node process cleanly
CMD ["node", "server.js"]