# Desktop Development Scripts

Collection of helper scripts for desktop development and building.

## Scripts

### install-optional-deps.js
Installs optional dependencies for enhanced features if available on the platform.

### build-icons.js  
Generates platform-specific icons from source PNG files.

### dev-server.js
Development server with hot reload for the game client.

### package-cleanup.js
Cleans up build artifacts and temporary files.

## Usage

These scripts are automatically run during the build process, but can be executed individually:

```bash
# Install optional dependencies
node scripts/install-optional-deps.js

# Generate icons
node scripts/build-icons.js

# Start development server
node scripts/dev-server.js

# Clean build artifacts
node scripts/package-cleanup.js
```