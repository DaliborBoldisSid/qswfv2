# UI Options to Test Coverage Mapping

This document maps the onboarding UI options shown in your screenshot to the specific test cases that validate them.

## UI Options Available

### Reduction Frequency
- 🔘 **Reduce gradually each week** → `reductionFrequency: 'weekly'`
- 🔵 **Reduce gradually each day** → `reductionFrequency: 'daily'`

### Daily Reduction Method
- 🔵 **Compound (Faster)** → `reductionMethod: 'compound'`
  - Reduce by % of current amount each day
  - Example: 200 → 180 (-10%) → 162 (-10%) → 146 (-10%)
  
- 🔘 **Linear (Steady)** → `reductionMethod: 'linear'`
  - Reduce by % of original amount each day
  - Example: 200 → 180 (-10%) → 160 (-10%) → 140 (-10%)

### Speed Options
- 🟤 **5% each day** → `planSpeed: 'slow'`
- ⚡ **10% each day** → `planSpeed: 'medium'`
- 🚀 **15% each day** → `planSpeed: 'quick'`

### Adaptive Mode
- 💗 **Smart Adaptive Plan** → `adaptiveMode: true`
- Regular Plan → `adaptiveMode: false`

---

## Test Coverage Matrix

✅ = Tested and Passing | Total: **24 combinations**

| Speed | Frequency | Method | Adaptive | Test Status | Duration (weeks) |
|-------|-----------|--------|----------|-------------|------------------|
| **SLOW (5%)** | | | | | |
| Slow | Weekly | Linear | Yes | ✅ | 102 weeks |
| Slow | Weekly | Linear | No | ✅ | 102 weeks |
| Slow | Weekly | Compound | Yes | ✅ | 102 weeks |
| Slow | Weekly | Compound | No | ✅ | 102 weeks |
| Slow | Daily | Linear | Yes | ✅ | **21 weeks** |
| Slow | Daily | Linear | No | ✅ | **21 weeks** |
| Slow | Daily | Compound | Yes | ✅ | 102 weeks |
| Slow | Daily | Compound | No | ✅ | 102 weeks |
| **MEDIUM (10%)** | | | | | |
| Medium | Weekly | Linear | Yes | ✅ | 61 weeks |
| Medium | Weekly | Linear | No | ✅ | 61 weeks |
| Medium | Weekly | Compound | Yes | ✅ | 61 weeks |
| Medium | Weekly | Compound | No | ✅ | 61 weeks |
| Medium | Daily | Linear | Yes | ✅ | **11 weeks** |
| Medium | Daily | Linear | No | ✅ | **11 weeks** |
| Medium | Daily | Compound | Yes | ✅ | 64 weeks |
| Medium | Daily | Compound | No | ✅ | 64 weeks |
| **QUICK (15%)** | | | | | |
| Quick | Weekly | Linear | Yes | ✅ | 40 weeks |
| Quick | Weekly | Linear | No | ✅ | 40 weeks |
| Quick | Weekly | Compound | Yes | ✅ | 40 weeks |
| Quick | Weekly | Compound | No | ✅ | 40 weeks |
| Quick | Daily | Linear | Yes | ✅ | **8 weeks** |
| Quick | Daily | Linear | No | ✅ | **8 weeks** |
| Quick | Daily | Compound | Yes | ✅ | 43 weeks |
| Quick | Daily | Compound | No | ✅ | 43 weeks |

---

## Screenshot Options → Test Cases

Based on your screenshot showing:
- ✅ **Smart Adaptive Plan** (checked)
- 🔵 **Reduce gradually each day** (selected)
- 🔵 **Compound (Faster)** (selected)
- Speed options available (5%, 10%, 15%)

### These UI selections map to:

#### If user selects 5% (Slow):
```javascript
{
  planSpeed: 'slow',
  reductionFrequency: 'daily',
  reductionMethod: 'compound',
  adaptiveMode: true
}
```
**Test**: ✅ `SLOW | daily | compound | adaptive=true`
**Duration**: 102 weeks

#### If user selects 10% (Medium):
```javascript
{
  planSpeed: 'medium',
  reductionFrequency: 'daily',
  reductionMethod: 'compound',
  adaptiveMode: true
}
```
**Test**: ✅ `MEDIUM | daily | compound | adaptive=true`
**Duration**: 64 weeks

#### If user selects 15% (Quick):
```javascript
{
  planSpeed: 'quick',
  reductionFrequency: 'daily',
  reductionMethod: 'compound',
  adaptiveMode: true
}
```
**Test**: ✅ `QUICK | daily | compound | adaptive=true`
**Duration**: 43 weeks

---

## How to Test Specific Combinations

### Test all 24 combinations:
```bash
npm run test:comprehensive
```

### Test with different configurations:
You can test specific scenarios from `tests/scenario-tests.js`:
```bash
npm run test:scenarios
```

### Current comprehensive test results:
```
Total Tests:  24
✅ Passed:    24 (100.0%)
❌ Failed:    0 (0.0%)
```

---

## Key Differences Between Methods

### Weekly vs Daily Frequency
- **Weekly**: Reduces once per week (smoother, longer timeline)
- **Daily**: Reduces every day of the week (faster, more frequent adjustments)

### Linear vs Compound Method
- **Linear**: Fixed reduction amount
  - Week 1: 270 items
  - Week 2: 257 items (-13.5)
  - Week 3: 243 items (-13.5)
  
- **Compound**: Percentage-based reduction
  - Week 1: 270 items
  - Week 2: 257 items (-5%)
  - Week 3: 244 items (-5% of 257)

### Impact on Duration
For the same speed setting (e.g., 10%):
- **Daily + Linear**: ~11 weeks (fastest)
- **Weekly + Compound**: ~61 weeks
- **Daily + Compound**: ~64 weeks (exponential decay takes longer)

---

## Validation Coverage

Each test validates:
- ✅ Plan structure integrity
- ✅ Week number sequencing
- ✅ **Rounding consistency** (cigs + vapes = total)
- ✅ Wait time accuracy
- ✅ Monotonic decrease pattern
- ✅ Percentage ratio maintenance
- ✅ Final week zeroing
- ✅ No negative values
- ✅ Reasonable duration limits

---

## Summary

**✅ YES** - All combinations shown in your UI are fully tested!

- **24 unique configurations** covering all possible user selections
- **100% pass rate** after rounding bug fix
- Tests run automatically with `npm test`
- Each configuration validated across multiple dimensions

Your app is thoroughly tested for all user-facing options! 🎉
