# Automated APK Build Script for Windows
# Builds the PWA and packages it as an APK using Bubblewrap

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " Quit Smoking App - Automated APK Builder" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "[1/6] Installing dependencies..." -ForegroundColor Yellow
npm install --ignore-scripts
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Build the app
Write-Host "[2/6] Building production app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ App built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Check Bubblewrap
Write-Host "[3/6] Checking for Bubblewrap..." -ForegroundColor Yellow
$bubblewrapVersion = bubblewrap --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Bubblewrap globally..." -ForegroundColor Yellow
    npm install -g @bubblewrap/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Bubblewrap!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Bubblewrap is ready" -ForegroundColor Green
Write-Host ""

# Step 4: Start preview server in background
Write-Host "[4/6] Starting preview server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock { npm run serve }
Start-Sleep -Seconds 3
Write-Host "✓ Server started (Job ID: $($serverJob.Id))" -ForegroundColor Green
Write-Host ""

# Step 5: Build APK using Bubblewrap
Write-Host "[5/6] Building APK with Bubblewrap..." -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: Bubblewrap will ask you some questions:" -ForegroundColor Cyan
Write-Host "  1. Install Android SDK? Type 'Y' and press Enter" -ForegroundColor White
Write-Host "  2. Agree to Android SDK terms? Type 'y' and press Enter" -ForegroundColor White
Write-Host "  3. Wait for the build to complete (3-5 minutes)" -ForegroundColor White
Write-Host ""

# Run bubblewrap build
bubblewrap build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ APK build failed or was cancelled" -ForegroundColor Red
    Write-Host ""
    Write-Host "If you see network errors, try:" -ForegroundColor Yellow
    Write-Host "  1. Check your internet connection" -ForegroundColor White
    Write-Host "  2. Use a VPN if behind a firewall" -ForegroundColor White
    Write-Host "  3. Try the web-based method: https://www.pwabuilder.com/" -ForegroundColor White
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
    exit 1
}
Write-Host "✓ APK built successfully!" -ForegroundColor Green
Write-Host ""

# Step 6: Move APK to build folder
Write-Host "[6/6] Moving APK to build folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "build" | Out-Null

$apkFiles = @(
    "app-release-unsigned.apk",
    "app-release-signed.apk"
)

$found = $false
foreach ($apkFile in $apkFiles) {
    if (Test-Path $apkFile) {
        Move-Item -Path $apkFile -Destination "build\" -Force
        Write-Host "✓ APK moved to build\$apkFile" -ForegroundColor Green
        $found = $true
        break
    }
}

if (-not $found) {
    $foundApk = Get-ChildItem -Path . -Filter "*.apk" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($foundApk) {
        Copy-Item -Path $foundApk.FullName -Destination "build\" -Force
        Write-Host "✓ APK copied to build\$($foundApk.Name)" -ForegroundColor Green
    } else {
        Write-Host "Warning: APK file not found in expected location" -ForegroundColor Yellow
        Write-Host "Please check the project directory for the generated APK" -ForegroundColor Yellow
    }
}
Write-Host ""

# Cleanup
Write-Host "Stopping preview server..." -ForegroundColor Yellow
Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
Write-Host "✓ Server stopped" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " APK Build Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check the build\ folder for your APK file" -ForegroundColor White
Write-Host "2. Transfer the APK to your Android device" -ForegroundColor White
Write-Host "3. Enable 'Install from Unknown Sources' in Android settings" -ForegroundColor White
Write-Host "4. Install and test the app" -ForegroundColor White
Write-Host ""
