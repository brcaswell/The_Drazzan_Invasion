# P2P Connection Test Script for Windows PowerShell
# This script helps test the P2P connection between host and peer

Write-Host "=== P2P Connection Test Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Start Host (localhost:8080)" -ForegroundColor Yellow
Write-Host "1. Open browser to: http://localhost:8080"
Write-Host "2. Click 'Cooperative Mode' or 'Versus Mode'"  
Write-Host "3. Note the 6-character game code displayed"
Write-Host "4. Keep this tab open as the host"
Write-Host ""
Write-Host "Step 2: Start Peer (localhost:8081)" -ForegroundColor Yellow
Write-Host "1. Open new browser tab to: http://localhost:8081"
Write-Host "2. Click 'Join Game'"
Write-Host "3. Enter the game code from Step 1"
Write-Host "4. Watch console logs for connection status"
Write-Host ""
Write-Host "Expected Success Flow:" -ForegroundColor Green
Write-Host "- Host: 'Game advertisement sent successfully'"
Write-Host "- Host: Shows lobby with game code"
Write-Host "- Peer: 'Resolved game code XXX to peer ID: peer_xxx'"
Write-Host "- Peer: 'Connected to peer successfully'"
Write-Host "- Both: 'WebRTC connection established'"
Write-Host ""
Write-Host "Common Issues:" -ForegroundColor Red
Write-Host "- Game not found: Host not running or game code expired"
Write-Host "- Connection timeout: WebRTC connection failed (firewall/NAT)"
Write-Host "- STUN/TURN server issues: ICE candidates not exchanged properly"
Write-Host ""

# Offer to open browser tabs automatically
$response = Read-Host "Open browser tabs automatically? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "Opening host browser (localhost:8080)..." -ForegroundColor Green
    Start-Process "http://localhost:8080"
    
    Start-Sleep -Seconds 2
    
    Write-Host "Opening peer browser (localhost:8081)..." -ForegroundColor Green  
    Start-Process "http://localhost:8081"
    
    Write-Host ""
    Write-Host "Browser tabs opened! Follow the steps above to test the connection." -ForegroundColor Cyan
}