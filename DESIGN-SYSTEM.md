# 🎨 HFC Dashboard Design System

**Version:** 1.0  
**Inspired by:** Stripe, Linear, Vercel Dashboard Design  
**Philosophy:** Professional, trustworthy, data-focused, accessible

---

## 🎯 Design Principles

1. **Clarity First** - Data should be easy to read and understand
2. **Professional** - This is business software for insurance professionals
3. **Consistent** - Every component follows the same visual language
4. **Accessible** - WCAG AA compliant, readable colors, clear hierarchy
5. **Subtle Motion** - Micro-interactions that feel polished, not distracting

---

## 🎨 Color System

### Primary Palette (Insurance Professional Blue)
```css
--primary-50:  #EFF6FF   /* Lightest backgrounds */
--primary-100: #DBEAFE   /* Hover backgrounds */
--primary-200: #BFDBFE   /* Borders, subtle accents */
--primary-300: #93C5FD   /* Disabled states */
--primary-400: #60A5FA   /* Hover states */
--primary-500: #3B82F6   /* PRIMARY - Main brand color */
--primary-600: #2563EB   /* Active states */
--primary-700: #1D4ED8   /* Dark text on light bg */
--primary-800: #1E40AF   /* Very dark variants */
--primary-900: #1E3A8A   /* Darkest */
```

### Neutral Palette (Slate - Professional Gray)
```css
--neutral-50:  #F8FAFC   /* Page background */
--neutral-100: #F1F5F9   /* Card backgrounds */
--neutral-200: #E2E8F0   /* Borders */
--neutral-300: #CBD5E1   /* Disabled text */
--neutral-400: #94A3B8   /* Placeholder text */
--neutral-500: #64748B   /* Secondary text */
--neutral-600: #475569   /* Body text */
--neutral-700: #334155   /* Headings */
--neutral-800: #1E293B   /* Primary text */
--neutral-900: #0F172A   /* Darkest text */
```

### Success (Green - Positive metrics)
```css
--success-50:  #F0FDF4
--success-500: #22C55E   /* Main success color */
--success-600: #16A34A   /* Hover */
--success-700: #15803D   /* Active */
```

### Warning (Amber - Needs attention)
```css
--warning-50:  #FFFBEB
--warning-500: #F59E0B   /* Main warning color */
--warning-600: #D97706   /* Hover */
--warning-700: #B45309   /* Active */
```

### Danger (Red - Critical issues)
```css
--danger-50:  #FEF2F2
--danger-500: #EF4444   /* Main danger color */
--danger-600: #DC2626   /* Hover */
--danger-700: #B91C1C   /* Active */
```

### Info (Cyan - Informational)
```css
--info-50:  #ECFEFF
--info-500: #06B6D4   /* Main info color */
--info-600: #0891B2   /* Hover */
```

---

## 📐 Spacing Scale

Based on 4px unit (Tailwind default)

```
0   = 0px
1   = 4px
2   = 8px
3   = 12px
4   = 16px
5   = 20px
6   = 24px
8   = 32px
10  = 40px
12  = 48px
16  = 64px
20  = 80px
24  = 96px
```

**Usage:**
- **Micro spacing** (1-2): Between related elements (icon + text)
- **Component spacing** (3-4): Padding inside cards, buttons
- **Section spacing** (6-8): Between sections, cards
- **Page spacing** (12-16): Major page sections

---

## 📝 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
Inter is a professional, highly readable sans-serif perfect for data dashboards.

### Type Scale

**Display (Page titles)**
- `text-4xl` (36px) - font-bold - leading-tight - tracking-tight
- Use for: Main dashboard title

**Heading 1 (Section titles)**
- `text-2xl` (24px) - font-semibold - leading-tight - tracking-tight
- Use for: Chart titles, major sections

**Heading 2 (Subsections)**
- `text-lg` (18px) - font-semibold - leading-normal
- Use for: Chart subtitles, subsections

**Body Large (Primary content)**
- `text-base` (16px) - font-normal - leading-relaxed
- Use for: Main body text, descriptions

**Body (Secondary content)**
- `text-sm` (14px) - font-normal - leading-normal
- Use for: Labels, secondary info

**Caption (Tertiary content)**
- `text-xs` (12px) - font-medium - leading-normal
- Use for: Badges, small labels, metadata

### Color Usage
- **Primary text**: `text-neutral-800` (Headings, important content)
- **Secondary text**: `text-neutral-600` (Body text, descriptions)
- **Tertiary text**: `text-neutral-500` (Labels, captions)
- **Disabled**: `text-neutral-400`

---

## 🔲 Elevation (Shadows)

```css
/* Subtle - Hovering just above surface */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)

/* Default - Most cards */
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)

/* Medium - Elevated cards, dropdowns */
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)

/* Large - Modals, popovers */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)

/* Extra Large - Important overlays */
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

---

## 🔘 Border Radius

```css
rounded-none: 0px      /* Tables, strict layouts */
rounded-sm:   4px      /* Badges, small elements */
rounded:      6px      /* DEFAULT - Buttons, inputs */
rounded-md:   8px      /* Cards */
rounded-lg:   12px     /* Large cards, sections */
rounded-xl:   16px     /* Hero sections, special cards */
rounded-full: 9999px   /* Pills, avatars */
```

---

## 🎴 Component Patterns

### Card (Standard container)
```tsx
<div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

**Variants:**
- **Subtle**: No shadow, just border
- **Elevated**: shadow-md by default
- **Interactive**: hover:shadow-lg transition-shadow

### Badge (Status indicator)
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
  {/* Icon */}
  {/* Label */}
</span>
```

**Status Colors:**
- Success: `bg-success-100 text-success-700`
- Warning: `bg-warning-100 text-warning-700`
- Danger: `bg-danger-100 text-danger-700`
- Info: `bg-info-100 text-info-700`
- Neutral: `bg-neutral-100 text-neutral-700`

### Button (Primary action)
```tsx
<button className="px-4 py-2 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 active:bg-primary-700 transition-colors shadow-sm">
  {/* Label */}
</button>
```

**Variants:**
- **Primary**: Blue background, white text
- **Secondary**: White background, neutral border
- **Ghost**: Transparent, hover background
- **Danger**: Red background, white text

### Input (Form field)
```tsx
<input className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
```

### Stat Card (KPI Display)
```tsx
<div className="bg-white rounded-lg border border-neutral-200 p-6">
  <div className="text-sm font-medium text-neutral-600">{label}</div>
  <div className="mt-2 text-3xl font-bold text-neutral-900">{value}</div>
  <div className="mt-2 text-sm text-neutral-500">{change}</div>
</div>
```

---

## 📊 Chart Styling

### Colors (Semantic data visualization)
```javascript
const chartColors = {
  primary: '#3B82F6',      // Blue - Main data
  success: '#22C55E',      // Green - Positive metrics
  warning: '#F59E0B',      // Amber - Caution
  danger: '#EF4444',       // Red - Negative metrics
  purple: '#A855F7',       // Purple - Secondary data
  cyan: '#06B6D4',         // Cyan - Tertiary data
  neutral: '#64748B'       // Gray - Baseline/average
}
```

### Chart Card Container
```tsx
<div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
  {/* Header */}
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-neutral-800">Chart Title</h3>
    <p className="text-sm text-neutral-600 mt-1">Description</p>
  </div>
  
  {/* Chart */}
  <div className="h-80">
    {/* Recharts component */}
  </div>
</div>
```

---

## 🎭 Animation Standards

### Transitions
```css
/* Default - Most interactions */
transition-colors duration-150

/* Hover effects */
transition-shadow duration-200

/* Transforms */
transition-transform duration-200

/* All properties */
transition-all duration-200
```

### Common Patterns
```tsx
// Hover lift
hover:scale-105 transition-transform

// Shadow reveal
hover:shadow-lg transition-shadow

// Color shift
hover:bg-primary-600 transition-colors

// Fade in
animate-fade-in

// Pulse (use sparingly)
animate-pulse
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind default)
```
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Small laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Layout Patterns
```tsx
// Mobile-first responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  {/* Heading */}
</h1>
```

---

## ♿ Accessibility

### Color Contrast
- Text on white: Minimum 4.5:1 (AA standard)
- Large text: Minimum 3:1
- Use `text-neutral-800` for body, `text-neutral-600` for secondary

### Focus States
```tsx
// All interactive elements need focus rings
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Button for actions, links for navigation
- Proper labels for form inputs
- Alt text for images

---

## 🎨 Example: Applying the System

### Before (Inconsistent)
```tsx
<div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl border-2 border-blue-100 p-8 shadow-2xl shadow-blue-500/10">
  <h2 className="text-3xl font-bold text-[#0A2540]">Chart Title</h2>
</div>
```

### After (Consistent)
```tsx
<div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-neutral-800">Chart Title</h3>
</div>
```

---

## 📦 Implementation Checklist

### Phase 1: Foundation
- [ ] Update tailwind.config.mjs with design tokens
- [ ] Add Inter font to layout
- [ ] Create reusable component classes

### Phase 2: Components
- [ ] Standardize all card components
- [ ] Unify badge system
- [ ] Consistent button styles
- [ ] Standardize form inputs

### Phase 3: Charts
- [ ] Apply consistent chart colors
- [ ] Unify chart card containers
- [ ] Standardize chart typography
- [ ] Consistent tooltips

### Phase 4: Layout
- [ ] Update page layout
- [ ] Standardize header/nav
- [ ] Unify filter components
- [ ] Consistent spacing

### Phase 5: Polish
- [ ] Add smooth transitions
- [ ] Verify accessibility
- [ ] Test responsive behavior
- [ ] Final visual consistency check

---

**Next Step:** Let's implement this system across the entire dashboard! 🚀
