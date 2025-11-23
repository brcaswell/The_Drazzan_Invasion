# Debug Console Testing Guide

## Overview
The debug console is a developer tool for testing game mechanics and progression in single-player mode only.

## Activation
- **Keyboard Shortcut**: Press `~` (tilde) or `F12` while in single-player game
- **Availability**: Single-player mode only - multiplayer modes do not have access
- **Visual**: Console appears as an overlay on the right side of the screen

## Access Requirements
1. Game must be in single-player mode
2. Game must be actively running (not in menu selection)
3. Console will show "Debug Console - Single Player Mode Only" when opened

## Testing Commands

### Game Progression Tests
```
skipToBoss          # Jump directly to Level 4 boss fight
setLevel 3          # Jump to Level 3
setLevel 1          # Return to Level 1
```

### Player Enhancement Tests
```
invincible          # Toggle invincibility (test enemy collisions)
doubleFire          # Toggle enhanced firing mode
addLives 5          # Add 5 extra lives
```

### Enemy Management Tests
```
killAll             # Clear all enemies (test level progression)
setScore 10000      # Set high score for testing
```

### System Information
```
gameState           # Show current game variables
features            # Display feature flag status
help                # Show all commands
clear               # Clear console output
```

### Game Reset Tests
```
resetGame           # Reset to initial state with intro
```

## Expected Behavior

### Single Player Mode
- Console should open when pressing `~` or `F12`
- All commands should execute successfully
- Commands should affect game state immediately
- Console should show command feedback

### Multiplayer/Menu Mode
- Console should NOT open when pressing `~` or `F12`
- Browser console should show: "Debug console only available in single player mode"

## Troubleshooting

### "Unknown command" Error
- Check that you're in single-player mode
- Verify command spelling (case-insensitive)
- Type `help` to see all available commands

### Console Won't Open
- Ensure you're in single-player gameplay (not menu)
- Check browser console for error messages
- Verify feature flags allow debug console

### Commands Not Working
- Check browser console for JavaScript errors
- Verify game state variables are available
- Try `gameState` command to check current status

## Development Notes

### Command Registration
Commands are registered in `setupCommands()` method during console initialization.

### Single Player Detection
Console checks `gameModeManager.currentMode === 'single'` and UI visibility to determine if single-player mode is active.

### Feature Flags
Debug console respects the `DEBUG_CONSOLE` feature flag, which is enabled by default in development environments.

## Testing Checklist

- [ ] Console opens with `~` key in single-player mode
- [ ] Console opens with `F12` key in single-player mode  
- [ ] Console does NOT open in multiplayer mode selection
- [ ] `skipToBoss` command triggers boss fight
- [ ] `setLevel` commands change level correctly
- [ ] `invincible` command prevents player death
- [ ] `killAll` command clears enemies
- [ ] `help` command shows all available commands
- [ ] `gameState` command displays current variables
- [ ] Commands show appropriate feedback messages
- [ ] Console history works with arrow keys
- [ ] Console can be closed and reopened