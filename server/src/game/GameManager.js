const { v4: uuidv4 } = require('uuid')

class GameManager {
  constructor() {
    this.games = new Map() // gameId -> Game instance
    this.players = new Map() // playerId -> Player instance
    this.playerToGame = new Map() // playerId -> gameId
  }

  // Create a new game session
  createGame(hostPlayerId) {
    const gameId = uuidv4()
    const game = {
      id: gameId,
      hostId: hostPlayerId,
      players: new Map(),
      state: 'waiting', // waiting, playing, paused, ended
      gameData: {
        level: 1,
        score: 0,
        enemies: [],
        bossFight: false,
        startTime: null
      },
      createdAt: new Date(),
      lastUpdate: new Date()
    }

    this.games.set(gameId, game)
    this.joinGame(gameId, hostPlayerId, true)

    console.log(`🎮 New game created: ${gameId} by player ${hostPlayerId}`)
    return game
  }

  // Join an existing game
  joinGame(gameId, playerId, isHost = false) {
    const game = this.games.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.state !== 'waiting' && !isHost) {
      throw new Error('Game is not accepting new players')
    }

    const player = {
      id: playerId,
      gameId: gameId,
      isHost: isHost,
      isReady: false,
      position: { x: 400, y: 500 },
      health: 100,
      score: 0,
      lastPing: Date.now(),
      joinedAt: new Date()
    }

    game.players.set(playerId, player)
    this.players.set(playerId, player)
    this.playerToGame.set(playerId, gameId)

    console.log(`👤 Player ${playerId} joined game ${gameId}`)
    return player
  }

  // Leave a game
  leaveGame(playerId) {
    const gameId = this.playerToGame.get(playerId)
    if (!gameId) return false

    const game = this.games.get(gameId)
    if (!game) return false

    const player = game.players.get(playerId)
    if (!player) return false

    // Remove player from game
    game.players.delete(playerId)
    this.players.delete(playerId)
    this.playerToGame.delete(playerId)

    // If host left, assign new host or end game
    if (player.isHost && game.players.size > 0) {
      const newHost = Array.from(game.players.values())[0]
      newHost.isHost = true
      game.hostId = newHost.id
      console.log(`👑 New host assigned: ${newHost.id} for game ${gameId}`)
    } else if (game.players.size === 0) {
      // Delete empty game
      this.games.delete(gameId)
      console.log(`🗑️ Empty game deleted: ${gameId}`)
    }

    console.log(`👋 Player ${playerId} left game ${gameId}`)
    return true
  }

  // Get game by ID
  getGame(gameId) {
    return this.games.get(gameId)
  }

  // Get player by ID
  getPlayer(playerId) {
    return this.players.get(playerId)
  }

  // Get game for player
  getPlayerGame(playerId) {
    const gameId = this.playerToGame.get(playerId)
    return gameId ? this.games.get(gameId) : null
  }

  // Update player position
  updatePlayerPosition(playerId, position) {
    const player = this.players.get(playerId)
    if (!player) return false

    player.position = position
    player.lastPing = Date.now()

    return true
  }

  // Start a game
  startGame(gameId) {
    const game = this.games.get(gameId)
    if (!game) throw new Error('Game not found')

    if (game.state !== 'waiting') {
      throw new Error('Game cannot be started')
    }

    game.state = 'playing'
    game.gameData.startTime = new Date()
    game.lastUpdate = new Date()

    console.log(`🚀 Game started: ${gameId}`)
    return game
  }

  // Update game state
  updateGameState(gameId, gameData) {
    const game = this.games.get(gameId)
    if (!game) return false

    game.gameData = { ...game.gameData, ...gameData }
    game.lastUpdate = new Date()

    return true
  }

  // Get active games list
  getActiveGames() {
    return Array.from(this.games.values())
      .filter(game => game.state !== 'ended')
      .map(game => ({
        id: game.id,
        hostId: game.hostId,
        playerCount: game.players.size,
        state: game.state,
        level: game.gameData.level,
        createdAt: game.createdAt
      }))
  }

  // Cleanup inactive games and players
  cleanup() {
    const now = Date.now()
    const timeout = 5 * 60 * 1000 // 5 minutes

    // Remove inactive players
    for (const [playerId, player] of this.players) {
      if (now - player.lastPing > timeout) {
        console.log(`🧹 Cleaning up inactive player: ${playerId}`)
        this.leaveGame(playerId)
      }
    }

    // Remove old ended games
    for (const [gameId, game] of this.games) {
      if (game.state === 'ended' && now - game.lastUpdate.getTime() > timeout) {
        console.log(`🧹 Cleaning up ended game: ${gameId}`)
        this.games.delete(gameId)
      }
    }
  }

  // Get server statistics
  getStats() {
    return {
      totalGames: this.games.size,
      activePlayers: this.players.size,
      gamesWaiting: Array.from(this.games.values()).filter(g => g.state === 'waiting').length,
      gamesPlaying: Array.from(this.games.values()).filter(g => g.state === 'playing').length
    }
  }
}

module.exports = GameManager