# -----------------------------------------------------------------------------
# Stage 1: Base - OS Dependencies
# -----------------------------------------------------------------------------
FROM node:20-slim AS base
WORKDIR /app

# Install system dependencies for Puppeteer and native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnss3 \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Stage 2: Dependencies (Prod Only)
# -----------------------------------------------------------------------------
FROM base AS deps
COPY package*.json ./
# Install ONLY production dependencies to keep image small
RUN npm ci --only=production

# -----------------------------------------------------------------------------
# Stage 3: Runner - Final Image
# -----------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5000

# Security: Run as non-root user
RUN groupadd -r inso && useradd -r -g inso -m inso

# Copy node_modules from deps stage
COPY --from=deps --chown=inso:inso /app/node_modules ./node_modules
COPY --chown=inso:inso package*.json ./

# Copy source code
COPY --chown=inso:inso . .

USER inso
EXPOSE 5000

CMD ["npm", "start"]
