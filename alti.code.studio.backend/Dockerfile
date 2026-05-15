# Use official lightweight Node.js standard base image optimized for GCP Cloud Run
FROM node:20-bookworm-slim

# Install necessary OS dependencies (Puppeteer/Chromium, Git, etc.)
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    git \
    make \
    g++ \
    openssh-client \
    python3 \
    python3-pip \
    python3-tk \
    tesseract-ocr \
    libtesseract-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*
    
# Phase 15: Install Python Bridge Dependencies for Browser-Use
RUN pip3 install --no-cache-dir --break-system-packages browser-use langchain-google-genai playwright \
    && playwright install --with-deps chromium

# Phase 16: Install Python Dependencies for Agent S (GUI Automation)
RUN pip3 install --no-cache-dir --break-system-packages gui-agents pyautogui pillow opencv-python

# Prevent Puppeteer from downloading its own Chromium (we are injecting ours for GCP stability)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Ensure Node environments explicitly default to production logging and behavior
ENV NODE_ENV=production

# App Workdir Setup
WORKDIR /usr/src/app

# Copy lockfile and package config to layer cache dependencies properly
COPY package*.json ./

# Execute a clean production installation
RUN npm install --legacy-peer-deps

# Install Google Cloud & Gemini Agentic CLIs globally
RUN npm install -g @google/gemini-cli-a2a-server @google/genai firebase-tools

# Source Code Copy (ignores node_modules via .dockerignore)
COPY . .

# Generate Prisma Data Access Layer for PostgreSQL
RUN npx prisma generate

# Expose backend REST port (Cloud Run defaults traffic over 8080 if PORT isn't overridden)
EXPOSE 5000

# Explicitly defining the un-privileged node user for security
# Switch to root to fix directory ownership first
RUN chown -R node:node /usr/src/app \
    # Create the `.gemini/` storage directory the swarm requires
    && mkdir -p /home/node/.gemini \
    && chown -R node:node /home/node/.gemini

USER node

# Healthcheck to self-monitor within Kubernetes/Run environments
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/healthz || exit 1

# Start execution loop
CMD [ "npm", "start" ]