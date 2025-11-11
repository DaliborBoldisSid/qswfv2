# Quick Start Instructions 🚀

## Step 1: Build the App

Open PowerShell in this directory and run:

```powershell
.\build-apk.ps1
```

This will:
- ✓ Install all dependencies
- ✓ Create app icons
- ✓ Build the production version
- ✓ Start a preview server at http://localhost:3000

## Step 2: Test the App

1. Open http://localhost:3000 in your browser
2. Go through the onboarding process
3. Grant notification permissions when asked
4. Test the logging functionality

## Step 3: Install on Android

### Option A: Direct PWA Install (Easiest)

1. Open http://localhost:3000 on your Android phone in Chrome
2. Tap the menu (⋮) → "Add to Home Screen"
3. The app will install like a native app
4. Notifications will work just like a native app!

**Note**: For this to work from your phone, your computer and phone must be on the same network, and you'll need to use your computer's local IP address (e.g., http://192.168.1.100:3000)

### Option B: Create APK with PWA Builder (Recommended)

1. Keep the preview server running (http://localhost:3000)
2. Go to https://www.pwabuilder.com/ on your computer
3. Enter `http://localhost:3000`
4. Click "Build My PWA"
5. Select "Android"
6. Download the generated package
7. Follow the instructions to sign and install the APK

### Option C: Deploy Online First (Most Reliable)

1. Build the app: `npm run build`
2. Deploy the `dist` folder to:
   - **Netlify**: Drag and drop the `dist` folder at https://app.netlify.com/drop
   - **Vercel**: `npx vercel --prod` (after installing Vercel CLI)
   - **GitHub Pages**: Push to GitHub and enable Pages
3. Go to https://www.pwabuilder.com/
4. Enter your deployed URL
5. Download the Android package
6. Install on your phone

## Testing Notifications on Android

For notifications to work properly on Android Chrome:

1. **Install as PWA**: Use "Add to Home Screen" in Chrome
2. **Grant Permissions**: Allow notifications when prompted
3. **Test**: Log a cigarette/vape and wait for the next notification

## Common Issues

### "Cannot access http://localhost:3000 from phone"

**Solution**: Use your computer's IP address instead of localhost

1. On Windows, run: `ipconfig` (look for IPv4 Address)
2. Use that IP, e.g., `http://192.168.1.100:3000`

### "Notifications not working"

**Solution**:
1. Make sure you installed as PWA (Add to Home Screen)
2. Check Chrome settings → Notifications → ensure the app is allowed
3. Test by logging something and checking if you get the success notification

### "Build script fails"

**Solution**:
1. Make sure Node.js is installed: https://nodejs.org/
2. Delete `node_modules` folder
3. Run `.\build-apk.ps1` again

## Alternative: Just Use as Web App

You don't NEED an APK! The app works great as a PWA:

1. Run: `npm run build` then `npm run preview`
2. Open on your phone's Chrome browser
3. Add to Home Screen
4. Use like a native app!

PWA advantages:
- ✓ No APK signing needed
- ✓ Easier to update (just refresh)
- ✓ Same functionality as APK
- ✓ Notifications work the same

## Need Help?

Check the README.md file for detailed documentation.

---

**Pro Tip**: For daily use, deploying to Netlify (free) and installing as PWA is the easiest and most reliable option!
