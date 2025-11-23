#!/usr/bin/env pwsh

Write-Host "Stopping P2P Development Environment" -ForegroundColor Red

# Stop Docker containers
if (Test-Path "docker-compose.dev.yml") {
    Write-Host "Stopping containers..." -ForegroundColor Blue
    docker compose -f docker-compose.dev.yml down
    
    # Clean up any orphaned containers
    docker compose -f docker-compose.dev.yml down --remove-orphans
    
    Write-Host "P2P development environment stopped" -ForegroundColor Green
} else {
    Write-Host "docker-compose.dev.yml not found" -ForegroundColor Yellow
}

# Optional: Remove WASM build artifacts
$cleanWasm = Read-Host "Clean WASM build artifacts? (y/N)"
if ($cleanWasm -eq 'y' -or $cleanWasm -eq 'Y') {
    if (Test-Path "client\wasm\build") {
        Remove-Item "client\wasm\build\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cleaned WASM build artifacts" -ForegroundColor Green
    }
}

Write-Host "P2P development environment stopped successfully" -ForegroundColor Green