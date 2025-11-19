# Enhanced Custom Date Picker

## Overview
The custom date picker has been significantly enhanced to provide easier navigation and selection of historical dates, making it much more user-friendly for viewing data from specific years (e.g., 2001 or any year back to 2000).

## New Features

### 1. **Manual Date Display**
- Start and End date input fields that show selected dates
- Clear visual feedback of your current selection

### 2. **Quick Year Jump Buttons**
Two rows of year buttons for instant navigation:
- **Recent years**: 2025, 2024, 2023, 2022, 2021, 2020
- **Historical years**: 2019, 2018, 2015, 2010, 2005, 2000
- Click any button to instantly jump to that year in the calendar

### 3. **Custom Year Input**
- Type any year between 2000-2025
- Press Enter or click "Go" button to jump to that year
- Perfect for quickly accessing specific years like "2001"

### 4. **Extended Quick Presets**
Five preset ranges for common use cases:
- **This Year**: Current year to date
- **Last Year**: Full previous year
- **Last 3 Years**: Rolling 3-year window
- **Last 5 Years**: Rolling 5-year window
- **All Time**: From year 2000 to present

### 5. **Enhanced Calendar**
- Two-month view for easier range selection
- Year dropdown in calendar header for navigation
- Date range goes back to January 1, 2000
- Improved visual styling and responsiveness

## How to Use

### Method 1: Quick Presets
1. Click "Custom" in the time period selector
2. Click one of the 5 preset buttons (This Year, Last Year, etc.)
3. Date range is applied immediately

### Method 2: Year Jump Buttons
1. Click "Custom" in the time period selector
2. Click any year button (2025, 2024, 2023, etc.)
3. Calendar jumps to that year
4. Select your start and end dates

### Method 3: Type Specific Year
1. Click "Custom" in the time period selector
2. Type year in the "Enter year" field (e.g., "2001")
3. Press Enter or click "Go"
4. Calendar jumps to that year
5. Select your date range

### Method 4: Calendar Navigation
1. Click "Custom" in the time period selector
2. Use arrow buttons in calendar header to navigate months
3. Click month/year in header to select different dates
4. Select start date, then end date

## Technical Details

### Date Range
- **Minimum Date**: January 1, 2000
- **Maximum Date**: Current date
- **Default View**: Current month

### Configuration
```typescript
minDate: new Date(2000, 0, 1)
maxDate: new Date()
mode: 'range'
showMonths: 2
```

### User Experience Improvements
- Wider modal (max-w-2xl) for better layout
- Organized year buttons in logical groupings
- Visual feedback for selected dates
- Helpful tips at bottom of modal
- Smooth transitions and animations

## Use Cases

This enhancement makes it easy to:
- View reviews from a specific year (e.g., all of 2001)
- Compare different historical periods
- Access old data without tedious month-by-month navigation
- Jump quickly between recent and historical data
- Create custom analysis windows spanning multiple years

## Future Enhancements

Potential improvements for future versions:
- Save frequently used custom ranges
- Month-only selection mode
- Quarter selection (Q1, Q2, Q3, Q4)
- Preset for "Same month last year"
- Keyboard shortcuts for common actions
