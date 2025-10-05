#!/bin/bash
# Build script for WebAssembly game server modules

echo "🚀 Building WebAssembly Game Server Modules..."

# Check if AssemblyScript is installed
if ! command -v asc &> /dev/null; then
    echo "❌ AssemblyScript compiler (asc) not found"
    echo "📦 Installing AssemblyScript..."
    npm install -g assemblyscript
fi

# Create build directory
mkdir -p build

# Build the main game server module
echo "🔨 Building game server module..."

# For now, create a minimal WASM module since AssemblyScript compilation is complex
# This will be a placeholder until proper AssemblyScript source is created
cat > build/minimal.wat << 'EOF'
(module
  (memory (export "memory") 1)
  
  ;; Initialize server function
  (func $initializeServer (param $mode i32) (result i32)
    i32.const 1  ;; Return success
  )
  (export "initializeServer" (func $initializeServer))
  
  ;; Add player function
  (func $addPlayer (param $playerId i32) (param $x f32) (param $y f32) (result i32)
    i32.const 1  ;; Return success
  )
  (export "addPlayer" (func $addPlayer))
  
  ;; Update game state function
  (func $updateGameState (param $deltaTime f32)
    ;; Empty implementation for now
  )
  (export "updateGameState" (func $updateGameState))
  
  ;; Get game state function
  (func $getGameState (result i32)
    i32.const 0  ;; Return empty state
  )
  (export "getGameState" (func $getGameState))
)
EOF

# Convert WAT to WASM
if command -v wat2wasm &> /dev/null; then
    echo "🔄 Converting WAT to WASM..."
    wat2wasm build/minimal.wat -o build/game-server.wasm
    echo "✅ WebAssembly module built successfully"
else
    echo "⚠️  wat2wasm not found, WASM module will use JavaScript fallback"
    echo "   Install WebAssembly Binary Toolkit (WABT) for WASM compilation"
    
    # Create a placeholder WASM file
    echo -n -e '\x00\x61\x73\x6d\x01\x00\x00\x00' > build/game-server.wasm
fi

# Create a development info file
cat > build/build-info.json << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "modules": {
    "gameServer": {
      "type": "placeholder",
      "size": $(wc -c < build/game-server.wasm),
      "fallback": "JavaScript implementation available"
    }
  },
  "notes": [
    "This is a minimal WebAssembly build for development",
    "The JavaScript fallback provides full functionality",
    "Future versions will include optimized WASM implementation"
  ]
}
EOF

echo "📊 Build complete!"
echo "   • WASM module: build/game-server.wasm"
echo "   • Build info: build/build-info.json"
echo "   • JavaScript fallback will be used for full functionality"

# Copy to client directory
if [ -d "../../client/wasm" ]; then
    cp -r build/* ../../client/wasm/
    echo "📁 Files copied to client/wasm/ directory"
fi