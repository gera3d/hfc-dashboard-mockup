# TailAdmin Dashboard Installation

## What Was Installed

This project now includes the **TailAdmin Next.js Dashboard** - a free and open-source admin dashboard template built with Next.js 15, React 19, and Tailwind CSS 4.

### Repository
- GitHub: [TailAdmin/free-nextjs-admin-dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard)
- Documentation: [tailadmin.com/docs](https://tailadmin.com/docs)
- Live Demo: [nextjs-demo.tailadmin.com](https://nextjs-demo.tailadmin.com)

## Installation Date
October 10, 2025

## What's Included

### Components (`src/components/tailadmin/`)
- **Authentication**: Sign in/up forms
- **Charts**: Line charts, bar charts, statistics
- **Ecommerce**: Metrics, sales charts, orders, demographics
- **Forms**: All form elements, inputs, checkboxes, date pickers
- **Tables**: Basic tables with pagination
- **UI Components**: Alerts, avatars, badges, buttons, dropdowns, modals
- **Calendar**: Full-featured calendar component
- **User Profile**: Profile cards and management

### Layout Components (`src/layout/`)
- **AppHeader**: Top navigation with theme switcher, notifications, user dropdown
- **AppSidebar**: Collapsible sidebar with navigation menu
- **Backdrop**: Mobile sidebar overlay

### Context Providers (`src/context/`)
- **ThemeProvider**: Dark/light mode management
- **SidebarProvider**: Sidebar state management (expanded, collapsed, mobile)

### Icons (`src/icons/`)
- Custom SVG icon library optimized for the dashboard

### Public Assets (`public/images/`)
- Logo and branding assets
- User avatars
- Product images
- Country flags
- Error page illustrations

## New Dependencies

The following npm packages were installed:

```json
{
  "dependencies": {
    "react-apexcharts": "^1.x",
    "apexcharts": "^3.x",
    "flatpickr": "^4.x",
    "jsvectormap": "^1.x"
  },
  "devDependencies": {
    "@svgr/webpack": "^8.x"
  }
}
```

- **react-apexcharts**: Chart library for data visualization
- **flatpickr**: Date and time picker
- **jsvectormap**: Interactive vector maps
- **@svgr/webpack**: SVG as React components support

## File Structure

```
src/
├── app/
│   ├── dashboard/              # New dashboard route
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   └── page.tsx           # Main dashboard page
│   ├── tailadmin.css          # TailAdmin CSS styles
│   └── globals.css            # Updated to import TailAdmin styles
├── components/
│   └── tailadmin/             # All TailAdmin components
├── context/                   # Theme and Sidebar providers
├── layout/                    # Header, Sidebar, Backdrop
├── icons/                     # SVG icons
└── hooks/                     # Custom React hooks

public/
└── images/                    # TailAdmin images and assets
```

## Usage

### Accessing the Dashboard

Navigate to `/dashboard` to see the TailAdmin dashboard:
```
http://localhost:3000/dashboard
```

A link has been added to the homepage for easy access.

### Features

1. **Responsive Sidebar**
   - Expandable/collapsible on desktop
   - Mobile-friendly drawer
   - Persistent state

2. **Dark Mode**
   - Theme switcher in header
   - Persistent theme preference
   - Smooth transitions

3. **Dashboard Layouts**
   - E-commerce dashboard (default)
   - Flexible grid system
   - Responsive charts and tables

4. **Navigation**
   - Multi-level sidebar menu
   - Breadcrumb navigation
   - Active route highlighting

## Configuration

### Customizing Colors

TailAdmin uses Tailwind CSS 4 with custom design tokens defined in `src/app/tailadmin.css`:

- Brand colors: `--color-brand-*`
- Success: `--color-success-*`
- Error: `--color-error-*`
- Warning: `--color-warning-*`

### Adding New Pages

1. Create a new page under `src/app/dashboard/`:
```tsx
// src/app/dashboard/mypage/page.tsx
export default function MyPage() {
  return <div>My Custom Page</div>
}
```

2. Add navigation link in `src/layout/AppSidebar.tsx`

### Using Components

Import components from the tailadmin folder:

```tsx
import { EcommerceMetrics } from "@/components/tailadmin/ecommerce/EcommerceMetrics"
import Button from "@/components/tailadmin/ui/button/Button"
```

## Next Steps

1. **Customize the sidebar** in `src/layout/AppSidebar.tsx` to add your own navigation items
2. **Create new dashboard pages** under `src/app/dashboard/`
3. **Integrate with your data** by replacing the TailAdmin sample data with your own API calls
4. **Customize the theme** by modifying the design tokens in `src/app/tailadmin.css`
5. **Add authentication** if needed using the provided sign-in/sign-up forms

## Support

- TailAdmin Documentation: [tailadmin.com/docs](https://tailadmin.com/docs)
- GitHub Issues: [github.com/TailAdmin/free-nextjs-admin-dashboard/issues](https://github.com/TailAdmin/free-nextjs-admin-dashboard/issues)
- Community Discord: [pimjo.com/community](https://pimjo.com/community)

## License

TailAdmin is MIT licensed and free to use for personal and commercial projects.
