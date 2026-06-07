#!/bin/bash
set -e

echo "🚀 Setting up browser-use-api python environment..."

# Go to browser-use-api directory
cd "$(dirname "$0")/../browser-use-api"

# Initialize venv using uv
echo "📦 Creating virtual environment using uv..."
uv venv --clear --python 3.11

# Install dependencies
echo "⚙️ Installing python dependencies..."
uv pip install -r requirements.txt

# Setup complete
echo "🎉 Setup complete! You can start the server with: .venv/bin/uvicorn app:app --port 3018"

