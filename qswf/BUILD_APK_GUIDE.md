# APK Build Guide for Quit Smoking App

This guide explains how to build an Android APK from your Progressive Web App.

## Quick Start (Automated)

### Linux/macOS

```bash
./build-apk-automated.sh
```

The APK will be generated in the `build/` folder.

### Windows (PowerShell)

```powershell
.\build-apk-windows.ps1
```

The APK will be generated in the `build\` folder.

**Note**: You'll need to answer two prompts:
1. Install Android SDK? Type `Y` and press Enter
2. Agree to SDK terms? Type `y` and press Enter

### Windows Subsystem for Linux (WSL)

```bash
bash build-apk-automated.sh
```

The APK will be generated in the `build/` folder.

## Manual Build Process

If the automated scripts don't work or you prefer manual control:

### Prerequisites

1. **Node.js and npm** installed
2. **Bubblewrap CLI**: `npm install -g @bubblewrap/cli`
3. **Expect** (Linux only, for automation): `sudo apt-get install expect`

### Step-by-Step Instructions

#### 1. Install Dependencies and Build

```bash
npm install --ignore-scripts
npm run build
```

#### 2. Start Preview Server

```bash
npm run serve
```

Keep this terminal open. The server runs at `http://localhost:3000`.

#### 3. Initialize Bubblewrap (New Tab/Terminal)

The project already includes a `twa-manifest.json` file, so you can skip this step if it exists.

If you need to recreate it:

```bash
bubblewrap init --manifest http://localhost:3000/manifest.webmanifest
```

Answer the prompts:
- **JDK Installation**: Choose "Yes" (recommended) or provide path to existing JDK 17+
- **Android SDK**: Choose "Yes" to install
- **Terms**: Accept Android SDK terms (`y`)

#### 4. Build the APK

```bash
bubblewrap build
```

This will:
- Generate the Android project structure
- Create a signing keystore (if needed)
- Build the APK

The build process takes 3-5 minutes depending on your system.

#### 5. Find Your APK

The APK will be in one of these locations:
- `./app-release-unsigned.apk`
- `./app-release-signed.apk`
- `./build/outputs/apk/release/app-release-unsigned.apk`

Move it to the `build/` folder:

```bash
mkdir -p build
mv app-release-*.apk build/
```

## Alternative Method: PWA Builder (Web-Based)

If command-line tools aren't working:

1. Start the preview server: `npm run serve`
2. Go to [PWABuilder.com](https://www.pwabuilder.com/)
3. Enter: `http://localhost:3000`
4. Click "Build My PWA"
5. Select "Android"
6. Configure options and download the APK

**Note**: For PWA Builder to work with localhost, you may need to:
- Deploy your app to a public URL (Netlify, Vercel, GitHub Pages)
- Use `ngrok` to create a public tunnel: `npx ngrok http 3000`

## Troubleshooting

### Network Issues

If you see `EAI_AGAIN` or connection errors:

- **Check internet connection**: Bubblewrap downloads JDK and Android SDK
- **Use VPN**: If behind corporate firewall
- **Pre-install dependencies**: Install JDK and Android SDK manually, then point Bubblewrap to them

### JDK Issues

**Error**: "JDK not found"

**Solution**: Install JDK 17 or higher:

```bash
# Linux
sudo apt-get install openjdk-17-jdk

# macOS
brew install openjdk@17

# Windows
Download from https://adoptium.net/
```

Then set `JAVA_HOME`:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Android SDK Issues

**Error**: "Android SDK not found"

**Solution**: Bubblewrap will offer to install it. If that fails, install manually:

1. Download [Android Command Line Tools](https://developer.android.com/studio#command-tools)
2. Extract to `~/android-sdk`
3. Run: `sdkmanager "platforms;android-33" "build-tools;33.0.0"`
4. Update `~/.bubblewrap/config.json`:

```json
{
  "jdkPath": "/path/to/jdk",
  "androidSdkPath": "/path/to/android-sdk"
}
```

### Build Fails

**Error**: "Build failed with exit code 1"

**Possible causes**:
- Missing dependencies
- Invalid manifest
- Network timeout

**Solutions**:
1. Clean and rebuild: `rm -rf node_modules && npm install --ignore-scripts && npm run build`
2. Check `dist/manifest.webmanifest` is valid JSON
3. Ensure preview server is running
4. Try building with `--verbose` flag: `bubblewrap build --verbose`

## Testing Your APK

### Install on Android Device

1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging

3. **Transfer APK**:
   - Via USB: `adb install build/app-release-unsigned.apk`
   - Via Email/Drive: Send APK to device and open

4. **Install**:
   - You may need to allow "Install from Unknown Sources"
   - Follow on-screen prompts

### Test Locally

Use Chrome DevTools to test PWA features:

1. Open `http://localhost:3000` in Chrome
2. F12 → Application tab
3. Check:
   - Service Worker registered
   - Manifest valid
   - Icons loading
   - Offline mode working

## Project Configuration

### twa-manifest.json

Key settings in the generated TWA manifest:

- **packageId**: `com.quitsmoking.app` (unique identifier)
- **name**: "Quit Smoking & Vaping"
- **iconUrl**: App icon (512x512)
- **themeColor**: `#10b981` (matches PWA)
- **enableNotifications**: `true` (for reminder feature)

To customize:
1. Edit `twa-manifest.json`
2. Run `bubblewrap update` to regenerate
3. Run `bubblewrap build` to rebuild

### Signing Key

Bubblewrap creates `android.keystore` for signing. **Keep this file secure!**

- Required for app updates
- Cannot be recovered if lost
- Store backup in secure location

To use your own key:

```json
"signingKey": {
  "path": "/path/to/your.keystore",
  "alias": "your-key-alias"
}
```

## Publishing to Google Play Store

1. **Create Play Console Account**: [play.google.com/console](https://play.google.com/console)

2. **Generate Signed APK**:
   ```bash
   bubblewrap build --skipPwaValidation
   ```

3. **Prepare Store Listing**:
   - App name and description
   - Screenshots (phone + tablet)
   - Feature graphic (1024x500)
   - Privacy policy URL

4. **Upload**:
   - Go to Play Console
   - Create new app
   - Upload APK in "Release" section
   - Fill in store listing
   - Submit for review

## Resources

- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap/tree/main/packages/cli)
- [TWA Best Practices](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Android Developer Guide](https://developer.android.com/guide)

## Support

If you encounter issues:

1. Check the [Bubblewrap GitHub Issues](https://github.com/GoogleChromeLabs/bubblewrap/issues)
2. Verify your manifest: `npx pwa-asset-generator validate`
3. Test PWA locally first: `npm run preview`
4. Review build logs for specific errors

## Files Created During Build

- `twa-manifest.json` - Bubblewrap configuration
- `android.keystore` - Signing key (DO NOT COMMIT)
- `assetlinks.json` - Digital Asset Links
- `app/` - Generated Android project
- `build/` - Output folder for APK

Add to `.gitignore`:
```
android.keystore
*.apk
app/
```

---

**Last Updated**: 2025-11-07
**Tested With**: Bubblewrap 1.20.0, Node.js 21, Android SDK 33
