@echo off
REM Build script for WebAssembly game server modules (Windows)

echo 🚀 Building WebAssembly Game Server Modules...

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found
    echo Please install Node.js first
    exit /b 1
)

REM Create build directory
if not exist "build" mkdir build

REM Build the main game server module
echo 🔨 Building game server module...

REM Create a minimal WAT file for placeholder
echo (module > build\minimal.wat
echo   (memory (export "memory") 1) >> build\minimal.wat
echo   ;; Initialize server function >> build\minimal.wat
echo   (func $initializeServer (param $mode i32) (result i32) >> build\minimal.wat
echo     i32.const 1  ;; Return success >> build\minimal.wat
echo   ) >> build\minimal.wat
echo   (export "initializeServer" (func $initializeServer)) >> build\minimal.wat
echo   ;; Add player function >> build\minimal.wat
echo   (func $addPlayer (param $playerId i32) (param $x f32) (param $y f32) (result i32) >> build\minimal.wat
echo     i32.const 1  ;; Return success >> build\minimal.wat
echo   ) >> build\minimal.wat
echo   (export "addPlayer" (func $addPlayer)) >> build\minimal.wat
echo   ;; Update game state function >> build\minimal.wat
echo   (func $updateGameState (param $deltaTime f32) >> build\minimal.wat
echo     ;; Empty implementation for now >> build\minimal.wat
echo   ) >> build\minimal.wat
echo   (export "updateGameState" (func $updateGameState)) >> build\minimal.wat
echo   ;; Get game state function >> build\minimal.wat
echo   (func $getGameState (result i32) >> build\minimal.wat
echo     i32.const 0  ;; Return empty state >> build\minimal.wat
echo   ) >> build\minimal.wat
echo   (export "getGameState" (func $getGameState)) >> build\minimal.wat
echo ) >> build\minimal.wat

REM Check for wat2wasm
where wat2wasm >nul 2>&1
if errorlevel 1 (
    echo ⚠️  wat2wasm not found, creating placeholder WASM file
    echo    Install WebAssembly Binary Toolkit (WABT) for WASM compilation
    
    REM Create a minimal WASM header as placeholder
    echo|set /p="^@asm^A^@^@^@" > build\game-server.wasm
) else (
    echo 🔄 Converting WAT to WASM...
    wat2wasm build\minimal.wat -o build\game-server.wasm
    echo ✅ WebAssembly module built successfully
)

REM Create build info file
echo { > build\build-info.json
echo   "buildTime": "%date:~-4%-%date:~-10,2%-%date:~-7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z", >> build\build-info.json
echo   "modules": { >> build\build-info.json
echo     "gameServer": { >> build\build-info.json
echo       "type": "placeholder", >> build\build-info.json
echo       "fallback": "JavaScript implementation available" >> build\build-info.json
echo     } >> build\build-info.json
echo   }, >> build\build-info.json
echo   "notes": [ >> build\build-info.json
echo     "This is a minimal WebAssembly build for development", >> build\build-info.json
echo     "The JavaScript fallback provides full functionality", >> build\build-info.json
echo     "Future versions will include optimized WASM implementation" >> build\build-info.json
echo   ] >> build\build-info.json
echo } >> build\build-info.json

echo 📊 Build complete!
echo    • WASM module: build\game-server.wasm
echo    • Build info: build\build-info.json
echo    • JavaScript fallback will be used for full functionality

REM Copy to client directory if it exists
if exist "..\..\client\wasm" (
    copy /Y build\* ..\..\client\wasm\ >nul
    echo 📁 Files copied to client\wasm\ directory
)

pause