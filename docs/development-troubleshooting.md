# Development Environment Troubleshooting

## Quick Start Options (Best to Worst)

### 1. 🥇 Docker P2P Environment (Full Features)
```powershell
# Start Docker Desktop first, then:
.\scripts\start-p2p-dev.ps1
```
- **Best for**: P2P multiplayer testing, cross-origin development
- **Provides**: localhost:8080 and localhost:8081 servers
- **Requires**: Docker Desktop running

### 2. 🥈 VS Code Live Server (Recommended for Single Player)
```
1. Install "Live Server" extension in VS Code
2. Right-click client/index.html
3. Select "Open with Live Server"
```
- **Best for**: Single-player development, fast iteration
- **Provides**: Hot reload, proper HTTP serving
- **Requires**: VS Code with Live Server extension

### 3. 🥉 Node.js HTTP Server (Alternative)
```bash
npx http-server client -p 8080
```
- **Best for**: When VS Code isn't available
- **Provides**: Basic HTTP serving
- **Requires**: Node.js installed

### 4. 🆘 Direct File Access (Fallback)
```
Double-click client/index.html
```
- **Best for**: Quick testing when nothing else works
- **Provides**: Basic functionality
- **Limitations**: No HTTP features, limited P2P capability

## Common Issues & Solutions

### Docker Desktop Issues

#### "Docker Desktop is not running"
```
Error: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

**Solutions:**
1. **Start Docker Desktop**
   - Look for Docker Desktop in your Start menu
   - Wait for it to fully initialize (whale icon in system tray)
   - Re-run the script

2. **Install Docker Desktop** (if not installed)
   - Download from https://www.docker.com/products/docker-desktop
   - Follow installation instructions
   - Restart computer if prompted

3. **Alternative: Skip Docker**
   - When script asks "Continue without Docker? (y/N)", type `y`
   - Use VS Code Live Server instead

#### "Port already in use"
```
Error: Port 8080 is already allocated
```

**Solutions:**
1. **Stop existing containers**
   ```powershell
   docker compose -f docker-compose.dev.yml down
   ```

2. **Kill process using port**
   ```powershell
   # Find what's using port 8080
   netstat -ano | findstr :8080
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

3. **Use alternative hosting**
   - Try VS Code Live Server (uses port 5500)
   - Or use Node.js http-server with different port

### VS Code Live Server Issues

#### "Live Server extension not found"
1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "Live Server"
3. Install by Ritwick Dey
4. Reload VS Code

#### "Right-click menu doesn't show Live Server"
1. Make sure you're right-clicking on an HTML file
2. Check that Live Server extension is enabled
3. Try opening the file first, then use Ctrl+Shift+P → "Live Server: Open with Live Server"

### Debug Console Issues

#### "Debug console not working after game reset"
- This is now fixed! The console automatically recreates its UI
- If issues persist, try refreshing the page

#### "Commands not recognized"
- Commands are case-sensitive: use exact casing (e.g., `skipToBoss`, not `skiptoboss`)
- Type `help` to see all available commands
- Debug console only works in single-player mode

### P2P Connection Issues

#### "Cannot connect to peer"
1. **Check both servers are running**
   - Verify localhost:8080 and localhost:8081 both load
   - Use debug console command `devEnv` to check status

2. **Clear localStorage**
   ```javascript
   // In browser console:
   localStorage.clear();
   ```

3. **Check cross-origin bridge**
   - Open browser dev tools → Network tab
   - Look for iframe loading errors
   - Ensure both servers serve the same files

#### "WebRTC connection timeout"
1. **Firewall/Network issues**
   - Try on same machine first
   - Check if Windows Firewall is blocking connections

2. **Browser compatibility**
   - Use Chrome or Firefox for best WebRTC support
   - Avoid Internet Explorer/old Edge

## Debug Console Commands

Access with `~` or `F12` key in single-player mode:

### Environment Checking
- `devEnv` - Check development environment status
- `gameState` - Show current game variables
- `features` - Show feature flags

### Game Testing
- `skipToBoss` - Jump directly to Level 4 boss fight
- `setLevel <1-4>` - Set current level
- `invincible` - Toggle player invincibility
- `killAll` - Destroy all enemies on screen

### Development Tools
- `resetGame` - Reset to initial state
- `sync` - Force synchronize game variables
- `clear` - Clear console output

## Getting Help

### In-Game Help
- Use debug console command `devEnv` for environment status
- Check browser console (F12) for error messages
- Look for network errors in browser dev tools

### File Locations
- Main game: `client/index.html`
- Debug console: `client/js/debug-console.js`
- P2P scripts: `scripts/start-p2p-dev.ps1`
- Docker config: `docker-compose.dev.yml`

### Development Flow
1. **Start with simplest setup** (VS Code Live Server)
2. **Test single-player features** thoroughly
3. **Move to Docker environment** for P2P testing
4. **Use debug console** for rapid iteration and testing

Remember: The game is designed to work offline and degrade gracefully - start simple and add complexity as needed!