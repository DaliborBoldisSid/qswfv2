# UI Customization Feature

## Overview
The Dashboard now includes a comprehensive UI customization system that allows users to personalize their experience by:
- Reordering components
- Hiding/showing components
- Resetting to default layout

## Changes Made

### 1. Daily Quote Removed ✅
The daily motivational quote section has been removed from the Dashboard as requested.

### 2. Vape & Cigarette Order Swapped ✅
- **Vape Session** now appears first
- **Cigarette** appears second
- This is the new default order and can be further customized by the user

### 3. UI Customization System ✅

#### Access
- Click the **Settings** icon (⚙️) in the Dashboard header
- Opens a modal with customization options

#### Features

**Component Reordering:**
- Use the up (↑) and down (↓) arrows to move components
- Each component has a grip icon (⋮⋮) indicating it can be reordered
- Changes are saved instantly to localStorage

**Component Visibility:**
- Click the eye icon to toggle component visibility:
  - 👁️ Green eye = Component is visible
  - 👁️‍🗨️ Gray eye with slash = Component is hidden
- Hidden components won't appear on the Dashboard but remain in the order list

**Reset to Default:**
- "Reset to Default" button restores the original layout:
  - Vape Session (visible)
  - Cigarette (visible)
  - This Week's Plan (visible)
  - Notifications (visible)

### Components Available for Customization

1. **Vape Session**
   - Log vape sessions
   - View today's vape count
   - Timer for next available session

2. **Cigarette**
   - Log cigarette sessions
   - View today's cigarette count
   - Timer for next available session

3. **This Week's Plan**
   - Summary of allowed cigarettes and vapes
   - Reduction information

4. **Notifications**
   - Notification permission status
   - Test notification button
   - Setup instructions

## Technical Implementation

### State Management
```javascript
const [componentOrder, setComponentOrder] = useState(() => {
  return storage.getDashboardOrder() || ['vape', 'cigarette', 'weekSummary', 'notifications']
})

const [componentVisibility, setComponentVisibility] = useState(() => {
  return storage.getDashboardVisibility() || {
    vape: true,
    cigarette: true,
    weekSummary: true,
    notifications: true
  }
})
```

### Storage Keys
- `qswf_dashboard_order` - Array of component IDs in order
- `qswf_dashboard_visibility` - Object mapping component IDs to boolean visibility

### Dynamic Rendering
Components are now rendered using `.map()` based on the saved order:
```javascript
{componentOrder.map((componentId) => {
  if (!componentVisibility[componentId]) return null
  // Render component based on componentId
})}
```

## User Experience

### First Time Users
- Dashboard shows default order: Vape → Cigarette → Week Summary → Notifications
- All components visible by default

### Returning Users
- Dashboard loads with their saved preferences
- Order and visibility persist across sessions
- Can be reset at any time

### Mobile Optimization
- Settings modal is scrollable on small screens
- Touch-friendly buttons for reordering and toggling
- Clear visual feedback for all actions

## Icons Used
- **Settings** (⚙️) - Open customization modal
- **GripVertical** (⋮⋮) - Visual indicator for reorderable items
- **ChevronUp** (↑) - Move component up
- **ChevronDown** (↓) - Move component down
- **Eye** (👁️) - Component is visible
- **EyeOff** (👁️‍🗨️) - Component is hidden

## Files Modified

1. **src/components/Dashboard.jsx**
   - Removed daily quote import and section
   - Added Settings icon and modal
   - Implemented dynamic component rendering
   - Added state management for order and visibility

2. **src/utils/storage.js**
   - Added `DASHBOARD_ORDER` storage key
   - Added `DASHBOARD_VISIBILITY` storage key
   - Added `saveDashboardOrder()` function
   - Added `getDashboardOrder()` function
   - Added `saveDashboardVisibility()` function
   - Added `getDashboardVisibility()` function

## Future Enhancements (Optional)

Potential future improvements:
- Drag-and-drop reordering (using react-beautiful-dnd or similar)
- More granular customization (font sizes, colors, etc.)
- Component presets (focus mode, minimal mode, etc.)
- Export/import custom layouts
- Per-user themes

## Testing Recommendations

1. Test reordering components in different sequences
2. Verify visibility toggles work correctly
3. Ensure settings persist after page reload
4. Test "Reset to Default" functionality
5. Check on different screen sizes
6. Verify localStorage limits aren't exceeded
