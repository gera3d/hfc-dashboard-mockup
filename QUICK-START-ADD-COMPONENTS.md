# 🚀 Quick Start - Adding More Components

This guide shows you how to quickly add more TailAdmin components to your dashboard.

---

## 📋 Table of Contents
1. [Add Pagination](#add-pagination)
2. [Add Modal for Review Details](#add-modal)
3. [Add DatePicker](#add-datepicker)
4. [Add Monthly Target](#add-monthly-target)
5. [Add ChartTab for Time Period Toggle](#add-charttab)
6. [Add Breadcrumb Navigation](#add-breadcrumb)

---

## 1. Add Pagination

**Purpose**: Add pagination to ReviewsTable and AgentPerformanceTable

**Step 1**: Import the Pagination component
```tsx
import Pagination from "@/components/tailadmin/tables/Pagination";
```

**Step 2**: Add state for current page
```tsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 15;
```

**Step 3**: Calculate paginated data
```tsx
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedReviews = reviews.slice(startIndex, endIndex);
```

**Step 4**: Add Pagination component after table
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={Math.ceil(reviews.length / itemsPerPage)}
  onPageChange={setCurrentPage}
/>
```

**Files to edit**:
- `src/components/dashboard/ReviewsTable.tsx`
- `src/components/dashboard/AgentPerformanceTable.tsx`

---

## 2. Add Modal for Review Details

**Purpose**: Click on a review to see full details in a popup

**Step 1**: Import Modal
```tsx
import { Modal } from "@/components/tailadmin/ui/modal";
```

**Step 2**: Add state for selected review
```tsx
const [selectedReview, setSelectedReview] = useState<Review | null>(null);
```

**Step 3**: Make table rows clickable
```tsx
<TableRow 
  key={review.id}
  onClick={() => setSelectedReview(review)}
  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
>
```

**Step 4**: Add Modal component
```tsx
<Modal
  isOpen={selectedReview !== null}
  onClose={() => setSelectedReview(null)}
  title="Review Details"
>
  {selectedReview && (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent</label>
        <p className="text-gray-900 dark:text-white">{getAgentName(selectedReview.agent_id)}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
        <p className="text-gray-900 dark:text-white">{"⭐".repeat(selectedReview.rating)}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
        <p className="text-gray-900 dark:text-white">{selectedReview.comment}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
        <p className="text-gray-900 dark:text-white">{selectedReview.source}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
        <p className="text-gray-900 dark:text-white">{formatDate(selectedReview.review_ts)}</p>
      </div>
    </div>
  )}
</Modal>
```

**Files to edit**:
- `src/components/dashboard/ReviewsTable.tsx`

---

## 3. Add DatePicker

**Purpose**: Replace dropdown with custom date range picker

**Step 1**: Import DatePicker
```tsx
import DatePicker from "@/components/tailadmin/form/date-picker";
```

**Step 2**: Add state for date range
```tsx
const [startDate, setStartDate] = useState<Date>(dateRanges.thisYear.from);
const [endDate, setEndDate] = useState<Date>(dateRanges.thisYear.to);
```

**Step 3**: Replace select dropdown
```tsx
<div className="flex items-center gap-3">
  <DatePicker
    selected={startDate}
    onChange={(date) => setStartDate(date)}
    placeholder="Start Date"
  />
  <span className="text-gray-500">to</span>
  <DatePicker
    selected={endDate}
    onChange={(date) => setEndDate(date)}
    placeholder="End Date"
  />
</div>
```

**Step 4**: Update dateRange when dates change
```tsx
useEffect(() => {
  setDateRange({ from: startDate, to: endDate, label: 'Custom' });
}, [startDate, endDate]);
```

**Files to edit**:
- `src/app/dashboard/page.tsx`

---

## 4. Add Monthly Target

**Purpose**: Show progress toward 5-star review goal

**Step 1**: Create MonthlyTargetCard component
```tsx
// src/components/dashboard/MonthlyTargetCard.tsx
"use client";
import MonthlyTarget from "@/components/tailadmin/ecommerce/MonthlyTarget";
import { MetricsSummary } from "@/data/dataService";

interface MonthlyTargetCardProps {
  metrics: MetricsSummary;
  target?: number; // Target percentage for 5-star reviews
}

export const MonthlyTargetCard: React.FC<MonthlyTargetCardProps> = ({ 
  metrics, 
  target = 80 
}) => {
  const current5StarPercent = metrics.percent_5_star;
  const progress = (current5StarPercent / target) * 100;
  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        5-Star Review Goal
      </h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {current5StarPercent.toFixed(1)}% / {target}%
        </span>
      </div>
      <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {progress >= 100 
          ? "🎉 Goal achieved!" 
          : `${(target - current5StarPercent).toFixed(1)}% to go`}
      </p>
    </div>
  );
};
```

**Step 2**: Add to dashboard
```tsx
import { MonthlyTargetCard } from "@/components/dashboard/MonthlyTargetCard";

// In the dashboard layout:
<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">
    <RatingTrendChart reviews={filteredReviews} />
  </div>
  <MonthlyTargetCard metrics={currentMetrics} target={80} />
</div>
```

**Files to create**:
- `src/components/dashboard/MonthlyTargetCard.tsx`

**Files to edit**:
- `src/app/dashboard/page.tsx`

---

## 5. Add ChartTab for Time Period Toggle

**Purpose**: Toggle between Daily, Weekly, Monthly views

**Step 1**: Import ChartTab
```tsx
import ChartTab from "@/components/tailadmin/common/ChartTab";
```

**Step 2**: Add state for active tab
```tsx
const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
```

**Step 3**: Create tabs
```tsx
<div className="mb-4">
  <ChartTab
    tabs={[
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' }
    ]}
    activeTab={timePeriod}
    onChange={setTimePeriod}
  />
</div>
```

**Step 4**: Update chart data based on selected period
```tsx
const chartData = useMemo(() => {
  if (timePeriod === 'daily') {
    // Group by day
  } else if (timePeriod === 'weekly') {
    // Group by week
  } else {
    // Group by month (current logic)
  }
}, [reviews, timePeriod]);
```

**Files to edit**:
- `src/components/dashboard/RatingTrendChart.tsx`

---

## 6. Add Breadcrumb Navigation

**Purpose**: Show navigation hierarchy

**Step 1**: Import PageBreadCrumb
```tsx
import PageBreadCrumb from "@/components/tailadmin/common/PageBreadCrumb";
```

**Step 2**: Add breadcrumb at top of dashboard
```tsx
<PageBreadCrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Analytics Dashboard', href: '/dashboard' }
  ]}
/>
```

**For drill-down pages (future)**:
```tsx
<PageBreadCrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Department', href: '/dashboard/department' },
    { label: 'Health', href: '/dashboard/department/health' }
  ]}
/>
```

**Files to edit**:
- `src/app/dashboard/page.tsx`

---

## 🎨 Component Styling Tips

All TailAdmin components use consistent patterns:

1. **Card Wrapper**:
```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
```

2. **Card Header**:
```tsx
<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Title</h3>
<p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
```

3. **Button**:
```tsx
<button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
```

4. **Badge Colors**:
- `color="success"` - Green
- `color="warning"` - Yellow/Orange
- `color="error"` - Red
- `color="info"` - Blue

---

## 📦 Import Paths Reference

```tsx
// Dashboard Components (your custom components)
import { ReviewMetrics } from "@/components/dashboard/ReviewMetrics";

// TailAdmin UI Components
import Badge from "@/components/tailadmin/ui/badge/Badge";
import { Modal } from "@/components/tailadmin/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/tailadmin/ui/table";

// TailAdmin Common Components
import ChartTab from "@/components/tailadmin/common/ChartTab";
import PageBreadCrumb from "@/components/tailadmin/common/PageBreadCrumb";

// TailAdmin E-commerce Components
import MonthlyTarget from "@/components/tailadmin/ecommerce/MonthlyTarget";

// TailAdmin Form Components
import DatePicker from "@/components/tailadmin/form/date-picker";
import Select from "@/components/tailadmin/form/Select";

// TailAdmin Table Components
import Pagination from "@/components/tailadmin/tables/Pagination";

// Data Service
import { 
  Review, 
  Agent, 
  Department, 
  MetricsSummary,
  loadReviews,
  calculateMetrics 
} from "@/data/dataService";
```

---

## 🚀 Quick Tips

1. **Always check** `TAILADMIN-COMPONENTS-CATALOG.md` for complete component list
2. **Use TypeScript** - All components have proper type definitions
3. **Dark mode** - All TailAdmin components support `dark:` classes automatically
4. **Responsive** - Components are mobile-friendly by default
5. **Icons** - Use Lucide icons or import from `@/icons/` (TailAdmin SVGs)

---

## 📖 Further Reading

- **Full Component Catalog**: See `TAILADMIN-COMPONENTS-CATALOG.md`
- **Integration Summary**: See `DASHBOARD-INTEGRATION-SUMMARY.md`
- **TailAdmin Docs**: Check original TailAdmin documentation for advanced usage

---

Happy coding! 🎉
