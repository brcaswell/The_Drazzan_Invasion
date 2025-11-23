#!/usr/bin/env pwsh

Write-Host "Starting P2P WebAssembly Development Environment" -ForegroundColor Green

# Check if client directory exists
if (-not (Test-Path "client")) {
    Write-Host "Client directory not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}

# Function to check Docker Desktop status
function Test-DockerDesktop {
    try {
        # Check if Docker service is running
        $dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
        if (-not $dockerProcess) {
            return $false
        }
        
        # Test basic Docker connectivity
        $dockerVersion = & docker version --format "{{.Server.Version}}" 2>$null
        return $dockerVersion -ne $null
    }
    catch {
        return $false
    }
}

# Check Docker Desktop status first
Write-Host "Checking Docker Desktop status..." -ForegroundColor Blue
$dockerAvailable = Test-DockerDesktop

if (-not $dockerAvailable) {
    Write-Host ""
    Write-Host "⚠️  Docker Desktop is not running or not available" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To use the containerized P2P development environment:" -ForegroundColor Cyan
    Write-Host "   1. Start Docker Desktop"
    Write-Host "   2. Wait for Docker to fully initialize"
    Write-Host "   3. Run this script again"
    Write-Host ""
    Write-Host "Alternative: Use VS Code Live Server or simple file:// opening" -ForegroundColor Green
    Write-Host "   1. Right-click client/index.html → 'Open with Live Server'"
    Write-Host "   2. Or double-click client/index.html for file:// access"
    Write-Host "   3. Use single-player mode for basic testing"
    Write-Host ""
    
    # Ask user if they want to continue anyway
    $continue = Read-Host "Continue without Docker? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Exiting. Start Docker Desktop and run again for P2P testing." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "Continuing without Docker containers..." -ForegroundColor Yellow
    Write-Host "Note: P2P multiplayer testing will not be available" -ForegroundColor Yellow
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

# Only start Docker containers if Docker is available
if ($dockerAvailable) {
    # Start P2P testing servers
    Write-Host "Starting Docker containers for P2P testing..." -ForegroundColor Blue
    
    try {
        & docker compose -f docker-compose.dev.yml up -d drazzan-host drazzan-peer
        
        # Wait for web server
        Start-Sleep -Seconds 3
        
        # Check if web server is running
        $webServerUp = $false
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction Stop
            $webServerUp = $true
            Write-Host "✅ Web servers running successfully!" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Web server failed to start on port 8080" -ForegroundColor Red
            Write-Host "This might be due to port conflicts or Docker issues" -ForegroundColor Yellow
        }
        
        if (-not $webServerUp) {
            Write-Host ""
            Write-Host "Docker containers started but web server check failed." -ForegroundColor Yellow
            Write-Host "You can still try accessing:" -ForegroundColor Cyan
            Write-Host "   - http://localhost:8080 (if port is available)"
            Write-Host "   - http://localhost:8081 (peer server)"
            Write-Host ""
            Write-Host "Or use alternative methods:" -ForegroundColor Green
            Write-Host "   - VS Code Live Server extension"
            Write-Host "   - File:// access by opening client/index.html directly"
        }
    }
    catch {
        Write-Host "❌ Failed to start Docker containers: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Fallback options:" -ForegroundColor Green
        Write-Host "   1. Use VS Code Live Server extension" -ForegroundColor Cyan
        Write-Host "      - Right-click client/index.html → 'Open with Live Server'"
        Write-Host "   2. Use Node.js http-server (if available)" -ForegroundColor Cyan
        Write-Host "      - Run: npx http-server client -p 8080"
        Write-Host "   3. Direct file access" -ForegroundColor Cyan
        Write-Host "      - Double-click client/index.html"
        Write-Host ""
        $dockerAvailable = $false
    }
}
else {
    Write-Host "Skipping Docker container startup (Docker not available)" -ForegroundColor Yellow
}

Write-Host ""
if ($dockerAvailable) {
    Write-Host "🚀 P2P Development Environment Ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Points:" -ForegroundColor Yellow
    Write-Host "   - Player 1 (Host): http://localhost:8080"
    Write-Host "   - Player 2 (Peer): http://localhost:8081"
    Write-Host ""
    Write-Host "P2P Multiplayer Testing:" -ForegroundColor Cyan
    Write-Host "   1. Open both URLs in different browser windows"
    Write-Host "   2. Select multiplayer mode in one window (becomes host)"
    Write-Host "   3. Join the game from the second window (becomes peer)"
    Write-Host "   4. Test WebRTC P2P connection and WASM game servers"
    Write-Host ""
    Write-Host "Debug Console:" -ForegroundColor Magenta
    Write-Host "   - Press ~ or F12 in single-player mode for debug commands"
    Write-Host "   - Try 'help' command for available debugging options"
    Write-Host ""
    Write-Host "To stop containers: docker compose -f docker-compose.dev.yml down" -ForegroundColor Red
}
else {
    Write-Host "⚡ Basic Development Environment Ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Recommended next steps:" -ForegroundColor Yellow
    Write-Host "   1. Use VS Code Live Server for best experience:"
    Write-Host "      - Install 'Live Server' extension in VS Code"
    Write-Host "      - Right-click client/index.html → 'Open with Live Server'"
    Write-Host "   2. Or double-click client/index.html for direct access"
    Write-Host ""
    Write-Host "Available Features:" -ForegroundColor Cyan
    Write-Host "   ✅ Single-player game mode"
    Write-Host "   ✅ Debug console (press ~ or F12)"
    Write-Host "   ✅ PWA offline functionality"
    Write-Host "   ❌ P2P multiplayer (requires Docker environment)"
    Write-Host ""
    Write-Host "For P2P multiplayer testing:" -ForegroundColor Magenta
    Write-Host "   1. Start Docker Desktop"
    Write-Host "   2. Run this script again"
    Write-Host "   3. Use the containerized environment"
}