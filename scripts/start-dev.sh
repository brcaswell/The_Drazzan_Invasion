#!/bin/bash

echo "🚀 Starting Drazzan Invasion development environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Run ./scripts/dev-setup.sh first"
    exit 1
fi

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

# Start development services
echo "🐳 Starting containers..."
$COMPOSE_CMD up -d game-server game-client game-cache

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check server health
SERVER_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$SERVER_HEALTH" = "200" ]; then
    echo "✅ Game server is healthy"
else
    echo "⚠️  Game server may not be ready yet (HTTP $SERVER_HEALTH)"
fi

# Check client availability
CLIENT_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)
if [ "$CLIENT_HEALTH" = "200" ]; then
    echo "✅ Game client is available"
else
    echo "⚠️  Game client may not be ready yet (HTTP $CLIENT_HEALTH)"
fi

echo ""
echo "🎉 Development environment is running!"
echo ""
echo "📍 Available services:"
echo "   🎮 Game Client: http://localhost:8081"
echo "   🔧 Game Server API: http://localhost:3000"
echo "   🔌 WebSocket: ws://localhost:8080"
echo ""
echo "📊 View logs: $COMPOSE_CMD logs -f"
echo "🛑 Stop services: ./scripts/stop-dev.sh"