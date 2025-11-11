# Android WebView Setup Guide for QSWF

This guide will help you set up an Android app with WebView that communicates with your PWA through a JavaScript bridge for native notifications.

## Part 1: Android Studio Project Setup

### Step 1: Create New Android Project

1. **Open Android Studio**
2. Click **"New Project"** or **File → New → New Project**
3. Select **"Empty Views Activity"** (or "Empty Activity" in older versions)
4. Click **Next**

### Step 2: Configure Project

Fill in the project configuration:
- **Name**: `QSWF` (or your preferred name)
- **Package name**: `com.qswf.app` (or your preferred package)
- **Save location**: Choose a location (e.g., `C:\Users\boldi\Desktop\qswfv2\qswf-android`)
- **Language**: `Kotlin`
- **Minimum SDK**: API 24 (Android 7.0) - covers 95%+ of devices
- Click **Finish**

### Step 3: Wait for Gradle Sync

Android Studio will create the project and sync Gradle dependencies. Wait for this to complete (bottom status bar will show "Gradle sync finished").

---

## Part 2: Configure Android Manifest

### Step 4: Open AndroidManifest.xml

1. In the **Project** view (left sidebar), navigate to:
   ```
   app → src → main → AndroidManifest.xml
   ```
2. Double-click to open

### Step 5: Add Permissions and Configure Activity

Replace the entire `<manifest>` content with the configuration I'll provide in the code files.

---

## Part 3: Update Layout File

### Step 6: Open activity_main.xml

   1. Navigate to: `app → res → layout → activity_main.xml`
   2. Click the **Code** tab at the top-right (not Design or Split)
3. Replace the entire content with the WebView layout I'll provide

---

## Part 4: Create Java/Kotlin Classes

### Step 7: Create WebAppInterface Class

1. Right-click on the package folder: `app → java → com.qswf.app` (or your package name)
2. Select **New → Kotlin Class/File**
3. Choose **Class**
4. Name it: `WebAppInterface`
5. Click **OK**
6. Replace the content with the code I'll provide

### Step 8: Update MainActivity

1. Open: `app → java → com.qswf.app → MainActivity.kt`
2. Replace the entire content with the code I'll provide

### Step 9: Create NotificationHelper Class

1. Right-click on your package: `app → java → com.qswf.app`
2. Select **New → Kotlin Class/File**
3. Choose **Class**
4. Name it: `NotificationHelper`
5. Click **OK**
6. Replace the content with the code I'll provide

---

## Part 5: Configure Gradle Build

### Step 10: Update build.gradle (Module: app)

1. Navigate to: `Gradle Scripts → build.gradle.kts (Module :app)`
2. Find the `dependencies` section
3. Add the AndroidX Work Manager dependency I'll provide

### Step 11: Sync Gradle

1. Click **Sync Now** banner at the top, or
2. Click the elephant icon with a down arrow in the toolbar: **Sync Project with Gradle Files**

---

## Part 6: Add App Icons

### Step 12: Add Launcher Icons

1. Right-click on: `app → res → mipmap`
2. Select **New → Image Asset**
3. Configure:
   - **Icon Type**: Launcher Icons (Adaptive and Legacy)
   - **Name**: `ic_launcher`
   - **Path**: Browse to your `public/icon-512.png`
   - Click **Next** → **Finish**

---

## Part 7: Build and Run

### Step 13: Connect Device or Start Emulator

**Option A: Physical Device**
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Allow USB debugging when prompted

**Option B: Emulator**
1. Click **Device Manager** (phone icon in right toolbar)
2. Click **Create Device**
3. Select a device (e.g., Pixel 5)
4. Select system image (e.g., API 34)
5. Click **Finish**
6. Click the play button next to your new device

### Step 14: Build and Run

1. Select your device from the dropdown in the toolbar
2. Click the **Run** button (green play icon) or press **Shift + F10**
3. Wait for the app to build and install

---

## Part 8: Test Deep Link Communication

### Step 15: Test Notifications

1. Once the app is running, open your QSWF app in the WebView
2. Complete onboarding if needed
3. Try logging a session - the app should detect it's running in Android and use native notifications
4. Check your Android notification drawer for notifications

### Step 16: Test Deep Links (via ADB)

Open a terminal/command prompt and test deep links:

```bash
# Test notification deep link
adb shell am start -a android.intent.action.VIEW -d "qswf://notification?title=Test&body=This%20is%20a%20test&delay=5000"

# Test stats deep link
adb shell am start -a android.intent.action.VIEW -d "qswf://stats"
```

---

## Part 9: Configure for Production

### Step 17: Generate Signed APK/AAB

1. **Build → Generate Signed Bundle / APK**
2. Select **APK** or **Android App Bundle** (AAB for Play Store)
3. Click **Next**
4. Create a new keystore:
   - Click **Create new...**
   - Choose location and password
   - Fill in certificate info
   - Click **OK**
5. Select build variant: **release**
6. Click **Finish**

### Step 18: Find Your APK/AAB

The signed file will be in:
```
app/release/app-release.apk
```
or
```
app/release/app-release.aab
```

---

## Troubleshooting

### WebView Not Loading

**Issue**: Blank screen or "ERR_CLEARTEXT_NOT_PERMITTED"
**Solution**: Add `android:usesCleartextTraffic="true"` to `<application>` in AndroidManifest.xml (already included in provided code)

### Notifications Not Showing

**Issue**: No notifications appear
**Solution**:
1. Check app has notification permission
2. Go to Android Settings → Apps → QSWF → Notifications → Enable
3. Check Logcat for errors: **View → Tool Windows → Logcat**

### Deep Links Not Working

**Issue**: Deep links don't open the app
**Solution**:
1. Verify intent filters in AndroidManifest.xml
2. Test with ADB command above
3. Check package name matches your app

### Build Errors

**Issue**: Gradle sync or build fails
**Solution**:
1. **File → Invalidate Caches → Invalidate and Restart**
2. Check you're using compatible Gradle/AGP versions
3. Check internet connection for dependency downloads

---

## File Structure Overview

After setup, your Android project structure will be:

```
qswf-android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/qswf/app/
│   │       │   ├── MainActivity.kt
│   │       │   ├── WebAppInterface.kt
│   │       │   └── NotificationHelper.kt
│   │       ├── res/
│   │       │   ├── layout/
│   │       │   │   └── activity_main.xml
│   │       │   ├── values/
│   │       │   │   ├── strings.xml
│   │       │   │   └── colors.xml
│   │       │   └── mipmap/
│   │       │       └── ic_launcher/
│   │       └── AndroidManifest.xml
│   └── build.gradle.kts
└── build.gradle.kts
```

---

## Next Steps

Once your Android app is working:

1. **Customize the app theme and colors** in `res/values/colors.xml`
2. **Add a splash screen** for better UX
3. **Implement background sync** for offline functionality
4. **Configure ProGuard rules** for release builds
5. **Test on multiple devices** and Android versions
6. **Submit to Google Play Store** (requires Google Play Developer account - $25 one-time fee)

---

## Communication Flow Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   Web App       │         │   Android App    │
│   (JavaScript)  │         │   (Kotlin)       │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │  Android.scheduleNotification()
         ├──────────────────────────>│
         │                           │
         │                   Create Notification
         │                   Set Alarm/WorkManager
         │                           │
         │                           ├─> Show at scheduled time
         │                           │
         │  <──────────────────────┤
         │     Notification shown  │
         │                           │
```

The web app detects it's running in Android WebView and uses the `Android` JavaScript interface instead of Web Notifications API.
