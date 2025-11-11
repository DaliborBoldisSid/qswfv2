# Changelog - Major Update

## New Features & Improvements

### 1. **Extraordinary Session Logging** ⚠️
- Users can now log cigarettes/vapes even when the timer is still active
- Click the ⚠️ button next to disabled log buttons to record slip-ups
- These sessions are tracked but clearly marked as "extraordinary"
- Helps maintain honest tracking even during difficult moments

### 2. **Improved Dashboard Organization** 📱
- **Logging cards moved to top** - Quick access to log cigarette/vape sessions
- **Today's activity integrated** - Each session card now shows today's count directly
- **Notification section moved to bottom** - Better visual hierarchy
- **Stats button removed from main view** - Access via bottom navigation instead
- **Timer display improved** - Clearer countdown for next available session

### 3. **Reduction Frequency Options** 📅
During onboarding, users can now choose:
- **Weekly reduction** - Traditional approach, reduce once per week
- **Daily reduction** - More aggressive, reduce consumption each day (7x per week)
- Dynamic descriptions update based on selected frequency

### 4. **Fixed Achievement System** 🏆
- **Uses actual prices** - Money saved calculations now use cigarette/vape prices from onboarding
- **Realistic unlock requirements** - Achievements require minimum time periods to prevent instant unlocking
- **New achievements added**:
  - "First Step" - Log your first session
  - "Building Habits" - Log for 3 days
  - "One Week Warrior" - Log for 7 days
- **Time-gated milestones** - Reduction achievements now require minimum weeks passed

### 5. **Craving Help Section** ❤️
New dedicated section accessible via bottom navigation:
- **100+ motivational quotes** - Powerful, direct messages to combat cravings
- **Random quote generator** - Get a new quote anytime you need support
- **Quick tips** - Immediate actions to beat cravings:
  - Drink water
  - Take a walk
  - Deep breathing exercises
  - Call someone
- **Reflection questions** - Answer questions about your journey
  - Questions stored from `quotes.json`
  - Responses saved in localStorage
  - Fun facts and explanations for each question
  - Progress indicator showing question completion

### 6. **Fixed Stats Calculations** 📊
- **Better error handling** - No more division by zero errors
- **Accurate money saved** - Uses user's actual cigarette/vape prices
  - Cigarette price divided by 20 to get per-cigarette cost
  - Vape price used directly per session
- **Proper null checks** - Handles empty data gracefully
- **Improved chart data** - Weekly and daily charts render correctly even with minimal data

### 7. **Enhanced Navigation** 🧭
- **4-tab bottom navigation**:
  1. Home (Dashboard)
  2. Stats
  3. Achievements
  4. Help (Craving Help)
- **Persistent across views** - Always accessible except during onboarding
- **Active state indicators** - Clear visual feedback for current section

## Technical Improvements

### Storage System
- Added `CRAVING_RESPONSES` storage key
- New functions: `saveCravingResponses()` and `getCravingResponses()`
- All user data persists across sessions

### Quitting Logic
- Updated `generateQuitPlan()` to support daily reduction frequency
- Calculates effective rate based on frequency selection
- Maintains backward compatibility with existing plans

### Component Structure
```
New Components:
- CravingHelp.jsx - Complete craving support interface

Updated Components:
- Dashboard.jsx - Reorganized layout, extraordinary logging
- Onboarding.jsx - Added frequency selection radio buttons
- Stats.jsx - Fixed calculations and null handling
- App.jsx - Added CravingHelp routing and navigation
- achievements.js - Price-based calculations, time requirements
- quittingLogic.js - Daily/weekly reduction support
- storage.js - Craving response persistence
```

## Data Structure Changes

### UserData Object (from onboarding)
```javascript
{
  cigarettesPerWeek: number,
  vapesPerWeek: number,
  planSpeed: 'slow' | 'medium' | 'quick',
  reductionFrequency: 'weekly' | 'daily', // NEW
  cigarettePrice: number, // Already existed
  vapePrice: number, // Already existed
  startDate: timestamp
}
```

### QuitPlan Object
```javascript
{
  startDate: timestamp,
  planSpeed: string,
  reductionFrequency: 'weekly' | 'daily', // NEW
  originalCigarettesPerWeek: number,
  originalVapesPerWeek: number,
  // ... other fields
}
```

### Craving Responses (localStorage)
```javascript
{
  "0": "User's answer to question 1",
  "1": "User's answer to question 2",
  // ... indexed by question number
}
```

## User Experience Improvements

1. **Better Visual Hierarchy** - Most important actions at the top
2. **Integrated Information** - Today's activity visible without scrolling
3. **Honest Tracking** - Can log slip-ups without waiting
4. **Mental Health Support** - Craving help always available
5. **Personalized Experience** - Questions help users reflect on their journey
6. **Accurate Metrics** - Money saved reflects actual costs
7. **Meaningful Progress** - Achievements unlock based on real milestones

## Migration Notes

- Existing users will default to 'weekly' reduction frequency
- All existing quit plans remain valid
- New achievement conditions won't retroactively unlock old achievements
- Craving responses start empty and build over time

## Files Modified

1. `src/components/Dashboard.jsx` - Major reorganization
2. `src/components/Onboarding.jsx` - Added frequency selection
3. `src/components/Stats.jsx` - Fixed calculations
4. `src/components/CravingHelp.jsx` - NEW FILE
5. `src/utils/achievements.js` - Price-based savings, time requirements
6. `src/utils/quittingLogic.js` - Daily reduction support
7. `src/utils/storage.js` - Craving response functions
8. `src/App.jsx` - Added CravingHelp routing
9. `README.md` - Updated documentation

## Testing Recommendations

1. Test onboarding flow with both weekly and daily reduction
2. Verify extraordinary logging works when timer is active
3. Check money saved calculations with custom prices
4. Ensure craving responses persist across sessions
5. Verify all achievements unlock at correct times
6. Test with empty data states (new users)
7. Verify charts render with minimal data
