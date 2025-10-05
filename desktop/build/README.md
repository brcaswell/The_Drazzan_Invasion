# Build Icons Directory

This directory contains icons for building the desktop application across different platforms.

## Required Icons

### Windows
- `icon.ico` - Main application icon (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
- `icon.png` - PNG version for development (512x512)

### macOS
- `icon.icns` - macOS icon bundle (1024x1024 down to 16x16)
- `icon.png` - Source PNG (1024x1024)

### Linux
- `icon.png` - Standard PNG icon (512x512)
- Various sizes: 16, 32, 48, 64, 128, 256, 512

## Icon Creation

Use the source PNG to generate platform-specific formats:

### Windows ICO
```bash
# Using ImageMagick
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### macOS ICNS
```bash
# Create iconset directory
mkdir icon.iconset

# Generate different sizes
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Create ICNS
iconutil -c icns icon.iconset
```

## Current Status
- [ ] Create custom game icon design
- [ ] Generate Windows ICO format
- [ ] Generate macOS ICNS format
- [ ] Generate Linux PNG icons
- [ ] Add installer banner images
- [ ] Add splash screen assets

For now, a placeholder icon should be created or the default Electron icon will be used.