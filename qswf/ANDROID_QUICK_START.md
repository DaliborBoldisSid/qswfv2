# Android WebView App - Quick Start Guide

This guide will get you up and running with the Android WebView app for QSWF in under 30 minutes.

## Prerequisites

- **Android Studio** (latest version) - [Download here](https://developer.android.com/studio)
- **JDK 11 or higher** (usually bundled with Android Studio)
- **Android device or emulator** running Android 7.0 (API 24) or higher

---

## Quick Setup (5 Steps)

### 1. Create New Android Project (5 minutes)

1. Open Android Studio → **New Project**
2. Select **"Empty Views Activity"**
3. Configure:
   - **Name**: QSWF
   - **Package**: com.qswf.app
   - **Language**: Kotlin
   - **Minimum SDK**: API 24
4. Click **Finish** and wait for Gradle sync

### 2. Copy Project Files (2 minutes)

Copy all files from the `android-code` folder in this repository to your Android Studio project:

```
android-code/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml          → Replace yours
│   │   ├── java/com/qswf/app/
│   │   │   ├── MainActivity.kt          → Replace yours
│   │   │   ├── WebAppInterface.kt       → New file
│   │   │   └── NotificationHelper.kt    → New file
│   │   └── res/
│   │       ├── layout/
│   │       │   └── activity_main.xml    → Replace yours
│   │       └── values/
│   │           ├── strings.xml          → Replace yours
│   │           ├── colors.xml           → Replace yours
│   │           └── themes.xml           → Replace yours
│   ├── build.gradle.kts                 → Replace yours
│   └── proguard-rules.pro               → Replace yours
├── build.gradle.kts                     → Replace yours (top-level)
└── settings.gradle.kts                  → Replace yours
```

**Important**: Make sure to **replace** the existing files, not append to them.

### 3. Sync Gradle (1 minute)

1. Click **Sync Now** in the banner at the top
2. Wait for Gradle to download dependencies (~1-2 minutes)
3. Ensure no errors in the **Build** tab

### 4. Add App Icon (2 minutes)

1. Right-click **res → New → Image Asset**
2. Select **Launcher Icons**
3. Browse to `public/icon-512.png` from the QSWF project
4. Click **Next → Finish**

### 5. Build and Run (2 minutes)

1. Connect your Android device (USB debugging enabled) OR start an emulator
2. Click the green **Run** button (▶) in the toolbar
3. Wait for the app to build and install
4. The app should open and load your QSWF PWA

---

## File Structure Overview

Here's what each file does:

### Android Files (Kotlin)

- **MainActivity.kt** - Main activity that hosts the WebView and handles deep links
- **WebAppInterface.kt** - JavaScript bridge for web-to-native communication
- **NotificationHelper.kt** - Manages native Android notifications and scheduling

### Configuration Files

- **AndroidManifest.xml** - App permissions and deep link configuration
- **build.gradle.kts** - Dependencies and build configuration
- **activity_main.xml** - Layout with WebView
- **strings.xml, colors.xml, themes.xml** - App resources

### Web App Files (JavaScript)

- **src/utils/androidBridge.js** - Detects Android WebView and calls native methods
- **src/utils/notificationBridge.js** - Unified notification API for web and Android
- **src/utils/notifications.js** - Updated to use the notification bridge
- **src/App.jsx** - Handles deep link navigation from Android

---

## Testing the Integration

### Test Notifications

1. Open the app on your device
2. Complete onboarding
3. Log a cigarette or vape session
4. Check notification drawer - you should see a native Android notification

### Test Deep Links

Open a terminal and run these ADB commands:

```bash
# Navigate to Stats page
adb shell am start -a android.intent.action.VIEW -d "qswf://stats"

# Navigate to Achievements page
adb shell am start -a android.intent.action.VIEW -d "qswf://achievements"

# Schedule a test notification (shows after 5 seconds)
adb shell am start -a android.intent.action.VIEW -d "qswf://notification?title=Test&body=Hello&delay=5000"
```

### Check Logs

View Android logs in **Logcat** (bottom panel in Android Studio):

```
Filter by: "qswf" or "WebApp" or "NotificationHelper"
```

You should see logs like:
```
D/WebApp: [Android] Scheduled notification: Ready for your cigarette in 60000ms
D/NotificationHelper: Notification scheduled: id=123456, delay=60000ms
```

---

## Common Issues & Solutions

### Issue: App shows blank screen

**Cause**: Internet permission not granted or cleartext traffic blocked

**Solution**:
1. Check AndroidManifest.xml has `<uses-permission android:name="android.permission.INTERNET" />`
2. Check `android:usesCleartextTraffic="true"` in `<application>` tag

### Issue: Notifications not showing

**Cause**: Permission not granted on Android 13+

**Solution**:
1. Go to: **Settings → Apps → QSWF → Notifications**
2. Enable "All QSWF notifications"
3. Check Logcat for permission errors

### Issue: Build errors after copying files

**Cause**: Package name mismatch

**Solution**:
1. Open each `.kt` file
2. Ensure the package line matches your package: `package com.qswf.app`
3. If you used a different package, update all `.kt` files

### Issue: Deep links don't work

**Cause**: Intent filters not configured or app not set as default handler

**Solution**:
1. Test with ADB command first: `adb shell am start -a android.intent.action.VIEW -d "qswf://stats"`
2. Check AndroidManifest.xml has the `<intent-filter>` sections
3. Reinstall the app

---

## How It Works

### Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web App (React)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. User logs a session                                       │ │
│  │ 2. App.jsx calls scheduleNotification('cigarette', 60000)    │ │
│  │ 3. notifications.js detects Android WebView                  │ │
│  │ 4. notificationBridge.js calls window.Android.schedule...    │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────────┘
                              │ JavaScript Bridge
┌─────────────────────────────▼─────────────────────────────────────┐
│                      Android App (Kotlin)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 5. WebAppInterface receives call                             │  │
│  │ 6. Calls NotificationHelper.scheduleNotification()           │  │
│  │ 7. AlarmManager schedules notification                       │  │
│  │ 8. At trigger time, NotificationReceiver shows notification  │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### Key Features

1. **Automatic Detection**: Web app detects Android WebView using `window.Android` object
2. **Fallback Support**: If not in Android, uses standard Web Notifications API
3. **Unified API**: Same code works on web and Android - no platform-specific conditionals needed
4. **Deep Links**: Android app can navigate web app using custom URL schemes
5. **Native Notifications**: Android shows system notifications with proper priority and vibration

---

## Customization

### Change App Name

1. Edit `app/src/main/res/values/strings.xml`:
   ```xml
   <string name="app_name">Your App Name</string>
   ```

### Change App Colors

1. Edit `app/src/main/res/values/colors.xml`
2. Update `colorPrimary`, `colorSecondary`, etc.

### Change Package Name

1. **Refactor**: Right-click package → Refactor → Rename
2. Update `build.gradle.kts`: `applicationId = "your.new.package"`
3. Update `AndroidManifest.xml` package attribute

### Change Web App URL

1. Edit `MainActivity.kt` line 18:
   ```kotlin
   private const val WEB_APP_URL = "https://your-domain.com/your-app/"
   ```

---

## Building Release APK

### Generate Signed APK

1. **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Create keystore (save credentials securely!)
4. Select **release** build variant
5. Find APK in: `app/release/app-release.apk`

### For Google Play Store

1. Use **Android App Bundle (AAB)** instead of APK
2. Follow the same signing process
3. Upload `app/release/app-release.aab` to Play Console

---

## Next Steps

- **Add Splash Screen**: Show logo while WebView loads
- **Offline Support**: Cache web app assets in Android
- **Background Sync**: Implement WorkManager for background tasks
- **ProGuard**: Configure code obfuscation for release
- **Play Store**: Create developer account and publish

---

## Support

- **Detailed Guide**: See `ANDROID_SETUP_GUIDE.md` for step-by-step instructions with screenshots
- **Android Docs**: [WebView Guide](https://developer.android.com/develop/ui/views/layout/webapps/webview)
- **Notification Docs**: [Notification Guide](https://developer.android.com/develop/ui/views/notifications)

---

## Summary Checklist

- [ ] Android Studio installed
- [ ] New project created with correct settings
- [ ] All files from `android-code/` copied to project
- [ ] Gradle sync completed successfully
- [ ] App icon added
- [ ] App builds without errors
- [ ] App runs on device/emulator
- [ ] Web app loads in WebView
- [ ] Notifications work (test by logging a session)
- [ ] Deep links work (test with ADB)

**Estimated Total Time**: 15-30 minutes for first-time setup

Good luck! 🚀
