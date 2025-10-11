# Health for California (HFC) Theme

## Overview
A custom theme that matches the Health for California website branding, providing a cohesive experience between the main website and the dashboard.

## Theme System

### Three Theme Modes
The dashboard now supports three distinct themes:

1. **Light Theme** (Default)
   - Clean, modern design with subtle grays
   - Indigo and purple accents
   - Best for general use

2. **Dark Theme**
   - Dark backgrounds with light text
   - Reduced eye strain in low-light environments
   - Professional appearance

3. **HFC Theme** (Health for California)
   - Brand-aligned colors from healthforcalifornia.com
   - Blue (#0066CC) as primary color
   - Green (#00CA6F) as accent/success color
   - Matches the company's web presence

## Brand Colors

### Health for California Color Palette

#### Primary Blue
```css
--hfc-blue-primary: #0066cc  /* Main brand blue */
--hfc-blue-light: #3399ff    /* Lighter blue for gradients/hovers */
--hfc-blue-dark: #003d7a     /* Darker blue for text/emphasis */
```

#### Accent Green
```css
--hfc-green: #00ca6f          /* Health/success green */
--hfc-green-light: #33cf87    /* Lighter green variant */
```

#### Backgrounds
```css
--color-background-app: #f0f7ff      /* Soft blue tint */
--color-background-surface: #ffffff   /* Pure white cards */
--color-background-subtle: #e6f2ff    /* Subtle blue backgrounds */
```

### Color Scales (Tailwind Extended)

#### HFC Blue Scale
- `hfc-50`: #e6f2ff (Very light blue)
- `hfc-100`: #cce5ff
- `hfc-200`: #99ccff
- `hfc-300`: #66b3ff
- `hfc-400`: #3399ff
- `hfc-500`: #0066cc ⭐ (Primary brand)
- `hfc-600`: #0052a3
- `hfc-700`: #003d7a
- `hfc-800`: #002952
- `hfc-900`: #001429

#### HFC Green Scale
- `hfc-green-50`: #e6f9f0
- `hfc-green-100`: #ccf3e1
- `hfc-green-200`: #99e7c3
- `hfc-green-300`: #66dba5
- `hfc-green-400`: #33cf87
- `hfc-green-500`: #00ca6f ⭐ (Accent)
- `hfc-green-600`: #00a259
- `hfc-green-700`: #007a43
- `hfc-green-800`: #00512c
- `hfc-green-900`: #002916

## Theme Switcher

### Location
The theme switcher is located in the top navigation bar, next to other utility buttons.

### Features
- **Dropdown Menu**: Click to see all three theme options
- **Visual Icons**: Each theme has a distinct icon
  - Light: Sun icon
  - Dark: Moon icon
  - HFC: Health/Clock icon with brand colors
- **Descriptions**: Hover to see theme descriptions
- **Current Indicator**: Checkmark shows active theme
- **Persistent**: Selection saved to localStorage

### Usage
```tsx
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  // Toggle between themes
  setTheme('hfc');  // or 'light', 'dark'
}
```

## Visual Changes in HFC Theme

### Buttons
- Primary buttons use blue gradient (light → dark blue)
- Hover states darken to deeper blue
- Success buttons use HFC green
- Smooth transitions maintained

### Cards & Containers
- White backgrounds with light blue borders
- Hover effects apply blue shadow
- Subtle blue tint on page background

### Text Colors
- Headings use dark blue (#003d7a)
- Body text remains readable black
- Links use primary blue with dark blue hover
- Success states use HFC green

### Charts & Visualizations
- Indigo/purple colors replaced with HFC blue
- Green remains for positive metrics
- Maintains data visualization best practices
- Consistent with brand identity

### Icons & Badges
- Gradient icons use blue scale
- Status badges match brand colors
- Consistent visual language

### Gradients
- Blue-to-light-blue gradients
- Subtle blue-green backgrounds for variety
- Professional, cohesive appearance

## Implementation Details

### Theme Context (`src/context/ThemeContext.tsx`)
```typescript
type Theme = "light" | "dark" | "hfc";

// Manages theme state
// Persists to localStorage
// Applies CSS classes to <html>
```

### Theme Toggle Button (`src/components/tailadmin/common/ThemeToggleButton.tsx`)
```typescript
// Dropdown with three options
// Visual feedback for current theme
// Click-outside-to-close behavior
// Smooth transitions
```

### Global Styles (`src/app/globals.css`)
```css
/* HFC theme class applies brand colors */
.hfc { /* ... */ }

/* Overrides default Tailwind classes */
.hfc .bg-indigo-600 { 
  background-color: var(--hfc-blue-primary);
}
```

### Tailwind Config (`tailwind.config.mjs`)
```javascript
// Extended color palette
colors: {
  'hfc': { /* blue scale */ },
  'hfc-green': { /* green scale */ }
}

// darkMode: ['class'] for theme support
```

## Design Principles

### 1. Brand Consistency
- Matches healthforcalifornia.com visual identity
- Uses official brand colors
- Maintains professional insurance industry look

### 2. Accessibility
- Sufficient color contrast ratios
- Clear focus states
- Readable text sizes
- Semantic color usage

### 3. User Experience
- Smooth transitions between themes
- Persistent theme preference
- No flash of unstyled content
- Intuitive theme switcher

### 4. Maintainability
- CSS custom properties for easy updates
- Centralized theme logic
- Consistent naming conventions
- Well-documented code

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS custom properties required
- localStorage for persistence
- Graceful fallbacks

## Future Enhancements

### Potential Additions
- [ ] Auto-detect system preference
- [ ] Per-user theme preferences (backend sync)
- [ ] Additional theme variants (e.g., high contrast)
- [ ] Theme preview before applying
- [ ] Scheduled theme switching (day/night)
- [ ] Custom theme builder for admins

### Color Customization
The theme system is built to easily add new themes:

```typescript
// Add to ThemeContext
type Theme = "light" | "dark" | "hfc" | "custom";

// Add CSS classes
.custom { /* custom colors */ }
```

## Testing Checklist

- [x] Theme switcher dropdown works
- [x] Themes persist across page refreshes
- [x] All UI components styled correctly in HFC theme
- [x] Charts render with brand colors
- [x] Buttons use correct brand colors
- [x] Cards and containers match branding
- [x] Text colors readable and accessible
- [x] Gradients and shadows apply correctly
- [x] Dark mode still works independently
- [x] Light mode still works independently

## Brand Alignment

### Health for California Website Elements
✅ Primary Blue (#0066CC) - Used throughout
✅ Green Accent (#00CA6F) - Success states
✅ Clean White Backgrounds - Cards and surfaces
✅ Professional Typography - Readable, clean
✅ Subtle Shadows - Depth without distraction
✅ Blue-tinted Backgrounds - Subtle brand presence

### Dashboard Implementation
✅ All buttons styled with brand blue
✅ Success metrics use brand green
✅ Cards match website aesthetic
✅ Gradients use brand color palette
✅ Icons and badges consistent
✅ Overall cohesive brand experience

## Files Modified

1. `src/context/ThemeContext.tsx` - Theme state management
2. `src/components/tailadmin/common/ThemeToggleButton.tsx` - UI component
3. `src/app/globals.css` - HFC theme styles
4. `tailwind.config.mjs` - Extended color palette

## Usage Example

### Applying HFC Theme
1. Click the theme toggle button in the top navigation
2. Select "HFC" from the dropdown menu
3. Dashboard immediately applies Health for California branding
4. Theme preference saved automatically

### Programmatic Theme Setting
```typescript
// In any component
const { setTheme } = useTheme();

// Switch to HFC theme
setTheme('hfc');

// Check current theme
const { theme } = useTheme();
console.log(theme); // 'light', 'dark', or 'hfc'
```

## Summary

The HFC theme provides a seamless brand experience between the Health for California website and the reviews dashboard. It uses official brand colors, maintains accessibility standards, and provides a professional, cohesive interface that reinforces brand identity while keeping all functionality intact.
