# Start app with HTTPS using ngrok
# This creates a secure tunnel with HTTPS support

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Starting App with HTTPS via ngrok" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "ngrok is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Install ngrok" -ForegroundColor Yellow
    Write-Host "1. Go to: https://ngrok.com/download" -ForegroundColor White
    Write-Host "2. Download and extract ngrok.exe" -ForegroundColor White
    Write-Host "3. Move ngrok.exe to this folder or add to PATH" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Deploy to Netlify (Easier!)" -ForegroundColor Yellow
    Write-Host "1. Go to: https://app.netlify.com/drop" -ForegroundColor White
    Write-Host "2. Drag the 'dist' folder" -ForegroundColor White
    Write-Host "3. Open the URL on your phone" -ForegroundColor White
    Write-Host ""
    pause
    exit
}

Write-Host "Starting preview server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run preview" -WindowStyle Minimized

Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting ngrok tunnel..." -ForegroundColor Green
Write-Host "This will create an HTTPS URL you can use on your phone" -ForegroundColor Cyan
Write-Host ""

# Start ngrok - it will create an HTTPS tunnel to localhost:4173
ngrok http 4173

Write-Host ""
Write-Host "Stopping preview server..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
