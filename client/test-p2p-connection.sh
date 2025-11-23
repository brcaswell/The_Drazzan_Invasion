#!/bin/bash
# P2P Connection Test Script
# This script helps test the P2P connection between host and peer

echo "=== P2P Connection Test Setup ==="
echo
echo "Step 1: Start Host (localhost:8080)"
echo "1. Open browser to: http://localhost:8080"
echo "2. Click 'Cooperative Mode' or 'Versus Mode'"
echo "3. Note the 6-character game code displayed"
echo "4. Keep this tab open as the host"
echo
echo "Step 2: Start Peer (localhost:8081)"  
echo "1. Open new browser tab to: http://localhost:8081"
echo "2. Click 'Join Game'"
echo "3. Enter the game code from Step 1"
echo "4. Watch console logs for connection status"
echo
echo "Expected Success Flow:"
echo "- Host: 'Game advertisement sent successfully'"
echo "- Host: Shows lobby with game code"
echo "- Peer: 'Resolved game code XXX to peer ID: peer_xxx'"
echo "- Peer: 'Connected to peer successfully'"
echo "- Both: 'WebRTC connection established'"
echo
echo "Common Issues:"
echo "- Game not found: Host not running or game code expired"
echo "- Connection timeout: WebRTC connection failed (firewall/NAT)"
echo "- STUN/TURN server issues: ICE candidates not exchanged properly"
echo