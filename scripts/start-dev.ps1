Write-Host "🚀 Starting Drazzan Invasion development environment..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Run .\scripts\dev-setup.ps1 first" -ForegroundColor Red
    exit 1
}

# Check if Docker is available
$composeCmd = $null
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeCmd = "docker-compose"
} elseif (Get-Command podman-compose -ErrorAction SilentlyContinue) {
    $composeCmd = "podman-compose"
} else {
    Write-Host "❌ Neither docker-compose nor podman-compose found" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Using: $composeCmd" -ForegroundColor Blue

# Start development services
Write-Host "🐳 Starting containers..." -ForegroundColor Blue
& $composeCmd up -d game-server game-client game-cache

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Blue

try {
    # Check server health
    $serverResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5 -ErrorAction Stop
    if ($serverResponse.StatusCode -eq 200) {
        Write-Host "✅ Game server is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Game server may not be ready yet" -ForegroundColor Yellow
}

try {
    # Check client availability
    $clientResponse = Invoke-WebRequest -Uri "http://localhost:8081" -TimeoutSec 5 -ErrorAction Stop
    if ($clientResponse.StatusCode -eq 200) {
        Write-Host "✅ Game client is available" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Game client may not be ready yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Development environment is running!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Available services:" -ForegroundColor Yellow
Write-Host "   🎮 Game Client: http://localhost:8081"
Write-Host "   🔧 Game Server API: http://localhost:3000"
Write-Host "   🔌 WebSocket: ws://localhost:8080"
Write-Host ""
Write-Host "📊 View logs: $composeCmd logs -f" -ForegroundColor Blue
Write-Host "🛑 Stop services: .\scripts\stop-dev.ps1" -ForegroundColor Blue