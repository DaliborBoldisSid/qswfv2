# Daily Reduction Methods

## Overview
When users select "Reduce gradually each day" in the onboarding, they now have the option to choose between two mathematical approaches for calculating their daily reduction.

## Reduction Methods

### 1. Compound Reduction (Faster) 🚀
**Default option for daily reduction**

- **How it works**: Each day, reduce by X% of the **current** amount
- **Mathematical model**: Exponential decay
- **Result**: Faster initial reduction that slows over time

**Example with 10% daily reduction starting at 200/week:**
- Week 1: 200 → 180 → 162 → 146 → 131 → 118 → 106 → 96
- Week 2: 96 → 86 → 77 → 70 → 63 → 56 → 51 → 46
- Week 3: 46 → 41 → 37 → 33 → 30 → 27 → 24 → 22

**Advantages:**
- Dramatic early results build motivation
- Natural "tapering" effect similar to medical approaches
- Less shocking to the system as amounts get smaller
- Reaches near-zero faster

**Best for:**
- Users who want quick early wins
- Those comfortable with exponential change
- Medical tapering approach preference

### 2. Linear Reduction (Steady) 📊
**Alternative option**

- **How it works**: Each day, reduce by X% of the **original** amount
- **Mathematical model**: Linear decrease
- **Result**: Consistent, predictable reduction every day

**Example with 10% daily reduction starting at 200/week:**
- Day 1: 200 - 20 = 180
- Day 2: 180 - 20 = 160
- Day 3: 160 - 20 = 140
- Day 4: 140 - 20 = 120
- Day 5: 120 - 20 = 100
- ...continues until reaching 0

**Advantages:**
- Predictable and easy to understand
- Same reduction amount each day
- Clear timeline to zero
- Mentally easier to track

**Best for:**
- Users who prefer predictability
- Those who like consistent goals
- People who find exponential math confusing
- Users wanting clear finish dates

## UI Implementation

### Onboarding Flow
1. User selects "Reduce gradually each day"
2. A new section appears: "📊 Daily Reduction Method"
3. Two radio options with explanations:
   - **Compound (Faster)** - Shows example calculation
   - **Linear (Steady)** - Shows example calculation
4. Examples use 200 as starting point for easy understanding
5. Visual difference clearly illustrated

### Visual Indicators
**In the onboarding examples:**
```
Compound: 200 → 180 (-10%) → 162 (-10%) → 146 (-10%)
Linear:   200 → 180 (-10%) → 160 (-10%) → 140 (-10%)
```

**On the Dashboard:**
- Shows "Reducing daily (faster)" for compound
- Shows "Reducing daily (steady)" for linear
- Maintains weekly for traditional users

## Technical Implementation

### Data Structure
```javascript
userData = {
  reductionFrequency: 'daily',
  reductionMethod: 'compound' // or 'linear'
}
```

### Calculation Logic

**Compound (in quittingLogic.js):**
```javascript
if (reductionMethod === 'compound') {
  const dailyRate = reductionRate / 7
  for (let i = 0; i < 7; i++) {
    currentTotal = currentTotal * (1 - dailyRate)
  }
}
```

**Linear (in quittingLogic.js):**
```javascript
if (reductionMethod === 'linear') {
  const dailyReduction = totalPerWeek * (reductionRate / 7)
  currentTotal = currentTotal - (dailyReduction * 7)
}
```

## Mathematical Comparison

### Given:
- Starting amount: 200 per week
- Reduction rate: 10%
- Time period: 7 days (1 week)

### Compound Method:
```
Daily rate = 10% / 7 ≈ 1.43% per day
Day 0: 200
Day 1: 200 * (1 - 0.0143) = 197.14
Day 2: 197.14 * (1 - 0.0143) = 194.32
...
Day 7: ~180
Week 2: ~162
Week 3: ~146
```

### Linear Method:
```
Daily reduction = 200 * 0.10 / 7 ≈ 2.86 per day
Day 0: 200
Day 1: 200 - 20 = 180
Day 2: 180 - 20 = 160
Day 3: 160 - 20 = 140
...
```

## User Guidance

### When to recommend Compound:
- "I want to quit as fast as possible"
- "I'm worried about withdrawal"
- "I like seeing big drops early on"
- Medical/clinical preference

### When to recommend Linear:
- "I want predictable progress"
- "I prefer knowing exactly what to expect"
- "I like math that's easy to calculate"
- "I want to know when I'll be done"

## Default Behavior

**For weekly reduction:**
- Always uses compound method (traditional approach)
- No additional option needed

**For daily reduction:**
- Defaults to compound (faster)
- User can switch to linear if preferred

**For existing users:**
- Defaults to compound if `reductionMethod` is not set
- Backward compatible with previous versions

## Files Modified

1. **src/components/Onboarding.jsx**
   - Added `reductionMethod` to formData
   - Conditional display when daily is selected
   - Two radio options with examples
   - Visual highlighting with blue border

2. **src/utils/quittingLogic.js**
   - Added `reductionMethod` parameter
   - Separate logic for compound vs linear
   - Maintains weekly compound behavior

3. **src/components/Dashboard.jsx**
   - Dynamic text showing reduction type
   - Displays "faster" or "steady" accordingly

## Testing Scenarios

1. **Weekly reduction** - Should work as before
2. **Daily + Compound** - Should show exponential decay
3. **Daily + Linear** - Should show steady reduction
4. **Switch between methods** - Should recalculate plan
5. **Edge cases** - Very small numbers, very large numbers
6. **Timeline to zero** - Linear should reach 0 in predictable time

## Future Enhancements

Possible additions:
- Visual graph showing both methods side-by-side
- Calculator to preview completion dates
- Ability to switch methods after onboarding
- Hybrid methods (compound early, linear late)
- Custom reduction curves
