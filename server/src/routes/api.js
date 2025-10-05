const express = require('express')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()

// This will be injected by the main server
let gameManager = null

// Set game manager instance
router.setGameManager = (gm) => {
  gameManager = gm
}

// Get server info
router.get('/info', (req, res) => {
  res.json({
    name: 'Drazzan Invasion Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: gameManager ? gameManager.getStats() : {}
  })
})

// Get active games
router.get('/games', (req, res) => {
  if (!gameManager) {
    return res.status(500).json({ error: 'Game manager not initialized' })
  }

  const games = gameManager.getActiveGames()
  res.json({ games })
})

// Create new game
router.post('/games', (req, res) => {
  if (!gameManager) {
    return res.status(500).json({ error: 'Game manager not initialized' })
  }

  try {
    const playerId = req.body.playerId || uuidv4()
    const game = gameManager.createGame(playerId)
    
    res.status(201).json({
      gameId: game.id,
      playerId: playerId,
      message: 'Game created successfully'
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Join existing game
router.post('/games/:gameId/join', (req, res) => {
  if (!gameManager) {
    return res.status(500).json({ error: 'Game manager not initialized' })
  }

  try {
    const { gameId } = req.params
    const playerId = req.body.playerId || uuidv4()
    
    const player = gameManager.joinGame(gameId, playerId)
    
    res.json({
      gameId: gameId,
      playerId: player.id,
      message: 'Joined game successfully'
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get game details
router.get('/games/:gameId', (req, res) => {
  if (!gameManager) {
    return res.status(500).json({ error: 'Game manager not initialized' })
  }

  const { gameId } = req.params
  const game = gameManager.getGame(gameId)
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  // Convert players Map to array for JSON response
  const gameData = {
    ...game,
    players: Array.from(game.players.values()).map(player => ({
      id: player.id,
      isHost: player.isHost,
      isReady: player.isReady,
      score: player.score,
      joinedAt: player.joinedAt
    }))
  }

  res.json({ game: gameData })
})

// Start game
router.post('/games/:gameId/start', (req, res) => {
  if (!gameManager) {
    return res.status(500).json({ error: 'Game manager not initialized' })
  }

  try {
    const { gameId } = req.params
    const { playerId } = req.body
    
    const game = gameManager.getGame(gameId)
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    const player = game.players.get(playerId)
    if (!player || !player.isHost) {
      return res.status(403).json({ error: 'Only the host can start the game' })
    }

    gameManager.startGame(gameId)
    res.json({ message: 'Game started successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Leave game
router.post('/games/:gameId/leave', (req, res) => {
  if (!gameManager) {
    return res.status(500).json({ error: 'Game manager not initialized' })
  }

  const { playerId } = req.body
  const success = gameManager.leaveGame(playerId)
  
  if (success) {
    res.json({ message: 'Left game successfully' })
  } else {
    res.status(400).json({ error: 'Could not leave game' })
  }
})

module.exports = router