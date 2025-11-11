# Quick setup and test script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Quit Smoking App - Quick Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Create icons
Write-Host ""
Write-Host "Creating icons..." -ForegroundColor Yellow
node create-icons.js

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✓ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "     (for development server)" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Run: npm run build" -ForegroundColor White
Write-Host "     (to build for production)" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Run: npm run preview" -ForegroundColor White
Write-Host "     (to test production build)" -ForegroundColor Gray
Write-Host ""
Write-Host "See INSTRUCTIONS.md for APK creation steps!" -ForegroundColor Yellow
Write-Host ""
