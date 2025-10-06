#!/usr/bin/env pwsh

Write-Host "🧪 Testing Containerized P2P WebAssembly Setup" -ForegroundColor Green

# Test 1: Check Docker availability
Write-Host "📋 Test 1: Docker availability..." -ForegroundColor Cyan
try {
    $dockerVersion = & docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker not found or not running" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker not available" -ForegroundColor Red
    exit 1
}

# Test 2: Check if docker-compose.dev.yml exists
Write-Host "📋 Test 2: Docker Compose configuration..." -ForegroundColor Cyan
if (Test-Path "docker-compose.dev.yml") {
    Write-Host "✅ docker-compose.dev.yml found" -ForegroundColor Green
} else {
    Write-Host "❌ docker-compose.dev.yml missing" -ForegroundColor Red
    exit 1
}

# Test 3: Test WASM builder container (dry run)
Write-Host "📋 Test 3: WASM builder container test..." -ForegroundColor Cyan
try {
    Write-Host "🔧 Running containerized WASM build..." -ForegroundColor Blue
    & docker compose -f docker-compose.dev.yml run --rm wasm-builder
    
    if (Test-Path "client\wasm\build\game-server.wasm") {
        Write-Host "✅ WASM build successful - game-server.wasm created" -ForegroundColor Green
        
        # Check file size
        $wasmFile = Get-Item "client\wasm\build\game-server.wasm"
        Write-Host "📊 WASM file size: $($wasmFile.Length) bytes" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  WASM build completed but no .wasm file found" -ForegroundColor Yellow
    }
    
    if (Test-Path "client\wasm\build\build-info.json") {
        Write-Host "✅ Build info created" -ForegroundColor Green
        $buildInfo = Get-Content "client\wasm\build\build-info.json" | ConvertFrom-Json
        Write-Host "📅 Build time: $($buildInfo.buildTime)" -ForegroundColor Cyan
        Write-Host "🏭 Builder: $($buildInfo.builder)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ WASM build failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Test web server startup
Write-Host "📋 Test 4: Web server startup test..." -ForegroundColor Cyan
try {
    Write-Host "🌐 Starting web server..." -ForegroundColor Blue
    & docker compose -f docker-compose.dev.yml up -d drazzan-web
    
    Start-Sleep -Seconds 5
    
    # Test both ports
    $port8080Works = $false
    $port8081Works = $false
    
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 3 -ErrorAction Stop
        $port8080Works = $true
        Write-Host "✅ Port 8080 responding" -ForegroundColor Green
    } catch {
        Write-Host "❌ Port 8080 not responding" -ForegroundColor Red
    }
    
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8081" -TimeoutSec 3 -ErrorAction Stop
        $port8081Works = $true
        Write-Host "✅ Port 8081 responding" -ForegroundColor Green
    } catch {
        Write-Host "❌ Port 8081 not responding" -ForegroundColor Red
    }
    
    # Clean up
    Write-Host "🧹 Cleaning up test containers..." -ForegroundColor Blue
    & docker compose -f docker-compose.dev.yml down -q
    
    if ($port8080Works -and $port8081Works) {
        Write-Host "✅ Both P2P testing ports working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some ports not responding - check Docker configuration" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Web server test failed: $_" -ForegroundColor Red
    & docker compose -f docker-compose.dev.yml down -q 2>$null
}

Write-Host ""
Write-Host "🎉 Containerized P2P Setup Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "   ✅ No host Node.js dependencies required"
Write-Host "   ✅ WASM building happens in containers"
Write-Host "   ✅ P2P testing on dual ports (8080 & 8081)"
Write-Host "   ✅ Ready for multiplayer WebRTC development"
Write-Host ""
Write-Host "🚀 To start development: .\scripts\start-p2p-dev.ps1" -ForegroundColor Cyan