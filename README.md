# HFC Reviews Dashboard Mockup

This is a **mockup** of the HFC Reviews Dashboard that demonstrates what the final application could look like based on the roadmap requirements. The mockup uses sample data and provides a complete user interface that matches the specifications in the Product Requirements Document (PRD).

## 🚀 Features Implemented

### Dashboard Overview
- **KPI Tiles**: Display star ratings (1★-5★), total reviews, and average rating with comparison mode
- **Global Filters**: Date range picker, department selector, agent selector, and source filters
- **Time Series Chart**: Shows review trends over time with breakdown by star rating
- **Agent Leaderboard**: Bar chart showing top agents by total reviews
- **Agent Performance Table**: Sortable table with all metrics and drill-down capability
- **Individual Reviews Table**: Paginated table with review details and modal popup
- **Background Sync System**: Non-blocking Google Sheets sync with real-time progress tracking

### Agent Detail Page
- **Agent Profile**: Shows agent information, department, and lifetime stats
- **Scoped Metrics**: KPI tiles filtered to the selected agent
- **Time Series**: Charts showing agent-specific trends
- **Performance Insights**: Highlights and recent activity
- **Review History**: Complete list of agent's reviews

### Data Management
- **Google Sheets Integration**: Live sync from Google Sheets via API
- **Background Sync**: Non-blocking sync with progress tracking
- **Agent Management**: Hide/unhide agents with Supabase persistence
- **Department Management**: Custom department configuration
- **Local Cache**: Fast data access with automatic refresh

### Interactive Features
- **Filtering**: Multi-select filters that work across all components
- **Comparison Mode**: Period-over-period comparison with delta indicators  
- **Drill-down Navigation**: Click agents to view detailed performance
- **Responsive Design**: Works on desktop and tablet devices
- **Sorting & Pagination**: Full table functionality with export placeholders
- **Real-time Updates**: Auto-refresh on sync completion

## 📊 Sample Data

The mockup includes realistic sample data:
- **25 reviews** spread across different time periods (last 7 days, this month, this year)
- **8 agents** across **4 departments** (IFP, Medicare, Small Business, Admin)
- **6 review sources** (Website, Google Reviews, Phone Survey, etc.)
- **Realistic ratings distribution** and comments

## 🛠 Technical Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

## 🎨 Design Features

- **Clean, professional interface** with rounded cards and soft shadows
- **Color-coded star ratings** (red=1★, orange=2★, yellow=3★, lime=4★, green=5★)
- **Consistent spacing** and typography
- **Loading states** and empty state handling
- **Accessible design** following best practices

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── agent/[id]/page.tsx         # Agent detail page
│   ├── settings/page.tsx           # Settings & sync management
│   └── api/
│       └── sync-sheets-bg/
│           └── route.ts            # Background sync API
├── components/
│   ├── GlobalFilters.tsx           # Filter controls
│   ├── KPITiles.tsx                # Metric tiles with comparisons
│   ├── Charts.tsx                  # Time series and bar charts
│   ├── DataTables.tsx              # Agent and review tables
│   ├── AgentDepartmentManager.tsx  # Agent management UI
│   └── SyncProgressIndicator.tsx   # Sync progress UI
├── context/
│   └── SyncContext.tsx             # Global sync state management
├── data/
│   ├── agents.json                 # Agent master data
│   ├── departments.json            # Department list
│   ├── sources.json                # Review sources
│   ├── reviews.ts                  # Sample review data
│   └── dataService.ts              # Data filtering and calculations
└── lib/
    ├── localStorage.ts             # Local storage utilities
    ├── supabaseService.ts          # Supabase integration
    └── parseSheets.ts              # CSV parsing utilities
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   http://localhost:3000

4. **Set up Google Sheets sync (optional):**
   - Create a Google Cloud service account
   - Download credentials JSON
   - Place as `google-sheets-credentials.json` in project root
   - Set `GOOGLE_SHEET_ID` in `.env.local`
   - See [GOOGLE-SHEETS-API-SETUP.md](./GOOGLE-SHEETS-API-SETUP.md) for details

5. **Configure Supabase (optional):**
   - Create a Supabase project
   - Add connection details to `.env.local`
   - Run the SQL setup scripts
   - See [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) for details

## 📚 Documentation

- **[BACKGROUND-SYNC-SYSTEM.md](./BACKGROUND-SYNC-SYSTEM.md)** - Background sync implementation guide
- **[SYNC-SYSTEM-FIXES-NOV-2025.md](./SYNC-SYSTEM-FIXES-NOV-2025.md)** - Recent sync improvements and bug fixes
- **[GOOGLE-SHEETS-API-SETUP.md](./GOOGLE-SHEETS-API-SETUP.md)** - Google Sheets integration guide
- **[SUPABASE-SETUP.md](./SUPABASE-SETUP.md)** - Supabase configuration
- **[AGENT-DEPARTMENT-MANAGEMENT.md](./AGENT-DEPARTMENT-MANAGEMENT.md)** - Agent management features
- **[HFC-THEME-DOCUMENTATION.md](./HFC-THEME-DOCUMENTATION.md)** - Design system and theming

## 📋 Roadmap Compliance

This mockup implements all major requirements from the PRD:

### ✅ Completed Features
- [x] Dashboard overview with KPI tiles
- [x] Global filters (date, department, agent, source)
- [x] Time series charts
- [x] Agent leaderboard
- [x] Agent performance table with sorting
- [x] Individual reviews table with pagination
- [x] Agent drill-down pages
- [x] Period comparison mode
- [x] Responsive design
- [x] Clean visual language with rounded cards
- [x] Star rating color coding
- [x] Google Sheets API integration
- [x] Background sync system with progress tracking
- [x] Supabase integration for agent management
- [x] Local storage for user preferences
- [x] Agent hide/unhide functionality
- [x] Custom department management
- [x] Real-time sync status updates

### 🔄 Future Implementation
- [ ] Supabase authentication and RLS
- [ ] Real-time data updates via WebSockets
- [ ] Actual CSV export functionality
- [ ] Advanced filtering and search
- [ ] Mobile optimization
- [ ] Sync scheduling/automation
- [ ] Performance metrics dashboard
- [ ] Multi-user collaboration features

## 🎯 Key Differentiators

This mockup demonstrates:

1. **Exact parity mindset** - Sample calculations match expected sheet logic
2. **Drill-down capability** - From overview to agent details to individual reviews  
3. **Flexible filtering** - Multi-dimensional filters that work together
4. **Comparison features** - Period-over-period trend analysis
5. **Professional design** - Clean, modern interface suitable for business users
6. **Performance focus** - Efficient data processing and rendering

## 📝 Sample Data Details

The sample data includes:
- Reviews from **September 2025** (recent) back to **April 2025** 
- **Realistic rating distribution**: Mix of 1-5 star reviews
- **Authentic comments** reflecting real customer feedback patterns
- **Multiple sources** showing various review collection methods
- **Department variety** covering IFP, Medicare, Small Business, and Admin teams

## 🔧 Customization

To adapt this mockup for your needs:

1. **Update sample data** in `/src/data/` files
2. **Modify date ranges** in `dataService.ts`
3. **Adjust styling** in Tailwind CSS classes
4. **Add new metrics** by extending the data model
5. **Customize charts** using Recharts configuration

---

**Last Updated:** November 14, 2025  
**Status:** ✅ Production Ready  

### Recent Updates (Nov 14, 2025)
- ✅ Fixed sync race conditions with lock mechanism
- ✅ Added 3-second cooldown protection
- ✅ Enhanced error handling and logging
- ✅ Improved credentials validation
- ✅ Updated all documentation

For detailed information about the sync system improvements, see [SYNC-SYSTEM-FIXES-NOV-2025.md](./SYNC-SYSTEM-FIXES-NOV-2025.md)

---

**Note**: This application includes both frontend mockup features and production-ready Google Sheets integration. The sync system uses real Google Sheets API and Supabase for data persistence.
