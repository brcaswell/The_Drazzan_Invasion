const { v4: uuidv4 } = require('uuid')

function setupWebSocket(wss, gameManager) {
  const connections = new Map() // ws -> { playerId, gameId }

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection')
    
    const connectionId = uuidv4()
    connections.set(ws, { connectionId, playerId: null, gameId: null })

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      connectionId: connectionId,
      timestamp: new Date().toISOString()
    }))

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString())
        await handleMessage(ws, message, gameManager, connections)
      } catch (error) {
        console.error('WebSocket message error:', error)
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }))
      }
    })

    ws.on('close', () => {
      const connection = connections.get(ws)
      if (connection && connection.playerId) {
        console.log(`🔌 Player ${connection.playerId} disconnected`)
        gameManager.leaveGame(connection.playerId)
        
        // Notify other players in the game
        if (connection.gameId) {
          broadcastToGame(connection.gameId, {
            type: 'player_left',
            playerId: connection.playerId
          }, gameManager, connections, ws)
        }
      }
      connections.delete(ws)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      connections.delete(ws)
    })
  })

  // Cleanup interval
  setInterval(() => {
    gameManager.cleanup()
  }, 60000) // Run every minute
}

async function handleMessage(ws, message, gameManager, connections) {
  const connection = connections.get(ws)
  
  switch (message.type) {
    case 'join_game':
      await handleJoinGame(ws, message, gameManager, connections)
      break
      
    case 'player_update':
      await handlePlayerUpdate(ws, message, gameManager, connections)
      break
      
    case 'game_action':
      await handleGameAction(ws, message, gameManager, connections)
      break
      
    case 'chat_message':
      await handleChatMessage(ws, message, gameManager, connections)
      break
      
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: message.timestamp }))
      break
      
    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${message.type}`
      }))
  }
}

async function handleJoinGame(ws, message, gameManager, connections) {
  try {
    const { gameId, playerId } = message
    const connection = connections.get(ws)
    
    // Join or create game
    let player
    if (gameId) {
      player = gameManager.joinGame(gameId, playerId || uuidv4())
    } else {
      const game = gameManager.createGame(playerId || uuidv4())
      player = gameManager.getPlayer(game.hostId)
    }
    
    // Update connection info
    connection.playerId = player.id
    connection.gameId = player.gameId
    
    // Send join confirmation
    ws.send(JSON.stringify({
      type: 'game_joined',
      gameId: player.gameId,
      playerId: player.id,
      isHost: player.isHost
    }))
    
    // Broadcast to other players
    broadcastToGame(player.gameId, {
      type: 'player_joined',
      playerId: player.id,
      isHost: player.isHost
    }, gameManager, connections, ws)
    
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: error.message
    }))
  }
}

async function handlePlayerUpdate(ws, message, gameManager, connections) {
  const connection = connections.get(ws)
  if (!connection.playerId) return
  
  const { position, health, score, actions } = message
  
  // Update player data
  if (position) {
    gameManager.updatePlayerPosition(connection.playerId, position)
  }
  
  // Broadcast to other players in the game
  broadcastToGame(connection.gameId, {
    type: 'player_state',
    playerId: connection.playerId,
    position,
    health,
    score,
    actions
  }, gameManager, connections, ws)
}

async function handleGameAction(ws, message, gameManager, connections) {
  const connection = connections.get(ws)
  if (!connection.playerId || !connection.gameId) return
  
  const { action, data } = message
  
  // Handle different game actions
  switch (action) {
    case 'shoot':
      broadcastToGame(connection.gameId, {
        type: 'player_action',
        playerId: connection.playerId,
        action: 'shoot',
        data: data
      }, gameManager, connections, ws)
      break
      
    case 'spawn_enemy':
      // Only host can spawn enemies (for now)
      const player = gameManager.getPlayer(connection.playerId)
      if (player && player.isHost) {
        broadcastToGame(connection.gameId, {
          type: 'game_event',
          event: 'enemy_spawned',
          data: data
        }, gameManager, connections)
      }
      break
      
    case 'boss_fight':
      broadcastToGame(connection.gameId, {
        type: 'game_event',
        event: 'boss_fight_started',
        data: data
      }, gameManager, connections)
      break
  }
}

async function handleChatMessage(ws, message, gameManager, connections) {
  const connection = connections.get(ws)
  if (!connection.playerId || !connection.gameId) return
  
  broadcastToGame(connection.gameId, {
    type: 'chat_message',
    playerId: connection.playerId,
    message: message.message,
    timestamp: new Date().toISOString()
  }, gameManager, connections)
}

function broadcastToGame(gameId, message, gameManager, connections, excludeWs = null) {
  const game = gameManager.getGame(gameId)
  if (!game) return
  
  const messageStr = JSON.stringify(message)
  
  for (const [ws, connection] of connections) {
    if (connection.gameId === gameId && ws !== excludeWs && ws.readyState === 1) {
      ws.send(messageStr)
    }
  }
}

module.exports = { setupWebSocket }