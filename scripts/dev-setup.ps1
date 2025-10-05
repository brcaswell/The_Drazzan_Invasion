Write-Host "🚀 Setting up Drazzan Invasion development environment..." -ForegroundColor Green

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please review and update .env file with your settings" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Blue
}

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Blue
Set-Location server
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ No package.json found in server directory" -ForegroundColor Red
}
Set-Location ..

# Create necessary directories
$directories = @("logs", "data\postgres", "data\redis")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "📁 Created data directories" -ForegroundColor Green

# Set up Git hooks (if in a git repository)
if (Test-Path ".git") {
    Write-Host "🔧 Setting up Git hooks..." -ForegroundColor Blue
    
    $preCommitHook = @"
#!/bin/bash
echo "Running pre-commit checks..."
cd server && npm run lint
if [ `$? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi
echo "✅ Pre-commit checks passed"
"@
    
    $preCommitHook | Out-File -FilePath ".git\hooks\pre-commit" -Encoding ASCII
    Write-Host "✅ Git hooks set up" -ForegroundColor Green
}

Write-Host "🎉 Development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and update .env file"
Write-Host "2. Run: .\scripts\start-dev.ps1"
Write-Host "3. Open: http://localhost:8081"