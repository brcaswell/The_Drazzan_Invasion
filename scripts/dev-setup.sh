#!/bin/bash

echo "🚀 Setting up Drazzan Invasion development environment..."

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please review and update .env file with your settings"
else
    echo "ℹ️  .env file already exists"
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
if [ -f package.json ]; then
    npm install
    echo "✅ Server dependencies installed"
else
    echo "❌ No package.json found in server directory"
fi
cd ..

# Create necessary directories
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis

echo "📁 Created data directories"

# Set up Git hooks (if in a git repository)
if [ -d .git ]; then
    echo "🔧 Setting up Git hooks..."
    # Add pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
cd server && npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi
echo "✅ Pre-commit checks passed"
EOF
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks set up"
fi

echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file"
echo "2. Run: ./scripts/start-dev.sh"
echo "3. Open: http://localhost:8081"