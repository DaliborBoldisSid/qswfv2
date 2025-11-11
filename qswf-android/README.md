# QSWF Android App

This is the Android WebView wrapper for the QSWF Progressive Web App.

## Quick Start

### 1. Sync Gradle
- Open this project in Android Studio
- Click **"Sync Now"** when prompted
- Wait for Gradle to download dependencies

### 2. Build and Run
- Connect your Android device (USB debugging enabled) OR start an emulator
- Click the green **Run** button (▶) or press **Shift + F10**
- The app will build, install, and launch

## Project Structure

```
app/src/main/
├── java/com/qswf/app/
│   ├── MainActivity.kt          - Main activity with WebView
│   ├── WebAppInterface.kt       - JavaScript-to-Android bridge
│   └── NotificationHelper.kt    - Native notification handler
├── res/
│   ├── layout/
│   │   └── activity_main.xml    - WebView layout
│   └── values/
│       ├── strings.xml
│       ├── colors.xml
│       └── themes.xml
└── AndroidManifest.xml          - App config with permissions & deep links
```

## Key Features

✅ **WebView Integration** - Loads QSWF PWA from https://daliborboldissid.github.io/qswf/
✅ **JavaScript Bridge** - Web app can call native Android functions via `window.Android`
✅ **Native Notifications** - Uses Android's notification system instead of web notifications
✅ **Deep Links** - Supports `qswf://` custom URL scheme for navigation
✅ **Permission Handling** - Requests notification permission on Android 13+
✅ **Back Button Support** - Navigate web app history with back button

## Testing

### Test Notifications
1. Run the app
2. Complete onboarding
3. Log a cigarette/vape session
4. Check notification drawer for native notifications

### Test Deep Links
Open a terminal and run:
```bash
# Navigate to Stats
adb shell am start -a android.intent.action.VIEW -d "qswf://stats"

# Navigate to Achievements
adb shell am start -a android.intent.action.VIEW -d "qswf://achievements"

# Test notification (shows after 5 seconds)
adb shell am start -a android.intent.action.VIEW -d "qswf://notification?title=Test&body=Message&delay=5000"
```

### View Logs
- Open **Logcat** (View → Tool Windows → Logcat)
- Filter by: `MainActivity`, `WebAppInterface`, or `NotificationHelper`
- Look for messages like:
  ```
  D/WebApp: [Android] Scheduled notification: Ready for your cigarette in 60000ms
  D/NotificationHelper: Notification scheduled: id=123456, delay=60000ms
  ```

## Building Release APK

### Debug APK (for testing)
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK location: `app/build/outputs/apk/debug/app-debug.apk`

### Signed Release APK
1. **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Create new keystore (save credentials!)
4. Select **release** variant
5. APK location: `app/release/app-release.apk`

## Configuration

### Change Web App URL
Edit `MainActivity.kt` line 26:
```kotlin
private const val WEB_APP_URL = "https://your-domain.com/your-app/"
```

### Change App Name
Edit `app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Change Package Name
1. Right-click package `com.qswf.app`
2. **Refactor → Rename**
3. Update `build.gradle.kts`: `applicationId`
4. Update `AndroidManifest.xml`: `package` attribute

## Troubleshooting

**Blank screen?**
- Check internet connection
- Check Logcat for errors
- Verify WEB_APP_URL is correct

**Notifications not showing?**
- Go to Settings → Apps → QSWF → Notifications
- Enable notifications
- Check permission was granted (Logcat)

**Build errors?**
- **File → Invalidate Caches → Invalidate and Restart**
- Check Gradle sync completed successfully
- Ensure Android SDK is installed

## Web App Communication

The web app automatically detects Android WebView using:
```javascript
if (window.Android && window.Android.isAndroid()) {
  // Running in Android app
  window.Android.scheduleNotification(title, body, delayMs, id);
}
```

All notification calls from the web app are automatically routed to native Android notifications when running in the WebView.

## Next Steps

- **Add splash screen** for better UX while loading
- **Implement offline mode** with cached assets
- **Add app shortcuts** for quick actions
- **Create home screen widget** with stats
- **Publish to Google Play Store**

---

**Web App Repository**: https://github.com/DaliborBoldisSid/qswf
**App Version**: 1.0.0
**Min Android Version**: 7.0 (API 24)
**Target Android Version**: 14 (API 34)
