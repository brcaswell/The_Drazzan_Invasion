# Development Scripts

This directory contains helper scripts for development workflow.

## Available Scripts

### `dev-setup.sh` / `dev-setup.ps1`
Initial development environment setup:
- Copies .env.example to .env
- Installs server dependencies
- Sets up Git hooks

### `start-dev.sh` / `start-dev.ps1` 
Start development environment:
- Starts Docker containers
- Runs in development mode with hot reload

### `stop-dev.sh` / `stop-dev.ps1`
Stop development environment:
- Stops and removes containers
- Cleans up volumes (optional)

### `test.sh` / `test.ps1`
Run tests:
- Server unit tests
- Integration tests
- Client tests (if added)

## Usage

### Linux/macOS
```bash
# Setup
chmod +x scripts/*.sh
./scripts/dev-setup.sh

# Development
./scripts/start-dev.sh
./scripts/test.sh
./scripts/stop-dev.sh
```

### Windows (PowerShell)
```powershell
# Setup
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\dev-setup.ps1

# Development
.\scripts\start-dev.ps1
.\scripts\test.ps1
.\scripts\stop-dev.ps1
```