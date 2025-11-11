# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Progressive Web App (PWA) that helps users gradually quit smoking and vaping through personalized reduction plans, adaptive algorithms, smart notifications, and achievement tracking. The app runs entirely client-side with all data persisted to localStorage.

## Development Commands

```bash
# Development
npm install                    # Install dependencies
npm run dev                    # Start dev server at http://localhost:3000

# Building
npm run build                  # Production build to dist/
npm run preview                # Preview production build at http://localhost:4173
npm run serve                  # Alias for preview on port 3000

# Testing
npm test                       # Run all test suites
npm run test:validate          # Validate user data
npm run test:scenarios         # Test real-world scenarios
npm run test:edge              # Test edge cases
npm run test:comprehensive     # Comprehensive plan tests

# To run a single test file directly
node tests/scenario-tests.js
```

## Architecture Overview

### State Management Pattern

The app uses React hooks with centralized state in [App.jsx](src/App.jsx). All state is persisted to localStorage through the [storage.js](src/utils/storage.js) utility. Key state includes:
- `userData`: User preferences (cigarettesPerWeek, vapesPerWeek, planSpeed, prices, etc.)
- `quitPlan`: Generated quit plan with weekly reduction schedule
- `logs`: Array of smoking/vaping sessions with timestamps
- `achievements`: Unlocked achievements

### Core Logic Modules

#### Quitting Plan Generation ([quittingLogic.js](src/utils/quittingLogic.js))

The `generateQuitPlan()` function creates a multi-week reduction schedule based on:
- **Reduction Rates**: Slow (5%), Medium (10%), Quick (15%)
- **Reduction Frequency**: Weekly (once per week) or Daily (7 times per week)
- **Reduction Method**:
  - Compound: Multiplicative reduction each period
  - Linear: Fixed amount reduction each period
- **Plateau Prevention**: Forces minimum 1-unit reduction per week if rounding causes stagnation

The plan consists of an array of week objects containing:
- `totalAllowed`, `cigarettesAllowed`, `vapesAllowed`
- `waitTimeCigs`, `waitTimeVapes` (in minutes between sessions)

Wait times are calculated by dividing waking hours (112 hrs/week = 6720 min) by sessions allowed.

#### Adaptive Plan System ([adaptivePlan.js](src/utils/adaptivePlan.js))

When `adaptiveMode` is enabled, the plan recalculates weekly based on actual consumption:
- `calculateConsumptionTrends()`: Analyzes last 7 days of logs to determine actual usage rate
- `recalculateAdaptivePlan()`: Adjusts reduction rate up to ±5% based on deviation from target
  - If user exceeds target by >20%: Slow down reductions
  - If user is under target by >20%: Accelerate reductions
- `enforceMinimumWait()`: Ensures minimum 10-minute wait between sessions
- `calculateDelayReward()`: Grants 2-minute bonus for staying below target

The adaptive system regenerates the quit plan from the current actual consumption rate, preserving original baseline values for achievement calculations.

#### Achievement System ([achievements.js](src/utils/achievements.js))

Achievements are checked after each log entry:
- `calculateStats()`: Computes reduction percentage, money saved, streaks, days active
- `checkAchievements()`: Evaluates all achievement conditions against current stats
- **Money Saved Calculation**: Compares actual consumption vs. what would have been consumed at original rate, using user's actual prices (cigarettePrice per pack, vapePrice per pod)
- **Reduction Percentage**: Always measured against original baseline, not current week's target

### Component Structure

- **Onboarding**: Multi-step wizard collecting user data (consumption rates, prices, plan preferences)
- **Dashboard**: Main view with countdown timers, session logging buttons, and "extraordinary session" warnings
- **Stats**: Charts (Recharts) showing daily/weekly consumption, money saved, and progress metrics
- **Achievements**: Grid of unlocked/locked achievements with unlock timestamps
- **CravingHelp**: Motivational quotes, tips, and reflection questions with saved responses

Navigation uses a fixed bottom tab bar (Home, Stats, Achievements, Help).

## Important Implementation Details

### Data Persistence

All data is stored in localStorage with the `qswf_` prefix:
- Changes to userData, quitPlan, logs, or achievements must call corresponding `storage.save*()` methods
- The storage module provides `clearAll()` for complete reset

### Plan Recalculation Triggers

Adaptive plans recalculate when:
1. `shouldRecalculatePlan()` returns true (7+ days since last recalculation)
2. Called explicitly in App.jsx after logging a session

### Notification System

Uses Web Notifications API + Service Workers:
- `requestNotificationPermission()` must be called during onboarding
- `scheduleNotification()` uses setTimeout (not persisted across reloads)
- Service worker is registered via Vite PWA plugin

### Testing Philosophy

Tests are custom Node.js scripts (not Jest/Vitest) that validate:
- Plan generation logic for various input combinations
- Adaptive plan adjustments under different user behaviors
- Achievement unlocking conditions
- Edge cases (zero consumption, very high consumption, etc.)

## Key Files Reference

### Core Logic
- [quittingLogic.js:27-147](src/utils/quittingLogic.js#L27-L147) - Plan generation algorithm
- [adaptivePlan.js:79-152](src/utils/adaptivePlan.js#L79-L152) - Adaptive recalculation logic
- [achievements.js:143-253](src/utils/achievements.js#L143-L253) - Stats calculation and money saved formula

### State Management
- [App.jsx:21-70](src/App.jsx#L21-L70) - Initial data load and plan recalculation
- [App.jsx:95-147](src/App.jsx#L95-L147) - Log handling and achievement checks
- [storage.js](src/utils/storage.js) - All localStorage operations

### UI Components
- [Dashboard.jsx](src/components/Dashboard.jsx) - Session tracking and timers
- [Onboarding.jsx](src/components/Onboarding.jsx) - User data collection flow

## Common Gotchas

1. **Reduction Percentage**: Always calculated against `originalCigarettesPerWeek` and `originalVapesPerWeek`, never against current week's allowed amount. This ensures achievements unlock based on real reduction from baseline.

2. **Plateau Prevention**: The plan generator forces at least 1-unit reduction per week even if percentage-based reduction would round to zero. See [quittingLogic.js:71-77](src/utils/quittingLogic.js#L71-L77).

3. **Money Saved**: Uses actual time elapsed (actualWeeksSinceStart) multiplied by original rate to calculate "would have consumed" baseline. User prices come from `userData.cigarettePrice` (per pack) and `userData.vapePrice` (per pod/device).

4. **Adaptive Mode**: The `adaptiveStats` object tracks recalculation metadata but is not used for achievement calculations. Original baseline is preserved in `quitPlan.originalCigarettesPerWeek` and `quitPlan.originalVapesPerWeek`.

5. **Wait Time Calculation**: In adaptive mode, `getTimeUntilNext()` applies both reward bonuses and minimum wait enforcement. Regular mode uses base wait times from current week plan.

## PWA Build Process

The app is configured as a PWA via [vite.config.js](vite.config.js):
- Service worker auto-updates on new builds
- Manifest includes app name, icons, theme colors
- Offline caching for all assets via Workbox

To create an APK, use the provided `build-apk.ps1` PowerShell script or follow the README instructions for PWA Builder/Bubblewrap.
