#!/usr/bin/env bash
set -e

# Define directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CLAW_MODULE_DIR="$BACKEND_DIR/src/app/modules/clawCode"
VENDOR_DIR="$CLAW_MODULE_DIR/vendor"
BIN_DIR="$CLAW_MODULE_DIR/bin"
CLAW_BIN="$BIN_DIR/claw"

echo "🚀 Starting Claw-Code Setup..."

# Create target directories
mkdir -p "$VENDOR_DIR"
mkdir -p "$BIN_DIR"

# Check if binary already compiled
if [ -f "$CLAW_BIN" ]; then
    echo "✅ Claw-Code binary already compiled and present at $CLAW_BIN"
    exit 0
fi

# Clone repository
if [ ! -d "$VENDOR_DIR/claw-code" ]; then
    echo "📥 Cloning ultraworkers/claw-code repository..."
    git clone https://github.com/ultraworkers/claw-code.git "$VENDOR_DIR/claw-code"
else
    echo "🔄 Repository already cloned at $VENDOR_DIR/claw-code. Pulling updates..."
    cd "$VENDOR_DIR/claw-code"
    git pull origin main || true
fi

# Build from source
echo "🛠️ Compiling Claw-Code release binary..."
cd "$VENDOR_DIR/claw-code/rust"
cargo build --workspace --release

# Copy binary
echo "📦 Copying compiled binary to bin directory..."
if [ -f "target/release/claw" ]; then
    cp "target/release/claw" "$CLAW_BIN"
elif [ -f "target/release/claw-code" ]; then
    cp "target/release/claw-code" "$CLAW_BIN"
else
    echo "❌ Compilation completed but binary not found in target/release/ (checked 'claw' and 'claw-code')"
    exit 1
fi

chmod +x "$CLAW_BIN"
echo "🎉 Claw-Code successfully installed at $CLAW_BIN"
