# Quick setup script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Quit Smoking App - Quick Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed" -ForegroundColor Green

# Create icons
Write-Host ""
Write-Host "Creating icons..." -ForegroundColor Yellow
node create-icons.js

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm run dev - for development" -ForegroundColor White
Write-Host "  2. npm run build - to build" -ForegroundColor White
Write-Host "  3. npm run preview - to test build" -ForegroundColor White
Write-Host ""
Write-Host "See INSTRUCTIONS.md for more details" -ForegroundColor Yellow
