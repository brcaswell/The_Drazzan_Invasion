require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const WebSocket = require('ws')
const http = require('http')

const GameManager = require('./game/GameManager')
const apiRoutes = require('./routes/api')
const { setupWebSocket } = require('./websocket/gameSocket')

const app = express()
const server = http.createServer(app)

// Configuration
const PORT = process.env.PORT || 3000
const WS_PORT = process.env.WS_PORT || 8080
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8081'

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}))

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Initialize Game Manager
const gameManager = new GameManager()

// Routes
app.use('/api', apiRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT })
setupWebSocket(wss, gameManager)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  wss.close(() => {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Drazzan Invasion Server running on port ${PORT}`)
  console.log(`🔌 WebSocket server running on port ${WS_PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = { app, server, gameManager }