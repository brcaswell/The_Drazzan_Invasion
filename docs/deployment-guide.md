# Deployment Guide

## Overview

The Drazzan Invasion supports multiple deployment strategies, from local development to production container orchestration. This guide covers Docker/Podman deployment and GitHub Pages integration.

## Container Architecture

### Services
- **game-server**: Node.js backend with WebSocket support
- **game-client**: Static files served via nginx
- **game-db**: PostgreSQL database (optional)
- **game-cache**: Redis for sessions and real-time data

### Ports
- **3000**: HTTP API server
- **8080**: WebSocket server
- **8081**: Client web server (nginx)
- **5432**: PostgreSQL database
- **6379**: Redis cache

## Local Development

### Prerequisites
- Docker or Podman
- Docker Compose or Podman Compose
- Node.js 18+ (for local server development)

### Quick Start
```bash
# Clone repository
git clone https://github.com/brcaswell/The_Drazzan_Invasion.git
cd The_Drazzan_Invasion

# Start all services
docker-compose up -d

# Or with Podman
podman-compose up -d
```

### Individual Services
```bash
# Start only game server and client
docker-compose up game-server game-client

# Start with database
docker-compose up game-server game-client game-db game-cache

# View logs
docker-compose logs -f game-server
```

### Environment Configuration
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
WS_PORT=8080
CLIENT_URL=http://localhost:8081

# Database
POSTGRES_DB=drazzan_game
POSTGRES_USER=gameuser
POSTGRES_PASSWORD=gamepass

# Redis
REDIS_URL=redis://game-cache:6379

# Security
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=12
```

## Production Deployment

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml drazzan

# Scale services
docker service scale drazzan_game-server=3
```

### Kubernetes
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: drazzan-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: drazzan-server
  template:
    metadata:
      labels:
        app: drazzan-server
    spec:
      containers:
      - name: server
        image: drazzan-server:latest
        ports:
        - containerPort: 3000
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
```

## GitHub Pages Integration

### Limitations
GitHub Pages serves static content only, so the full multiplayer server cannot run there. However, there are several deployment strategies:

### Option 1: Static Client + External Server
**GitHub Pages**: Serve the client
**External Host**: Run the server (Heroku, Railway, DigitalOcean, etc.)

```javascript
// client/js/config.js
const CONFIG = {
  SERVER_URL: 'https://your-server.herokuapp.com',  
  WS_URL: 'wss://your-server.herokuapp.com',
  // ... other config
}
```

### Option 2: GitHub Actions + Container Registry
Use GitHub Actions to build and push containers to a registry:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: |
        docker build -t ghcr.io/brcaswell/drazzan-server:latest ./server
        docker build -t ghcr.io/brcaswell/drazzan-client:latest ./client
    
    - name: Push to GitHub Container Registry
      run: |
        echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
        docker push ghcr.io/brcaswell/drazzan-server:latest
        docker push ghcr.io/brcaswell/drazzan-client:latest
```

### Option 3: Hybrid Deployment
**GitHub Pages**: Host static single-player version
**Container Platform**: Host multiplayer version

## Container Hosting Platforms

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render
- Connect GitHub repository
- Auto-deploy on push
- Built-in PostgreSQL and Redis

### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: drazzan-invasion
services:
- name: server
  source_dir: /server
  github:
    repo: brcaswell/The_Drazzan_Invasion
    branch: main
  build_command: npm install
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

### Heroku
```bash
# Create apps
heroku create drazzan-server
heroku create drazzan-client

# Set buildpacks
heroku buildpacks:set heroku/nodejs -a drazzan-server
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static -a drazzan-client

# Deploy
git subtree push --prefix server heroku-server main
git subtree push --prefix client heroku-client main
```

## Performance Considerations

### Client Optimization
- **Nginx**: Use gzip compression and caching
- **CDN**: Consider CloudFlare or similar for static assets
- **Minification**: Minify JavaScript and CSS for production

### Server Optimization
- **Load Balancing**: Use multiple server instances
- **Session Affinity**: Ensure WebSocket connections stay on same server
- **Database**: Use connection pooling and read replicas
- **Caching**: Redis for frequently accessed data

### Container Optimization
```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
CMD ["npm", "start"]
```

## Monitoring and Logging

### Health Checks
All services include health check endpoints:
- **Server**: `GET /health`
- **Database**: Built-in PostgreSQL health checks
- **Redis**: Built-in Redis health checks

### Logging
```bash
# View logs
docker-compose logs -f

# Log aggregation (production)
docker-compose -f docker-compose.prod.yml up -d
```

### Metrics
Consider adding:
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Sentry**: Error tracking

## Security

### Container Security
- Non-root users in containers
- Minimal base images (Alpine Linux)
- Security scanning with `docker scan`

### Network Security
- Use HTTPS/WSS in production
- Implement rate limiting
- Use environment variables for secrets

### Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups

## Backup and Recovery

### Database Backups
```bash
# Backup
docker-compose exec game-db pg_dump -U gameuser drazzan_game > backup.sql

# Restore  
docker-compose exec -T game-db psql -U gameuser drazzan_game < backup.sql
```

### Volume Backups
```bash
# Backup volumes
docker run --rm -v drazzan_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 3000, 8080, 8081 are available
2. **Memory issues**: Increase Docker memory limits
3. **WebSocket connections**: Ensure proper proxy configuration
4. **Database connections**: Check connection strings and credentials

### Debug Commands
```bash
# Check container status
docker-compose ps

# Execute commands in containers
docker-compose exec game-server npm run test
docker-compose exec game-db psql -U gameuser drazzan_game

# View real-time logs
docker-compose logs -f --tail=100 game-server
```

---

*Updated: October 5, 2025*