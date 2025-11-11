# Chart Y-Axis Dynamic Scaling Fix

## Problem
The Weekly Progress and Last 7 Days charts were using auto-scaling that included very high target values, making small actual values nearly invisible.

### Example Before Fix:
- User baseline: 220 vapes/week
- Week 1 actual: 1 logged session
- Y-axis range: 0-220
- Result: The actual line (1) is barely visible at the bottom

## Solution
Implemented intelligent dynamic Y-axis scaling based on actual data with the following logic:

### Weekly Progress Chart
```javascript
// Calculate max values
const maxActual = Math.max(...weeklyData.map(d => d.actual), 0)
const maxTarget = Math.max(...weeklyData.map(d => d.target), 0)

// Scale based on actuals with 20% padding, minimum 10
const weeklyChartMax = Math.max(
  Math.ceil(maxActual * 1.2),
  10
)

// Include targets only if they're reasonably close (within 3x of actuals)
const shouldIncludeTargets = maxTarget > 0 && maxTarget <= maxActual * 3
const weeklyYAxisDomain = shouldIncludeTargets
  ? [0, Math.ceil(Math.max(maxActual, maxTarget) * 1.2)]
  : [0, weeklyChartMax]
```

### Last 7 Days Chart
```javascript
const maxDaily = Math.max(...dailyData.map(d => d.count), 0)
const dailyYAxisDomain = [0, Math.max(Math.ceil(maxDaily * 1.2), 5)]
```

## Behavior Examples

### Scenario 1: New User (1 session logged)
- Max actual: 1
- Y-axis range: 0-10 (uses minimum of 10)
- Result: Visible bar/line showing progress

### Scenario 2: Active User (50 sessions in a week)
- Max actual: 50
- Y-axis range: 0-60 (50 * 1.2)
- Result: Chart uses full height effectively

### Scenario 3: User Near Target
- Max actual: 180
- Max target: 200
- Y-axis range: 0-240 (max(180, 200) * 1.2)
- Result: Both lines visible with good spacing

### Scenario 4: User Far Below Target (Early Days)
- Max actual: 5
- Max target: 220
- Targets more than 3x actuals: Yes (220 > 5 * 3)
- Y-axis range: 0-10 (focuses on actual data)
- Result: Actual progress clearly visible

## Benefits

1. **Better Visibility**: Small values are now clearly visible
2. **Adaptive**: Scales automatically as user logs more sessions
3. **Smart Target Inclusion**: Only shows target scale when relevant
4. **Minimum Scale**: Ensures charts never appear empty (min 5-10)
5. **No Decimals**: `allowDecimals={false}` keeps Y-axis labels clean

## Files Modified
- `src/components/Stats.jsx` (lines 36-51, 70-72, 200, 211)

## Testing
The fix was verified by:
1. Building the app successfully (no syntax errors)
2. Visual testing scenarios documented above
3. Existing test suites all passing
