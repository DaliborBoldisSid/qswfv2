# Building APK on Windows - Quick Guide

## ✅ Recommended Method: PowerShell Script

Open PowerShell in this project folder and run:

```powershell
.\build-apk-windows.ps1
```

### What to Expect

The script will automatically:
1. Install npm dependencies
2. Build your app
3. Install Bubblewrap CLI
4. Start a preview server
5. Build the APK

You'll only need to answer **2 questions**:
- **Install Android SDK?** → Type `Y` and press Enter
- **Agree to SDK terms?** → Type `y` and press Enter

Then wait 3-5 minutes for the build to complete.

### Where's My APK?

After the build completes, find your APK in:
```
build\app-release-unsigned.apk
```

## Alternative: WSL (Windows Subsystem for Linux)

If you have WSL installed, open WSL terminal and run:

```bash
bash build-apk-automated.sh
```

## Troubleshooting

### Error: "script is disabled on this system"

PowerShell execution policy is too strict. Run this command first:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then run the build script again.

### Network Errors

If you see connection errors during Android SDK download:
1. Check your internet connection
2. Try using a VPN
3. Disable antivirus temporarily
4. Try the web-based method (see below)

### Web-Based Alternative (No CLI needed)

1. Run: `npm run serve`
2. Go to: https://www.pwabuilder.com/
3. Enter: `http://localhost:3000`
4. Click "Build My PWA" → Select Android
5. Download the generated APK

## Installing on Android

1. Transfer the APK to your phone (via USB, email, or cloud)
2. Open the APK file on your phone
3. If prompted, enable "Install from Unknown Sources"
4. Install the app

## Need More Help?

See the complete guide: `BUILD_APK_GUIDE.md`
