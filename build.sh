#!/bin/bash
# CLAWD Wallet - Build Script
# Run this to complete the setup: ./build.sh

set -e

echo "🦁 CLAWD Wallet Build Script"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Please install Node.js first:"
    echo "  brew install node"
    echo "  or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✓ Node.js installed: $(node --version)"
echo "✓ npm installed: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✓ Dependencies installed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build

echo ""
echo "✓ Build complete"
echo ""

# Link globally
echo "🔗 Linking globally..."
if npm link; then
    echo "✓ Linked successfully"
else
    echo "⚠️  Link failed, you may need to run: sudo npm link"
fi

echo ""
echo "🎉 CLAWD Wallet is ready!"
echo ""
echo "Next steps:"
echo "  1. clawd init           # Initialize wallet"
echo "  2. [Fund wallet]        # Send USDC on Base"
echo "  3. clawd status         # Check status"
echo "  4. clawd install        # Configure Claude Code"
echo "  5. [Restart Claude Code]"
echo ""
echo "See SETUP.md for detailed instructions."
echo ""
