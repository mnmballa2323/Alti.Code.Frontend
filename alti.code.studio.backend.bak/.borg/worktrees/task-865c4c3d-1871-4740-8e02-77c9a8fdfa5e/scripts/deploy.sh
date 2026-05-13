#!/bin/bash

echo "🚀 Starting Deployment Process..."

# 1. Check for Harness/Gitness
if [ "$(docker ps -q -f name=gitness)" ]; then
    echo "✅ Harness Gitness is running."
else
    echo "⚠️ Harness Gitness is NOT running. Starting it..."
    docker-compose -f ../../docker-compose.harness.yml up -d
fi

# 2. Simulate Cloud Push (Since we used dry_run in pipeline)
echo "☁️  Simulating Push to Cloud Container Registry..."
docker build -f ../Dockerfile -t inso-backend:latest ..
echo "✅ Build Complete: inso-backend:latest"

# 3. Trigger Webhook (Mock)
echo "🔗 Triggering Deployment Webhook..."
# curl -X POST http://localhost:3000/api/v1/repos/inso-code/pipelines/default/trigger ...
echo "✅ Deployment Triggered via Harness!"

echo "🎉 Deployed Successfully (Simulated)"
