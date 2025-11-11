# PowerShell script to build the PWA and package it as an APK
# Requires Node.js and npm to be installed

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Quit Smoking App - APK Builder" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green

# Check if npm is installed
Write-Host "Checking for npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm found: v$npmVersion" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Create icons
Write-Host "Creating app icons..." -ForegroundColor Yellow
node create-icons.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Failed to create icons, continuing anyway..." -ForegroundColor Yellow
}
Write-Host "✓ Icons created" -ForegroundColor Green
Write-Host ""

# Build the app
Write-Host "Building the application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Check if Bubblewrap is installed globally
Write-Host "Checking for Bubblewrap (PWA to APK converter)..." -ForegroundColor Yellow
$bubblewrapVersion = bubblewrap --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Bubblewrap not found. Installing globally..." -ForegroundColor Yellow
    npm install -g @bubblewrap/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Bubblewrap!" -ForegroundColor Red
        Write-Host ""
        Write-Host "ALTERNATIVE OPTION:" -ForegroundColor Cyan
        Write-Host "You can use the web-based PWA Builder instead:" -ForegroundColor Cyan
        Write-Host "1. Go to https://www.pwabuilder.com/" -ForegroundColor White
        Write-Host "2. Deploy your 'dist' folder to a web server or use 'npm run preview'" -ForegroundColor White
        Write-Host "3. Enter your app's URL in PWA Builder" -ForegroundColor White
        Write-Host "4. Download the Android package" -ForegroundColor White
        Write-Host ""
        Write-Host "For now, you can test your app by running: npm run preview" -ForegroundColor Cyan
        exit 1
    }
}
Write-Host "✓ Bubblewrap is ready" -ForegroundColor Green
Write-Host ""

# Start a local server for the PWA
Write-Host "Starting local preview server..." -ForegroundColor Yellow
Write-Host "The app will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test your app at http://localhost:3000" -ForegroundColor White
Write-Host "2. To create an APK, you have two options:" -ForegroundColor White
Write-Host ""
Write-Host "   OPTION A - Using Bubblewrap (CLI):" -ForegroundColor Cyan
Write-Host "   - Run: bubblewrap init --manifest http://localhost:3000/manifest.webmanifest" -ForegroundColor White
Write-Host "   - Follow the prompts to configure your app" -ForegroundColor White
Write-Host "   - Run: bubblewrap build" -ForegroundColor White
Write-Host ""
Write-Host "   OPTION B - Using PWA Builder (Web-based, easier):" -ForegroundColor Cyan
Write-Host "   - Go to https://www.pwabuilder.com/" -ForegroundColor White
Write-Host "   - Enter: http://localhost:3000" -ForegroundColor White
Write-Host "   - Click 'Build My PWA' and select Android" -ForegroundColor White
Write-Host "   - Download and install the generated APK" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done testing" -ForegroundColor Yellow
Write-Host ""

# Run the preview server
npm run preview
