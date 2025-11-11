# Quit Smoking & Vaping App 🚭

A Progressive Web App (PWA) that helps users gradually quit smoking and vaping through personalized reduction plans, smart notifications, and achievement tracking.

## Features ✨

- **Personalized Quitting Plans**: Choose from slow, medium, or quick reduction paces with weekly or daily reduction options
- **Smart Notifications**: Get notified when you're allowed to smoke/vape
- **Dual Tracking**: Track both cigarettes and vapes separately
- **Extraordinary Session Logging**: Log sessions even when timer is active for tracking slip-ups
- **Craving Help**: Access motivational quotes and reflection questions when experiencing cravings
- **Achievement System**: Unlock meaningful achievements based on real progress milestones
- **Comprehensive Stats**: View detailed charts, money saved (based on your actual prices), and progress metrics
- **Offline Support**: Works even without internet connection
- **Mobile-First Design**: Beautiful, modern UI optimized for mobile devices with intuitive organization
- **Persistent Data**: All data saved locally, survives page reloads

## Getting Started 🚀

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- (Optional) Android Studio for APK signing

### Quick Start

1. **Build the app and create APK:**
   ```powershell
   .\build-apk.ps1
   ```

   This script will:
   - Install all dependencies
   - Create app icons
   - Build the production version
   - Start a preview server at http://localhost:3000

2. **For development:**
   ```bash
   npm install
   npm run dev
   ```

## Creating an APK 📱

### Method 1: PWA Builder (Recommended - Easy)

1. Run the build script: `.\build-apk.ps1`
2. Once the server starts, go to https://www.pwabuilder.com/
3. Enter `http://localhost:3000` (or your deployed URL)
4. Click "Build My PWA"
5. Select "Android" and download the package
6. Follow PWA Builder's instructions to sign and install

### Method 2: Bubblewrap CLI (Advanced)

1. Run the build script: `.\build-apk.ps1`
2. Initialize Bubblewrap:
   ```bash
   bubblewrap init --manifest http://localhost:3000/manifest.webmanifest
   ```
3. Configure your app details (package name, etc.)
4. Build the APK:
   ```bash
   bubblewrap build
   ```
5. The APK will be in the `app-release-signed.apk` file

### Method 3: Deploy and Use PWA Builder Online

1. Build the app: `npm run build`
2. Deploy the `dist` folder to a hosting service (Netlify, Vercel, GitHub Pages, etc.)
3. Go to https://www.pwabuilder.com/
4. Enter your deployed URL
5. Download the Android package

## Using the App 📱

### First Time Setup

1. Open the app
2. Answer the onboarding questions:
   - How many cigarettes per week?
   - How many vapes per week?
   - Choose your reduction pace (slow/medium/quick)
3. Grant notification permissions when prompted
4. Your personalized plan is ready!

### Daily Use

1. **Dashboard**: 
   - See when you can next smoke/vape with countdown timers
   - View today's activity integrated into each session card
   - Log sessions when allowed, or use the ⚠️ button for extraordinary sessions
   - Access notification settings at the bottom

2. **Stats**: 
   - View your reduction percentage and money saved
   - Check detailed charts for daily and weekly progress
   - Track your active days and streak

3. **Achievements**: 
   - Unlock meaningful achievements based on real progress
   - See which achievements you've completed and when

4. **Craving Help**: 
   - Get instant access to motivational quotes
   - Read quick tips to beat cravings
   - Answer reflection questions about your journey
   - Your responses are saved for future reference

### Notifications

The app will notify you when:
- You're allowed to have a cigarette/vape
- You unlock a new achievement
- You log a smoke/vape session

## How It Works 🔧

### Reduction Algorithm

The app gradually reduces your consumption based on your chosen pace and frequency:

**Reduction Paces:**
- **Slow**: 5% reduction
- **Medium**: 10% reduction
- **Quick**: 15% reduction

**Reduction Frequencies:**
- **Weekly**: Reduction applied once per week
- **Daily**: Reduction applied each day (7 times per week for faster results)

The algorithm calculates wait times between smokes to distribute them evenly throughout your waking hours.

### Achievement System

Earn achievements by:
- Completing days and weeks (with realistic time requirements)
- Reducing consumption percentages (must meet minimum week requirements)
- Saving money (calculated using your actual cigarette/vape prices)
- Maintaining activity streaks
- Logging your first session

Achievements are designed to unlock progressively as you make real progress, not all at once.

### Data Persistence

All data is stored locally in your browser using LocalStorage:
- User preferences
- Quitting plan
- Log history
- Achievements
- Progress stats

## Technology Stack 💻

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin with Workbox
- **Date Handling**: date-fns

## Browser Support 🌐

- Chrome/Edge: Full support (recommended for Android)
- Firefox: Full support
- Safari: Full support (iOS PWAs have limited notification support)

## Project Structure 📁

```
qswf/
├── public/
│   ├── sw.js              # Service worker for notifications
│   ├── icon-192.png       # App icon (192x192)
│   └── icon-512.png       # App icon (512x512)
├── src/
│   ├── components/
│   │   ├── Onboarding.jsx       # Initial setup flow with price and frequency options
│   │   ├── Dashboard.jsx        # Main app screen with improved layout
│   │   ├── Stats.jsx            # Statistics and charts with accurate calculations
│   │   ├── Achievements.jsx     # Achievement tracking with meaningful milestones
│   │   ├── CravingHelp.jsx      # Craving support with quotes and questions
│   │   └── NotificationDebug.jsx # Notification debugging tools
│   ├── utils/
│   │   ├── storage.js           # LocalStorage utilities with craving responses
│   │   ├── quittingLogic.js     # Reduction algorithm with daily/weekly support
│   │   ├── notifications.js     # Notification system
│   │   ├── achievements.js      # Achievement logic with price-based calculations
│   │   ├── quotes.js            # Daily quote selector
│   │   └── quotes.json          # 100+ motivational quotes and reflection questions
│   ├── App.jsx            # Main app component with 4-tab navigation
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── build-apk.ps1          # Build and APK creation script
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## Troubleshooting 🔧

### Notifications not working on Android Chrome

1. Ensure you granted notification permissions
2. Check that the app is installed as PWA (Add to Home Screen)
3. Check Chrome settings → Site Settings → Notifications

### App not updating after changes

1. Unregister the service worker in DevTools
2. Clear cache and reload
3. Reinstall the PWA

### Build fails

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Make sure Node.js version is 16+

## Privacy 🔒

- All data is stored locally on your device
- No data is sent to any server
- No analytics or tracking
- No account required

## Contributing 🤝

Feel free to fork this project and customize it for your needs!

## License 📄

MIT License - feel free to use this app for personal or commercial purposes.

## Support 💬

If you find this app helpful in your quitting journey, please share it with others who might benefit!

---

**Remember**: Quitting is a journey, not a destination. Be patient with yourself and celebrate every small victory! 🎉
