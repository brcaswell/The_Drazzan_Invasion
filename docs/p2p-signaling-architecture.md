# P2P Signaling Architecture

## Overview

The Drazzan Invasion implements a **fully decentralized P2P multiplayer system** using WebRTC for game communication and localStorage-based signaling for peer discovery. This architecture eliminates the need for central servers while enabling cross-origin testing between different localhost ports.

## Core Components

### Signaling Layer
- **Primary**: BroadcastChannel API (same-origin)
- **Fallback**: localStorage polling (cross-origin)
- **Purpose**: WebRTC peer discovery and connection establishment

### Connection Layer
- **Protocol**: WebRTC DataChannels
- **Data Flow**: Direct peer-to-peer after connection establishment
- **Game State**: Host-authoritative with peer validation

## Message Types & Flow

### 1. Game Advertisement (Discovery Phase)

**Origin**: Host → Broadcast  
**Timing**: When host starts a game  
**Transport**: BroadcastChannel + localStorage  
**Purpose**: Announce game availability to potential peers

```javascript
{
  id: "host-1728123456789-0.123",           // Unique message ID
  type: "game-advertisement",
  gameInfo: {
    hostId: "peer-abc123",                  // Host's peer ID
    gameCode: "ALPHA7",                     // User-friendly game code
    gameType: "drazzan-invasion",           // Game type identifier
    maxPlayers: 4,                          // Maximum players allowed
    currentPlayers: 1                       // Current player count
  },
  timestamp: 1728123456789
}
```

**Flow**:
1. Host calls `networkManager.hostGame()`
2. Network manager generates game code and peer ID
3. Advertisement sent via both BroadcastChannel and localStorage
4. All potential peers receive the advertisement

### 2. WebRTC Offer (Connection Initiation)

**Origin**: Peer → Host  
**Timing**: When peer attempts to join game  
**Transport**: localStorage signaling (cross-origin)  
**Purpose**: Initiate WebRTC connection to host

```javascript
{
  id: "peer-1728123456790-0.456",           // Unique message ID
  targetPeer: "peer-abc123",                // Host's peer ID
  sourcePeer: "peer-def456",                // Joining peer's ID
  signal: {
    type: "offer",
    offer: RTCSessionDescription            // WebRTC offer object
  },
  timestamp: 1728123456790
}
```

**Flow**:
1. Peer calls `networkManager.joinGame(hostPeerId)`
2. Peer creates RTCPeerConnection
3. Peer generates WebRTC offer
4. Offer sent to host via localStorage signaling

### 3. WebRTC Answer (Connection Response)

**Origin**: Host → Peer  
**Timing**: When host receives valid offer  
**Transport**: localStorage signaling (cross-origin)  
**Purpose**: Accept WebRTC connection from peer

```javascript
{
  id: "host-1728123456791-0.789",           // Unique message ID
  targetPeer: "peer-def456",                // Joining peer's ID
  sourcePeer: "peer-abc123",                // Host's peer ID
  signal: {
    type: "answer",
    answer: RTCSessionDescription           // WebRTC answer object
  },
  timestamp: 1728123456791
}
```

**Flow**:
1. Host receives offer via localStorage polling
2. Host creates RTCPeerConnection for peer
3. Host sets remote description (offer)
4. Host generates and sends answer
5. Host sets local description (answer)

### 4. ICE Candidates (NAT Traversal)

**Origin**: Both directions (Host ↔ Peer)  
**Timing**: Throughout WebRTC negotiation  
**Transport**: localStorage signaling  
**Purpose**: Exchange networking information for connection establishment

```javascript
{
  id: "peer-1728123456792-0.012",           // Unique message ID
  targetPeer: "peer-abc123",                // Target peer ID
  sourcePeer: "peer-def456",                // Source peer ID
  signal: {
    type: "ice-candidate",
    candidate: {                            // Serialized RTCIceCandidate
      candidate: "candidate:...",
      sdpMid: "0",
      sdpMLineIndex: 0,
      usernameFragment: "abc123"
    }
  },
  timestamp: 1728123456792
}
```

**Flow**:
1. Both peers generate ICE candidates
2. Candidates serialized for localStorage transport
3. Each peer sends candidates to the other
4. Candidates added to respective RTCPeerConnections
5. WebRTC connection established

## Signaling Implementation

### Dual Transport Strategy

The system uses both BroadcastChannel and localStorage to maximize compatibility:

```javascript
// Try BroadcastChannel first (fast, same-origin)
try {
    this.channel.postMessage(message);
} catch (error) {
    console.warn('BroadcastChannel failed, using localStorage:', error);
}

// Always send via localStorage for cross-origin support
this.sendViaLocalStorage(message);
```

### Cross-Origin localStorage Signaling

**Storage Key**: `drazzan-p2p-signals`  
**Polling Interval**: 500ms  
**Message Retention**: 5 minutes  
**Deduplication**: Unique message IDs + processed message tracking

### Message Processing

```javascript
// Filter for relevant messages
const newMessages = signals.filter(msg =>
    msg.timestamp > this.lastProcessedTimestamp &&
    (msg.targetPeer === this.peerId || msg.type === 'game-advertisement') &&
    msg.sourcePeer !== this.peerId &&
    msg.id && !this.processedMessages.has(msg.id)
);
```

## Connection Establishment Sequence

```
Phase 1: Discovery
┌────────┐                                    ┌────────┐
│  HOST  │ ──── game-advertisement ────────► │  PEER  │
└────────┘         (broadcast)               └────────┘

Phase 2: WebRTC Handshake
┌────────┐                                    ┌────────┐
│  HOST  │ ◄──── offer ─────────────────────── │  PEER  │
│        │ ────── answer ────────────────────► │        │
│        │ ◄──── ice-candidate ──────────────── │        │
│        │ ────── ice-candidate ──────────────► │        │
└────────┘                                    └────────┘

Phase 3: P2P Connection
┌────────┐                                    ┌────────┐
│  HOST  │ ◄═════ WebRTC DataChannel ═════► │  PEER  │
└────────┘         (direct P2P)               └────────┘
```

## Error Handling & Edge Cases

### Duplicate Message Prevention
- **Unique IDs**: Each message gets a unique identifier
- **Processed Tracking**: Set of processed message IDs
- **Connection State**: Ignore offers if connection already exists

### Connection Failures
- **Timeout Handling**: 10-second connection timeout
- **State Monitoring**: RTCPeerConnection state change events
- **Cleanup**: Automatic cleanup of failed connections

### Memory Management
- **Message Cleanup**: Old messages removed after 5 minutes
- **ID Cleanup**: Processed message IDs limited to last 100
- **Connection Cleanup**: Failed connections automatically removed

## Testing Scenarios

### Same-Origin Testing (Option 1)
- **URL**: Both instances on `localhost:8080`
- **Transport**: BroadcastChannel (fast)
- **Use Case**: Development and quick testing

### Cross-Origin Testing (Option 2)
- **Host**: `localhost:8080`
- **Peer**: `localhost:8081`
- **Transport**: localStorage polling
- **Use Case**: Production-like multi-port testing

## Debug Tools

### Browser Console Commands

```javascript
// Inspect all P2P signals in localStorage
inspectP2PSignals()

// Check network manager state
window.networkManager

// Check signaling server state
window.networkManager.signalingServer
```

### Debug Logging

Key log patterns to watch for:

```
[LocalSignaling] Advertising game: {...}
[LocalSignaling] Sent via localStorage: {...}
[LocalSignaling] Found X new localStorage messages
[P2P] Received offer from peer-id
[P2P] Connection state with peer-id: connected
[P2P] Data channel opened with peer-id
```

## Architecture Benefits

### Decentralization
- **No Central Servers**: Pure P2P after connection establishment
- **Offline Capable**: Works without internet connection
- **Browser Native**: Runs directly from file:// URLs

### Scalability
- **Self-Organizing**: Peers discover and connect automatically
- **Host Authority**: Host maintains canonical game state
- **Peer Validation**: Non-host peers validate and predict

### Compatibility
- **Cross-Origin**: Works across different ports/origins
- **Fallback Strategy**: BroadcastChannel → localStorage
- **Modern Browsers**: Uses standard WebRTC and Storage APIs

## Known Limitations

### LocalStorage Scope
- **Origin Bound**: localhost:8080 and localhost:8081 share storage
- **Storage Limits**: ~5-10MB localStorage limit per origin
- **Polling Latency**: 500ms polling adds connection latency

### WebRTC Constraints
- **Browser Support**: Requires modern browser with WebRTC
- **NAT Traversal**: May need STUN/TURN for complex networks
- **Connection Limits**: Browser-dependent P2P connection limits

## Future Enhancements

### Potential Improvements
- **WebSocket Signaling**: Optional centralized signaling server
- **STUN/TURN Integration**: Better NAT traversal support
- **Connection Pooling**: Reuse connections for multiple games
- **Mesh Networking**: Multi-peer mesh topology support

### Monitoring Additions
- **Connection Quality**: Latency and packet loss monitoring
- **Performance Metrics**: Message throughput and processing time
- **Error Analytics**: Connection failure pattern analysis