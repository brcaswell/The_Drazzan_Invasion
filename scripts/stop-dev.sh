#!/bin/bash

echo "🛑 Stopping Drazzan Invasion development environment..."

# Check if Docker/Podman is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
else
    echo "❌ Neither docker-compose nor podman-compose found"
    exit 1
fi

echo "📦 Using: $COMPOSE_CMD"

# Stop services
echo "🐳 Stopping containers..."
$COMPOSE_CMD down

# Optional: Remove volumes (uncomment to clean data)
# echo "🗑️  Removing volumes..."
# $COMPOSE_CMD down -v

echo "✅ Development environment stopped"