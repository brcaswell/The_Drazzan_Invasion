// Development server for the Electron app with hot reload
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const app = express();
const PORT = 8081;

// Serve the client files
app.use(express.static(path.join(__dirname, '../../client')));
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

let electronProcess = null;

function startElectron() {
  if (electronProcess) {
    electronProcess.kill();
  }
  
  console.log('🚀 Starting Electron...');
  electronProcess = spawn('npx', ['electron', '.', '--dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  electronProcess.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log(`Electron process exited with code ${code}`);
    }
  });
}

function restartElectron() {
  console.log('🔄 Restarting Electron...');
  startElectron();
}

// Start the web server
const server = app.listen(PORT, () => {
  console.log(`🌐 Development server running at http://localhost:${PORT}`);
  console.log('📁 Serving client files from ../client/');
  
  // Start Electron
  startElectron();
  
  // Watch for changes in main process files
  const mainWatcher = chokidar.watch([
    path.join(__dirname, '../src/main.js'),
    path.join(__dirname, '../src/preload.js'),
    path.join(__dirname, '../package.json')
  ]);
  
  mainWatcher.on('change', (filePath) => {
    console.log(`📝 Main process file changed: ${path.basename(filePath)}`);
    restartElectron();
  });
  
  // Watch for changes in client files
  const clientWatcher = chokidar.watch([
    path.join(__dirname, '../../client/**/*.js'),
    path.join(__dirname, '../../client/**/*.css'),
    path.join(__dirname, '../../client/**/*.html')
  ], {
    ignored: /node_modules/
  });
  
  clientWatcher.on('change', (filePath) => {
    console.log(`🎨 Client file changed: ${path.relative(__dirname, filePath)}`);
    // Electron will auto-reload the web content
  });
  
  console.log('👀 Watching for file changes...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  
  if (electronProcess) {
    electronProcess.kill();
  }
  
  server.close(() => {
    console.log('✅ Development server stopped');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});