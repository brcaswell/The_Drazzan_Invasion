Write-Host "🛑 Stopping Drazzan Invasion development environment..." -ForegroundColor Yellow

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

# Stop services
Write-Host "🐳 Stopping containers..." -ForegroundColor Blue
& $composeCmd down

# Optional: Remove volumes (uncomment to clean data)
# Write-Host "🗑️  Removing volumes..." -ForegroundColor Yellow
# & $composeCmd down -v

Write-Host "✅ Development environment stopped" -ForegroundColor Green