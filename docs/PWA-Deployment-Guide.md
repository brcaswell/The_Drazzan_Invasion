# Deployment Guide - The Drazzan Invasion PWA

## Quick Start Deployment

### Web Deployment (GitHub Pages)

1. **Enable GitHub Pages** (simplest option):
   ```bash
   # Push to main branch
   git add .
   git commit -m "Deploy PWA to GitHub Pages"
   git push origin main
   
   # Enable Pages in repository settings
   # Source: Deploy from a branch -> main -> /client folder
   ```

2. **Access your game**:
   ```
   https://yourusername.github.io/The_Drazzan_Invasion/
   ```

### Desktop Distribution

1. **Build for all platforms**:
   ```bash
   cd desktop
   npm install
   npm run build
   ```

2. **Distribute**:
   - Upload to GitHub Releases
   - Share direct download links
   - Auto-updater will handle future updates

## Detailed Deployment Options

### Static Web Hosting

#### Option 1: Netlify (Recommended for PWAs)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from client directory
cd client
netlify deploy --prod --dir .

# Custom domain (optional)
netlify domains:add yourdomain.com
```

**Netlify Configuration** (`client/netlify.toml`):
```toml
[build]
  publish = "."
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.wasm"
  [headers.values]
    Content-Type = "application/wasm"
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel --prod
```

**Vercel Configuration** (`client/vercel.json`):
```json
{
  "functions": {},
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Performance Optimization

### Web Performance

1. **Enable Service Worker caching**:
   ```javascript
   // Verify SW registration
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

2. **Optimize assets**:
   ```bash
   # Compress images
   imagemin client/assets/*.png --out-dir=client/assets/optimized
   
   # Minify JavaScript
   terser client/js/*.js --compress --mangle --output client/js/game.min.js
   ```

## Security Considerations

### HTTPS Requirements
All PWA features require HTTPS. Use services like:
- Netlify (automatic HTTPS)
- Vercel (automatic HTTPS)
- Cloudflare (free SSL certificates)

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self' wss: ws:;
  img-src 'self' data:;
  media-src 'self';
  style-src 'self' 'unsafe-inline';
">
```

## Troubleshooting Common Issues

### WASM MIME Type Issues
**Problem**: WASM files not loading
**Solution**: Ensure server sends correct MIME type
```nginx
location ~* \.wasm$ {
    add_header Content-Type "application/wasm";
}
```

### Service Worker Caching Issues  
**Problem**: Updates not appearing
**Solution**: Implement proper cache versioning
```javascript
// In sw.js
const CACHE_VERSION = 'v2.0.0';
```

---

*This deployment guide ensures your Drazzan Invasion PWA can be distributed globally with optimal performance and security.*