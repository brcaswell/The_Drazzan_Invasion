# WebAssembly Game Server

This directory contains the WebAssembly game server implementation for The Drazzan Invasion.

## Overview

The WASM server provides:
- High-performance game logic execution
- Deterministic game state management
- Cross-platform compatibility
- Sandboxed execution environment

## Building the WASM Module

### Prerequisites
- Emscripten SDK (emsdk)
- Rust with wasm-pack (alternative)
- Or AssemblyScript compiler

### Using Emscripten (C++)
```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Build the WASM module
cd wasm/src
emcc game-server.cpp -o ../game-server.wasm \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS="['_malloc', '_free', '_init_game_server', '_create_game', '_join_game', '_update_player', '_process_game_tick', '_handle_player_action', '_get_game_state', '_get_game_state_size', '_cleanup_game_server']" \
    -s EXPORTED_RUNTIME_METHODS="['cwrap', 'ccall']" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=16777216 \
    -O3
```

### Using Rust + wasm-pack
```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build the WASM module
cd wasm/rust-src
wasm-pack build --target web --out-dir ../
```

### Using AssemblyScript
```bash
# Install AssemblyScript
npm install -g assemblyscript

# Build the WASM module
cd wasm/as-src
asc game-server.ts --outFile ../game-server.wasm --optimize
```

## WASM Module Interface

### Exported Functions

#### `init_game_server()`
Initializes the game server module.

#### `create_game(host_player_id_ptr: i32, host_player_id_len: i32) -> i32`
Creates a new game and returns the game ID.

#### `join_game(game_id: i32, player_id_ptr: i32, player_id_len: i32) -> i32`
Adds a player to the game. Returns 1 on success, 0 on failure.

#### `update_player(player_id_ptr: i32, player_id_len: i32, x: f32, y: f32, health: i32, score: i32) -> i32`
Updates player position and stats.

#### `process_game_tick(delta_time: f32)`
Processes one game logic tick.

#### `handle_player_action(player_id_ptr: i32, player_id_len: i32, action_ptr: i32, action_len: i32, data_ptr: i32, data_len: i32)`
Handles player actions like shooting, movement, etc.

#### `get_game_state() -> i32`
Returns pointer to serialized game state JSON.

#### `get_game_state_size() -> i32`
Returns size of game state data.

#### `cleanup_game_server()`
Cleans up server resources.

### JavaScript Imports

The WASM module expects these JavaScript functions to be available:

#### `js_log(message_ptr: i32, message_len: i32)`
Logging function.

#### `js_send_message(player_id_ptr: i32, player_id_len: i32, message_ptr: i32, message_len: i32)`
Send message to specific player.

#### `js_broadcast_message(message_ptr: i32, message_len: i32)`
Broadcast message to all players.

#### `js_get_current_time() -> f64`
Get current timestamp.

#### `js_random() -> f32`
Get random number 0-1.

## Development

### Testing
```bash
# Run tests (if using Rust)
cd wasm/rust-src
cargo test

# Run web server for testing
python -m http.server 8000
# Navigate to http://localhost:8000 and test in browser console
```

### Debugging
```bash
# Build with debug symbols
emcc game-server.cpp -o ../game-server.wasm -g4 --source-map-base http://localhost:8000/wasm/

# Or with Rust
wasm-pack build --dev --target web
```

## Performance Considerations

- Use `--optimize` flags for production builds
- Consider using SIMD instructions for vector math
- Profile memory usage and optimize allocations
- Use fixed-point math for deterministic calculations

## Security

- WASM provides sandboxed execution
- All external communication goes through defined imports
- No direct file system or network access
- Memory is isolated from host JavaScript

---

*Note: The actual WASM file needs to be compiled from source code. This directory contains build instructions and interface documentation.*