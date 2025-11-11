# Quick Deploy to Netlify
# This will deploy your app with HTTPS support

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deploy to Netlify with HTTPS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "Building app..." -ForegroundColor Yellow
    npm run build
    Write-Host ""
}

Write-Host "✅ App built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  TWO EASY OPTIONS:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPTION 1: Drag & Drop (EASIEST - No account needed)" -ForegroundColor Yellow
Write-Host "  1. Go to: https://app.netlify.com/drop" -ForegroundColor White
Write-Host "  2. Drag the 'dist' folder from:" -ForegroundColor White
Write-Host "     $PWD\dist" -ForegroundColor Cyan
Write-Host "  3. Get your HTTPS URL instantly!" -ForegroundColor White
Write-Host ""

Write-Host "OPTION 2: Using Netlify CLI" -ForegroundColor Yellow
Write-Host ""

# Check if netlify CLI is installed
$netlifyCLI = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyCLI) {
    Write-Host "  Netlify CLI is not installed." -ForegroundColor Red
    Write-Host "  Install it with:" -ForegroundColor White
    Write-Host "    npm install -g netlify-cli" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Then run:" -ForegroundColor White
    Write-Host "    netlify deploy --prod --dir=dist" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "  Netlify CLI detected! Running deployment..." -ForegroundColor Green
    Write-Host ""
    
    # Deploy to Netlify
    netlify deploy --prod --dir=dist
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "After deploying:" -ForegroundColor Yellow
Write-Host "  1. Copy your HTTPS URL" -ForegroundColor White
Write-Host "  2. Open it on your Android phone" -ForegroundColor White
Write-Host "  3. Tap the notification button" -ForegroundColor White
Write-Host "  4. Notifications will work! 🎉" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Open the dist folder in explorer
Write-Host "Opening dist folder for you..." -ForegroundColor Yellow
Start-Process explorer.exe -ArgumentList "$PWD\dist"

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
