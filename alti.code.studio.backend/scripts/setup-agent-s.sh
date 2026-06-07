#!/bin/bash
set -e

echo "🚀 Setting up agent-s python environment..."

# Go to backend directory
cd "$(dirname "$0")/.."

# Initialize venv using uv
echo "📦 Creating virtual environment .venv-agent-s using uv..."
uv venv --clear --python 3.11 .venv-agent-s

# Install dependencies and local submodule in editable mode
echo "⚙️ Installing python dependencies and gui-agents submodule..."
uv pip install --python .venv-agent-s/bin/python -e ../submodules/agent-s

echo "🎉 Agent-S Setup complete!"
