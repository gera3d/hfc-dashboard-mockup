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

### Agent Detail Page
- **Agent Profile**: Shows agent information, department, and lifetime stats
- **Scoped Metrics**: KPI tiles filtered to the selected agent
- **Time Series**: Charts showing agent-specific trends
- **Performance Insights**: Highlights and recent activity
- **Review History**: Complete list of agent's reviews

### Interactive Features
- **Filtering**: Multi-select filters that work across all components
- **Comparison Mode**: Period-over-period comparison with delta indicators  
- **Drill-down Navigation**: Click agents to view detailed performance
- **Responsive Design**: Works on desktop and tablet devices
- **Sorting & Pagination**: Full table functionality with export placeholders

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
│   ├── page.tsx              # Main dashboard
│   └── agent/[id]/page.tsx   # Agent detail page
├── components/
│   ├── GlobalFilters.tsx     # Filter controls
│   ├── KPITiles.tsx         # Metric tiles with comparisons
│   ├── Charts.tsx           # Time series and bar charts
│   └── DataTables.tsx       # Agent and review tables
└── data/
    ├── agents.json          # Agent master data
    ├── departments.json     # Department list
    ├── sources.json         # Review sources
    ├── reviews.ts          # Sample review data
    └── dataService.ts      # Data filtering and calculations
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
- [x] Export placeholders

### 🔄 Future Implementation (Real App)
- [ ] Google Sheets API integration
- [ ] PostgreSQL database with Drizzle ORM
- [ ] Supabase authentication and RLS
- [ ] Real-time data updates
- [ ] Actual CSV export functionality
- [ ] Parity checker with Google Sheets
- [ ] Advanced filtering and search
- [ ] Mobile optimization

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

**Note**: This is a frontend mockup with sample data. The final implementation will require backend services, database integration, and authentication as outlined in the roadmap.
