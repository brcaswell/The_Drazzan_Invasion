#!/usr/bin/env pwsh

Write-Host "Starting P2P WebAssembly Development Environment" -ForegroundColor Green

# Check if client directory exists
if (-not (Test-Path "client")) {
    Write-Host "Client directory not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}

# Build WASM modules in container (no host dependencies)
Write-Host "Building WebAssembly modules in container..." -ForegroundColor Blue
if (Test-Path "client\wasm") {
    Write-Host "Running containerized WASM build (no Node.js required on host)..." -ForegroundColor Cyan
    & docker compose -f docker-compose.dev.yml run --rm wasm-builder
    
    if (Test-Path "client\wasm\build\game-server.wasm") {
        Write-Host "WASM modules built successfully" -ForegroundColor Green
    }
    else {
        Write-Host "WASM build completed but no .wasm file found - JavaScript fallback will be used" -ForegroundColor Yellow
    }
}
else {
    Write-Host "No client/wasm directory found, skipping WASM build" -ForegroundColor Yellow
}

# Start Docker containers for P2P testing
Write-Host "Starting P2P testing containers..." -ForegroundColor Blue

# Check if we have the dev compose file
if (-not (Test-Path "docker-compose.dev.yml")) {
    Write-Host "docker-compose.dev.yml not found" -ForegroundColor Red
    exit 1
}

# Start basic web server
docker compose -f docker-compose.dev.yml up -d drazzan-web

# Wait for web server
Start-Sleep -Seconds 3

# Check if web server is running
try {
    $null = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Web server running at http://localhost:8080" -ForegroundColor Green
}
catch {
    Write-Host "Web server failed to start" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "P2P Development Environment Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Yellow
Write-Host "   - Player 1: http://localhost:8080"
Write-Host "   - Player 2: http://localhost:8081 (for P2P testing)"
Write-Host ""
Write-Host "Testing Instructions:" -ForegroundColor Cyan
Write-Host "   1. Open both URLs in different browser windows"
Write-Host "   2. Select multiplayer mode in one window (host)"
Write-Host "   3. Join the game from the second window (peer)"
Write-Host "   4. Test WebRTC P2P connection and WASM game servers"
Write-Host ""
Write-Host "To stop: docker compose -f docker-compose.dev.yml down" -ForegroundColor Red